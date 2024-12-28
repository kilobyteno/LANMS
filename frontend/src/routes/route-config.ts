export const RouteConfig = {
    // Public routes
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    SIGNUP_VERIFY: '/signup/verify',
    SIGNUP_DETAILS: '/signup/details',

    // Onboarding
    ONBOARDING: {
        ORGANISATION: '/onboarding/organisation',
    },

    // Organiser routes
    ORGANISER: {
        ROOT: '/organiser',
        EVENTS: {
            ROOT: '/organiser/events',
            CREATE: '/organiser/events/create',
            EDIT: '/organiser/events/:id/edit',
            DELETE: '/organiser/events/:id/delete',
        },
        ORGANISATIONS: {
            CREATE: '/organiser/organisation/create',
            EDIT: '/organiser/organisation/:id/edit',
            DELETE: '/organiser/organisation/:id/delete',
        },
        SYSTEM: {
            CHANGELOG: '/organiser/system/changelog',
        },
    },

    // Attendee routes
    ATTENDEE: {
        ROOT: '/attendee',
        EVENTS: {
            ROOT: '/attendee/events',
            DETAIL: '/attendee/events/:id',
        },
        USER: {
            PASSWORD_CHANGE: '/attendee/user/password/change',
        },
    },

    // Auth routes
    AUTH: {
        PASSWORD_FORGOT: '/auth/forgot-password',
        PASSWORD_RESET: '/auth/reset-password',
    },
} as const;

interface RouteConfigType {
    path: string;
    key: string;
    title?: string;
    isProtected?: boolean;
}

export const routes: RouteConfigType[] = [
    {
        path: RouteConfig.HOME,
        key: 'home',
    },
    {
        path: RouteConfig.ORGANISER.ROOT,
        key: 'organiser',
    },
    {
        path: RouteConfig.ORGANISER.EVENTS.ROOT,
        key: 'events',
    },
    {
        path: RouteConfig.ORGANISER.EVENTS.CREATE,
        key: 'events_create',
    },
    {
        path: RouteConfig.ORGANISER.EVENTS.EDIT,
        key: 'events_edit',
    },
    {
        path: RouteConfig.ORGANISER.ORGANISATIONS.CREATE,
        key: 'organisation_create',
    },
    {
        path: RouteConfig.ORGANISER.ORGANISATIONS.EDIT,
        key: 'organisation_edit',
    }
];

export function route(path: string, params?: Record<string, string>) {
    if (!params) return path;
    let result = path;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, value);
    });
    return result;
}
