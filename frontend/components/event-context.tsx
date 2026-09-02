"use client"

import {
  createContext,
  startTransition as startReactTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  asEventList,
  getOrganisationEvents,
  type EventRecord,
} from "@/lib/api/events"
import {
  persistEventIdForOrganisation,
  readEventIdForOrganisation,
  removeEventIdForOrganisation,
} from "@/lib/event/storage"
import { useOrganisation } from "@/components/organisation-context"
import { getAccessToken } from "@/lib/auth/session"

export type EventContextValue = {
  events: EventRecord[]
  eventsByOrganisationId: Record<string, EventRecord[]>
  selectedEvent: EventRecord | null
  selectedEventId: string | null
  /** Select an event within the already-selected organisation. */
  selectEvent: (eventId: string) => void
  /** Set active organisation and event together (e.g. from nested menu). */
  chooseWorkspace: (organisationId: string, eventId: string) => void
  loading: boolean
  error: string | null
  refresh: () => void
}

const EventContext = createContext<EventContextValue | null>(null)

export function useEvent(): EventContextValue {
  const ctx = useContext(EventContext)
  if (!ctx) {
    throw new Error("useEvent must be used within an EventProvider")
  }
  return ctx
}

export function EventProvider({ children }: { children: React.ReactNode }) {
  const {
    organisations,
    selectedOrganisationId,
    selectOrganisation,
    loading: organisationsLoading,
  } = useOrganisation()

  const [eventsByOrganisationId, setEventsByOrganisationId] = useState<
    Record<string, EventRecord[]>
  >({})
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  const orgIdsKey = useMemo(
    () =>
      [...organisations]
        .map((o) => o.id)
        .sort()
        .join("|"),
    [organisations],
  )

  const refresh = useCallback(() => {
    setFetchKey((k) => k + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    if (organisationsLoading || organisations.length === 0) {
      startReactTransition(() => {
        if (!cancelled) {
          setEventsByOrganisationId({})
          setSelectedEventId(null)
          setError(null)
          setLoading(false)
        }
      })
      return () => {
        cancelled = true
      }
    }

    const run = async () => {
      startReactTransition(() => {
        if (!cancelled) {
          setLoading(true)
          setError(null)
        }
      })

      const token = getAccessToken()
      const entries = await Promise.all(
        organisations.map(async (org) => {
          const res = await getOrganisationEvents(org.id, token ?? undefined)
          return { orgId: org.id, res }
        }),
      )
      if (cancelled) return

      const next: Record<string, EventRecord[]> = {}
      const errors: string[] = []
      for (const { orgId, res } of entries) {
        if (res.ok) {
          next[orgId] = asEventList(res.data)
        } else {
          errors.push(res.message)
        }
      }

      startReactTransition(() => {
        if (cancelled) return
        setEventsByOrganisationId(next)
        setError(errors.length > 0 ? errors[0] ?? "Some events failed to load" : null)
        setLoading(false)
      })
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [organisationsLoading, orgIdsKey, fetchKey, organisations])

  useEffect(() => {
    const oid = selectedOrganisationId
    if (!oid) {
      startReactTransition(() => setSelectedEventId(null))
      return
    }
    const list = eventsByOrganisationId[oid]
    if (!list) {
      return
    }
    const stored = readEventIdForOrganisation(oid)
    const valid =
      stored && list.some((e) => e.id === stored) ? stored : null
    const initial = valid ?? list[0]?.id ?? null
    if (initial) {
      persistEventIdForOrganisation(oid, initial)
    } else {
      removeEventIdForOrganisation(oid)
    }
    startReactTransition(() => setSelectedEventId(initial))
  }, [selectedOrganisationId, eventsByOrganisationId])

  const chooseWorkspace = useCallback(
    (organisationId: string, eventId: string) => {
      selectOrganisation(organisationId)
      persistEventIdForOrganisation(organisationId, eventId)
      startReactTransition(() => {
        setSelectedEventId(eventId)
      })
    },
    [selectOrganisation],
  )

  const selectEvent = useCallback(
    (eventId: string) => {
      if (!selectedOrganisationId) return
      persistEventIdForOrganisation(selectedOrganisationId, eventId)
      startReactTransition(() => {
        setSelectedEventId(eventId)
      })
    },
    [selectedOrganisationId],
  )

  const events = useMemo(() => {
    if (!selectedOrganisationId) return []
    return eventsByOrganisationId[selectedOrganisationId] ?? []
  }, [selectedOrganisationId, eventsByOrganisationId])

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null
    return events.find((e) => e.id === selectedEventId) ?? null
  }, [events, selectedEventId])

  const value = useMemo(
    () => ({
      events,
      eventsByOrganisationId,
      selectedEvent,
      selectedEventId,
      selectEvent,
      chooseWorkspace,
      loading,
      error,
      refresh,
    }),
    [
      events,
      eventsByOrganisationId,
      selectedEvent,
      selectedEventId,
      selectEvent,
      chooseWorkspace,
      loading,
      error,
      refresh,
    ],
  )

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>
}
