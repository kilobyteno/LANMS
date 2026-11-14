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
  asOrganisationList,
  getUserOrganisations,
  type Organisation,
} from "@/lib/api/organisations"
import {
  clearActiveOrganisationId,
  persistActiveOrganisationId,
  readActiveOrganisationId,
} from "@/lib/organisation/storage"
import { getAccessToken } from "@/lib/auth/session"

export type OrganisationContextValue = {
  organisations: Organisation[]
  selectedOrganisation: Organisation | null
  selectedOrganisationId: string | null
  selectOrganisation: (id: string) => void
  loading: boolean
  error: string | null
  refresh: () => void
}

const OrganisationContext = createContext<OrganisationContextValue | null>(
  null,
)

export function useOrganisation(): OrganisationContextValue {
  const ctx = useContext(OrganisationContext)
  if (!ctx) {
    throw new Error(
      "useOrganisation must be used within an OrganisationProvider",
    )
  }
  return ctx
}

export function OrganisationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [organisations, setOrganisations] = useState<Organisation[]>([])
  const [selectedOrganisationId, setSelectedOrganisationId] = useState<
    string | null
  >(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  const refresh = useCallback(() => {
    setFetchKey((k) => k + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      startReactTransition(() => {
        if (!cancelled) {
          setLoading(true)
          setError(null)
        }
      })

      const token = getAccessToken()
      if (!token) {
        startReactTransition(() => {
          if (cancelled) return
          setOrganisations([])
          setSelectedOrganisationId(null)
          clearActiveOrganisationId()
          setLoading(false)
        })
        return
      }

      const res = await getUserOrganisations(token)
      if (cancelled) return

      if (!res.ok) {
        if (res.status === 401) {
          startReactTransition(() => {
            if (cancelled) return
            setOrganisations([])
            setSelectedOrganisationId(null)
            clearActiveOrganisationId()
            setError(null)
            setLoading(false)
          })
          return
        }
        startReactTransition(() => {
          if (cancelled) return
          setOrganisations([])
          setError(res.message)
          setLoading(false)
        })
        return
      }

      const list = asOrganisationList(res.data)
      const stored = readActiveOrganisationId()
      const validStored =
        stored && list.some((o) => o.id === stored) ? stored : null
      const initialId = validStored ?? list[0]?.id ?? null

      if (initialId) {
        persistActiveOrganisationId(initialId)
      } else {
        clearActiveOrganisationId()
      }

      startReactTransition(() => {
        if (cancelled) return
        setOrganisations(list)
        setSelectedOrganisationId(initialId)
        setError(null)
        setLoading(false)
      })
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [fetchKey])

  const selectOrganisation = useCallback((id: string) => {
    persistActiveOrganisationId(id)
    startReactTransition(() => {
      setSelectedOrganisationId(id)
    })
  }, [])

  const selectedOrganisation = useMemo(() => {
    if (!selectedOrganisationId) return null
    return (
      organisations.find((o) => o.id === selectedOrganisationId) ?? null
    )
  }, [organisations, selectedOrganisationId])

  const value = useMemo(
    () => ({
      organisations,
      selectedOrganisation,
      selectedOrganisationId,
      selectOrganisation,
      loading,
      error,
      refresh,
    }),
    [
      organisations,
      selectedOrganisation,
      selectedOrganisationId,
      selectOrganisation,
      loading,
      error,
      refresh,
    ],
  )

  return (
    <OrganisationContext.Provider value={value}>
      {children}
    </OrganisationContext.Provider>
  )
}
