import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import {DotsThree, DotsThreeOutline, Folder, Share, Trash} from "@phosphor-icons/react";

export function NavProjects() {
    const {isMobile} = useSidebar()
    const items: any[] = [
        /* {
            name: "Some project",
            url: "#",
            icon: HardDrives,
        }, */
    ]

    if (items.length === 0) {
        return null
    }

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton asChild>
                            <a href={item.url}>
                                <item.icon weight="bold"/>
                                <span>{item.name}</span>
                            </a>
                        </SidebarMenuButton>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuAction showOnHover>
                                    <DotsThree weight="bold"/>
                                    <span className="sr-only">More</span>
                                </SidebarMenuAction>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-48 rounded-lg"
                                side={isMobile ? "bottom" : "right"}
                                align={isMobile ? "end" : "start"}
                            >
                                <DropdownMenuItem>
                                    <Folder weight="bold" className="text-muted-foreground"/>
                                    <span>View Project</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Share weight="bold" className="text-muted-foreground"/>
                                    <span>Share Project</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem>
                                    <Trash weight="bold" className="text-muted-foreground"/>
                                    <span>Delete Project</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                    <SidebarMenuButton className="text-sidebar-foreground/70">
                        <DotsThreeOutline weight="bold" className="text-sidebar-foreground/70"/>
                        <span>More</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    )
}
