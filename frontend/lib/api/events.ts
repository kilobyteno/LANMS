import { coreFetch } from "@/lib/api/client"

/** Matches backend `EventResponse` JSON (nested fields typed loosely). */
export type EventRecord = {
  id: string
  title: string
  description: string | null
  max_participants: number | null
  website: string | null
  contact_email: string | null
  contact_phone_code: string | null
  contact_phone_number: string | null
  maps_url: string | null
  address_street: string | null
  address_city: string | null
  address_postal_code: string | null
  address_country: string | null
  start_at: string
  end_at: string
  organisation_id: string
  organisation: unknown
  created_by: unknown
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export function asEventList(data: unknown): EventRecord[] {
  if (Array.isArray(data)) {
    return data as EventRecord[]
  }
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data) as unknown
      return Array.isArray(parsed) ? (parsed as EventRecord[]) : []
    } catch {
      return []
    }
  }
  return []
}

export function asEventRecord(data: unknown): EventRecord | null {
  if (!data || typeof data !== "object") return null
  const o = data as Record<string, unknown>
  if (
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    typeof o.start_at === "string" &&
    typeof o.end_at === "string" &&
    typeof o.organisation_id === "string"
  ) {
    return data as EventRecord
  }
  return null
}

/** Payload for `POST /events` (matches backend `EventCreate`). */
export type EventCreatePayload = {
  title: string
  description?: string | null
  organisation_id: string
  start_at: string
  end_at: string
  max_participants?: number | null
  website?: string | null
  contact_email?: string | null
  contact_phone_code?: string | null
  contact_phone_number?: string | null
  maps_url?: string | null
  address_street?: string | null
  address_city?: string | null
  address_postal_code?: string | null
  address_country?: string | null
}

export function createEvent(token: string, body: EventCreatePayload) {
  return coreFetch<unknown>(`/events`, {
    method: "POST",
    body,
    token,
  })
}

/** Non-deleted events for an organisation (`GET /organisations/{id}/events`). */
export function getOrganisationEvents(
  organisationId: string,
  token?: string | null,
) {
  return coreFetch<unknown>(`/organisations/${organisationId}/events`, {
    method: "GET",
    ...(token ? { token } : {}),
  })
}
