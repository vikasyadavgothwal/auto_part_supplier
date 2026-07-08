const DEFAULT_BASE_PATH = "/user_dashboard"

function normalizeBasePath(value?: string) {
  if (!value) {
    return DEFAULT_BASE_PATH
  }
  const trimmedValue = value.trim().replace(/\/+$/, "")
  if (!trimmedValue || trimmedValue === "/") {
    return DEFAULT_BASE_PATH
  }
  return trimmedValue.startsWith("/") ? trimmedValue : `/${trimmedValue}`
}
export const appBasePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH)
export const appRoutes = {
  dashboard: "/dashboard",
  rfqInbox: "/rfq-inbox",
  orders: "/orders",
  inventory: "/inventory",
  offers: "/offers",
  performance: "/performance",
  settings: "/settings",
  login: "/login",
} as const

export function stripBasePath(pathname: string | null) {
  if (!pathname) {
    return appRoutes.dashboard
  }

  if (pathname === appBasePath || pathname === `${appBasePath}/`) {
    return appRoutes.dashboard
  }

  if (pathname.startsWith(`${appBasePath}/`)) {
    return pathname.slice(appBasePath.length) || appRoutes.dashboard
  }

  return pathname
}
