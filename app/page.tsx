import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import {
  CF_ADMIN_SESSION_COOKIE,
  CF_ADMIN_SESSION_VALUE,
} from "@/lib/cf-admin/session"

export default async function RootPage() {
  const jar = await cookies()
  if (jar.get(CF_ADMIN_SESSION_COOKIE)?.value === CF_ADMIN_SESSION_VALUE) {
    redirect("/cf-admin")
  }
  redirect("/login")
}
