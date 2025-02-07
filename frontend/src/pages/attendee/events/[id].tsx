import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Breadcrumb } from '@/components/breadcrumb';
import { Container } from '@/components/container';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { eventsApi, type Event } from '@/lib/api/events';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';
import { Calendar, Globe, EnvelopeSimple, Phone, MapPin, CaretDown, Article } from "@phosphor-icons/react";
import { eventInterestApi, type EventInterest, type EventInterestCount } from '@/lib/api/event-interest';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { articlesApi } from '@/lib/api/event-articles';
import {formatDate} from "@/lib/utils.ts";
import { Link } from 'react-router-dom';

const INTEREST_STATUS = {
    NOT_INTERESTED: 0,
    INTERESTED: 1,
    MAYBE: 2,
} as const;

const getInterestLabel = (status: number | undefined, t: (key: string) => string) => {
    switch (status) {
        case INTEREST_STATUS.INTERESTED:
            return t('attendee.events.interested');
        case INTEREST_STATUS.MAYBE:
            return t('attendee.events.maybe');
        case INTEREST_STATUS.NOT_INTERESTED:
            return t('attendee.events.not_interested');
        default:
            return t('attendee.events.set_interest');
    }
};

export default function EventDetailPage() {
    const { t } = useTranslation();
    const { id } = useParams();
    const breadcrumbs = useBreadcrumbs();
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [interest, setInterest] = useState<EventInterest | null>(null);
    const [interestCounts, setInterestCounts] = useState<EventInterestCount>({
        interested: 0,
        maybe: 0,
        not_interested: 0
    });

    const fetchEvent = async () => {
        if (!id) return;

        try {
            const response = await eventsApi.get(id);
            const articlesResponse = await articlesApi.list(id);
            setEvent({
                ...response.data.data,
                articles: articlesResponse.data.data
            });
        } catch (error) {
            console.error('Failed to fetch event:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchInterest = async () => {
        if (!id) return;

        try {
            const response = await eventInterestApi.getMe(id);
            setInterest(response.data.data);
        } catch (error) {
            console.error('Failed to fetch interest:', error);
        }
    };

    const fetchInterestCounts = async () => {
        if (!id) return;

        try {
            const response = await eventInterestApi.getCount(id);
            setInterestCounts(response.data.data);
        } catch (error) {
            console.error('Failed to fetch interest counts:', error);
        }
    };

    useEffect(() => {
        fetchEvent();
        fetchInterest();
        fetchInterestCounts();
    }, [id]);

    const handleInterestChange = async (newStatus: number) => {
        if (!id) return;

        try {
            const response = !interest
                ? await eventInterestApi.create(id, { status: newStatus })
                : await eventInterestApi.update(id, { ...interest, status: newStatus });

            setInterest(response.data.data);
            await fetchInterestCounts();
        } catch (error) {
            console.error('Failed to update interest:', error);
        }
    };

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!event) {
        return (
            <Container>
                <div className="text-center py-8">
                    <h1 className="text-2xl font-bold">{t('attendee.events.not_found')}</h1>
                </div>
            </Container>
        );
    }

    return (
        <>
            <Breadcrumb items={breadcrumbs} />

            <Container>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-bold">{event.title}</h1>
                            <span className="text-sm text-muted-foreground">
                                {interestCounts.interested} {t('attendee.events.people_interested')}
                            </span>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    {getInterestLabel(interest?.status, t)}
                                    <CaretDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleInterestChange(INTEREST_STATUS.INTERESTED)}>
                                    {t('attendee.events.interested')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleInterestChange(INTEREST_STATUS.MAYBE)}>
                                    {t('attendee.events.maybe')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleInterestChange(INTEREST_STATUS.NOT_INTERESTED)}>
                                    {t('attendee.events.not_interested')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>{t('attendee.events.details')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>
                                        {formatDate(event.start_at)} &mdash; {formatDate(event.end_at)}
                                    </span>
                                </div>

                                {event.description && (
                                    <p className="text-muted-foreground">
                                        {event.description}
                                    </p>
                                )}

                                {event.max_participants && (
                                    <p className="text-sm">
                                        {t('attendee.events.max_participants')}: {event.max_participants}
                                    </p>
                                )}

                                {event.website && (
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-5 w-5" />
                                        <a
                                            href={event.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline break-all"
                                        >
                                            {event.website}
                                        </a>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('attendee.events.contact_info')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {event.contact_email && (
                                    <div className="flex items-center gap-2">
                                        <EnvelopeSimple className="h-5 w-5" />
                                        <a
                                            href={`mailto:${event.contact_email}`}
                                            className="text-primary hover:underline break-all"
                                        >
                                            {event.contact_email}
                                        </a>
                                    </div>
                                )}

                                {event.contact_phone_number && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-5 w-5" />
                                        <a
                                            href={`tel:${event.contact_phone_code}${event.contact_phone_number}`}
                                            className="text-primary hover:underline"
                                        >
                                            {event.contact_phone_code} {event.contact_phone_number}
                                        </a>
                                    </div>
                                )}

                                {(event.address_street || event.address_city) && (
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-5 w-5 mt-1" />
                                        <address className="not-italic">
                                            {event.address_street && <div>{event.address_street}</div>}
                                            {event.address_postal_code && event.address_city && (
                                                <div>{event.address_postal_code} {event.address_city}</div>
                                            )}
                                            {event.address_country && <div>{event.address_country}</div>}
                                        </address>
                                    </div>
                                )}

                                {event.maps_url && (
                                    <a
                                        href={event.maps_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block mt-2 text-sm text-primary hover:underline"
                                    >
                                        {t('attendee.events.view_on_map')}
                                    </a>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-3">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Article className="h-5 w-5" />
                                    {t('attendee.events.articles')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {event.articles && event.articles.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        {t('attendee.events.no_articles')}
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {event.articles?.map((article) => (
                                            <Link 
                                                key={article.id} 
                                                to={`/attendee/events/${event.id}/articles/${article.id}`}
                                                className="border rounded-lg p-4 hover:border-primary transition-colors"
                                            >
                                                <h4 className="font-medium mb-2">{article.title}</h4>
                                                <p className="text-sm text-muted-foreground mb-2 line-clamp-4">
                                                    {article.content}
                                                </p>
                                                <span className="text-sm text-primary">
                                                    {t('attendee.events.read_more')}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Container>
        </>
    );
}
