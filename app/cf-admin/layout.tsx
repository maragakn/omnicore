"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/shared/Sidebar"
import { OmniGhostBackground } from "@/components/shared/OmniMascot"
import { CfAdminLogoutButton } from "@/components/cf-admin/CfAdminLogoutButton"

export default function CFAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen overflow-hidden bg-oc-base">
      <Sidebar role="cf-admin" currentPath={pathname} endSlot={<CfAdminLogoutButton />} />
      <main className="relative flex-1 overflow-y-auto">
        <OmniGhostBackground opacity={5} />
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  )
}
