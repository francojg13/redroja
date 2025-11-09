import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Droplet, Heart, Users, MapPin, Shield, Clock } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <div className="flex justify-center">
            <div className="p-4 bg-red-600 rounded-full">
              <Droplet className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight">
            Sistema <span className="text-red-600">Red Roja</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Conectando donantes con receptores de sangre en Tucumán.
            Tu donación puede salvar vidas.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <Link href="/registro">
              <Button size="lg" className="bg-red-600 hover:bg-red-700">
                <Heart className="mr-2 h-5 w-5" />
                Registrarse
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>

        {/* Características */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-red-600 mb-2" />
              <CardTitle>Comunidad Solidaria</CardTitle>
              <CardDescription>
                Únete a una red de donantes comprometidos con salvar vidas en Tucumán
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <MapPin className="h-10 w-10 text-red-600 mb-2" />
              <CardTitle>Encuentra Donantes Cercanos</CardTitle>
              <CardDescription>
                Sistema de geolocalización para conectar con donantes compatibles en tu zona
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-red-600 mb-2" />
              <CardTitle>Seguro y Confiable</CardTitle>
              <CardDescription>
                Verificación médica y gestión profesional con bancos de sangre oficiales
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Cómo Funciona */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-center mb-8">¿Cómo funciona?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Regístrate</h3>
              <p className="text-muted-foreground">
                Crea tu cuenta y completa tu perfil médico con tu tipo de sangre
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Conecta</h3>
              <p className="text-muted-foreground">
                Recibe notificaciones cuando alguien compatible necesite tu ayuda
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Dona</h3>
              <p className="text-muted-foreground">
                Acude al banco de sangre más cercano y salva vidas
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 p-12 bg-red-600 rounded-lg text-white">
          <Clock className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">
            Cada 2 segundos, alguien necesita sangre
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Tu donación puede marcar la diferencia
          </p>
          <Link href="/registro">
            <Button size="lg" variant="secondary">
              Únete Hoy
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Sistema Red Roja - UTN Tucumán</p>
          <p className="text-sm mt-2">Proyecto de Base de Datos II</p>
        </div>
      </footer>
    </div>
  )
}