import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

// Proteger rutas /app-protected/*
if (request.nextUrl.pathname.startsWith('/app-protected') && !user) {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  return NextResponse.redirect(url)
}

// Redirigir a dashboard si ya está logueado
if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/registro') && user) {
  const url = request.nextUrl.clone()
  url.pathname = '/app-protected/dashboard'
  return NextResponse.redirect(url)
}

  return supabaseResponse
}

export const config = {
  matcher: [
    '/app-protected/:path*',
    '/login',
    '/registro'
  ],
}