import type {
  CreateSupplierPartPayload,
  SupplierPartCreateResponse,
  SupplierPartsListResponse,
} from "@/components/inventory/types"
import { getBackendBaseUrl, toBackendCookieHeader } from "@/lib/auth/backend"

export function getAdminApiBaseUrl() {
  return getBackendBaseUrl()
}

function buildAdminUrl(path: string, search = "") {
  const url = new URL(path, getAdminApiBaseUrl())
  url.search = search
  return url
}

function buildForwardHeaders(cookieHeader?: string | null, hasJsonBody = false) {
  const headers = new Headers({ accept: "application/json" })

  if (hasJsonBody) {
    headers.set("content-type", "application/json")
  }

  if (cookieHeader) {
    headers.set("cookie", toBackendCookieHeader(cookieHeader))
  }

  return headers
}

export async function getSupplierPartsFromBackend(cookieHeader?: string | null) {
  const response = await fetch(buildAdminUrl("/api/supplier/parts", "?page=1&pageSize=10"), {
    cache: "no-store",
    headers: buildForwardHeaders(cookieHeader),
  })
  const payload = (await response.json()) as SupplierPartsListResponse

  if (!response.ok || !payload.ok) {
    throw new Error(payload.message ?? "Unable to load supplier parts")
  }

  return {
    parts: payload.parts ?? [],
    pagination: payload.pagination ?? { page: 1, pageSize: 10, total: 0, totalPages: 1 },
  }
}

export async function createSupplierPartInBackend(
  input: CreateSupplierPartPayload,
  cookieHeader?: string | null,
) {
  const response = await fetch(buildAdminUrl("/api/supplier/parts"), {
    method: "POST",
    cache: "no-store",
    headers: buildForwardHeaders(cookieHeader, true),
    body: JSON.stringify(input),
  })
  const payload = (await response.json()) as SupplierPartCreateResponse

  if (!response.ok || !payload.ok || !payload.part) {
    throw new Error(payload.message ?? "Unable to add supplier part")
  }

  return payload.part
}

export async function forwardSupplierPartsRequest(request: Request) {
  return forwardSupplierBackendRequest(request, "/api/supplier/parts")
}

export async function forwardSupplierBackendRequest(
  request: Request,
  path: string,
) {
  const requestUrl = new URL(request.url)
  const adminUrl = buildAdminUrl(path, requestUrl.search)
  const method = request.method.toUpperCase()
  const hasBody = method !== "GET" && method !== "HEAD"
  const cookieHeader = request.headers.get("cookie")
  const headers = buildForwardHeaders(cookieHeader)
  const contentType = request.headers.get("content-type")
  if (contentType) {
    headers.set("content-type", contentType)
  }
  const body = hasBody ? await request.arrayBuffer() : undefined

  const response = await fetch(adminUrl, {
    method,
    cache: "no-store",
    headers,
    body,
  })
  const text = await response.text()
  return new Response(text, {
    status: response.status,
    headers: {
      "content-type":
        response.headers.get("content-type") ?? "application/json; charset=utf-8",
    },
  })
}
