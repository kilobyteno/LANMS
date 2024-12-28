import {Buildings} from "@phosphor-icons/react";
import {useOrganisation} from "@/context/OrganisationContext.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Link} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {CardDescription, CardTitle} from "@/components/ui/card.tsx";
import { route, RouteConfig } from "@/routes/route-config";

export function OrganiserDashboard() {
    const {userOrganisations, loading} = useOrganisation();
    const {t} = useTranslation();

    // Show empty state when user has no organisation
    if (!loading && userOrganisations.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center p-4">
                <div className="max-w-md space-y-4 text-center">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-primary/10 p-3 text-primary">
                            <Buildings className="size-6" weight="duotone"/>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <CardTitle>
                            {t('dashboard.no_organisations.title')}
                        </CardTitle>
                        <CardDescription>
                            {t('dashboard.no_organisations.description')}
                        </CardDescription>
                    </div>
                    <Button asChild>
                        <Link
                            to={route(RouteConfig.ORGANISER.ORGANISATIONS.CREATE)}
                        >
                            {t('dashboard.no_organisations.create')}
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Default dashboard content
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="aspect-video rounded-xl bg-muted/50"/>
                <div className="aspect-video rounded-xl bg-muted/50"/>
                <div className="aspect-video rounded-xl bg-muted/50"/>
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min"/>
        </div>
    );
}
