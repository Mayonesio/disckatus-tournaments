import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  // Rutas protegidas que requieren autenticación
  const protectedPaths = ["/dashboard", "/players", "/tournaments", "/calendar", "/profile", "/settings"]

  // Rutas que requieren rol de administrador
  const adminPaths = ["/admin"]

  const path = request.nextUrl.pathname

  // Verificar si la ruta actual está protegida
  const isProtectedPath = protectedPaths.some(
    (protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`),
  )

  // Verificar si la ruta actual requiere rol de administrador
  const isAdminPath = adminPaths.some((adminPath) => path === adminPath || path.startsWith(`${adminPath}/`))

  // Redirigir a login si no hay token y la ruta está protegida
  if (!token && isProtectedPath) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // Redirigir a dashboard si no tiene rol de administrador y la ruta requiere ese rol
  if (token && isAdminPath && token.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/players/:path*",
    "/tournaments/:path*",
    "/calendar/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/admin/:path*",
  ],
}

