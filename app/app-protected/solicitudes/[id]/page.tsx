'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Droplet, 
  Calendar, 
  MapPin, 
  User,
  AlertCircle,
  Loader2,
  Heart,
  CheckCircle
} from 'lucide-react'
import { PRIORIDADES } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface SolicitudDetalle {
  id: string
  tipo_sangre_requerido: string
  unidades_requeridas: number
  prioridad: 'baja' | 'media' | 'alta' | 'urgente'
  estado: string
  motivo: string | null
  hospital: string | null
  direccion_hospital: string | null
  fecha_necesidad: string
  created_at: string
  usuario_solicitante: {
    nombre: string
    apellido: string
    ciudad: string
    email: string
  }
}

export default function DetallesSolicitudPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const solicitudId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [solicitud, setSolicitud] = useState<SolicitudDetalle | null>(null)
  const [usuarioActual, setUsuarioActual] = useState<any>(null)

  useEffect(() => {
    cargarDatos()
  }, [solicitudId])

  const cargarDatos = async () => {
    try {
      setLoading(true)

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const { data: usuario } = await supabase
        .from('usuario')
        .select('*, perfil_medico(*)')
        .eq('auth_id', user.id)
        .single()

      setUsuarioActual(usuario)

      // Obtener solicitud
      const { data: solicitudData, error: solicitudError } = await supabase
        .from('solicitud')
        .select(`
          *,
          usuario_solicitante:usuario_solicitante_id (
            nombre,
            apellido,
            ciudad,
            email
          )
        `)
        .eq('id', solicitudId)
        .single()

      if (solicitudError) throw solicitudError
      if (!solicitudData) throw new Error('Solicitud no encontrada')

      setSolicitud(solicitudData as any)

    } catch (err: any) {
      console.error('Error cargando solicitud:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const responderSolicitud = async () => {
    if (!usuarioActual) return

    setResponding(true)
    setError(null)

    try {
      // Verificar que puede donar
      const perfilMedico = usuarioActual.perfil_medico

      if (!perfilMedico.apto_medico) {
        throw new Error('Necesitas subir tu certificado médico antes de responder')
      }

      // Verificar compatibilidad de sangre
      // (Esto es una simplificación - en producción usarías la función de la BD)
      // if (perfilMedico.tipo_sangre !== solicitud.tipo_sangre_requerido) {
      //   throw new Error('Tu tipo de sangre no es compatible con esta solicitud')
      // }

      // Crear donación programada
      const { error: donacionError } = await supabase
        .from('donacion')
        .insert({
          donante_id: usuarioActual.id,
          solicitud_id: solicitud!.id,
          fecha_donacion: solicitud!.fecha_necesidad,
          tipo_sangre: perfilMedico.tipo_sangre,
          estado: 'programada',
          unidades_donadas: 1
        })

      if (donacionError) throw donacionError

      // Actualizar estado de solicitud
      const { error: updateError } = await supabase
        .from('solicitud')
        .update({ estado: 'en_proceso' })
        .eq('id', solicitud!.id)

      if (updateError) throw updateError

      setSuccess('¡Gracias por responder! Tu donación ha sido programada.')
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/app-protected/donaciones')
      }, 2000)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setResponding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando detalles...</p>
        </div>
      </div>
    )
  }

  if (error && !solicitud) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Link href="/app-protected/solicitudes">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Solicitudes
          </Button>
        </Link>
      </div>
    )
  }

  if (!solicitud) return null

  const prioridad = PRIORIDADES[solicitud.prioridad]

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
        <h1 className="text-3xl font-bold tracking-tight">Detalles de la Solicitud</h1>
      </div>

      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Información Principal */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <Droplet className="h-8 w-8 text-red-600" />
              <div>
                <CardTitle className="text-3xl font-bold text-red-600">
                  {solicitud.tipo_sangre_requerido}
                </CardTitle>
                <CardDescription>
                  {solicitud.unidades_requeridas} {solicitud.unidades_requeridas === 1 ? 'unidad' : 'unidades'} requeridas
                </CardDescription>
              </div>
            </div>
            <Badge className={`${prioridad.color} text-white text-lg px-4 py-1`}>
              {prioridad.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Motivo */}
          {solicitud.motivo && (
            <div>
              <h3 className="font-semibold mb-2">Motivo de la Solicitud</h3>
              <p className="text-muted-foreground">{solicitud.motivo}</p>
            </div>
          )}

          <Separator />

          {/* Detalles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Fecha Necesidad</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(solicitud.fecha_necesidad)}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Solicitante</p>
                <p className="text-sm text-muted-foreground">
                  {solicitud.usuario_solicitante.nombre} {solicitud.usuario_solicitante.apellido}
                </p>
              </div>
            </div>

            {solicitud.hospital && (
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Hospital</p>
                  <p className="text-sm text-muted-foreground">{solicitud.hospital}</p>
                  {solicitud.direccion_hospital && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {solicitud.direccion_hospital}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Ciudad</p>
                <p className="text-sm text-muted-foreground">
                  {solicitud.usuario_solicitante.ciudad}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Estado */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Estado de la Solicitud</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Publicada el {formatDate(solicitud.created_at)}
                </p>
              </div>
              <Badge variant="outline" className="text-sm">
                {solicitud.estado.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acción */}
      {solicitud.estado === 'pendiente' && usuarioActual && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="mr-2 h-5 w-5 text-red-600" />
              ¿Quieres ayudar?
            </CardTitle>
            <CardDescription>
              Programa tu donación para esta solicitud
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!usuarioActual.perfil_medico?.apto_medico && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Necesitas subir tu certificado médico antes de poder responder a solicitudes.
                  <Link href="/app-protected/perfil" className="underline ml-1">
                    Ir a mi perfil
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tu tipo de sangre:</strong> {usuarioActual.perfil_medico?.tipo_sangre || 'No especificado'}
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <strong>Compatibilidad:</strong> {usuarioActual.perfil_medico?.tipo_sangre === solicitud.tipo_sangre_requerido 
                  ? '✅ Compatible' 
                  : '⚠️ Verifica compatibilidad con tu médico'}
              </p>
            </div>

            <Button
              onClick={responderSolicitud}
              disabled={responding || !usuarioActual.perfil_medico?.apto_medico}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {responding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Programando donación...
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Quiero Donar
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}