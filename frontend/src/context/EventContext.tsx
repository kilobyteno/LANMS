import React, {createContext, useContext, useState, useEffect} from 'react';
import {useOrganisation} from './OrganisationContext';
import {organisationApi} from '../lib/api/organisation';
import {useAuth} from './AuthContext';
import {Event} from '../lib/api/events.ts';
import { useIsOrganiserRoute } from '../hooks/useIsOrganiserRoute.ts';

interface EventContextType {
    currentEvent: Event | null;
    events: Event[];
    setCurrentEvent: (event: Event | null) => void;
    loading: boolean;
    refreshEvents: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

const CURRENT_EVENT_ID_KEY = 'currentEventId';

export function EventProvider({children}: { children: React.ReactNode }) {
    const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const {currentOrganisation} = useOrganisation();
    const {isAuthenticated} = useAuth();
    const isOrganiserRoute = useIsOrganiserRoute();

    const handleSetCurrentEvent = (event: Event | null) => {
        setCurrentEvent(event);
        if (event?.id) {
            localStorage.setItem(CURRENT_EVENT_ID_KEY, event.id);
        } else {
            localStorage.removeItem(CURRENT_EVENT_ID_KEY);
        }
    }

    async function fetchEvents() {
        if (!isAuthenticated || !isOrganiserRoute || !currentOrganisation) {
            setEvents([]);
            setCurrentEvent(null);
            setLoading(false);
            return;
        }

        try {
            const response = await organisationApi.eventsAll(currentOrganisation.id);
            const events = response.data.data;
            setEvents(events);

            const savedEventId = localStorage.getItem(CURRENT_EVENT_ID_KEY);
            const savedEvent = events.find((event) => event.id === savedEventId);

            if (savedEvent) {
                setCurrentEvent(savedEvent);
            } else if (events.length > 0) {
                // If no saved event or saved event not found, use the first event
                const firstEvent = events[0];
                handleSetCurrentEvent(firstEvent);
            } else {
                handleSetCurrentEvent(null);
            }
        } catch (err) {
            console.error('Failed to fetch events:', err);
            //setEvents([]);
            handleSetCurrentEvent(null);
        } finally {
            setLoading(false);
        }
    }

    // Initial load
    useEffect(() => {
        fetchEvents();
    }, [currentOrganisation, isAuthenticated, isOrganiserRoute]);

    return (
        <EventContext.Provider
            value={{
                currentEvent,
                events,
                setCurrentEvent: handleSetCurrentEvent,
                loading,
                refreshEvents: fetchEvents,
            }}
        >
            {children}
        </EventContext.Provider>
    );
}

export const useEvent = () => {
    const context = useContext(EventContext);
    if (context === undefined) {
        throw new Error('useEvent must be used within an EventProvider');
    }
    return context;
};
