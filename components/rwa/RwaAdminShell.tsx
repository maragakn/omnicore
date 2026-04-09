"use client"

import { usePathname, useRouter } from "next/navigation"
import { Sidebar } from "@/components/shared/Sidebar"
import { LogOut } from "lucide-react"

export function RwaAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch("/api/rwa/session", { method: "DELETE" })
    router.push("/rwa-admin/join")
    router.refresh()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0d14]">
      <Sidebar
        role="rwa-admin"
        currentPath={pathname}
        endSlot={
          <button
            type="button"
            onClick={() => void logout()}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-[#9ca3af] hover:bg-[#1a2235] hover:text-[#f9fafb] transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Log out</span>
          </button>
        }
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
