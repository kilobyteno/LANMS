import {Link} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useTranslation} from "react-i18next";
import {AuthCardLayout} from "@/components/auth/auth-card-layout";
import {Warning} from "@phosphor-icons/react";
import { RouteConfig } from "@/routes/route-config";
import { route } from "@/routes/route-config";

export function NotFound() {
    const {t} = useTranslation();

    return (
        <AuthCardLayout>
            <div className="space-y-4">
                <CardHeader className="p-6 pb-2">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-destructive/10 p-3 text-destructive">
                            <Warning className="size-6" weight="duotone"/>
                        </div>
                    </div>
                    <CardTitle className="text-center">
                        {t('error.404.title', 'Page not found')}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {t('error.404.description', "Sorry, we couldn't find the page you're looking for.")}
                    </CardDescription>
                </CardHeader>
                <div className="p-6 pt-0">
                    <Button asChild className="w-full">
                        <Link
                            to={route(RouteConfig.HOME)}
                        >
                            {t('error.404.backHome', 'Back to home')}
                        </Link>
                    </Button>
                </div>
            </div>
        </AuthCardLayout>
    );
} 