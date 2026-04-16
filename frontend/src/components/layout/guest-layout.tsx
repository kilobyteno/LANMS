"use client";

import * as React from "react";
import { NavLanguageSwitch } from "@/components/nav-language-switch";
import { NavThemeSwitch } from "../nav-theme-switch";
import { CURRENT_VERSION } from "@/env";

export default function GuestLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <main className="w-full">
                <div>
                    {children}
                </div>
                <footer className="bottom-0 text-xs text-gray-300 dark:text-gray-800 p-4 text-center flex items-center justify-center gap-4">
                    <span>LANMS {CURRENT_VERSION}</span>
                    <NavLanguageSwitch />
                    <NavThemeSwitch />
                </footer>
            </main>
        </>
    );
}
