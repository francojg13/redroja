'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Droplet, 
  Heart, 
  User, 
  MapPin,
  LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/app-protected/dashboard', icon: LayoutDashboard, roles: ['donante', 'receptor', 'ambos'] },
  { name: 'Solicitudes', href: '/app-protected/solicitudes', icon: Droplet, roles: ['donante', 'receptor', 'ambos'] },
  { name: 'Mis Donaciones', href: '/app-protected/donaciones', icon: Heart, roles: ['donante', 'ambos'] },
  { name: 'Mapa', href: '/app-protected/mapa', icon: MapPin, roles: ['donante', 'receptor', 'ambos'] },
  { name: 'Mi Perfil', href: '/app-protected/perfil', icon: User, roles: ['donante', 'receptor', 'ambos'] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [userRole, setUserRole] = useState<'donante' | 'receptor' | 'ambos'>('donante')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    cargarDatosUsuario()
  }, [])

  const cargarDatosUsuario = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { data: usuario } = await supabase
        .from('usuario')
        .select('nombre, apellido, rol')
        .eq('auth_id', user.id)
        .single()

      if (usuario) {
        setUserName(`${usuario.nombre} ${usuario.apellido}`)
        setUserRole(usuario.rol)
      }
    } catch (err) {
      console.error('Error cargando usuario:', err)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Filtrar navegación según el rol del usuario
  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  )

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 bg-red-600">
        <Droplet className="h-8 w-8 text-white" />
        <span className="ml-2 text-xl font-bold text-white">Red Roja</span>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-gray-800">
        <p className="text-sm font-medium text-white">{userName}</p>
        <p className="text-xs text-gray-400 capitalize mt-1">
          {userRole === 'ambos' ? 'Donante/Receptor' : userRole}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
              )}
            >
              <item.icon
                className={cn(
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-white',
                  'mr-3 h-5 w-5 flex-shrink-0'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-800 px-3 py-4">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}