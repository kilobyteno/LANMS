import { apiClient, ApiResponse } from "./client";
import { Article } from "./event-articles";

export interface Event {
    id: string;
    title: string;
    description?: string;
    max_participants?: number;
    website?: string;
    contact_email?: string;
    contact_phone_code?: string;
    contact_phone_number?: string;
    maps_url?: string;
    address_street?: string;
    address_city?: string;
    address_postal_code?: string;
    address_country?: string;
    start_at: string;
    end_at: string;
    organisation_id: string;
    articles?: Article[];
}

export type E1Output = ApiResponse<Event>;
export type E2Output = ApiResponse<Event[]>;
export type E3Output = ApiResponse<Event>;
export type E4Output = ApiResponse<Event>;
export type E5Output = ApiResponse<Event>;


export const eventsApi = {
    create: (data: Event) => apiClient.post<E1Output>('/events', data),
    list: () => apiClient.get<E2Output>('/events'),
    get: (id: string) => apiClient.get<E3Output>(`/events/${id}`),
    update: (id: string, data: Event) => apiClient.put<E4Output>(`/events/${id}`, data),
    delete: (id: string) => apiClient.delete<E5Output>(`/events/${id}`),
};
