import {Link} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useTranslation} from "react-i18next";
import {AuthCardLayout} from "@/components/auth/auth-card-layout";
import {Rocket} from "@phosphor-icons/react";
import { route } from "@/routes/route-config";
import { RouteConfig } from "@/routes/route-config";
import {useAuth} from "@/context/AuthContext.tsx";
import {Text} from "recharts";

export function Landing() {
    const {t} = useTranslation();
    const {isAuthenticated} = useAuth();

    return (
        <AuthCardLayout>
            <div className="space-y-4">
                <CardHeader className="p-6 pb-2">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-primary/10 p-3 text-primary">
                            <Rocket className="size-6" weight="duotone"/>
                        </div>
                    </div>
                    <CardTitle className="text-center">
                        {t('landing.title')}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {t('landing.description')}
                    </CardDescription>
                </CardHeader>
                <div className="flex flex-col gap-2 p-6 pt-0">
                    <Button asChild>
                        <Link to={route(RouteConfig.ORGANISER.ROOT)}>
                            {t('landing.organiser_dashboard')}
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link to={route(RouteConfig.ATTENDEE.ROOT)}>
                            {t('landing.attendee_dashboard')}
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link to={route(RouteConfig.SIGNUP)}>
                            {t('landing.signup')}
                        </Link>
                    </Button>
                    {!isAuthenticated && (
                        <Button asChild variant="outline">
                            <Link to={route(RouteConfig.LOGIN)}>
                                {t('landing.login')}
                            </Link>
                        </Button>
                    )}
                    {isAuthenticated && (
                        <Text>You are logged in.</Text>
                    )}
                </div>
            </div>
        </AuthCardLayout>
    );
}
