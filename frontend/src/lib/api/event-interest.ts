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
    create: (event_id: string, data: EventInterest) => apiClient.post<EI1Output>(`/events/${event_id}/interests`, data),
    get: (event_id: string) => apiClient.get<EI2Output>(`/events/${event_id}/interests`),
    update: (event_id: string, data: EventInterest) => apiClient.put<EI3Output>(`/events/${event_id}/interests`, data),
    getMe: (event_id: string) => apiClient.get<EI4Output>(`/events/${event_id}/interests/me`),
    getCount: (event_id: string) => apiClient.get<EI5Output>(`/events/${event_id}/interests/count`),
};
