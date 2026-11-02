"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { EventProvider } from "@/components/event-context"
import { OrganisationProvider } from "@/components/organisation-context"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

function DashboardBreadcrumb() {
  const pathname = usePathname()
  const isArticles = pathname.includes("/articles")
  const isNewArticle = pathname.endsWith("/articles/new")
  const articlesBase =
    isArticles && !isNewArticle
      ? pathname
      : isNewArticle
        ? pathname.replace(/\/new$/, "")
        : null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/organisor">Organisor</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {isArticles ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {isNewArticle && articlesBase ? (
                <BreadcrumbLink asChild>
                  <Link href={articlesBase}>Articles</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>Articles</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {isNewArticle ? (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>New article</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : null}
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <OrganisationProvider>
        <EventProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-vertical:h-4 data-vertical:self-auto"
                />
                <DashboardBreadcrumb />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
          </SidebarInset>
        </EventProvider>
      </OrganisationProvider>
    </SidebarProvider>
  )
}
