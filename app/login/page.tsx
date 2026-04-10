import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { CfAdminLoginForm } from "@/components/login/CfAdminLoginForm"
import {
  CF_ADMIN_SESSION_COOKIE,
  CF_ADMIN_SESSION_VALUE,
} from "@/lib/cf-admin/session"

interface Props {
  searchParams: Promise<{ next?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const jar = await cookies()
  if (jar.get(CF_ADMIN_SESSION_COOKIE)?.value === CF_ADMIN_SESSION_VALUE) {
    redirect("/cf-admin")
  }

  const { next: nextRaw } = await searchParams
  const nextPath =
    typeof nextRaw === "string" &&
    nextRaw.startsWith("/") &&
    !nextRaw.startsWith("//") &&
    (nextRaw === "/cf-admin" || nextRaw.startsWith("/cf-admin/"))
      ? nextRaw
      : "/cf-admin"

  return (
    <CfAdminLoginForm
      nextPath={nextPath}
      showDevHint={process.env.NODE_ENV === "development"}
    />
  )
}
