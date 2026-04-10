"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export function CfAdminLogoutButton() {
  const router = useRouter()

  async function logout() {
    await fetch("/api/cf-admin/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-oc-fg-muted hover:bg-oc-hover hover:text-oc-fg transition-colors font-ui"
    >
      <LogOut className="w-4 h-4 shrink-0" />
      <span>Log out</span>
    </button>
  )
}
