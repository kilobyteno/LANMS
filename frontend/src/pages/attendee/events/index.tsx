import {useTranslation} from 'react-i18next';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Breadcrumb} from '@/components/breadcrumb';
import {Container} from '@/components/container';
import {LoadingScreen} from '@/components/ui/loading-screen';
import {Button} from '@/components/ui/button';
import {useBreadcrumbs} from '@/hooks/use-breadcrumbs';
import {eventsApi, type Event} from '@/lib/api/events';
import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {Calendar} from "@phosphor-icons/react";
import { route, RouteConfig } from '@/routes/route-config';

export default function EventsPage() {
    const {t} = useTranslation();
    const breadcrumbs = useBreadcrumbs();
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await eventsApi.list();
                setEvents(response.data.data);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (isLoading) {
        return <LoadingScreen/>;
    }

    return (
        <>
            <Breadcrumb items={breadcrumbs}/>

            <Container>
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">{t('attendee.events.title')}</h1>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {events?.map((event) => (
                            <Card key={event.id}>
                                <CardHeader>
                                    <CardTitle>{event.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4"/>
                                            <span>{new Date(event.start_at).toLocaleDateString()} &mdash; {new Date(event.end_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {event.description}
                                        </p>
                                        <Button asChild className="w-full">
                                            <Link to={route(RouteConfig.ATTENDEE.EVENTS.DETAIL, {id: event.id})}>
                                                {t('attendee.events.view_details')}
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </Container>
        </>
    );
}
