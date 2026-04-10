import { NextRequest, NextResponse } from "next/server"
import {
  CF_ADMIN_SESSION_COOKIE,
  CF_ADMIN_SESSION_VALUE,
  getExpectedCfAdminCredentials,
} from "@/lib/cf-admin/session"

export async function POST(req: NextRequest) {
  const creds = getExpectedCfAdminCredentials()
  if (!creds) {
    return NextResponse.json(
      { error: "CF Admin login is not configured. Set CF_ADMIN_LOGIN_USER and CF_ADMIN_PASSWORD." },
      { status: 503 }
    )
  }

  let body: { username?: string; password?: string }
  try {
    body = (await req.json()) as { username?: string; password?: string }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const username = typeof body.username === "string" ? body.username.trim() : ""
  const password = typeof body.password === "string" ? body.password : ""

  if (username !== creds.user || password !== creds.password) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(CF_ADMIN_SESSION_COOKIE, CF_ADMIN_SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
  return res
}
