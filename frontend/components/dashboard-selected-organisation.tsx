"use client"

import { useOrganisation } from "@/components/organisation-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
  const { selectedOrganisation, loading, error, organisations } =
    useOrganisation()

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
        {organisations.length === 0
          ? "You don’t have any organisations yet. Use the switcher above to create one when that flow is available."
          : "Select an organisation from the sidebar switcher."}
      </p>
    )
  }

  const o = selectedOrganisation

  return (
    <Card>
      <CardHeader>
        <CardTitle>{o.name}</CardTitle>
        <CardDescription>
          {o.description?.trim()
            ? o.description
            : "No description for this organisation."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid max-w-lg gap-4 sm:grid-cols-2">
          <Detail label="Contact email" value={o.contact_email} />
          <Detail label="Contact phone" value={o.contact_phone} />
          <Detail label="Website" value={o.website} />
          <Detail
            label="Address"
            value={
              [
                o.address_street,
                o.address_city,
                o.address_postal_code,
                o.address_country,
              ]
                .filter(Boolean)
                .join(", ") || null
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}
