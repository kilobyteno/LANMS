"use client"

import { NavThemeSwitch } from "@/components/nav-theme-switch"
import * as React from "react"
import { NavLanguageSwitch } from "../nav-language-switch"
import { AttendeeNavUser } from "../attendee-nav-user"
import { Separator } from "../ui/separator"
import Link from "next/link"
import { Button } from "../ui/button"
import { CalendarBlankIcon } from "@phosphor-icons/react"
import { useTranslation } from "react-i18next"
import { VersionChecker } from "../version-checker"

export default function AttendeePanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight">LANMS</span>
        </div>
        <nav className="flex flex-1 items-center px-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/attendee/events">
              <CalendarBlankIcon className="mr-2 size-4" />
              {t("attendee.nav.events")}
            </Link>
          </Button>
        </nav>
        <AttendeeNavUser />
        <Separator orientation="vertical" className="h-6" />
        <NavLanguageSwitch />
        <NavThemeSwitch />
      </header>
      <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        <VersionChecker showUpdateBadge={false} />
      </footer>
    </div>
  )
}
