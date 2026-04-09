import { RwaAdminShell } from "@/components/rwa/RwaAdminShell"
import { requireRwaLeadFromSession } from "@/lib/rwa/session"

export default async function RwaPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRwaLeadFromSession()
  return <RwaAdminShell>{children}</RwaAdminShell>
}
