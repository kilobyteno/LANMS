/** Bumped for UUIDv7 breaking release; ignores stale v4-era org/event id map. */
const KEY = "lanms_event_selections_v7"

type Store = Record<string, string>

function readAll(): Store {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Store)
      : {}
  } catch {
    return {}
  }
}

function writeAll(store: Store): void {
  localStorage.setItem(KEY, JSON.stringify(store))
}

export function readEventIdForOrganisation(orgId: string): string | null {
  return readAll()[orgId] ?? null
}

export function persistEventIdForOrganisation(
  orgId: string,
  eventId: string,
): void {
  const all = readAll()
  all[orgId] = eventId
  writeAll(all)
}

export function removeEventIdForOrganisation(orgId: string): void {
  const all = readAll()
  delete all[orgId]
  writeAll(all)
}

export function clearEventSelections(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(KEY)
}
