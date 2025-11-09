'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  User, 
  Heart, 
  Shield, 
  AlertCircle, 
  Loader2,
  CheckCircle,
  Upload,
  FileText,
  Download,
  Trash2
} from 'lucide-react'
import { TIPOS_SANGRE, PROVINCIAS_TUCUMAN } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

interface Usuario {
  id: string
  email: string
  nombre: string
  apellido: string
  dni: string
  fecha_nacimiento: string
  telefono: string | null
  direccion: string | null
  ciudad: string
  rol: 'donante' | 'receptor' | 'ambos'
}

interface PerfilMedico {
  id: string
  tipo_sangre: string
  factor_rh: string
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
}

export default function PerfilPage() {
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [perfilMedico, setPerfilMedico] = useState<PerfilMedico | null>(null)
  const [authUserId, setAuthUserId] = useState<string | null>(null)

  // Form states
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [rol, setRol] = useState<'donante' | 'receptor' | 'ambos'>('donante')
  
  const [tipoSangre, setTipoSangre] = useState('')
  const [peso, setPeso] = useState('')
  const [fumador, setFumador] = useState(false)
  const [tatuajesRecientes, setTatuajesRecientes] = useState(false)
  const [enfermedadesPrevias, setEnfermedadesPrevias] = useState('')
  const [medicamentosActuales, setMedicamentosActuales] = useState('')
  
  const [passwordActual, setPasswordActual] = useState('')
  const [passwordNueva, setPasswordNueva] = useState('')
  const [passwordConfirmar, setPasswordConfirmar] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Usuario no autenticado')
      
      setAuthUserId(user.id)

      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuario')
        .select('*, perfil_medico(*)')
        .eq('auth_id', user.id)
        .single()

      if (usuarioError) throw usuarioError

      setUsuario(usuarioData)
      setPerfilMedico(usuarioData.perfil_medico)
      
      // Llenar formularios
      setNombre(usuarioData.nombre)
      setApellido(usuarioData.apellido)
      setTelefono(usuarioData.telefono || '')
      setDireccion(usuarioData.direccion || '')
      setCiudad(usuarioData.ciudad)
      setRol(usuarioData.rol)
      
      setTipoSangre(usuarioData.perfil_medico.tipo_sangre)
      setPeso(usuarioData.perfil_medico.peso?.toString() || '')
      setFumador(usuarioData.perfil_medico.fumador)
      setTatuajesRecientes(usuarioData.perfil_medico.tatuajes_recientes)
      setEnfermedadesPrevias(usuarioData.perfil_medico.enfermedades_previas || '')
      setMedicamentosActuales(usuarioData.perfil_medico.medicamentos_actuales || '')

    } catch (err: any) {
      console.error('Error cargando datos:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const guardarPersonal = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: updateError } = await supabase
        .from('usuario')
        .update({
          nombre,
          apellido,
          telefono: telefono || null,
          direccion: direccion || null,
          ciudad,
          rol
        })
        .eq('id', usuario!.id)

      if (updateError) throw updateError

      setSuccess('Información personal actualizada correctamente')
      await cargarDatos()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const guardarMedico = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const factorRh = tipoSangre.includes('+') ? 'positivo' : 'negativo'

      const { error: updateError } = await supabase
        .from('perfil_medico')
        .update({
          tipo_sangre: tipoSangre,
          factor_rh: factorRh,
          peso: peso ? parseFloat(peso) : null,
          fumador,
          tatuajes_recientes: tatuajesRecientes,
          enfermedades_previas: enfermedadesPrevias || null,
          medicamentos_actuales: medicamentosActuales || null
        })
        .eq('id', perfilMedico!.id)

      if (updateError) throw updateError

      setSuccess('Información médica actualizada correctamente')
      await cargarDatos()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const subirCertificado = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (file.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF')
      return
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo no debe superar los 5MB')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      // Eliminar certificado anterior si existe
      if (perfilMedico?.url_certificado_apto) {
        const oldPath = perfilMedico.url_certificado_apto.split('/').pop()
        if (oldPath) {
          await supabase.storage
            .from('certificados-medicos')
            .remove([`${authUserId}/${oldPath}`])
        }
      }

      // Subir nuevo certificado
      const fileName = `certificado_${Date.now()}.pdf`
      const filePath = `${authUserId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('certificados-medicos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('certificados-medicos')
        .getPublicUrl(filePath)

      // Actualizar base de datos
      const fechaHoy = new Date().toISOString().split('T')[0]
      const fechaVencimiento = new Date()
      fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1)
      const fechaVencimientoStr = fechaVencimiento.toISOString().split('T')[0]

      const { error: updateError } = await supabase
        .from('perfil_medico')
        .update({
          url_certificado_apto: publicUrl,
          fecha_apto: fechaHoy,
          fecha_vencimiento_apto: fechaVencimientoStr,
          apto_medico: true
        })
        .eq('id', perfilMedico!.id)

      if (updateError) throw updateError

      setSuccess('Certificado médico subido correctamente')
      await cargarDatos()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const eliminarCertificado = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar tu certificado médico?')) return

    setUploading(true)
    setError(null)

    try {
      if (perfilMedico?.url_certificado_apto) {
        const oldPath = perfilMedico.url_certificado_apto.split('/').pop()
        if (oldPath) {
          await supabase.storage
            .from('certificados-medicos')
            .remove([`${authUserId}/${oldPath}`])
        }
      }

      const { error: updateError } = await supabase
        .from('perfil_medico')
        .update({
          url_certificado_apto: null,
          fecha_apto: null,
          fecha_vencimiento_apto: null,
          apto_medico: false
        })
        .eq('id', perfilMedico!.id)

      if (updateError) throw updateError

      setSuccess('Certificado eliminado correctamente')
      await cargarDatos()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const cambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      if (passwordNueva !== passwordConfirmar) {
        throw new Error('Las contraseñas no coinciden')
      }

      if (passwordNueva.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres')
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordNueva
      })

      if (updateError) throw updateError

      setSuccess('Contraseña actualizada correctamente')
      setPasswordActual('')
      setPasswordNueva('')
      setPasswordConfirmar('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground mt-2">
          Administra tu información personal y médica
        </p>
      </div>

      {/* Alertas globales */}
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

      {/* Tabs */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">
            <User className="mr-2 h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="medico">
            <Heart className="mr-2 h-4 w-4" />
            Médico
          </TabsTrigger>
          <TabsTrigger value="seguridad">
            <Shield className="mr-2 h-4 w-4" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        {/* TAB: Información Personal */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Actualiza tus datos personales y de contacto
              </CardDescription>
            </CardHeader>
            <form onSubmit={guardarPersonal}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido *</Label>
                    <Input
                      id="apellido"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      required
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={usuario?.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    El email no se puede modificar
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dni">DNI</Label>
                  <Input
                    id="dni"
                    value={usuario?.dni}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    disabled={saving}
                    placeholder="381-1234567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad *</Label>
                  <Select value={ciudad} onValueChange={setCiudad} disabled={saving}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVINCIAS_TUCUMAN.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    disabled={saving}
                    placeholder="Calle 123"
                  />
                </div>

                <div className="space-y-2">
  <Label htmlFor="rol">Rol en el Sistema *</Label>
  <Select 
    value={rol} 
    onValueChange={(value: 'donante' | 'receptor' | 'ambos') => setRol(value)}
    disabled={saving}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="donante">
        <div>
          <p className="font-medium">Donante</p>
          <p className="text-xs text-muted-foreground">Puedo donar sangre</p>
        </div>
      </SelectItem>
      <SelectItem value="receptor">
        <div>
          <p className="font-medium">Receptor</p>
          <p className="text-xs text-muted-foreground">Necesito recibir sangre</p>
        </div>
      </SelectItem>
      <SelectItem value="ambos">
        <div>
          <p className="font-medium">Ambos</p>
          <p className="text-xs text-muted-foreground">Puedo donar y necesito recibir</p>
        </div>
      </SelectItem>
    </SelectContent>
  </Select>
  <p className="text-xs text-muted-foreground">
    {rol === 'receptor' 
      ? 'Como receptor, no podrás programar donaciones ni necesitas certificado médico.' 
      : 'Como donante, necesitarás certificado médico para donar sangre.'}
  </p>
</div>

{rol === 'receptor' && perfilMedico && perfilMedico.total_donaciones > 0 && (
  <Alert>
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      Has donado {perfilMedico.total_donaciones} veces. Si cambias a "Receptor", ya no podrás programar nuevas donaciones.
    </AlertDescription>
  </Alert>
)}
              </CardContent>

              <CardContent className="border-t pt-6">
                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </CardContent>
            </form>
          </Card>
        </TabsContent>

        {/* TAB: Información Médica */}
        <TabsContent value="medico">
          <Card>
            <CardHeader>
              <CardTitle>Información Médica</CardTitle>
              <CardDescription>
                Actualiza tus datos médicos y sube tu certificado
              </CardDescription>
            </CardHeader>
            <form onSubmit={guardarMedico}>
              <CardContent className="space-y-6">
                {rol === 'receptor' && (
  <Alert className="bg-yellow-50 border-yellow-200">
    <AlertCircle className="h-4 w-4 text-yellow-600" />
    <AlertDescription className="text-yellow-800">
      Como receptor, no necesitas subir certificado médico ni completar información de donante.
      Si deseas donar sangre, cambia tu rol a "Donante" o "Ambos" en la pestaña Personal.
    </AlertDescription>
  </Alert>
)}
                {/* Certificado Médico */}
                {(rol === 'donante' || rol === 'ambos') && (
  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        Certificado Médico
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Requerido para poder donar sangre
                      </p>
                    </div>
                    {perfilMedico?.apto_medico && (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    )}
                  </div>

                  {perfilMedico?.url_certificado_apto ? (
                    <div className="space-y-3">
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Certificado médico válido hasta: {' '}
                          <strong>{perfilMedico.fecha_vencimiento_apto && formatDate(perfilMedico.fecha_vencimiento_apto)}</strong>
                        </AlertDescription>
                      </Alert>

                      <div className="flex space-x-2">
                        <a 
                          href={perfilMedico.url_certificado_apto} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button type="button" variant="outline" className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Ver Certificado
                          </Button>
                        </a>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={eliminarCertificado}
                          disabled={uploading}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No tienes un certificado médico válido. Debes subir uno para poder donar.
                        </AlertDescription>
                      </Alert>

                      <div>
                        <Label htmlFor="certificado" className="cursor-pointer">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-red-500 transition-colors text-center">
                            {uploading ? (
                              <>
                                <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-red-600" />
                                <p className="text-sm text-muted-foreground">Subiendo certificado...</p>
                              </>
                            ) : (
                              <>
                                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm font-medium">Click para subir certificado</p>
                                <p className="text-xs text-muted-foreground mt-1">PDF • Máximo 5MB</p>
                              </>
                            )}
                          </div>
                        </Label>
                        <Input
                          id="certificado"
                          type="file"
                          accept=".pdf"
                          onChange={subirCertificado}
                          disabled={uploading}
                          className="hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>
                )}
                {/* Datos Médicos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipoSangre">Tipo de Sangre *</Label>
                    <Select value={tipoSangre} onValueChange={setTipoSangre} disabled={saving}>
                      <SelectTrigger>
                        <SelectValue />
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
                    <Label htmlFor="peso">Peso (kg) *</Label>
                    <Input
                      id="peso"
                      type="number"
                      value={peso}
                      onChange={(e) => setPeso(e.target.value)}
                      disabled={saving || rol === 'receptor'}
                      min="30"
                      max="200"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="fumador"
                      checked={fumador}
                      onChange={(e) => setFumador(e.target.checked)}
                      className="h-4 w-4 rounded"
                      disabled={saving || rol === 'receptor'}
                    />
                    <Label htmlFor="fumador" className="font-normal cursor-pointer">
                      Soy fumador
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="tatuajes"
                      checked={tatuajesRecientes}
                      onChange={(e) => setTatuajesRecientes(e.target.checked)}
                      className="h-4 w-4 rounded"
                      disabled={saving || rol === 'receptor'}
                    />
                    <Label htmlFor="tatuajes" className="font-normal cursor-pointer">
                      Me hice tatuajes en los últimos 6 meses
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enfermedades">Enfermedades Previas</Label>
                  <Input
                    id="enfermedades"
                    value={enfermedadesPrevias}
                    onChange={(e) => setEnfermedadesPrevias(e.target.value)}
                    disabled={saving || rol === 'receptor'}
                    placeholder="Ej: Diabetes, Hipertensión..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicamentos">Medicamentos Actuales</Label>
                  <Input
                    id="medicamentos"
                    value={medicamentosActuales}
                    onChange={(e) => setMedicamentosActuales(e.target.value)}
                    disabled={saving || rol === 'receptor'}
                    placeholder="Ej: Aspirina, Omeprazol..."
                  />
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Estadísticas:</strong> Has donado {perfilMedico?.total_donaciones || 0} veces.
                    {perfilMedico?.ultima_donacion && ` Última donación: ${formatDate(perfilMedico.ultima_donacion)}`}
                  </p>
                </div>
                {rol === 'receptor' && (
  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <p className="text-sm text-blue-800">
      <strong>Información:</strong> Como receptor, solo necesitas mantener actualizado tu tipo de sangre.
      La información médica detallada solo es necesaria para donantes.
    </p>
  </div>
)}
              </CardContent>

              <CardContent className="border-t pt-6">
                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </CardContent>
            </form>
          </Card>
        </TabsContent>

        {/* TAB: Seguridad */}
        <TabsContent value="seguridad">
          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>
                Actualiza tu contraseña de acceso
              </CardDescription>
            </CardHeader>
            <form onSubmit={cambiarPassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordNueva">Nueva Contraseña *</Label>
                  <Input
                    id="passwordNueva"
                    type="password"
                    value={passwordNueva}
                    onChange={(e) => setPasswordNueva(e.target.value)}
                    required
                    minLength={6}
                    disabled={saving}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passwordConfirmar">Confirmar Contraseña *</Label>
                  <Input
                    id="passwordConfirmar"
                    type="password"
                    value={passwordConfirmar}
                    onChange={(e) => setPasswordConfirmar(e.target.value)}
                    required
                    minLength={6}
                    disabled={saving}
                    placeholder="Repetir contraseña"
                  />
                </div>
              </CardContent>

              <CardContent className="border-t pt-6">
                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cambiando...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Cambiar Contraseña
                    </>
                  )}
                </Button>
              </CardContent>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}