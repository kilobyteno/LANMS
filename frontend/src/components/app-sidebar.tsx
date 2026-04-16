"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { OrganisationSwitcher } from "@/components/organisation-switcher"
import { EventSwitcher } from "@/components/event-switcher"
import { VersionChecker } from "@/components/version-checker"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganisationSwitcher />
        <EventSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavProjects />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
        <div className="flex flex-col items-center border-t border-sidebar-border py-2 text-xs text-muted-foreground">
          <VersionChecker />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
