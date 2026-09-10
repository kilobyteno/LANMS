/** Bumped for UUIDv7 breaking release; ignores stale v4-era organisation id. */
const KEY = "lanms_active_organisation_id_v7"

export function readActiveOrganisationId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(KEY)
}

export function persistActiveOrganisationId(id: string): void {
  localStorage.setItem(KEY, id)
}

export function clearActiveOrganisationId(): void {
  localStorage.removeItem(KEY)
}
