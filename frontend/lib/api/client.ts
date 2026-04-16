export type CoreApiBody = {
  status_code?: number
  message?: string
  data?: unknown
}

export type CoreApiResult<T = unknown> = {
  ok: boolean
  status: number
  message: string
  data: T | undefined
}

function normalizeData(raw: unknown): unknown {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as unknown
    } catch {
      return raw
    }
  }
  return raw
}

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_CORE_API_URL
  if (!base) {
    throw new Error("NEXT_PUBLIC_CORE_API_URL is not set")
  }
  return base.replace(/\/$/, "")
}

export async function coreFetch<T = unknown>(
  path: string,
  options: {
    method?: string
    body?: unknown
    token?: string | null
  } = {},
): Promise<CoreApiResult<T>> {
  const { method = "GET", body, token } = options
  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`

  const headers: HeadersInit = {
    Accept: "application/json",
  }

  if (body !== undefined) {
    headers["Content-Type"] = "application/json"
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let json: CoreApiBody = {}
  try {
    json = (await response.json()) as CoreApiBody
  } catch {
    json = {}
  }

  const status =
    typeof json.status_code === "number" ? json.status_code : response.status
  const message =
    typeof json.message === "string"
      ? json.message
      : response.statusText || "Request failed"
  const data =
    json.data !== undefined ? (normalizeData(json.data) as T) : undefined
  const ok = status >= 200 && status < 300

  return { ok, status, message, data }
}
