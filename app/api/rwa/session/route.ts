import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"
import { isTokenExpired } from "@/lib/leads/token"
import { RWA_INVITE_COOKIE } from "@/lib/rwa/constants"
import { RWA_SESSION_MAX_AGE_SEC } from "@/lib/rwa/session"

function sessionCookieOpts() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: RWA_SESSION_MAX_AGE_SEC,
  }
}

/**
 * POST — establish RWA portal session (invite token → HttpOnly cookie).
 * DELETE — clear session (logout).
 */
export async function POST(req: NextRequest) {
  let body: { token?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const token = typeof body.token === "string" ? body.token.trim() : ""
  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 })
  }

  const lead = await prisma.lead.findUnique({ where: { inviteToken: token } })
  if (!lead) {
    return NextResponse.json({ error: "Invalid invite link" }, { status: 404 })
  }

  if (lead.status === "INVITED" && isTokenExpired(lead.inviteExpiresAt)) {
    return NextResponse.json({ error: "This invite link has expired" }, { status: 410 })
  }

  const res = NextResponse.json({
    ok: true as const,
    lead: {
      id: lead.id,
      status: lead.status,
      societyName: lead.societyName,
      centerId: lead.centerId,
    },
  })
  res.cookies.set(RWA_INVITE_COOKIE, token, sessionCookieOpts())
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true as const })
  res.cookies.set(RWA_INVITE_COOKIE, "", { ...sessionCookieOpts(), maxAge: 0 })
  return res
}
