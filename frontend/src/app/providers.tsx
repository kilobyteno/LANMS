"use client";

import { AuthProvider } from "@/context/AuthContext";
import { OrganisationProvider } from "@/context/OrganisationContext";
import { EventProvider } from "@/context/EventContext";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/i18n";
import "react-day-picker/style.css";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <TooltipProvider delayDuration={0}>
                <AuthProvider>
                    <OrganisationProvider>
                        <EventProvider>
                            {children}
                            <Toaster />
                        </EventProvider>
                    </OrganisationProvider>
                </AuthProvider>
            </TooltipProvider>
        </ThemeProvider>
    );
}
