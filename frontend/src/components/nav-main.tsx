"use client"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {Newspaper, CaretRight, Gauge, Nut} from "@phosphor-icons/react"
import {route, RouteConfig} from "@/routes/route-config.ts";
import {useTranslation} from "react-i18next";
import {Link, useLocation} from "react-router-dom";
import {useSidebar} from "@/components/ui/sidebar";
import { useEvent } from '@/context/EventContext';

export function NavMain() {
    const {t} = useTranslation();
    const {setOpenMobile} = useSidebar();
    const location = useLocation();
    const {currentEvent} = useEvent();

    if (!currentEvent) {
        return null;
    }

    const items = [
        {
            title: t('nav.sidebar.general'),
            url: "#",
            icon: Gauge,
            items: [
                {
                    title: t('nav.sidebar.dashboard'),
                    url: route(RouteConfig.ORGANISER.ROOT),
                },
            ],
        },
        {
            title: t('nav.sidebar.news'),
            url: "#",
            icon: Newspaper,
            items: [
                {
                    title: t('nav.sidebar.articles'),
                    url: route(RouteConfig.ORGANISER.EVENTS.ARTICLES.LIST, { id: currentEvent.id }),
                },
            ],
        },
    ]

    const handleLinkClick = () => {
        setOpenMobile(false);
    };

    const isItemActive = (item: { url: string, items?: Array<{ url: string }> }) => {
        if (item.url !== "#" && location.pathname === item.url) {
            return true;
        }
        return item.items?.some(subItem => location.pathname === subItem.url) ?? false;
    };

    const isSubItemActive = (url: string) => {
        return location.pathname === url;
    };

    return (
        <SidebarGroup>
            <SidebarMenu>
                {items.map((item) => (
                    <Collapsible
                        key={item.title}
                        asChild
                        defaultOpen={isItemActive(item)}
                        className="group/collapsible"
                    >
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton tooltip={item.title}>
                                    {item.icon && <item.icon weight="bold"/>}
                                    <span>{item.title}</span>
                                    <CaretRight
                                        className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"/>
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {item.items?.map((subItem) => (
                                        <SidebarMenuSubItem key={subItem.title}>
                                            <SidebarMenuSubButton
                                                asChild
                                                isActive={isSubItemActive(subItem.url)}
                                            >
                                                <Link to={subItem.url} onClick={handleLinkClick}>
                                                    <span>{subItem.title}</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ))}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
                <Collapsible
                    defaultOpen={location.pathname === RouteConfig.ORGANISER.SYSTEM.CHANGELOG}
                >
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={t('nav.sidebar.system')}>
                                <Nut weight="bold" />
                                <span>{t('nav.sidebar.system')}</span>
                                <CaretRight
                                    className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"/>
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton
                                        asChild
                                        isActive={location.pathname === RouteConfig.ORGANISER.SYSTEM.CHANGELOG}
                                    >
                                        <Link to={RouteConfig.ORGANISER.SYSTEM.CHANGELOG} onClick={handleLinkClick}>
                                            {t('changelog.title')}
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            </SidebarMenu>
        </SidebarGroup>
    )
}
