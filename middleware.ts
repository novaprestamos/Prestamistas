import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = req.nextUrl.pathname

  // Permitir endpoints API sin redirección
  if (path.startsWith('/api')) {
    return res
  }

  // Rutas públicas (sin sesión requerida)
  const publicPaths = ['/login', '/recuperar-acceso', '/reset-password']
  const isPublic = publicPaths.includes(path)

  // Si no hay sesión y la ruta no es pública, enviar al login
  if (!session && !isPublic) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(redirectUrl)
  }

  // Si hay sesión y está en login, redirigir al dashboard
  if (session && path === '/login') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Protección extra por rol (admin) en ciertas rutas
  const adminOnlyPaths = ['/usuarios', '/reportes', '/configuracion']
  if (session && adminOnlyPaths.includes(path)) {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', session.user.id)
      .single()

    if (!usuario || usuario.rol !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
