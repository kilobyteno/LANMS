import {apiClient, ApiResponse} from './client';
import {Organisation} from "@/lib/api/organisation.ts";
import {Event} from "@/lib/api/events";

export interface User {
    name: string;
    email: string;
    phone_code: string;
    phone_number: string;
    referrer: string;
    photo_url: string;
    id: string;
    email_verified_at: string;
    privacy_policy_accepted_at: string;
    terms_of_service_accepted_at: string;
    refresh_token: string;
}

export type U1Output = ApiResponse<User>;
export type U2Output = ApiResponse<Organisation[]>;
export type U3Output = ApiResponse<Event[]>;

export const userApi = {
    getUser: () => apiClient.get<U1Output>('/user/me'),
    getUserOrganisations: () => apiClient.get<U2Output>('/user/organisations'),
    getUserEvents: () => apiClient.get<U3Output>('/user/events'),
};
