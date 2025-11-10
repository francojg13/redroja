'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Droplet, AlertCircle, Loader2 } from 'lucide-react'
import { TIPOS_SANGRE, PROVINCIAS_TUCUMAN } from '@/lib/constants'
import { calcularEdad } from '@/lib/utils'
import { enviarEmailBienvenida } from '@/lib/emails'

export default function RegistroPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // Datos de usuario
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [dni, setDni] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [ciudad, setCiudad] = useState('San Miguel de Tucumán')
  
  // Datos médicos
  const [tipoSangre, setTipoSangre] = useState<string>('')
  const [peso, setPeso] = useState('')
  const [rol, setRol] = useState<'donante' | 'receptor' | 'ambos'>('donante')
  
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validar edad
      const edad = calcularEdad(fechaNacimiento)
      if (edad < 18) {
        setError('Debes ser mayor de 18 años para registrarte.')
        setLoading(false)
        return
      }

      // Validar peso si es donante
      if ((rol === 'donante' || rol === 'ambos') && parseFloat(peso) < 50) {
        setError('El peso mínimo para donar sangre es 50 kg.')
        setLoading(false)
        return
      }

      console.log('1. Creando usuario en Auth...')
      
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
            apellido
          }
        }
      })

      if (authError) {
        console.error('Error en Auth:', authError)
        setError(`Error de autenticación: ${authError.message}`)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('Error al crear el usuario en el sistema de autenticación.')
        setLoading(false)
        return
      }

      console.log('2. Usuario Auth creado:', authData.user.id)
      console.log('3. Insertando en tabla usuario...')

      // 2. Crear registro en tabla usuario
      const { data: userData, error: userError } = await supabase
        .from('usuario')
        .insert({
          auth_id: authData.user.id,
          email,
          nombre,
          apellido,
          dni,
          fecha_nacimiento: fechaNacimiento,
          telefono: telefono || null,
          direccion: direccion || null,
          ciudad,
          rol,
        })
        .select()
        .single()

      if (userError) {
        console.error('Error al crear usuario en BD:', userError)
        setError(`Error al crear perfil: ${userError.message || 'Error desconocido'}. Por favor contacta al administrador.`)
        setLoading(false)
        return
      }

      if (!userData) {
        setError('No se pudo crear el perfil de usuario.')
        setLoading(false)
        return
      }

      console.log('4. Usuario creado en BD:', userData.id)
      console.log('5. Insertando perfil médico...')

      console.log('6. Perfil médico creado exitosamente')

        // NUEVO: Enviar email de bienvenida
      console.log('7. Enviando email de bienvenida...')
      await enviarEmailBienvenida(email, nombre, apellido)
        .catch(err => console.error('Error enviando email:', err))
      console.log('8. Redirigiendo al dashboard...')

      // 3. Crear perfil médico
      const factorRh = tipoSangre.includes('+') ? 'positivo' : 'negativo'
      
      const { error: perfilError } = await supabase
        .from('perfil_medico')
        .insert({
          usuario_id: userData.id,
          tipo_sangre: tipoSangre,
          factor_rh: factorRh,
          peso: parseFloat(peso) || null,
          apto_medico: false,
          fumador: false,
          tatuajes_recientes: false,
        })

      if (perfilError) {
        console.error('Error al crear perfil médico:', perfilError)
        setError(`Error al crear perfil médico: ${perfilError.message}. El usuario fue creado pero sin perfil médico.`)
        setLoading(false)
        return
      }

      console.log('6. Perfil médico creado exitosamente')
      console.log('7. Redirigiendo al dashboard...')

      // 4. Redirigir al dashboard
      router.push('/app-protected/dashboard')
      router.refresh()

    } catch (err: any) {
      console.error('Error general en registro:', err)
      setError(`Error inesperado: ${err.message || 'Por favor intenta de nuevo.'}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-600 rounded-full">
              <Droplet className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
          <CardDescription>
            Completa el formulario para unirte al Sistema Red Roja
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleRegistro}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Información de Cuenta */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Información de Cuenta</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Información Personal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Juan"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input
                    id="apellido"
                    type="text"
                    placeholder="Pérez"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dni">DNI *</Label>
                  <Input
                    id="dni"
                    type="text"
                    placeholder="12345678"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    required
                    disabled={loading}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="381-1234567"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad *</Label>
                  <Select value={ciudad} onValueChange={setCiudad} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu ciudad" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVINCIAS_TUCUMAN.map((ciudad) => (
                        <SelectItem key={ciudad} value={ciudad}>
                          {ciudad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  type="text"
                  placeholder="Calle 123"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Información Médica */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Información Médica</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoSangre">Tipo de Sangre *</Label>
                  <Select value={tipoSangre} onValueChange={setTipoSangre} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
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
                    placeholder="70"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    required
                    disabled={loading}
                    min="30"
                    max="200"
                    step="0.1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rol">Rol *</Label>
                  <Select 
                    value={rol} 
                    onValueChange={(value: 'donante' | 'receptor' | 'ambos') => setRol(value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="donante">Donante</SelectItem>
                      <SelectItem value="receptor">Receptor</SelectItem>
                      <SelectItem value="ambos">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Requisitos: Ser mayor de 18 años y pesar más de 50 kg para donar sangre.
                  Deberás subir tu certificado médico desde tu perfil.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={loading || !tipoSangre}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </Button>

            <div className="text-sm text-center text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-red-600 hover:underline font-medium">
                Inicia sesión aquí
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}