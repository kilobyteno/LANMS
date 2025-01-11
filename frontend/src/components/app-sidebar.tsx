import * as React from "react"

import {NavMain} from "@/components/nav-main"
import {NavProjects} from "@/components/nav-projects"
import {NavUser} from "@/components/nav-user"
import {OrganisationSwitcher} from "@/components/organisation-switcher.tsx"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import {EventSwitcher} from "@/components/event-switcher.tsx";
import { VersionChecker } from "./version-checker"

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <OrganisationSwitcher/>
                <EventSwitcher/>
            </SidebarHeader>
            <SidebarContent>
                <NavMain/>
                <NavProjects/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser/>
                <div className="flex flex-col items-center border-t border-gray-200 py-2 bg-background/50 dark:bg-gray-800 -mb-2 -mx-2 text-xs text-gray-400 dark:text-gray-500 hover:text-muted-foreground dark:hover:text-secondary-foreground dark:border-gray-700 dark:bg-background/10">
                    <VersionChecker/>
                </div>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}
