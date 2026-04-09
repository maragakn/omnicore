"use client"

import { useEffect } from "react"

/** Sets the RWA portal cookie when the user opens a valid quote URL (same invite token). */
export function EstablishRwaSession({ token }: { token: string }) {
  useEffect(() => {
    void fetch("/api/rwa/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).catch(() => {})
  }, [token])
  return null
}
