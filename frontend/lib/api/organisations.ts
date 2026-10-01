import { coreFetch } from "@/lib/api/client"

/** Matches backend `OrganisationResponse` JSON. */
export type Organisation = {
  id: string
  name: string
  description: string | null
  contact_email: string | null
  contact_phone: string | null
  address_street: string | null
  address_city: string | null
  address_postal_code: string | null
  address_country: string | null
  website: string | null
  created_by_id: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export function asOrganisationList(data: unknown): Organisation[] {
  if (Array.isArray(data)) {
    return data as Organisation[]
  }
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data) as unknown
      return Array.isArray(parsed) ? (parsed as Organisation[]) : []
    } catch {
      return []
    }
  }
  return []
}

/** Payload for `POST /organisations` (matches backend `OrganisationCreate`). */
export type OrganisationCreatePayload = {
  name: string
  description?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  address_street?: string | null
  address_city?: string | null
  address_postal_code?: string | null
  address_country?: string | null
  website?: string | null
}

export function asOrganisation(data: unknown): Organisation | null {
  if (!data || typeof data !== "object") return null
  const o = data as Record<string, unknown>
  if (typeof o.id === "string" && typeof o.name === "string") {
    return data as Organisation
  }
  return null
}

/** Organisations created by the current user (`GET /user/organisations`). */
export function getUserOrganisations(token: string) {
  return coreFetch<unknown>(`/user/organisations`, { method: "GET", token })
}

export function createOrganisation(
  token: string,
  body: OrganisationCreatePayload,
) {
  return coreFetch<unknown>(`/organisations`, {
    method: "POST",
    body,
    token,
  })
}
