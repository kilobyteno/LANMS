import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar.tsx"
import {AppSidebar} from "@/components/app-sidebar.tsx"
import {Separator} from "@/components/ui/separator.tsx";
import {NavThemeSwitch} from "@/components/nav-theme-switch.tsx";
import * as React from "react";
import {Toaster} from "@/components/ui/toaster.tsx";
import { NavLanguageSwitch } from "../nav-language-switch.tsx";

export default function OrganiserPanelLayout({children}: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar/>
            <main className="w-full">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger/>
                    <Separator orientation="vertical" className="mr-2 h-4"/>
                    <div className="flex-1"></div>
                    <Separator orientation="vertical" className="mr-2 h-4"/>
                    <NavLanguageSwitch />
                    <NavThemeSwitch/>
                </header>
                <div className="m-6">
                    {children}
                </div>
                {/* <footer className="relative bottom-0 p-4 text-center flex items-center justify-center gap-4">
                    
                </footer> */}
            </main>
            <Toaster />
        </SidebarProvider>
    )
}
