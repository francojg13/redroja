'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Droplet, 
  Calendar, 
  MapPin, 
  AlertCircle,
  Filter,
  Loader2
} from 'lucide-react'
import { TIPOS_SANGRE, PRIORIDADES } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface Solicitud {
  id: string
  tipo_sangre_requerido: string
  unidades_requeridas: number
  prioridad: 'baja' | 'media' | 'alta' | 'urgente'
  estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada'
  motivo: string | null
  hospital: string | null
  fecha_necesidad: string
  created_at: string
  usuario: {
    nombre: string
    apellido: string
    ciudad: string
  }
}

export default function SolicitudesPage() {
  const supabase = createClient()
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filtros
  const [filtroTipoSangre, setFiltroTipoSangre] = useState<string>('todos')
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('todos')
  const [filtroEstado, setFiltroEstado] = useState<string>('activas')

  useEffect(() => {
    cargarSolicitudes()
  }, [filtroTipoSangre, filtroPrioridad, filtroEstado])

  const cargarSolicitudes = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('solicitud')
        .select(`
          *,
          usuario:usuario_solicitante_id (
            nombre,
            apellido,
            ciudad
          )
        `)
        .eq('es_publica', true)
        .order('prioridad', { ascending: false })
        .order('created_at', { ascending: false })

      // Aplicar filtros
      if (filtroTipoSangre !== 'todos') {
        query = query.eq('tipo_sangre_requerido', filtroTipoSangre)
      }

      if (filtroPrioridad !== 'todos') {
        query = query.eq('prioridad', filtroPrioridad)
      }

      if (filtroEstado === 'activas') {
        query = query.in('estado', ['pendiente', 'en_proceso'])
      } else if (filtroEstado !== 'todos') {
        query = query.eq('estado', filtroEstado)
      }

      const { data, error } = await query

      if (error) throw error

      setSolicitudes(data || [])
    } catch (err: any) {
      console.error('Error cargando solicitudes:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getPrioridadBadge = (prioridad: string) => {
    const config = PRIORIDADES[prioridad as keyof typeof PRIORIDADES]
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    )
  }

  const getEstadoBadge = (estado: string) => {
    const colores = {
      pendiente: 'bg-blue-500',
      en_proceso: 'bg-yellow-500',
      completada: 'bg-green-500',
      cancelada: 'bg-gray-500'
    }
    
    const labels = {
      pendiente: 'Pendiente',
      en_proceso: 'En Proceso',
      completada: 'Completada',
      cancelada: 'Cancelada'
    }

    return (
      <Badge className={`${colores[estado as keyof typeof colores]} text-white`}>
        {labels[estado as keyof typeof labels]}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando solicitudes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Solicitudes de Sangre</h1>
          <p className="text-muted-foreground mt-2">
            Personas que necesitan donantes compatibles
          </p>
        </div>
        <Link href="/app-protected/solicitudes/nueva">
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Solicitud
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Sangre</label>
              <Select value={filtroTipoSangre} onValueChange={setFiltroTipoSangre}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {TIPOS_SANGRE.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridad</label>
              <Select value={filtroPrioridad} onValueChange={setFiltroPrioridad}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activas">Activas</SelectItem>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_proceso">En Proceso</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error: {error}</AlertDescription>
        </Alert>
      )}

      {/* Lista de Solicitudes */}
      {solicitudes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Droplet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay solicitudes</h3>
            <p className="text-muted-foreground">
              No se encontraron solicitudes con los filtros seleccionados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {solicitudes.map((solicitud) => (
            <Card key={solicitud.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Droplet className="h-5 w-5 text-red-600" />
                    <CardTitle className="text-2xl font-bold text-red-600">
                      {solicitud.tipo_sangre_requerido}
                    </CardTitle>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getPrioridadBadge(solicitud.prioridad)}
                    {getEstadoBadge(solicitud.estado)}
                  </div>
                </div>
                <CardDescription>
                  {solicitud.unidades_requeridas} {solicitud.unidades_requeridas === 1 ? 'unidad requerida' : 'unidades requeridas'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {solicitud.motivo && (
                  <p className="text-sm">
                    <strong>Motivo:</strong> {solicitud.motivo}
                  </p>
                )}

                {solicitud.hospital && (
                  <div className="flex items-start space-x-2 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium">{solicitud.hospital}</p>
                      <p className="text-muted-foreground">{solicitud.usuario?.ciudad}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Necesario para: {formatDate(solicitud.fecha_necesidad)}</span>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Solicitado por: <span className="font-medium text-foreground">
                      {solicitud.usuario?.nombre} {solicitud.usuario?.apellido}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Publicado: {formatDate(solicitud.created_at)}
                  </p>
                </div>

                <Link href={`/app-protected/solicitudes/${solicitud.id}`}>
                  <Button className="w-full" variant="outline">
                    Ver Detalles / Responder
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}