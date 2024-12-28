"use client"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
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
import {CaretUpDown, Password, SignOut, UserSwitch} from "@phosphor-icons/react";
import {useAuth} from "@/context/AuthContext";
import {useTranslation} from "react-i18next";
import {RouteConfig} from "@/routes/route-config";
import {Link} from "react-router-dom";

export function NavUser() {
    const {isMobile} = useSidebar();
    const {logout, user} = useAuth();
    const {t} = useTranslation();
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user?.photo_url || ""} alt={user?.name || ""}/>
                                <AvatarFallback className="rounded-lg">KB</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user?.name || ""}</span>
                                <span className="truncate text-xs">{user?.email || ""}</span>
                            </div>
                            <CaretUpDown className="ml-auto size-4"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user?.photo_url || ""} alt={user?.name || ""}/>
                                    <AvatarFallback className="rounded-lg">KB</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user?.name || ""}</span>
                                    <span className="truncate text-xs">{user?.email || ""}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuGroup>
                            <Link to={RouteConfig.ATTENDEE.ROOT}>
                                <DropdownMenuItem>
                                    <UserSwitch/>
                                    {t('nav.user.attendee_panel')}
                                </DropdownMenuItem>
                            </Link>
                        </DropdownMenuGroup>
                        {/*<DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Sparkle weight="bold" />
                                Upgrade to Pro
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator/>
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <IdentificationCard weight="bold" />
                                Account
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <CreditCard weight="bold" />
                                Billing
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Bell weight="bold" />
                                Notifications
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        */}
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={() => logout()}>
                            <SignOut weight="bold"/>
                            {t('nav.user.logout')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
