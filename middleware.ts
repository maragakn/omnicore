import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { RWA_INVITE_COOKIE } from "@/lib/rwa/constants"
import { CF_ADMIN_SESSION_COOKIE, CF_ADMIN_SESSION_VALUE } from "@/lib/cf-admin/session"

function isCfAdminPath(pathname: string) {
  return pathname === "/cf-admin" || pathname.startsWith("/cf-admin/")
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isCfAdminPath(pathname)) {
    const session = request.cookies.get(CF_ADMIN_SESSION_COOKIE)?.value
    if (session !== CF_ADMIN_SESSION_VALUE) {
      const login = new URL("/login", request.url)
      login.searchParams.set("next", pathname + request.nextUrl.search)
      return NextResponse.redirect(login)
    }
    return NextResponse.next()
  }

  if (!pathname.startsWith("/rwa-admin")) {
    return NextResponse.next()
  }
  if (pathname === "/rwa-admin/join" || pathname.startsWith("/rwa-admin/join/")) {
    return NextResponse.next()
  }

  const token = request.cookies.get(RWA_INVITE_COOKIE)?.value
  if (!token) {
    const join = new URL("/rwa-admin/join", request.url)
    if (pathname !== "/rwa-admin") {
      join.searchParams.set("next", pathname + request.nextUrl.search)
    }
    return NextResponse.redirect(join)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/cf-admin",
    "/cf-admin/:path*",
    "/rwa-admin",
    "/rwa-admin/:path*",
  ],
}
