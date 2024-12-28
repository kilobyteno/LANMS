import { apiClient, ApiResponse } from "./client";
import { Event } from "@/lib/api/events";


export interface Organisation {
    id?: string;
    name: string;
    description?: string;
    website: string;
    email: string;
    phone?: string;
    address?: {
        street?: string;
        unit?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
    };
}
export type O1Output = ApiResponse<Organisation>;
export type O2Output = ApiResponse<Organisation>;
export type O3Output = ApiResponse<Organisation>;
export type O4Output = ApiResponse<Organisation>;
export type O5Output = ApiResponse<Organisation>;
export type O6Output = ApiResponse<Event[]>;

export const organisationApi = {
    create: (data: Organisation) => apiClient.post<O1Output>('/organisations', data),
    list: () => apiClient.get<O2Output>('/organisations'),
    get: (id: string) => apiClient.get<O3Output>(`/organisations/${id}`),
    update: (id: string, data: Organisation) => apiClient.put<O4Output>(`/organisations/${id}`, data),
    delete: (id: string) => apiClient.delete<O5Output>(`/organisations/${id}`),
    events: (id: string) => apiClient.get<O6Output>(`/organisations/${id}/events`),
    eventsAll: (id: string) => apiClient.get<O6Output>(`/organisations/${id}/events/all`),
};
