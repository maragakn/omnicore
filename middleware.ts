import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { RWA_INVITE_COOKIE } from "@/lib/rwa/constants"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
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
  matcher: ["/rwa-admin", "/rwa-admin/:path*"],
}
