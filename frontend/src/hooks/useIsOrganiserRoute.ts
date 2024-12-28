import { RouteConfig } from '@/routes/route-config';
import { useEffect, useState } from 'react';

export const useIsOrganiserRoute = () => {
    const [isOrganiserRoute, setIsOrganiserRoute] = useState(false);

    useEffect(() => {
        // Check if we are on an organiser route by looking at the current URL
        const checkRoute = () => {
            setIsOrganiserRoute(window.location.pathname.includes(RouteConfig.ORGANISER.ROOT));
        };

        // Check initially
        checkRoute();

        // Listen for route changes
        window.addEventListener('popstate', checkRoute);

        return () => {
            window.removeEventListener('popstate', checkRoute);
        };
    }, []);

    return isOrganiserRoute;
};
