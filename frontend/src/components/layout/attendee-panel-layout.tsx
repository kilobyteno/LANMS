import {NavThemeSwitch} from "@/components/nav-theme-switch.tsx";
import * as React from "react";
import {Toaster} from "@/components/ui/toaster.tsx";
import {NavLanguageSwitch} from "../nav-language-switch.tsx";
import {AttendeeNavUser} from "../attendee-nav-user.tsx";
import {Separator} from "../ui/separator.tsx";
import {Link} from "react-router-dom";
import {Button} from "../ui/button";
import {CalendarBlank} from "@phosphor-icons/react";
import { RouteConfig } from "@/routes/route-config.ts";
import { route } from "@/routes/route-config.ts";
import { useTranslation } from "react-i18next";

export default function AttendeePanelLayout({children}: { children: React.ReactNode }) {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold">Attendee Panel</h1>
                </div>
                <div className="flex-1 px-4">
                    <nav className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                        >
                            <Link to={route(RouteConfig.ATTENDEE.EVENTS.ROOT)}>
                                <CalendarBlank className="size-4"/>
                                {t('attendee.nav.events')}
                            </Link>
                        </Button>
                    </nav>
                </div>
                <AttendeeNavUser/>
                <Separator orientation="vertical" className="h-full mx-2"/>
                <NavLanguageSwitch/>
                <NavThemeSwitch/>
            </header>
            <main className="m-6">
                {children}
            </main>
            <footer className="relative bottom-0 text-xs text-gray-300 dark:text-gray-800 p-4 text-center">
                <span>LANMS 3.0.0-alpha.1</span>
            </footer>
            <Toaster/>
        </div>
    )
}
