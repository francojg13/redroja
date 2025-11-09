'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Heart, 
  Droplet, 
  Users, 
  TrendingUp,
  AlertCircle,
  Loader2,
  CheckCircle,
  Upload,
  Plus,
  Clock,
  Calendar
} from 'lucide-react'

interface Stats {
  solicitudesActivas: number
  donacionesProgramadas: number
  donantesDisponibles: number
  misTotalDonaciones: number
}

interface PerfilMedico {
  apto_medico: boolean
  ultima_donacion: string | null
  total_donaciones: number
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats>({
    solicitudesActivas: 0,
    donacionesProgramadas: 0,
    donantesDisponibles: 0,
    misTotalDonaciones: 0
  })
  const [perfilMedico, setPerfilMedico] = useState<PerfilMedico | null>(null)
  const [usuarioRol, setUsuarioRol] = useState<'donante' | 'receptor' | 'ambos'>('donante')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error: dbError } = await supabase
        .from('usuario')
        .select('*, perfil_medico(*)')
        .eq('auth_id', user.id)
        .single()

      if (dbError) throw dbError
      if (!data) throw new Error('Usuario no encontrado')

      setUsuarioRol(data.rol)
      setPerfilMedico(data.perfil_medico)

      // Solicitudes activas
      const { count: solicitudesCount } = await supabase
        .from('solicitud')
        .select('*', { count: 'exact', head: true })
        .in('estado', ['pendiente', 'en_proceso'])
        .eq('es_publica', true)

      // Donaciones programadas (solo si es donante)
      let donacionesCount = 0
      if (data.rol === 'donante' || data.rol === 'ambos') {
        const { count } = await supabase
          .from('donacion')
          .select('*', { count: 'exact', head: true })
          .eq('donante_id', data.id)
          .eq('estado', 'programada')
        
        donacionesCount = count || 0
      }

      // Donantes disponibles
      const { count: donantesCount } = await supabase
        .from('usuario')
        .select('perfil_medico!inner(*)', { count: 'exact', head: true })
        .eq('activo', true)
        .eq('perfil_medico.apto_medico', true)

      setStats({
        solicitudesActivas: solicitudesCount || 0,
        donacionesProgramadas: donacionesCount,
        donantesDisponibles: donantesCount || 0,
        misTotalDonaciones: data.perfil_medico?.total_donaciones || 0
      })

    } catch (err: any) {
      console.error('Error cargando dashboard:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido a Red Roja - Sistema de donación de sangre
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Activas</CardTitle>
            <Droplet className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.solicitudesActivas}</div>
            <p className="text-xs text-muted-foreground">
              Personas necesitan sangre
            </p>
          </CardContent>
        </Card>

        {(usuarioRol === 'donante' || usuarioRol === 'ambos') && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mis Donaciones</CardTitle>
              <Heart className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.misTotalDonaciones}</div>
              <p className="text-xs text-muted-foreground">
                {stats.donacionesProgramadas > 0 
                  ? `${stats.donacionesProgramadas} programada(s)`
                  : 'Total completadas'}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Donantes Activos</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.donantesDisponibles}</div>
            <p className="text-xs text-muted-foreground">
              Disponibles para donar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impacto</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.misTotalDonaciones * 3}</div>
            <p className="text-xs text-muted-foreground">
              Vidas salvadas aprox.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Acción Requerida */}
        {(usuarioRol === 'donante' || usuarioRol === 'ambos') && !perfilMedico?.apto_medico && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-yellow-600" />
                Acción Requerida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Para poder donar sangre, necesitas subir tu certificado médico actualizado.
                </AlertDescription>
              </Alert>
              <Link href="/app-protected/perfil">
                <Button className="w-full mt-4 bg-red-600 hover:bg-red-700">
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Certificado Médico
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {usuarioRol === 'receptor' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Heart className="mr-2 h-5 w-5 text-red-600" />
                Tu Actividad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Como receptor</strong>, puedes crear solicitudes de sangre cuando necesites.
                  La comunidad de donantes verá tus solicitudes y podrá responder.
                </p>
              </div>
              <Link href="/app-protected/solicitudes/nueva">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Nueva Solicitud
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Próximos Pasos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximos Pasos</CardTitle>
            <CardDescription>
              {usuarioRol === 'receptor' 
                ? 'Completa estos pasos para usar el sistema como receptor'
                : 'Completa estos pasos para empezar a donar sangre'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(usuarioRol === 'donante' || usuarioRol === 'ambos') && (
              <>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {perfilMedico?.apto_medico ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <Clock className="h-6 w-6 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Subir certificado médico</h4>
                    <p className="text-sm text-muted-foreground">
                      {perfilMedico?.apto_medico 
                        ? '✅ Completado - Certificado válido'
                        : 'Pendiente - Ve a tu perfil'}
                    </p>
                    {!perfilMedico?.apto_medico && (
                      <Link href="/app-protected/perfil">
                        <Button variant="link" className="p-0 h-auto text-red-600">
                          Ir al perfil →
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {stats.donacionesProgramadas > 0 ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <Clock className="h-6 w-6 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Programar primera donación</h4>
                    <p className="text-sm text-muted-foreground">
                      {stats.donacionesProgramadas > 0
                        ? `✅ Tienes ${stats.donacionesProgramadas} donación(es) programada(s)`
                        : 'Programa tu primera donación de sangre'}
                    </p>
                    {stats.donacionesProgramadas === 0 && perfilMedico?.apto_medico && (
                      <Link href="/app-protected/donaciones/nueva">
                        <Button variant="link" className="p-0 h-auto text-red-600">
                          Programar donación →
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </>
            )}

            {usuarioRol === 'receptor' && (
              <>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {stats.solicitudesActivas > 0 ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <Clock className="h-6 w-6 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Crear solicitud de sangre</h4>
                    <p className="text-sm text-muted-foreground">
                      {stats.solicitudesActivas > 0
                        ? `✅ Tienes solicitud(es) activa(s)`
                        : 'Crea una solicitud cuando necesites sangre'}
                    </p>
                    {stats.solicitudesActivas === 0 && (
                      <Link href="/app-protected/solicitudes/nueva">
                        <Button variant="link" className="p-0 h-auto text-red-600">
                          Crear solicitud →
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Explorar solicitudes</h4>
                <p className="text-sm text-muted-foreground">
                  {usuarioRol === 'receptor'
                    ? 'Ve qué otras personas necesitan sangre'
                    : 'Ve a la sección de solicitudes para ver quién necesita sangre'}
                </p>
                <Link href="/app-protected/solicitudes">
                  <Button variant="link" className="p-0 h-auto text-red-600">
                    Ver solicitudes →
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}