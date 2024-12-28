import { apiClient, ApiResponse } from "./client";

export interface EventInterest {
    id?: string;
    status: number;
    event_id?: string;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
}
export interface EventInterestCount {
    interested: number;
    maybe: number;
    not_interested: number;
}

export type EI1Output = ApiResponse<EventInterest>;
export type EI2Output = ApiResponse<EventInterest[]>;
export type EI3Output = ApiResponse<EventInterest>;
export type EI4Output = ApiResponse<EventInterest>;
export type EI5Output = ApiResponse<EventInterestCount>;

export const eventInterestApi = {
    create: (event_id: string, data: EventInterest) => apiClient.post<EI1Output>(`/event-interests/${event_id}`, data),
    get: (event_id: string) => apiClient.get<EI2Output>(`/event-interests/${event_id}`),
    update: (event_id: string, data: EventInterest) => apiClient.put<EI3Output>(`/event-interests/${event_id}`, data),
    getMe: (event_id: string) => apiClient.get<EI4Output>(`/event-interests/${event_id}/me`),
    getCount: (event_id: string) => apiClient.get<EI5Output>(`/event-interests/${event_id}/count`),
};