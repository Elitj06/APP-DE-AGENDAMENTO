import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/app', '/tv', '/checkin', '/onboarding', '/api/auth', '/api/checkin', '/api/ranking', '/api/webhooks', '/api/cron']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // If Supabase is not configured, allow all routes (demo mode)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://SEU_PROJETO.supabase.co') {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()

    // Redirecionar para login se tentar acessar /painel sem auth
    if (!user && path.startsWith('/painel')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirecionar para /painel se já logado tentar ir para /login
    if (user && path === '/login') {
      return NextResponse.redirect(new URL('/painel', request.url))
    }

    return supabaseResponse
  } catch {
    // If Supabase auth fails, allow access (demo fallback)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
