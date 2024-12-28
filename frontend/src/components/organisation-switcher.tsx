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
    SidebarMenuItem,
    SidebarMenuButton,
    useSidebar,
} from "@/components/ui/sidebar"
import {CaretUpDown, Plus, Buildings, PencilSimple, Trash} from "@phosphor-icons/react";
import {useTranslation} from "react-i18next";
import {Link, useNavigate} from "react-router-dom";
import {route, RouteConfig} from "@/routes/route-config";
import {useOrganisation} from "@/context/OrganisationContext";

export function OrganisationSwitcher() {
    const {isMobile} = useSidebar()
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {currentOrganisation, userOrganisations, setCurrentOrganisation, loading} = useOrganisation();

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

    if (userOrganisations.length === 0) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <Link to={route(RouteConfig.ORGANISER.ORGANISATIONS.CREATE)}>
                        <SidebarMenuButton
                            size="lg"
                            className="gap-2 text-sidebar-muted-foreground hover:text-sidebar-foreground"
                        >
                            <Plus className="size-5"/>
                            <span className="flex-1 text-left text-sm">
                                {t("organisation_switcher.no_organisations")}
                            </span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div
                                className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-sidebar-primary-foreground">
                                <Buildings className="size-5" weight="bold"/>
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        {currentOrganisation?.name || t("organisation_switcher.select_organisation")}
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
                        {currentOrganisation && (
                            <>
                                <DropdownMenuLabel className="text-muted-foreground font-semibold">
                                    {currentOrganisation?.name || t("organisation_switcher.select_organisation")}
                                </DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link to={route(RouteConfig.ORGANISER.ORGANISATIONS.EDIT, { id: currentOrganisation.id })}>
                                        <div className="flex items-center">
                                            <PencilSimple className="mr-2 size-4" />
                                            {t('common.edit')}
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to={route(RouteConfig.ORGANISER.ORGANISATIONS.DELETE, { id: currentOrganisation.id })}>
                                        <div className="flex items-center text-destructive">
                                            <Trash className="mr-2 size-4" />
                                            {t('common.delete')}
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator/>
                            </>
                        )}
                        {userOrganisations.length > 1 && (
                            <>
                                <DropdownMenuLabel className="text-xs text-muted-foreground">
                                    {t("organisation_switcher.title")}
                                </DropdownMenuLabel>
                                {userOrganisations.map((org) => (
                                    <DropdownMenuItem
                                        key={org.id}
                                        onClick={() => {
                                            setCurrentOrganisation(org);
                                            navigate(route(RouteConfig.ORGANISER.ROOT));
                                        }}
                                        className="gap-2 p-2"
                                    >
                                        <div className="flex size-6 items-center justify-center rounded-sm border">
                                            <Buildings className="size-4 shrink-0"/>
                                        </div>
                                        {org.name}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator/>
                            </>
                        )}
                        <DropdownMenuItem asChild className="gap-2 p-2">
                            <Link to={route(RouteConfig.ORGANISER.ORGANISATIONS.CREATE)}>
                                <Plus className="size-4"/>
                                <div className="font-medium text-muted-foreground">
                                    {t("organisation_switcher.create")}
                                </div>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
