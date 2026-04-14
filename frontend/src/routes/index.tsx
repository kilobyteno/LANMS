import {createBrowserRouter, Outlet} from 'react-router-dom';
import GuestLayout from '@/components/layout/guest-layout';
import {ProtectedRoute} from '@/routes/ProtectedRoute.tsx';
import {PublicOnlyRoute} from '@/routes/PublicOnlyRoute.tsx';
import {Landing} from '@/pages/Landing';
import {Login} from '@/pages/auth/Login';
import {Signup} from '@/pages/auth/Signup.tsx';
import {VerifyOtp} from '@/pages/auth/VerifyOtp.tsx';
import {NotFound} from '@/pages/error/NotFound';
import SignupDetails from '@/pages/auth/SignupDetails';
import {AttendeeDashboard} from '@/pages/attendee/dashboard';
import {OrganiserDashboard} from '@/pages/organiser/dashboard';
import {RouteConfig} from '@/routes/route-config.ts';
import {OrganisationCreate} from "@/pages/organiser/organisation/organisation-create.tsx";
import ChangePassword from '@/pages/auth/ChangePassword';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import { EventCreate } from '@/pages/organiser/event/event-create';
import Changelog from '@/pages/changelog';
import { EventEdit } from '@/pages/organiser/event/event-edit';
import { EventDelete } from '@/pages/organiser/event/event-delete';
import { OrganisationDelete } from '@/pages/organiser/organisation/organisation-delete';
import { OrganisationEdit } from '@/pages/organiser/organisation/organisation-edit';
import EventsPage from '@/pages/attendee/events';
import EventDetailPage from '@/pages/attendee/events/[id]';
import { ArticleList } from '@/pages/organiser/article/article-list';
import { ArticleCreate } from '@/pages/organiser/article/article-create';
import { ArticleEdit } from '@/pages/organiser/article/article-edit';
import ArticleDetailPage from '@/pages/attendee/events/articles/[id]';

const authRoutes = [
    {
        path: RouteConfig.LOGIN,
        element: <Login/>
    },
    {
        path: RouteConfig.SIGNUP,
        element: <Signup/>
    },
    {
        path: RouteConfig.SIGNUP_VERIFY,
        element: <VerifyOtp/>
    },
    {
        path: RouteConfig.SIGNUP_DETAILS,
        element: <SignupDetails/>
    },
    {
        path: RouteConfig.AUTH.PASSWORD_FORGOT,
        element: <ForgotPassword />
    },
    {
        path: RouteConfig.AUTH.PASSWORD_RESET,
        element: <ResetPassword />
    },
];

const onboardingRoutes: never[] = [
    /*{
        path: RouteConfig.ONBOARDING.ORGANISATION,
        element: <OrganizationOnboarding/>
    },*/
];

const organizerRoutes = [
    {
        path: RouteConfig.ORGANISER.ROOT,
        children: [
            {
                path: '',
                element: <OrganiserDashboard/>
            },
            {
                path: RouteConfig.ORGANISER.ORGANISATIONS.CREATE,
                element: <OrganisationCreate/>
            },
            {
                path: RouteConfig.ORGANISER.ORGANISATIONS.EDIT,
                element: <OrganisationEdit/>
            },
            {
                path: RouteConfig.ORGANISER.ORGANISATIONS.DELETE,
                element: <OrganisationDelete/>
            },
            {
                path: RouteConfig.ORGANISER.EVENTS.CREATE,
                element: <EventCreate/>
            },
            {
                path: RouteConfig.ORGANISER.SYSTEM.CHANGELOG,
                element: <Changelog/>
            },
            {
                path: RouteConfig.ORGANISER.EVENTS.EDIT,
                element: <EventEdit />
            },
            {
                path: RouteConfig.ORGANISER.EVENTS.DELETE,
                element: <EventDelete />
            },
            {
                path: RouteConfig.ORGANISER.EVENTS.ARTICLES.LIST,
                element: <ArticleList />
            },
            {
                path: RouteConfig.ORGANISER.EVENTS.ARTICLES.CREATE,
                element: <ArticleCreate />
            },
            {
                path: RouteConfig.ORGANISER.EVENTS.ARTICLES.EDIT,
                element: <ArticleEdit />
            },
        ]
    },
];

const attendeeRoutes = [
    {
        path: RouteConfig.ATTENDEE.ROOT,
        children: [
            {
                path: '',
                element: <AttendeeDashboard/>
            },
            {
                path: RouteConfig.ATTENDEE.USER.PASSWORD_CHANGE,
                element: <ChangePassword/>
            },
            {
                path: RouteConfig.ATTENDEE.EVENTS.ROOT,
                element: <EventsPage/>
            },
            {
                path: RouteConfig.ATTENDEE.EVENTS.DETAIL,
                element: <EventDetailPage/>
            },
            {
                path: RouteConfig.ATTENDEE.EVENTS.ARTICLES.DETAIL,
                element: <ArticleDetailPage/>
            }
        ]
    },
];

export const router = createBrowserRouter([
    {
        element: <GuestLayout><Outlet/></GuestLayout>,
        children: [
            {path: RouteConfig.HOME, element: <Landing/>},
            {
                element: <PublicOnlyRoute redirectTo={RouteConfig.HOME}><Outlet/></PublicOnlyRoute>,
                children: [...authRoutes, ...onboardingRoutes],
            },
        ],
    },
    {
        element: <ProtectedRoute layout="organiser"><Outlet/></ProtectedRoute>,
        children: [...organizerRoutes],
    },
    {
        element: <ProtectedRoute layout="attendee"><Outlet/></ProtectedRoute>,
        children: attendeeRoutes,
    },
    {
        path: "*",
        element: <GuestLayout><NotFound/></GuestLayout>
    }
]);
