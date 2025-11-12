'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, AlertCircle, Loader2, Heart, CheckCircle } from 'lucide-react'
import { puedeDonar, diasHastaPoderDonar } from '@/lib/utils'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { enviarEmailConfirmacionDonacion } from '@/actions/emails'

interface BancoSangre {
  id: string
  nombre: string
  direccion: string
  ciudad: string
  telefono: string | null
  horario_atencion: string | null
}

export default function NuevaDonacionPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [loadingBancos, setLoadingBancos] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const [tipoSangre, setTipoSangre] = useState<string>('')
  const [ultimaDonacion, setUltimaDonacion] = useState<string | null>(null)
  const [bancosSangre, setBancosSangre] = useState<BancoSangre[]>([])
  
  // Form data
  const [bancoId, setBancoId] = useState('')
  const [fechaDonacion, setFechaDonacion] = useState('')
  const [unidades, setUnidades] = useState('1')
  const [ubicacion, setUbicacion] = useState('')
  const [notas, setNotas] = useState('')
  const [esPrimeraVez, setEsPrimeraVez] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      // Obtener usuario
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: usuario } = await supabase
        .from('usuario')
        .select('id, perfil_medico(*)')
        .eq('auth_id', user.id)
        .single()

     if (usuario) {
  setUsuarioId(usuario.id)
  
  const perfil = Array.isArray(usuario.perfil_medico) 
    ? usuario.perfil_medico[0] 
    : usuario.perfil_medico
  
  if (perfil) {
    setTipoSangre(perfil.tipo_sangre)
    setUltimaDonacion(perfil.ultima_donacion)
    setEsPrimeraVez(perfil.total_donaciones === 0)
  }
}

      // Obtener bancos de sangre
      const { data: bancos, error: bancosError } = await supabase
        .from('banco_sangre')
        .select('*')
        .eq('activo', true)
        .order('nombre')

      if (bancosError) throw bancosError

      setBancosSangre(bancos || [])
    } catch (err) {
      console.error('Error cargando datos:', err)
    } finally {
      setLoadingBancos(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!usuarioId) {
        throw new Error('Usuario no identificado')
      }

      // Verificar si puede donar
      if (ultimaDonacion && !puedeDonar(ultimaDonacion)) {
        const dias = diasHastaPoderDonar(ultimaDonacion)
        throw new Error(`Debes esperar ${dias} días más antes de poder donar nuevamente`)
      }

      // Validar fecha
      const fechaSeleccionada = new Date(fechaDonacion)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      if (fechaSeleccionada < hoy) {
        throw new Error('La fecha de donación no puede ser en el pasado')
      }

      const { data, error: insertError } = await supabase
        .from('donacion')
        .insert({
          donante_id: usuarioId,
          banco_sangre_id: bancoId || null,
          fecha_donacion: fechaDonacion,
          unidades_donadas: parseInt(unidades),
          tipo_sangre: tipoSangre,
          estado: 'programada',
          ubicacion_donacion: ubicacion || null,
          notas: notas || null,
          es_primera_vez: esPrimeraVez
        })
        .select()
        .single()

      if (insertError) throw insertError

try {
  const bancoSeleccionado = bancosSangre.find(b => b.id === bancoId)
  
  if (bancoSeleccionado) {
    console.log('Enviando email de confirmación de donación...')
    
    // Obtener datos del usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: usuarioData } = await supabase
        .from('usuario')
        .select('email, nombre, apellido')
        .eq('auth_id', user.id)
        .single()
      
      if (usuarioData) {
        await enviarEmailConfirmacionDonacion(
          usuarioData.email,
          usuarioData.nombre,
          {
            fecha: formatDate(fechaDonacion),
            banco: bancoSeleccionado.nombre,
            direccion: bancoSeleccionado.direccion,
            tipo_sangre: tipoSangre
          }
        )
        
        console.log('Email de confirmación enviado correctamente')
      }
    }
  }
} catch (emailError) {
  console.error('Error enviando email (no crítico):', emailError)
  // No lanzar error para que la donación se cree igual
}

      // Redirigir
      router.push('/app-protected/donaciones')
      router.refresh()

    } catch (err: any) {
      console.error('Error programando donación:', err)
      setError(err.message || 'Error al programar la donación')
    } finally {
      setLoading(false)
    }
  }

  const puedeDonante = ultimaDonacion ? puedeDonar(ultimaDonacion) : true
  const diasRestantes = ultimaDonacion && !puedeDonante ? diasHastaPoderDonar(ultimaDonacion) : 0

  if (loadingBancos) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-red-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/app-protected/donaciones">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Mis Donaciones
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Programar Donación</h1>
        <p className="text-muted-foreground mt-2">
          Agenda tu próxima donación de sangre
        </p>
      </div>

      {/* Alerta si no puede donar */}
      {!puedeDonante && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No puedes programar una donación todavía. Debes esperar <strong>{diasRestantes} días</strong> más desde tu última donación.
          </AlertDescription>
        </Alert>
      )}

      {/* Alerta de primera vez */}
      {esPrimeraVez && puedeDonante && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            ¡Esta será tu primera donación! Gracias por unirte a salvar vidas. 🎉
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="mr-2 h-5 w-5 text-red-600" />
              Información de la Donación
            </CardTitle>
            <CardDescription>
              Completa los detalles de tu donación programada
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Tipo de sangre (solo lectura) */}
            <div className="space-y-2">
              <Label>Tu Tipo de Sangre</Label>
              <Input
                value={tipoSangre}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Este es tu tipo de sangre registrado en tu perfil
              </p>
            </div>

            {/* Banco de sangre */}
            <div className="space-y-2">
              <Label htmlFor="banco">Banco de Sangre / Hospital *</Label>
              <Select value={bancoId} onValueChange={setBancoId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un banco de sangre" />
                </SelectTrigger>
                <SelectContent>
                  {bancosSangre.map((banco) => (
                    <SelectItem key={banco.id} value={banco.id}>
                      <div>
                        <p className="font-medium">{banco.nombre}</p>
                        <p className="text-xs text-muted-foreground">{banco.direccion}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mostrar info del banco seleccionado */}
            {bancoId && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  {(() => {
                    const bancoSeleccionado = bancosSangre.find(b => b.id === bancoId)
                    return bancoSeleccionado ? (
                      <div className="space-y-2 text-sm">
                        <p><strong>Dirección:</strong> {bancoSeleccionado.direccion}</p>
                        {bancoSeleccionado.telefono && (
                          <p><strong>Teléfono:</strong> {bancoSeleccionado.telefono}</p>
                        )}
                        {bancoSeleccionado.horario_atencion && (
                          <p><strong>Horario:</strong> {bancoSeleccionado.horario_atencion}</p>
                        )}
                      </div>
                    ) : null
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Fecha y unidades */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha de Donación *</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={fechaDonacion}
                  onChange={(e) => setFechaDonacion(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  disabled={loading || !puedeDonante}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidades">Unidades *</Label>
                <Select 
                  value={unidades} 
                  onValueChange={setUnidades}
                  disabled={loading || !puedeDonante}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 unidad</SelectItem>
                    <SelectItem value="2">2 unidades</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ubicación alternativa */}
            <div className="space-y-2">
              <Label htmlFor="ubicacion">Ubicación Alternativa</Label>
              <Input
                id="ubicacion"
                type="text"
                placeholder="Ej: Móvil de donación en Plaza Independencia"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                disabled={loading || !puedeDonante}
              />
              <p className="text-xs text-muted-foreground">
                Opcional - Solo si no donarás en el banco de sangre seleccionado
              </p>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                placeholder="Información adicional sobre tu donación..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                disabled={loading || !puedeDonante}
                rows={3}
              />
            </div>

            {/* Primera vez */}
            {esPrimeraVez && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="primeraVez"
                  checked={esPrimeraVez}
                  disabled
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="primeraVez" className="font-normal">
                  Esta es mi primera donación
                </Label>
              </div>
            )}
          </CardContent>

          <CardContent className="border-t pt-6">
            <div className="flex space-x-4">
              <Button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={loading || !puedeDonante || !bancoId}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Programando...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    Programar Donación
                  </>
                )}
              </Button>

              <Link href="/app-protected/donaciones" className="flex-1">
                <Button type="button" variant="outline" className="w-full" disabled={loading}>
                  Cancelar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}