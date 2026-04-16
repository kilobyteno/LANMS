"use client"

import Link from "next/link"
import { useEvent } from "@/components/event-context"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NewspaperIcon } from "@phosphor-icons/react"

export function NavEventArticles() {
  const { selectedEvent } = useEvent()

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild={!!selectedEvent}
            disabled={!selectedEvent}
            tooltip={
              selectedEvent
                ? "Articles for the selected event"
                : "Select an event in the workspace switcher"
            }
          >
            {selectedEvent ? (
              <Link href={`/dashboard/events/${selectedEvent.id}/articles`}>
                <NewspaperIcon />
                <span>Articles</span>
              </Link>
            ) : (
              <span className="flex w-full items-center gap-2">
                <NewspaperIcon />
                <span>Articles</span>
              </span>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
