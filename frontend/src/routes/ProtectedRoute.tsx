"use client";

import OrganiserPanelLayout from "../components/layout/organiser-panel-layout";
import AttendeePanelLayout from "../components/layout/attendee-panel-layout";
import { useAuth } from "@/context/AuthContext";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    layout: "organiser" | "attendee";
}

export function ProtectedRoute({ children, layout }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            const loginUrl = `/login?from=${encodeURIComponent(pathname)}`;
            router.replace(loginUrl);
        }
    }, [loading, user, router, pathname]);

    if (loading) {
        return <LoadingScreen />;
    }

    if (!user) {
        return <LoadingScreen />;
    }

    if (layout === "organiser") {
        return <OrganiserPanelLayout>{children}</OrganiserPanelLayout>;
    }

    return <AttendeePanelLayout>{children}</AttendeePanelLayout>;
}
