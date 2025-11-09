'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Arreglar iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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

interface MapaInteractivoProps {
  donantes: Donante[]
  solicitudes: Solicitud[]
  miUbicacion: [number, number] | null
}

export default function MapaInteractivo({ donantes, solicitudes, miUbicacion }: MapaInteractivoProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Crear mapa centrado en Tucumán
    const center: [number, number] = miUbicacion || [-26.8083, -65.2176]
    
    const map = L.map(mapContainerRef.current).setView(center, 12)
    mapRef.current = map

    // Agregar capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // Cleanup
    return () => {
      map.remove()
    }
  }, [])

  // Actualizar marcadores cuando cambien los datos
  useEffect(() => {
    if (!mapRef.current) return

    const map = mapRef.current

    // Limpiar marcadores anteriores
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer)
      }
    })

    // Icono para donantes (azul)
    const donanteIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: #3b82f6;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">
          💉
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    })

    // Icono para solicitudes (rojo)
    const solicitudIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: #ef4444;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">
          🩸
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    })

    // Agregar marcadores de donantes
    donantes.forEach((donante) => {
      const marker = L.marker([donante.latitud, donante.longitud], {
        icon: donanteIcon
      }).addTo(map)

      marker.bindPopup(`
        <div style="padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 8px; color: #3b82f6;">
            🩸 ${donante.nombre} ${donante.apellido}
          </h3>
          <p style="margin: 4px 0;"><strong>Tipo de sangre:</strong> ${donante.tipo_sangre}</p>
          <p style="margin: 4px 0;"><strong>Ciudad:</strong> ${donante.ciudad}</p>
          <p style="margin: 4px 0;"><strong>Donaciones:</strong> ${donante.total_donaciones}</p>
          <p style="margin-top: 8px; font-size: 12px; color: #666;">
            Click para contactar (próximamente)
          </p>
        </div>
      `)
    })

    // Agregar marcadores de solicitudes
    solicitudes.forEach((solicitud) => {
      if (!solicitud.usuario.latitud || !solicitud.usuario.longitud) return

      const marker = L.marker(
        [solicitud.usuario.latitud, solicitud.usuario.longitud],
        { icon: solicitudIcon }
      ).addTo(map)

      const prioridadColor = {
        urgente: '#dc2626',
        alta: '#ea580c',
        media: '#eab308',
        baja: '#16a34a'
      }[solicitud.prioridad] || '#gray'

      marker.bindPopup(`
        <div style="padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 8px; color: ${prioridadColor};">
            ⚠️ Solicitud de ${solicitud.tipo_sangre_requerido}
          </h3>
          <p style="margin: 4px 0;"><strong>Unidades:</strong> ${solicitud.unidades_requeridas}</p>
          <p style="margin: 4px 0;"><strong>Prioridad:</strong> <span style="color: ${prioridadColor};">${solicitud.prioridad.toUpperCase()}</span></p>
          ${solicitud.hospital ? `<p style="margin: 4px 0;"><strong>Hospital:</strong> ${solicitud.hospital}</p>` : ''}
          <p style="margin: 4px 0;"><strong>Solicitante:</strong> ${solicitud.usuario.nombre} ${solicitud.usuario.apellido}</p>
          <p style="margin: 4px 0;"><strong>Ciudad:</strong> ${solicitud.usuario.ciudad}</p>
          <p style="margin-top: 8px; font-size: 12px; color: #666;">
            Click en "Solicitudes" para responder
          </p>
        </div>
      `)
    })

    // Agregar marcador de mi ubicación (verde)
    if (miUbicacion) {
      const miUbicacionIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: #22c55e;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 16px;
          ">
            📍
          </div>
        `,
        iconSize: [35, 35],
        iconAnchor: [17.5, 17.5],
      })

      const marker = L.marker(miUbicacion, {
        icon: miUbicacionIcon
      }).addTo(map)

      marker.bindPopup(`
        <div style="padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 4px; color: #22c55e;">
            📍 Tu Ubicación
          </h3>
          <p style="font-size: 12px; color: #666;">
            Lat: ${miUbicacion[0].toFixed(4)}, Lng: ${miUbicacion[1].toFixed(4)}
          </p>
        </div>
      `)

      // Centrar mapa en mi ubicación
      map.setView(miUbicacion, 13)
    }

    // Ajustar vista para mostrar todos los marcadores
    const allMarkers: L.LatLngExpression[] = [
      ...donantes.map(d => [d.latitud, d.longitud] as L.LatLngExpression),
      ...solicitudes
        .filter(s => s.usuario.latitud && s.usuario.longitud)
        .map(s => [s.usuario.latitud!, s.usuario.longitud!] as L.LatLngExpression),
    ]

    if (miUbicacion) {
      allMarkers.push(miUbicacion)
    }

    if (allMarkers.length > 0) {
      const bounds = L.latLngBounds(allMarkers)
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
    }

  }, [donantes, solicitudes, miUbicacion])

  return (
    <div 
      ref={mapContainerRef} 
      className="h-[600px] w-full rounded-lg overflow-hidden border shadow-sm"
      style={{ zIndex: 0 }}
    />
  )
}