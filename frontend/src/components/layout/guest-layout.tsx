import * as React from "react";
import {Toaster} from "@/components/ui/toaster.tsx";
import {NavLanguageSwitch} from "@/components/nav-language-switch.tsx";
import { NavThemeSwitch } from "../nav-theme-switch";

export default function GuestLayout({children}: { children: React.ReactNode }) {
    return (
        <>
            <main className="w-full">
                <div>
                    {children}
                </div>
                <footer className="bottom-0 text-xs text-gray-300 dark:text-gray-800 p-4 text-center flex items-center justify-center gap-4">
                    <span>LANMS 3.0.0-alpha.1</span>
                    <NavLanguageSwitch />
                    <NavThemeSwitch />
                </footer>
            </main>
            <Toaster />
        </>
    )
}
