"use client"

import { CalendarBlankIcon } from "@phosphor-icons/react"
import { useEvent } from "@/components/event-context"
import { useOrganisation } from "@/components/organisation-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

function Detail({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  if (!value?.trim()) return null
  return (
    <div className="grid gap-0.5 text-sm">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  )
}

export function DashboardSelectedOrganisation() {
  const { selectedOrganisation, loading, error } = useOrganisation()
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
  } = useEvent()

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Loading organisation…</p>
    )
  }

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    )
  }

  if (!selectedOrganisation) {
    return (
      <p className="text-sm text-muted-foreground">
        Select an organisation from the workspace menu in the sidebar.
      </p>
    )
  }

  const o = selectedOrganisation

  return (
    <div className="flex flex-col gap-6">
      {eventsLoading ? (
        <p className="text-sm text-muted-foreground">Loading events…</p>
      ) : eventsError ? (
        <p className="text-sm text-destructive" role="alert">
          {eventsError}
        </p>
      ) : events.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarBlankIcon />
            </EmptyMedia>
            <EmptyTitle>No events yet</EmptyTitle>
            <EmptyDescription>
              Add an event for {o.name} from the workspace menu in the sidebar,
              or open an organisation that already has events.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <h1>{o.name}</h1>
          <p>{o.description}</p>
        </div>
      )}
    </div>
  )
}
