import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/client"
import { RWA_INVITE_COOKIE } from "@/lib/rwa/constants"

/** ~90 days — RWA should not have to paste the link on every visit. */
export const RWA_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 90

export type RwaLeadForSession = NonNullable<Awaited<ReturnType<typeof getRwaLeadFromSession>>>

/**
 * Resolve the current browser session to a Lead (by invite token cookie).
 * Returns null if missing/invalid token.
 */
export async function getRwaLeadFromSession() {
  const jar = await cookies()
  const token = jar.get(RWA_INVITE_COOKIE)?.value
  if (!token) return null

  const lead = await prisma.lead.findUnique({
    where: { inviteToken: token },
  })
  if (!lead) return null
  return lead
}

export async function requireRwaLeadFromSession() {
  const lead = await getRwaLeadFromSession()
  if (!lead) redirect("/rwa-admin/join")
  return lead
}

/**
 * Center for the logged-in RWA (after quote acceptance), or null while still in funnel.
 */
export async function getCenterForRwaSession() {
  const lead = await requireRwaLeadFromSession()
  if (!lead.centerId) return { lead, center: null }

  const center = await loadCenterForDashboard(lead.centerId)
  return { lead, center }
}

export async function loadCenterForDashboard(centerId: string) {
  return prisma.center.findUnique({
    where: { id: centerId },
    include: {
      modules: { where: { isEnabled: true } },
      residentialDetails: true,
      lead: {
        include: {
          quote: {
            include: { lineItems: true },
          },
        },
      },
    },
  })
}
