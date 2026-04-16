"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { useOrganisation } from "@/components/organisation-context"
import { useEvent } from "@/components/event-context"
import { userInitials } from "@/lib/user-display"
import {
  asEventRecord,
  createEvent,
} from "@/lib/api/events"
import {
  asOrganisation,
  createOrganisation,
} from "@/lib/api/organisations"
import { getAccessToken } from "@/lib/auth/session"
import { dashboardPathAfterEventSwitch } from "@/lib/dashboard-event-path"
import { persistActiveOrganisationId } from "@/lib/organisation/storage"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BuildingsIcon,
  CaretUpDownIcon,
  PlusIcon,
} from "@phosphor-icons/react"

function formatEventSubtitle(startAt: string, endAt: string) {
  try {
    const start = new Date(startAt)
    const end = new Date(endAt)
    const fmt = new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
    return `${fmt.format(start)} – ${fmt.format(end)}`
  } catch {
    return startAt
  }
}

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

/** Value for `<input type="datetime-local" />` in local time. */
function toDatetimeLocalValue(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function defaultEventStartEndLocal() {
  const start = new Date()
  start.setDate(start.getDate() + 1)
  start.setHours(10, 0, 0, 0)
  const end = new Date(start)
  end.setHours(18, 0, 0, 0)
  return { start: toDatetimeLocalValue(start), end: toDatetimeLocalValue(end) }
}

export function WorkspaceSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const { isMobile } = useSidebar()
  const {
    organisations,
    selectedOrganisation,
    selectedOrganisationId,
    loading: orgLoading,
    error: orgError,
    refresh: refreshOrganisations,
  } = useOrganisation()
  const {
    selectedEvent,
    eventsByOrganisationId,
    chooseWorkspace,
    loading: eventsLoading,
    error: eventsError,
    refresh: refreshEvents,
  } = useEvent()

  const navigateForActiveEvent = (eventId: string) => {
    const next = dashboardPathAfterEventSwitch(pathname, eventId)
    if (next != null && next !== pathname) {
      router.push(next)
    }
  }

  const [createOrgOpen, setCreateOrgOpen] = useState(false)
  const [orgName, setOrgName] = useState("")
  const [orgDescription, setOrgDescription] = useState("")
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const resetCreateForm = () => {
    setOrgName("")
    setOrgDescription("")
    setCreateError(null)
  }

  const [createEventOpen, setCreateEventOpen] = useState(false)
  const [createEventOrgId, setCreateEventOrgId] = useState<string | null>(
    null,
  )
  const [eventTitle, setEventTitle] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [eventStartLocal, setEventStartLocal] = useState("")
  const [eventEndLocal, setEventEndLocal] = useState("")
  const [createEventSubmitting, setCreateEventSubmitting] = useState(false)
  const [createEventError, setCreateEventError] = useState<string | null>(null)

  const openCreateEventDialog = (organisationId: string) => {
    const { start, end } = defaultEventStartEndLocal()
    setCreateEventOrgId(organisationId)
    setEventTitle("")
    setEventDescription("")
    setEventStartLocal(start)
    setEventEndLocal(end)
    setCreateEventError(null)
    setCreateEventOpen(true)
  }

  const resetCreateEventForm = () => {
    setCreateEventOrgId(null)
    setEventTitle("")
    setEventDescription("")
    setEventStartLocal("")
    setEventEndLocal("")
    setCreateEventError(null)
  }

  const loading = orgLoading || eventsLoading

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled className="pointer-events-none">
            <Skeleton className="size-8 rounded-lg" />
            <div className="grid flex-1 gap-1.5 text-left">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-32" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const activeOrg = selectedOrganisation ?? organisations[0] ?? null
  const lineError = orgError || eventsError
  const createEventOrgName =
    createEventOrgId != null
      ? (organisations.find((o) => o.id === createEventOrgId)?.name ?? null)
      : null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {selectedEvent ? (
                  <span className="text-xs font-semibold">
                    {userInitials(selectedEvent.title)}
                  </span>
                ) : activeOrg ? (
                  <span className="text-xs font-semibold">
                    {userInitials(activeOrg.name)}
                  </span>
                ) : (
                  <BuildingsIcon className="size-4" weight="duotone" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {lineError
                    ? "Workspace"
                    : selectedEvent
                      ? selectedEvent.title
                      : activeOrg
                        ? "Select an event"
                        : "Workspace"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {lineError
                    ? lineError
                    : activeOrg
                      ? activeOrg.name
                      : "No organisation"}
                </span>
              </div>
              <CaretUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organisations and events
            </DropdownMenuLabel>
            {organisations.length === 0 ? (
              <div className="space-y-2 px-2 py-3 text-sm text-muted-foreground">
                <p>No organisations yet. Create one to get started.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setCreateOrgOpen(true)}
                >
                  <PlusIcon className="size-4" />
                  Create organisation
                </Button>
              </div>
            ) : (
              organisations.map((org) => {
                const orgEvents = eventsByOrganisationId[org.id] ?? []
                const isActiveOrg = selectedOrganisationId === org.id

                return (
                  <DropdownMenuSub key={org.id}>
                    <DropdownMenuSubTrigger className="gap-2 p-2">
                      <div className="flex size-6 items-center justify-center rounded-md border text-[10px] font-semibold">
                        {userInitials(org.name)}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <div className="truncate font-medium">{org.name}</div>
                        {org.description ? (
                          <div className="truncate text-xs text-muted-foreground">
                            {org.description}
                          </div>
                        ) : null}
                      </div>
                      {isActiveOrg ? (
                        <span className="text-[10px] font-medium text-muted-foreground">
                          active
                        </span>
                      ) : null}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-52">
                      {orgEvents.length === 0 ? (
                        <div className="px-2 py-2 text-sm text-muted-foreground">
                          No events in this organisation.
                        </div>
                      ) : (
                        orgEvents.map((ev) => (
                          <DropdownMenuItem
                            key={ev.id}
                            className="gap-2 p-2"
                            onClick={() => {
                              chooseWorkspace(org.id, ev.id)
                              navigateForActiveEvent(ev.id)
                            }}
                          >
                            <div className="flex size-6 shrink-0 items-center justify-center rounded-md border text-[10px] font-semibold">
                              {userInitials(ev.title)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-medium">
                                {ev.title}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">
                                {formatEventSubtitle(ev.start_at, ev.end_at)}
                              </div>
                            </div>
                          </DropdownMenuItem>
                        ))
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="gap-2 p-2"
                        onSelect={(e) => {
                          e.preventDefault()
                          openCreateEventDialog(org.id)
                        }}
                      >
                        <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                          <PlusIcon className="size-4" />
                        </div>
                        <span className="font-medium text-muted-foreground">
                          Add event
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )
              })
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onSelect={(e) => {
                e.preventDefault()
                setCreateOrgOpen(true)
              }}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <PlusIcon className="size-4" />
              </div>
              <span className="font-medium text-muted-foreground">
                New organisation
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Dialog
          open={createOrgOpen}
          onOpenChange={(open) => {
            setCreateOrgOpen(open)
            if (!open) resetCreateForm()
          }}
        >
          <DialogContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={async (e) => {
                e.preventDefault()
                const name = orgName.trim()
                if (!name) {
                  setCreateError("Name is required")
                  return
                }
                const token = getAccessToken()
                if (!token) {
                  setCreateError("You must be signed in to create an organisation")
                  return
                }
                setCreateSubmitting(true)
                setCreateError(null)
                try {
                  const res = await createOrganisation(token, {
                    name,
                    description: orgDescription.trim() || null,
                  })
                  if (!res.ok) {
                    setCreateError(res.message)
                    return
                  }
                  const created = asOrganisation(res.data)
                  if (!created) {
                    setCreateError(
                      "Could not read the new organisation from the server",
                    )
                    return
                  }
                  persistActiveOrganisationId(created.id)
                  refreshOrganisations()
                  setCreateOrgOpen(false)
                  resetCreateForm()
                } finally {
                  setCreateSubmitting(false)
                }
              }}
            >
              <DialogHeader>
                <DialogTitle>New organisation</DialogTitle>
                <DialogDescription>
                  Add another organisation you manage. You can fill in more
                  details later.
                </DialogDescription>
              </DialogHeader>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="workspace-new-org-name">Name</FieldLabel>
                  <Input
                    id="workspace-new-org-name"
                    name="name"
                    autoComplete="organization"
                    placeholder="Acme LAN Party"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    disabled={createSubmitting}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="workspace-new-org-description">
                    Description{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </FieldLabel>
                  <Input
                    id="workspace-new-org-description"
                    name="description"
                    placeholder="Short summary"
                    value={orgDescription}
                    onChange={(e) => setOrgDescription(e.target.value)}
                    disabled={createSubmitting}
                  />
                </Field>
              </FieldGroup>
              {createError ? (
                <Alert variant="destructive">
                  <AlertDescription>{createError}</AlertDescription>
                </Alert>
              ) : null}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={createSubmitting}
                  onClick={() => setCreateOrgOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createSubmitting}>
                  {createSubmitting ? "Creating…" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog
          open={createEventOpen}
          onOpenChange={(open) => {
            setCreateEventOpen(open)
            if (!open) resetCreateEventForm()
          }}
        >
          <DialogContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={async (e) => {
                e.preventDefault()
                if (!createEventOrgId) {
                  setCreateEventError("No organisation selected")
                  return
                }
                const title = eventTitle.trim()
                if (!title) {
                  setCreateEventError("Title is required")
                  return
                }
                if (!eventStartLocal || !eventEndLocal) {
                  setCreateEventError("Start and end times are required")
                  return
                }
                const startAt = new Date(eventStartLocal)
                const endAt = new Date(eventEndLocal)
                if (
                  Number.isNaN(startAt.getTime()) ||
                  Number.isNaN(endAt.getTime())
                ) {
                  setCreateEventError("Invalid start or end time")
                  return
                }
                if (endAt <= startAt) {
                  setCreateEventError("End must be after start")
                  return
                }
                const token = getAccessToken()
                if (!token) {
                  setCreateEventError("You must be signed in to create an event")
                  return
                }
                setCreateEventSubmitting(true)
                setCreateEventError(null)
                try {
                  const res = await createEvent(token, {
                    title,
                    description: eventDescription.trim() || null,
                    organisation_id: createEventOrgId,
                    start_at: startAt.toISOString(),
                    end_at: endAt.toISOString(),
                  })
                  if (!res.ok) {
                    setCreateEventError(res.message)
                    return
                  }
                  const created = asEventRecord(res.data)
                  if (!created) {
                    setCreateEventError(
                      "Could not read the new event from the server",
                    )
                    return
                  }
                  chooseWorkspace(created.organisation_id, created.id)
                  navigateForActiveEvent(created.id)
                  refreshEvents()
                  setCreateEventOpen(false)
                  resetCreateEventForm()
                } finally {
                  setCreateEventSubmitting(false)
                }
              }}
            >
              <DialogHeader>
                <DialogTitle>New event</DialogTitle>
                <DialogDescription>
                  {createEventOrgName
                    ? `Create an event in ${createEventOrgName}. You can add more details later.`
                    : "Create an event. You can add more details later."}
                </DialogDescription>
              </DialogHeader>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="workspace-new-event-title">
                    Title
                  </FieldLabel>
                  <Input
                    id="workspace-new-event-title"
                    name="title"
                    placeholder="Spring LAN 2026"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    disabled={createEventSubmitting}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="workspace-new-event-description">
                    Description{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </FieldLabel>
                  <Input
                    id="workspace-new-event-description"
                    name="description"
                    placeholder="Short summary"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    disabled={createEventSubmitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="workspace-new-event-start">
                    Starts
                  </FieldLabel>
                  <Input
                    id="workspace-new-event-start"
                    name="start_at"
                    type="datetime-local"
                    value={eventStartLocal}
                    onChange={(e) => setEventStartLocal(e.target.value)}
                    disabled={createEventSubmitting}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="workspace-new-event-end">Ends</FieldLabel>
                  <Input
                    id="workspace-new-event-end"
                    name="end_at"
                    type="datetime-local"
                    value={eventEndLocal}
                    onChange={(e) => setEventEndLocal(e.target.value)}
                    disabled={createEventSubmitting}
                    required
                  />
                </Field>
              </FieldGroup>
              {createEventError ? (
                <Alert variant="destructive">
                  <AlertDescription>{createEventError}</AlertDescription>
                </Alert>
              ) : null}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={createEventSubmitting}
                  onClick={() => setCreateEventOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createEventSubmitting}>
                  {createEventSubmitting ? "Creating…" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
