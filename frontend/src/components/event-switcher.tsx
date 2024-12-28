import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import {CaretUpDown, Plus, PencilSimple, Trash, DotsThree, Eye} from "@phosphor-icons/react";
import {useTranslation} from "react-i18next";
import {Link, useNavigate} from "react-router-dom";
import {route, RouteConfig} from "@/routes/route-config.ts";
import {useEvent} from "@/context/EventContext"
import {useState} from "react";

export function EventSwitcher() {
    const {isMobile, setOpenMobile} = useSidebar()
    const {currentEvent, setCurrentEvent, events, loading} = useEvent()
    const {t} = useTranslation()
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false);

    const handleEventSwitch = (event: any) => {
        setCurrentEvent(event);
        navigate(route(RouteConfig.ORGANISER.ROOT));
        setOpenMobile(false);
        setIsOpen(false);
    }

    const handleActionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenMobile(false);
        setIsOpen(false);
    };

    if (loading) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg">
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">
                                {t("common.loading")}
                            </span>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    if (events.length === 0) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <Link to={route(RouteConfig.ORGANISER.EVENTS.CREATE)}>
                        <SidebarMenuButton
                            size="lg"
                            className="gap-2 text-sidebar-muted-foreground hover:text-sidebar-foreground"
                        >
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {t("event_switcher.no_events")}
                                </span>
                            </div>
                            <Plus className="ml-auto"/>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {currentEvent?.title || t("event_switcher.select_event")}
                                </span>
                            </div>
                            <CaretUpDown className="ml-auto"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            {t("event_switcher.title")}
                        </DropdownMenuLabel>
                        {events.map((event: any) => (
                            <DropdownMenuItem
                                key={event.id}
                                className="flex items-center justify-between gap-2 p-2"
                            >
                                <div className="flex-1 cursor-pointer" onClick={() => handleEventSwitch(event)}>
                                    {event.title}
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="rounded-md p-1 hover:bg-primary/10 text-muted-foreground dark:hover:bg-primary/10">
                                            <DotsThree className="size-4" weight="bold" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem asChild>
                                            <Link 
                                                to={route(RouteConfig.ATTENDEE.EVENTS.DETAIL, { id: event.id })}
                                                className="flex items-center gap-2"
                                                onClick={handleActionClick}
                                            >
                                                <Eye className="size-4" />
                                                <span>{t("common.view")}</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link 
                                                to={route(RouteConfig.ORGANISER.EVENTS.EDIT, { id: event.id })}
                                                className="flex items-center gap-2"
                                            >
                                                <PencilSimple className="size-4" />
                                                <span>{t("common.edit")}</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link 
                                                to={route(RouteConfig.ORGANISER.EVENTS.DELETE, { id: event.id })}
                                                className="flex items-center gap-2 text-destructive"
                                            >
                                                <Trash className="size-4" />
                                                <span>{t("common.delete")}</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem asChild className="gap-2 p-2">
                            <Link to={route(RouteConfig.ORGANISER.EVENTS.CREATE)}>
                                    <Plus className="size-4"/>
                                <div className="font-medium text-muted-foreground">
                                    {t("event_switcher.create")}
                                </div>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
