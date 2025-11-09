import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea una fecha a formato legible en español
 * Soluciona el problema de timezone mostrando la fecha local correcta
 */
export function formatDate(dateString: string): string {
  if (!dateString) return ''
  
  // Separar la fecha del string ISO (YYYY-MM-DD)
  const [year, month, day] = dateString.split('T')[0].split('-')
  
  // Crear fecha usando los valores directos (sin conversión de timezone)
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Calcula la edad a partir de una fecha de nacimiento
 */
export function calcularEdad(fechaNacimiento: string): number {
  if (!fechaNacimiento) return 0
  
  const [year, month, day] = fechaNacimiento.split('T')[0].split('-')
  const nacimiento = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  const hoy = new Date()
  
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--
  }
  
  return edad
}

/**
 * Verifica si puede donar (60 días desde última donación)
 */
export function puedeDonar(ultimaDonacion: string): boolean {
  if (!ultimaDonacion) return true
  
  const [year, month, day] = ultimaDonacion.split('T')[0].split('-')
  const fechaUltima = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  const hoy = new Date()
  
  const diasPasados = Math.floor((hoy.getTime() - fechaUltima.getTime()) / (1000 * 60 * 60 * 24))
  
  return diasPasados >= 60
}

/**
 * Calcula días restantes hasta poder donar
 */
export function diasHastaPoderDonar(ultimaDonacion: string): number {
  if (!ultimaDonacion) return 0
  
  const [year, month, day] = ultimaDonacion.split('T')[0].split('-')
  const fechaUltima = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  const hoy = new Date()
  
  const diasPasados = Math.floor((hoy.getTime() - fechaUltima.getTime()) / (1000 * 60 * 60 * 24))
  const diasRestantes = 60 - diasPasados
  
  return diasRestantes > 0 ? diasRestantes : 0
}

/**
 * Formatea una fecha para inputs de tipo date (YYYY-MM-DD)
 */
export function formatDateForInput(dateString: string): string {
  if (!dateString) return ''
  return dateString.split('T')[0]
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 */
export function getTodayDate(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formatea fecha y hora
 */
export function formatDateTime(dateString: string): string {
  if (!dateString) return ''
  
  const [datePart] = dateString.split('T')
  const [year, month, day] = datePart.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}