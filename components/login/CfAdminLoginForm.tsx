"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Props {
  nextPath: string
  showDevHint: boolean
}

export function CfAdminLoginForm({ nextPath, showDevHint }: Props) {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const res = await fetch("/api/cf-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? "Sign-in failed")
        return
      }
      router.push(nextPath.startsWith("/") ? nextPath : "/cf-admin")
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 sm:p-10">
      <div className="absolute inset-0 z-0">
        <Image
          src="/brand/omnicore-login-hero.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-oc-base/80 backdrop-blur-[1px]" />
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 100%, rgba(34, 211, 238, 0.12) 0%, transparent 55%), linear-gradient(to bottom, rgba(10, 13, 20, 0.55) 0%, rgba(10, 13, 20, 0.88) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="rounded-2xl border border-oc-border/80 bg-oc-card/40 backdrop-blur-xl shadow-2xl oc-shadow-lg overflow-hidden">
          <div className="px-8 pt-8 pb-2 text-center space-y-1">
            <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-oc-fg-soft">
              OmniCore
            </h1>
            <p className="text-xs text-oc-fg-dim uppercase tracking-[0.14em] font-medium">
              Gym Ops — CF Admin
            </p>
          </div>

          <form onSubmit={(e) => void onSubmit(e)} className="px-8 pb-8 pt-6 space-y-5">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="cf-admin-user" className="block text-xs font-medium text-oc-fg-muted font-ui">
                Username
              </label>
              <input
                id="cf-admin-user"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input font-ui"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cf-admin-pass" className="block text-xs font-medium text-oc-fg-muted font-ui">
                Password
              </label>
              <input
                id="cf-admin-pass"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input font-ui"
                required
              />
            </div>

            <button type="submit" disabled={pending} className="btn-primary w-full justify-center mt-2">
              {pending ? "Signing in…" : "Sign in"}
            </button>

            {showDevHint && (
              <p className="text-[11px] text-oc-fg-dim text-center leading-relaxed">
                Development default: <span className="font-mono text-oc-fg-muted">admin</span> /{" "}
                <span className="font-mono text-oc-fg-muted">admin</span>
                {" · "}
                Set <span className="font-mono">CF_ADMIN_LOGIN_USER</span> and{" "}
                <span className="font-mono">CF_ADMIN_PASSWORD</span> for production.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
