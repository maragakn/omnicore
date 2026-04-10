/** HttpOnly cookie — must stay in sync with login/logout routes and middleware. */
export const CF_ADMIN_SESSION_COOKIE = "oc_cf_admin_session"

export const CF_ADMIN_SESSION_VALUE = "1"

export function getExpectedCfAdminCredentials(): { user: string; password: string } | null {
  const user = process.env.CF_ADMIN_LOGIN_USER?.trim()
  const password = process.env.CF_ADMIN_PASSWORD?.trim()

  if (user && password) {
    return { user, password }
  }

  if (process.env.NODE_ENV === "development") {
    return { user: "admin", password: "admin" }
  }

  return null
}
