'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Users, 
  Droplet, 
  AlertCircle,
  Loader2,
  Navigation
} from 'lucide-react'
import { TIPOS_SANGRE } from '@/lib/constants'
import dynamic from 'next/dynamic'

// Importar el componente del mapa de forma dinámica (para evitar SSR)
const MapaComponent = dynamic(() => import('@/components/maps/MapaInteractivo'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-muted rounded-lg flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-red-600 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Cargando mapa...</p>
      </div>
    </div>
  )
})

interface Donante {
  id: string
  nombre: string
  apellido: string
  ciudad: string
  latitud: number
  longitud: number
  tipo_sangre: string
  total_donaciones: number
}

interface Solicitud {
  id: string
  tipo_sangre_requerido: string
  unidades_requeridas: number
  prioridad: string
  hospital: string | null
  usuario: {
    nombre: string
    apellido: string
    ciudad: string
    latitud: number | null
    longitud: number | null
  }
}

export default function MapaPage() {
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [donantes, setDonantes] = useState<Donante[]>([])
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [miUbicacion, setMiUbicacion] = useState<[number, number] | null>(null)
  
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [mostrarDonantes, setMostrarDonantes] = useState(true)
  const [mostrarSolicitudes, setMostrarSolicitudes] = useState(true)

  useEffect(() => {
    cargarDatos()
    obtenerUbicacion()
  }, [])

  const obtenerUbicacion = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMiUbicacion([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.log('Error obteniendo ubicación:', error)
        }
      )
    }
  }

  const cargarDatos = async () => {
    try {
      setLoading(true)

      // Cargar donantes con ubicación
      const { data: donantesData, error: donantesError } = await supabase
        .from('usuario')
        .select(`
          id,
          nombre,
          apellido,
          ciudad,
          latitud,
          longitud,
          perfil_medico (
            tipo_sangre,
            total_donaciones,
            apto_medico
          )
        `)
        .eq('rol', 'donante')
        .eq('activo', true)
        .not('latitud', 'is', null)
        .not('longitud', 'is', null)

      if (donantesError) throw donantesError

const donantesMapeados = (donantesData || [])
  .filter(d => {
    const perfil = Array.isArray(d.perfil_medico) ? d.perfil_medico[0] : d.perfil_medico
    return perfil?.apto_medico
  })
  .map(d => {
    const perfil = Array.isArray(d.perfil_medico) ? d.perfil_medico[0] : d.perfil_medico
    return {
      id: d.id,
      nombre: d.nombre,
      apellido: d.apellido,
      ciudad: d.ciudad,
      latitud: d.latitud!,
      longitud: d.longitud!,
      tipo_sangre: perfil.tipo_sangre,
      total_donaciones: perfil.total_donaciones
    }
  })

      setDonantes(donantesMapeados)

      // Cargar solicitudes activas
      const { data: solicitudesData, error: solicitudesError } = await supabase
        .from('solicitud')
        .select(`
          id,
          tipo_sangre_requerido,
          unidades_requeridas,
          prioridad,
          hospital,
          usuario:usuario_solicitante_id (
            nombre,
            apellido,
            ciudad,
            latitud,
            longitud
          )
        `)
        .in('estado', ['pendiente', 'en_proceso'])
        .eq('es_publica', true)

      if (solicitudesError) throw solicitudesError

const solicitudesMapeadas = (solicitudesData || [])
  .filter(s => {
    const usuario = Array.isArray(s.usuario) ? s.usuario[0] : s.usuario
    return usuario?.latitud && usuario?.longitud
  })
  .map(s => {
    const usuario = Array.isArray(s.usuario) ? s.usuario[0] : s.usuario
    return {
      id: s.id,
      tipo_sangre_requerido: s.tipo_sangre_requerido,
      unidades_requeridas: s.unidades_requeridas,
      prioridad: s.prioridad,
      hospital: s.hospital,
      usuario: {
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        ciudad: usuario.ciudad,
        latitud: usuario.latitud,
        longitud: usuario.longitud
      }
    }
  })

      setSolicitudes(solicitudesMapeadas)

    } catch (err: any) {
      console.error('Error cargando datos:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const donantesFiltrados = filtroTipo === 'todos' 
    ? donantes 
    : donantes.filter(d => d.tipo_sangre === filtroTipo)

  const solicitudesFiltradas = filtroTipo === 'todos'
    ? solicitudes
    : solicitudes.filter(s => s.tipo_sangre_requerido === filtroTipo)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando mapa y ubicaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mapa de Donantes</h1>
        <p className="text-muted-foreground mt-2">
          Explora donantes y solicitudes cercanas a tu ubicación
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Donantes Activos</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donantesFiltrados.length}</div>
            <p className="text-xs text-muted-foreground">
              Con ubicación registrada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Activas</CardTitle>
            <Droplet className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{solicitudesFiltradas.length}</div>
            <p className="text-xs text-muted-foreground">
              Necesitan donantes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tu Ubicación</CardTitle>
            <Navigation className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {miUbicacion ? '✓' : '✗'}
            </div>
            <p className="text-xs text-muted-foreground">
              {miUbicacion ? 'Detectada' : 'No disponible'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros y Capas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Filtrar por Tipo de Sangre</label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  {TIPOS_SANGRE.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mostrar en el Mapa</label>
              <div className="flex flex-col space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mostrarDonantes}
                    onChange={(e) => setMostrarDonantes(e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm">Donantes</span>
                  <Badge className="bg-blue-500 text-white ml-auto">
                    {donantesFiltrados.length}
                  </Badge>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mostrarSolicitudes}
                    onChange={(e) => setMostrarSolicitudes(e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm">Solicitudes</span>
                  <Badge className="bg-red-500 text-white ml-auto">
                    {solicitudesFiltradas.length}
                  </Badge>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Acciones</label>
              <Button 
                onClick={obtenerUbicacion} 
                variant="outline" 
                className="w-full"
              >
                <Navigation className="mr-2 h-4 w-4" />
                Actualizar Mi Ubicación
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mapa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Mapa Interactivo
          </CardTitle>
          <CardDescription>
            Haz click en los marcadores para ver más información
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MapaComponent
            donantes={mostrarDonantes ? donantesFiltrados : []}
            solicitudes={mostrarSolicitudes ? solicitudesFiltradas : []}
            miUbicacion={miUbicacion}
          />
        </CardContent>
      </Card>

      {/* Leyenda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leyenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
              <span className="text-sm">Donantes disponibles</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
              <span className="text-sm">Solicitudes activas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
              <span className="text-sm">Tu ubicación</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}