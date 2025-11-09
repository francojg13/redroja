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
import { ArrowLeft, AlertCircle, Loader2, Droplet } from 'lucide-react'
import { TIPOS_SANGRE } from '@/lib/constants'
import Link from 'next/link'

export default function NuevaSolicitudPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  
  // Form data
  const [tipoSangre, setTipoSangre] = useState('')
  const [unidades, setUnidades] = useState('1')
  const [prioridad, setPrioridad] = useState<'baja' | 'media' | 'alta' | 'urgente'>('media')
  const [motivo, setMotivo] = useState('')
  const [hospital, setHospital] = useState('')
  const [direccionHospital, setDireccionHospital] = useState('')
  const [fechaNecesidad, setFechaNecesidad] = useState('')
  const [esPublica, setEsPublica] = useState(true)

  useEffect(() => {
    obtenerUsuario()
  }, [])

  const obtenerUsuario = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: usuario } = await supabase
        .from('usuario')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (usuario) {
        setUsuarioId(usuario.id)
      }
    } catch (err) {
      console.error('Error obteniendo usuario:', err)
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

      // Validar fecha
      const fechaSeleccionada = new Date(fechaNecesidad)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      if (fechaSeleccionada < hoy) {
        throw new Error('La fecha de necesidad no puede ser en el pasado')
      }

      const { data, error: insertError } = await supabase
        .from('solicitud')
        .insert({
          usuario_solicitante_id: usuarioId,
          tipo_sangre_requerido: tipoSangre,
          unidades_requeridas: parseInt(unidades),
          prioridad,
          motivo: motivo || null,
          hospital: hospital || null,
          direccion_hospital: direccionHospital || null,
          fecha_necesidad: fechaNecesidad,
          es_publica: esPublica,
          estado: 'pendiente'
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Redirigir a solicitudes
      router.push('/app-protected/solicitudes')
      router.refresh()

    } catch (err: any) {
      console.error('Error creando solicitud:', err)
      setError(err.message || 'Error al crear la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/app-protected/solicitudes">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Solicitudes
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Nueva Solicitud de Sangre</h1>
        <p className="text-muted-foreground mt-2">
          Completa el formulario para solicitar donantes de sangre
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Droplet className="mr-2 h-5 w-5 text-red-600" />
              Información de la Solicitud
            </CardTitle>
            <CardDescription>
              Todos los campos marcados con * son obligatorios
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Tipo de Sangre y Unidades */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoSangre">Tipo de Sangre Requerido *</Label>
                <Select value={tipoSangre} onValueChange={setTipoSangre} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo de sangre" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_SANGRE.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidades">Unidades Requeridas *</Label>
                <Input
                  id="unidades"
                  type="number"
                  min="1"
                  max="10"
                  value={unidades}
                  onChange={(e) => setUnidades(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Prioridad y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prioridad">Prioridad *</Label>
                <Select 
                  value={prioridad} 
                  onValueChange={(value: 'baja' | 'media' | 'alta' | 'urgente') => setPrioridad(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaNecesidad">Fecha Necesidad *</Label>
                <Input
                  id="fechaNecesidad"
                  type="date"
                  value={fechaNecesidad}
                  onChange={(e) => setFechaNecesidad(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Motivo */}
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo de la Solicitud</Label>
              <Textarea
                id="motivo"
                placeholder="Describe brevemente por qué necesitas la donación..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                disabled={loading}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Opcional - Ayuda a los donantes a entender la urgencia
              </p>
            </div>

            {/* Hospital */}
            <div className="space-y-2">
              <Label htmlFor="hospital">Hospital o Centro Médico</Label>
              <Input
                id="hospital"
                type="text"
                placeholder="Ej: Hospital Ángel C. Padilla"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Dirección Hospital */}
            <div className="space-y-2">
              <Label htmlFor="direccionHospital">Dirección del Hospital</Label>
              <Input
                id="direccionHospital"
                type="text"
                placeholder="Ej: Av. Belgrano 1900, San Miguel de Tucumán"
                value={direccionHospital}
                onChange={(e) => setDireccionHospital(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Visibilidad */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="esPublica"
                checked={esPublica}
                onChange={(e) => setEsPublica(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="esPublica" className="font-normal cursor-pointer">
                Hacer esta solicitud pública (visible para todos los donantes)
              </Label>
            </div>

            {prioridad === 'urgente' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Las solicitudes urgentes se notificarán inmediatamente a todos los donantes compatibles.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardContent className="border-t pt-6">
            <div className="flex space-x-4">
              <Button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={loading || !tipoSangre}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando solicitud...
                  </>
                ) : (
                  <>
                    <Droplet className="mr-2 h-4 w-4" />
                    Crear Solicitud
                  </>
                )}
              </Button>

              <Link href="/app-protected/solicitudes" className="flex-1">
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