import {apiClient, ApiResponse} from "./client";

export interface Article {
    id?: string;
    title: string;
    slug?: string;
    content: string;
    event_id?: string;
    created_by_id?: string;
    published_at?: string;
    created_at?: string;
    updated_at?: string;
}

export type EA1Output = ApiResponse<Article>;
export type EA2Output = ApiResponse<Article[]>;
export type EA3Output = ApiResponse<Article>;
export type EA4Output = ApiResponse<Article>;
export type EA5Output = ApiResponse<Article>;

export const articlesApi = {
    create: (eventId: string, data: Article) =>
        apiClient.post<EA1Output>(`/events/${eventId}/articles`, data),
    list: (eventId: string) =>
        apiClient.get<EA2Output>(`/events/${eventId}/articles`),
    get: (eventId: string, articleId: string) =>
        apiClient.get<EA3Output>(`/events/${eventId}/articles/${articleId}`),
    update: (eventId: string, articleId: string, data: Article) =>
        apiClient.put<EA4Output>(`/events/${eventId}/articles/${articleId}`, data),
    delete: (eventId: string, articleId: string) =>
        apiClient.delete<EA5Output>(`/events/${eventId}/articles/${articleId}`),
};
