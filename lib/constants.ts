export const TIPOS_SANGRE = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
] as const

export type TipoSangre = typeof TIPOS_SANGRE[number]

export const PRIORIDADES = {
  baja: { 
    label: 'Baja', 
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgLight: 'bg-green-100'
  },
  media: { 
    label: 'Media', 
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgLight: 'bg-yellow-100'
  },
  alta: { 
    label: 'Alta', 
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgLight: 'bg-orange-100'
  },
  urgente: { 
    label: 'Urgente', 
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgLight: 'bg-red-100'
  }
} as const

export const ESTADOS_SOLICITUD = {
  pendiente: { label: 'Pendiente', color: 'bg-blue-500' },
  en_proceso: { label: 'En Proceso', color: 'bg-yellow-500' },
  completada: { label: 'Completada', color: 'bg-green-500' },
  cancelada: { label: 'Cancelada', color: 'bg-gray-500' }
} as const

export const ESTADOS_DONACION = {
  programada: { label: 'Programada', color: 'bg-blue-500' },
  completada: { label: 'Completada', color: 'bg-green-500' },
  cancelada: { label: 'Cancelada', color: 'bg-gray-500' },
  no_asistio: { label: 'No Asistió', color: 'bg-red-500' }
} as const

// Tabla de compatibilidad de sangre
// Clave: tipo de donante, Valor: array de tipos compatibles para recibir
export const COMPATIBILIDAD_SANGRE: Record<TipoSangre, TipoSangre[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Donante universal
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+']
}

// Función auxiliar para verificar compatibilidad
export function esCompatible(tipoDonante: TipoSangre, tipoReceptor: TipoSangre): boolean {
  return COMPATIBILIDAD_SANGRE[tipoDonante]?.includes(tipoReceptor) || false
}

// Función para obtener donantes compatibles con un tipo de sangre
export function getTiposDonanteCompatibles(tipoReceptor: TipoSangre): TipoSangre[] {
  return TIPOS_SANGRE.filter(tipoDonante => 
    COMPATIBILIDAD_SANGRE[tipoDonante].includes(tipoReceptor)
  )
}

export const PROVINCIAS_TUCUMAN = [
  'San Miguel de Tucumán',
  'Yerba Buena',
  'Tafí Viejo',
  'Banda del Río Salí',
  'Concepción',
  'Aguilares',
  'Monteros',
  'Famaillá',
  'Alderetes',
  'Simoca'
] as const

export const ROLES_USUARIO = {
  donante: 'Donante',
  receptor: 'Receptor',
  ambos: 'Donante y Receptor'
} as const

// Coordenadas del centro de Tucumán (para mapas)
export const TUCUMAN_CENTER = {
  lat: -26.8083,
  lng: -65.2176
}

// Límites de Tucumán (para validación de ubicación)
export const TUCUMAN_BOUNDS = {
  north: -26.3,
  south: -27.9,
  east: -64.8,
  west: -66.0
}