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
import { CaretRightIcon, GaugeIcon, NewspaperIcon, NutIcon } from "@phosphor-icons/react"
import { useTranslation } from "react-i18next"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar"
import { useEvent } from "@/context/EventContext"

export function NavMain() {
  const { t } = useTranslation()
  const { setOpenMobile } = useSidebar()
  const pathname = usePathname()
  const { currentEvent } = useEvent()

  if (!currentEvent) {
    return null
  }

  const items = [
    {
      title: t("nav.sidebar.general"),
      url: "#",
      icon: GaugeIcon,
      items: [
        {
          title: t("nav.sidebar.dashboard"),
          url: "/organiser",
        },
      ],
    },
    {
      title: t("nav.sidebar.news"),
      url: "#",
      icon: NewspaperIcon,
      items: [
        {
          title: t("nav.sidebar.articles"),
          url: `/organiser/events/${currentEvent.id}/articles`,
        },
      ],
    },
  ]

  const handleLinkClick = () => {
    setOpenMobile(false)
  }

  const isItemActive = (item: {
    url: string
    items?: Array<{ url: string }>
  }) => {
    if (item.url !== "#" && pathname === item.url) {
      return true
    }
    return item.items?.some((subItem) => pathname === subItem.url) ?? false
  }

  const isSubItemActive = (url: string) => pathname === url

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
                  {item.icon && (
                    <item.icon weight="bold" className="size-4" />
                  )}
                  <span>{item.title}</span>
                  <CaretRightIcon className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
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
                        <Link href={subItem.url} onClick={handleLinkClick}>
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
          defaultOpen={pathname === "/organiser/system/changelog"}
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={t("nav.sidebar.system")}>
                <NutIcon weight="bold" className="size-4" />
                <span>{t("nav.sidebar.system")}</span>
                <CaretRightIcon className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={
                      pathname === "/organiser/system/changelog"
                    }
                  >
                    <Link
                      href="/organiser/system/changelog"
                      onClick={handleLinkClick}
                    >
                      {t("changelog.title")}
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
