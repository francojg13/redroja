export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      usuario: {
        Row: {
          id: string
          auth_id: string | null
          email: string
          nombre: string
          apellido: string
          fecha_nacimiento: string
          telefono: string | null
          dni: string
          direccion: string | null
          ciudad: string
          latitud: number | null
          longitud: number | null
          rol: 'donante' | 'receptor' | 'ambos'
          activo: boolean
          created_at: string
          updated_at: string
          ultimo_login: string | null
        }
        Insert: {
          id?: string
          auth_id?: string | null
          email: string
          nombre: string
          apellido: string
          fecha_nacimiento: string
          telefono?: string | null
          dni: string
          direccion?: string | null
          ciudad?: string
          latitud?: number | null
          longitud?: number | null
          rol?: 'donante' | 'receptor' | 'ambos'
          activo?: boolean
          created_at?: string
          updated_at?: string
          ultimo_login?: string | null
        }
        Update: {
          id?: string
          auth_id?: string | null
          email?: string
          nombre?: string
          apellido?: string
          fecha_nacimiento?: string
          telefono?: string | null
          dni?: string
          direccion?: string | null
          ciudad?: string
          latitud?: number | null
          longitud?: number | null
          rol?: 'donante' | 'receptor' | 'ambos'
          activo?: boolean
          created_at?: string
          updated_at?: string
          ultimo_login?: string | null
        }
      }
      perfil_medico: {
        Row: {
          id: string
          usuario_id: string
          tipo_sangre: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
          factor_rh: 'positivo' | 'negativo'
          peso: number | null
          apto_medico: boolean
          url_certificado_apto: string | null
          fecha_apto: string | null
          fecha_vencimiento_apto: string | null
          enfermedades_previas: string | null
          medicamentos_actuales: string | null
          fumador: boolean
          tatuajes_recientes: boolean
          ultima_donacion: string | null
          total_donaciones: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          tipo_sangre: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
          factor_rh: 'positivo' | 'negativo'
          peso?: number | null
          apto_medico?: boolean
          url_certificado_apto?: string | null
          fecha_apto?: string | null
          fecha_vencimiento_apto?: string | null
          enfermedades_previas?: string | null
          medicamentos_actuales?: string | null
          fumador?: boolean
          tatuajes_recientes?: boolean
          ultima_donacion?: string | null
          total_donaciones?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          tipo_sangre?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
          factor_rh?: 'positivo' | 'negativo'
          peso?: number | null
          apto_medico?: boolean
          url_certificado_apto?: string | null
          fecha_apto?: string | null
          fecha_vencimiento_apto?: string | null
          enfermedades_previas?: string | null
          medicamentos_actuales?: string | null
          fumador?: boolean
          tatuajes_recientes?: boolean
          ultima_donacion?: string | null
          total_donaciones?: number
          created_at?: string
          updated_at?: string
        }
      }
      solicitud: {
        Row: {
          id: string
          usuario_solicitante_id: string
          banco_sangre_id: string | null
          tipo_sangre_requerido: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
          unidades_requeridas: number
          prioridad: 'baja' | 'media' | 'alta' | 'urgente'
          estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada'
          motivo: string | null
          hospital: string | null
          direccion_hospital: string | null
          fecha_necesidad: string
          es_publica: boolean
          created_at: string
          updated_at: string
          fecha_completada: string | null
        }
        Insert: {
          id?: string
          usuario_solicitante_id: string
          banco_sangre_id?: string | null
          tipo_sangre_requerido: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
          unidades_requeridas?: number
          prioridad?: 'baja' | 'media' | 'alta' | 'urgente'
          estado?: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada'
          motivo?: string | null
          hospital?: string | null
          direccion_hospital?: string | null
          fecha_necesidad: string
          es_publica?: boolean
          created_at?: string
          updated_at?: string
          fecha_completada?: string | null
        }
        Update: {
          id?: string
          usuario_solicitante_id?: string
          banco_sangre_id?: string | null
          tipo_sangre_requerido?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
          unidades_requeridas?: number
          prioridad?: 'baja' | 'media' | 'alta' | 'urgente'
          estado?: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada'
          motivo?: string | null
          hospital?: string | null
          direccion_hospital?: string | null
          fecha_necesidad?: string
          es_publica?: boolean
          created_at?: string
          updated_at?: string
          fecha_completada?: string | null
        }
      }
      donacion: {
        Row: {
          id: string
          donante_id: string
          solicitud_id: string | null
          banco_sangre_id: string | null
          fecha_donacion: string
          unidades_donadas: number
          tipo_sangre: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
          estado: 'programada' | 'completada' | 'cancelada' | 'no_asistio'
          notas: string | null
          ubicacion_donacion: string | null
          es_primera_vez: boolean
          hemoglobina_previa: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donante_id: string
          solicitud_id?: string | null
          banco_sangre_id?: string | null
          fecha_donacion: string
          unidades_donadas?: number
          tipo_sangre: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
          estado?: 'programada' | 'completada' | 'cancelada' | 'no_asistio'
          notas?: string | null
          ubicacion_donacion?: string | null
          es_primera_vez?: boolean
          hemoglobina_previa?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donante_id?: string
          solicitud_id?: string | null
          banco_sangre_id?: string | null
          fecha_donacion?: string
          unidades_donadas?: number
          tipo_sangre?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
          estado?: 'programada' | 'completada' | 'cancelada' | 'no_asistio'
          notas?: string | null
          ubicacion_donacion?: string | null
          es_primera_vez?: boolean
          hemoglobina_previa?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      banco_sangre: {
        Row: {
          id: string
          nombre: string
          direccion: string
          ciudad: string
          telefono: string | null
          email: string | null
          latitud: number | null
          longitud: number | null
          horario_atencion: string | null
          activo: boolean
          responsable: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          direccion: string
          ciudad?: string
          telefono?: string | null
          email?: string | null
          latitud?: number | null
          longitud?: number | null
          horario_atencion?: string | null
          activo?: boolean
          responsable?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          direccion?: string
          ciudad?: string
          telefono?: string | null
          email?: string | null
          latitud?: number | null
          longitud?: number | null
          horario_atencion?: string | null
          activo?: boolean
          responsable?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notificacion: {
        Row: {
          id: string
          usuario_id: string
          solicitud_id: string | null
          titulo: string
          mensaje: string
          tipo: 'nueva_solicitud' | 'solicitud_urgente' | 'confirmacion_donacion' | 'recordatorio' | 'agradecimiento'
          leida: boolean
          fecha_envio: string
          fecha_lectura: string | null
          url_accion: string | null
          created_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          solicitud_id?: string | null
          titulo: string
          mensaje: string
          tipo: 'nueva_solicitud' | 'solicitud_urgente' | 'confirmacion_donacion' | 'recordatorio' | 'agradecimiento'
          leida?: boolean
          fecha_envio?: string
          fecha_lectura?: string | null
          url_accion?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          solicitud_id?: string | null
          titulo?: string
          mensaje?: string
          tipo?: 'nueva_solicitud' | 'solicitud_urgente' | 'confirmacion_donacion' | 'recordatorio' | 'agradecimiento'
          leida?: boolean
          fecha_envio?: string
          fecha_lectura?: string | null
          url_accion?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calcular_distancia_km: {
        Args: {
          lat1: number
          lon1: number
          lat2: number
          lon2: number
        }
        Returns: number
      }
      es_compatible_sangre: {
        Args: {
          tipo_donante: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
          tipo_receptor: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}