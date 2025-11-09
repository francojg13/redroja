'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Droplet, 
  LayoutDashboard, 
  FileText, 
  Heart, 
  User, 
  Map, 
  LogOut
} from 'lucide-react'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = createClient()
  const [usuario, setUsuario] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('usuario')
        .select('nombre, apellido, email')
        .eq('auth_id', user.id)
        .single()

      setUsuario(data)
      setLoading(false)
    }

    loadUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Droplet className="h-12 w-12 text-red-600 animate-pulse mx-auto mb-4" />
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!usuario) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="p-2 bg-red-600 rounded-lg">
            <Droplet className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl">Red Roja</h1>
            <p className="text-xs text-muted-foreground">Sistema de Donación</p>
          </div>
        </div>

        <nav className="space-y-2">
          <Link href="/app-protected/dashboard">
            <Button variant="ghost" className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>

          <Link href="/app-protected/solicitudes">
            <Button variant="ghost" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Solicitudes
            </Button>
          </Link>

          <Link href="/app-protected/donaciones">
            <Button variant="ghost" className="w-full justify-start">
              <Heart className="mr-2 h-4 w-4" />
              Mis Donaciones
            </Button>
          </Link>

          <Link href="/app-protected/mapa">
            <Button variant="ghost" className="w-full justify-start">
              <Map className="mr-2 h-4 w-4" />
              Mapa
            </Button>
          </Link>

          <Link href="/app-protected/perfil">
            <Button variant="ghost" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              Mi Perfil
            </Button>
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <p className="text-sm font-medium">{usuario?.nombre} {usuario?.apellido}</p>
            <p className="text-xs text-muted-foreground">{usuario?.email}</p>
          </div>

          <Button 
            onClick={handleSignOut}
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}