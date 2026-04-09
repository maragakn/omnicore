import { randomBytes } from "crypto"

export const TOKEN_EXPIRY_DAYS = 7

export function generateInviteToken(): string {
  return randomBytes(32).toString("hex")
}

export function tokenExpiresAt(): Date {
  const d = new Date()
  d.setDate(d.getDate() + TOKEN_EXPIRY_DAYS)
  return d
}

export function isTokenExpired(expiresAt: Date): boolean {
  return Date.now() > expiresAt.getTime()
}
