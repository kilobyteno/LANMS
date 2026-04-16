"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface PublicOnlyRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export const PublicOnlyRoute = ({
    children,
    redirectTo = "/",
}: PublicOnlyRouteProps) => {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && isAuthenticated) {
            router.replace(redirectTo);
        }
    }, [isAuthenticated, loading, redirectTo, router, pathname]);

    if (loading) {
        return null;
    }

    if (isAuthenticated) {
        return null;
    }

    return <>{children}</>;
};
