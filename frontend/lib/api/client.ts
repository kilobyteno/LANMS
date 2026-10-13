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

const LOG_PREFIX = "[core-api]"

function isVerboseApiLogging(): boolean {
  if (process.env.NODE_ENV === "development") return true
  const env = (process.env.NEXT_PUBLIC_ENV ?? "").toLowerCase()
  return env === "local" || env === "dev" || env === "test"
}

function logVerbose(message: string, details?: Record<string, unknown>) {
  if (!isVerboseApiLogging()) return
  if (details) {
    console.log(LOG_PREFIX, message, details)
  } else {
    console.log(LOG_PREFIX, message)
  }
}

function logNetworkFailure(
  method: string,
  path: string,
  error: unknown,
) {
  const errMsg = error instanceof Error ? error.message : String(error)
  console.warn(LOG_PREFIX, "fetch failed", { method, path, error: errMsg })
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
  const started = typeof performance !== "undefined" ? performance.now() : 0

  logVerbose("request", {
    method,
    path,
    hasBody: body !== undefined,
    hasToken: Boolean(token),
  })

  const headers: HeadersInit = {
    Accept: "application/json",
  }

  if (body !== undefined) {
    headers["Content-Type"] = "application/json"
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    logNetworkFailure(method, path, err)
    return {
      ok: false,
      status: 0,
      message:
        "Could not reach the API. Check that the backend is running and NEXT_PUBLIC_CORE_API_URL matches it (see frontend/.env.example).",
      data: undefined,
    }
  }

  let json: CoreApiBody = {}
  try {
    json = (await response.json()) as CoreApiBody
  } catch {
    logVerbose("response body not JSON", {
      method,
      path,
      httpStatus: response.status,
    })
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

  const elapsedMs =
    typeof performance !== "undefined"
      ? Math.round(performance.now() - started)
      : undefined
  logVerbose("response", {
    method,
    path,
    ok,
    status,
    httpStatus: response.status,
    elapsedMs,
    ...(ok ? {} : { message }),
  })

  return { ok, status, message, data }
}
