"use client"

import { BuildingsIcon } from "@phosphor-icons/react"
import { DashboardSelectedOrganisation } from "@/components/dashboard-selected-organisation"
import { useOrganisation } from "@/components/organisation-context"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function DashboardPage() {
  const { organisations, loading, error } = useOrganisation()

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

  if (organisations.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BuildingsIcon />
          </EmptyMedia>
          <EmptyTitle>No organisation yet</EmptyTitle>
          <EmptyDescription>
            Create an organisation from the workspace menu in the sidebar to
            manage events and content.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return <DashboardSelectedOrganisation />
}
