'use client'

import { User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Heart, 
  Calendar, 
  MapPin, 
  AlertCircle,
  Loader2,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react'
import { formatDate, puedeDonar, diasHastaPoderDonar } from '@/lib/utils'
import Link from 'next/link'

interface Donacion {
  id: string
  fecha_donacion: string
  unidades_donadas: number
  tipo_sangre: string
  estado: 'programada' | 'completada' | 'cancelada' | 'no_asistio'
  ubicacion_donacion: string | null
  es_primera_vez: boolean
  created_at: string
  banco_sangre: {
    nombre: string
    direccion: string
  } | null
}

interface PerfilMedico {
  ultima_donacion: string | null
  total_donaciones: number
  tipo_sangre: string
}

export default function DonacionesPage() {
  const supabase = createClient()
  const [donaciones, setDonaciones] = useState<Donacion[]>([])
  const [perfilMedico, setPerfilMedico] = useState<PerfilMedico | null>(null)
  const [usuarioRol, setUsuarioRol] = useState<'donante' | 'receptor' | 'ambos'>('donante')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Obtener ID del usuario en la tabla
const { data: usuario } = await supabase
  .from('usuario')
  .select('id, rol, perfil_medico(*)')
  .eq('auth_id', user.id)
  .single()

if (!usuario) {
  throw new Error('Usuario no encontrado')
}

setUsuarioRol(usuario.rol)
setPerfilMedico(usuario.perfil_medico)

// Si es receptor, no cargar donaciones
if (usuario.rol === 'receptor') {
  setDonaciones([])
  setLoading(false)
  return
}

      // Obtener donaciones del usuario
      const { data: donacionesData, error: donacionesError } = await supabase
        .from('donacion')
        .select(`
          *,
          banco_sangre (
            nombre,
            direccion
          )
        `)
        .eq('donante_id', usuario.id)
        .order('fecha_donacion', { ascending: false })

      if (donacionesError) throw donacionesError

      setDonaciones(donacionesData || [])
    } catch (err: any) {
      console.error('Error cargando donaciones:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    const config = {
      programada: { color: 'bg-blue-500', label: 'Programada' },
      completada: { color: 'bg-green-500', label: 'Completada' },
      cancelada: { color: 'bg-gray-500', label: 'Cancelada' },
      no_asistio: { color: 'bg-red-500', label: 'No Asistió' }
    }
    
    const { color, label } = config[estado as keyof typeof config]
    return <Badge className={`${color} text-white`}>{label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando historial...</p>
        </div>
      </div>
    )
  }

  if (usuarioRol === 'receptor') {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Donaciones</h1>
        <p className="text-muted-foreground mt-2">
          Información sobre donaciones de sangre
        </p>
      </div>

      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          Los usuarios con rol <strong>"Receptor"</strong> no pueden programar donaciones.
          Si deseas donar sangre, cambia tu rol a "Donante" o "Ambos" en tu perfil.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="mr-2 h-5 w-5 text-red-600" />
            ¿Quieres ser donante?
          </CardTitle>
          <CardDescription>
            Cambia tu rol en el perfil para poder donar sangre y salvar vidas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Requisitos para ser donante:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Tener entre 18 y 65 años</li>
              <li>Pesar más de 50 kg</li>
              <li>Estar en buen estado de salud</li>
              <li>Subir certificado médico actualizado</li>
            </ul>
          </div>

          <Link href="/app-protected/perfil">
            <Button className="w-full bg-red-600 hover:bg-red-700">
              <User className="mr-2 h-4 w-4" />
              Ir a Mi Perfil
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

  const puedeDonante = perfilMedico?.ultima_donacion 
    ? puedeDonar(perfilMedico.ultima_donacion)
    : true

  const diasRestantes = perfilMedico?.ultima_donacion && !puedeDonante
    ? diasHastaPoderDonar(perfilMedico.ultima_donacion)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Donaciones</h1>
          <p className="text-muted-foreground mt-2">
            Historial y estadísticas de tus donaciones
          </p>
        </div>
        <Link href="/app-protected/donaciones/nueva">
          <Button 
            className="bg-red-600 hover:bg-red-700"
            disabled={!puedeDonante}
          >
            <Plus className="mr-2 h-4 w-4" />
            Programar Donación
          </Button>
        </Link>
      </div>

      {/* Alerta si no puede donar */}
      {!puedeDonante && perfilMedico && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Debes esperar <strong>{diasRestantes} días</strong> más antes de poder donar nuevamente.
            Última donación: {formatDate(perfilMedico.ultima_donacion!)}
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Donaciones</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{perfilMedico?.total_donaciones || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Vidas salvadas aproximadamente: {(perfilMedico?.total_donaciones || 0) * 3}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Donación</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {perfilMedico?.ultima_donacion 
                ? formatDate(perfilMedico.ultima_donacion)
                : 'Nunca'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {puedeDonante ? '¡Puedes donar!' : `Espera ${diasRestantes} días`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nivel</CardTitle>
            <Award className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {perfilMedico?.total_donaciones === 0 && 'Novato'}
              {perfilMedico && perfilMedico.total_donaciones >= 1 && perfilMedico.total_donaciones < 5 && 'Héroe'}
              {perfilMedico && perfilMedico.total_donaciones >= 5 && perfilMedico.total_donaciones < 10 && 'Veterano'}
              {perfilMedico && perfilMedico.total_donaciones >= 10 && 'Leyenda'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Basado en donaciones completadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error: {error}</AlertDescription>
        </Alert>
      )}

      {/* Historial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Historial de Donaciones
          </CardTitle>
          <CardDescription>
            Todas tus donaciones registradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {donaciones.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay donaciones registradas</h3>
              <p className="text-muted-foreground mb-4">
                ¡Programa tu primera donación y salva vidas!
              </p>
              <Link href="/app-protected/donaciones/nueva">
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Programar Donación
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {donaciones.map((donacion) => (
                <div
                  key={donacion.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-red-600" />
                      <p className="font-semibold">
                        {donacion.unidades_donadas} {donacion.unidades_donadas === 1 ? 'unidad' : 'unidades'} - {donacion.tipo_sangre}
                      </p>
                      {donacion.es_primera_vez && (
                        <Badge variant="outline" className="text-xs">
                          Primera vez
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(donacion.fecha_donacion)}</span>
                      </div>
                      
                      {(donacion.ubicacion_donacion || donacion.banco_sangre) && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {donacion.banco_sangre?.nombre || donacion.ubicacion_donacion}
                          </span>
                        </div>
                      )}
                    </div>

                    {donacion.banco_sangre?.direccion && (
                      <p className="text-xs text-muted-foreground">
                        {donacion.banco_sangre.direccion}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    {getEstadoBadge(donacion.estado)}
                    <p className="text-xs text-muted-foreground">
                      {formatDate(donacion.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}