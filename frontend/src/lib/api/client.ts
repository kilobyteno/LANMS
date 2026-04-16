import axios, {AxiosError, InternalAxiosRequestConfig} from 'axios';
import { toast } from "sonner";
import {authApi, TokenPair} from "@/lib/api/auth";
import {API_BASE_URL, ENV} from "@/env";

export interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Token management (browser only — never touch sessionStorage/localStorage during SSR)
const getAccessToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("access_token");
};

const getRefreshToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refresh_token");
};

const setTokens = (tokens: TokenPair) => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
};

const clearTokens = () => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
};

// Refresh token function
const refreshTokens = async (): Promise<TokenPair> => {
    const refresh_token = getRefreshToken();
    if (!refresh_token) {
        throw new Error('No refresh token available');
    }

    try {
        const response = await authApi.refreshToken({refresh_token: refresh_token});
        let refreshed_access_token = response.data.data;
        let at = refreshed_access_token.access_token;
        if (!at) {
            return Promise.reject('Invalid token response');
        }
        let tokens = {
            access_token: at,
            refresh_token: refresh_token,
        };
        setTokens(tokens);
        return tokens;
    } catch (error) {
        clearTokens();
        throw error;
    }
};

// Helper function to get message from response
const getResponseMessage = (response: any): string => {
    if (response?.data?.message) {
        return response.data.message;
    }
    return 'Operation completed successfully';
};

// Helper function to get error message
const getErrorMessage = (error: any): string => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    return 'An unexpected error occurred';
};

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
    const access_token = getAccessToken();
    if (access_token) {
        config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
});
// Modify the response interceptor
apiClient.interceptors.response.use(
    (response) => {
        // Show success toast for POST, PUT, PATCH, DELETE requests (except token refresh when not in production)
        const successMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
        const method = response.config.method?.toUpperCase() || '';
        if (successMethods.includes(method) && 
            !(ENV !== 'production' && response.config.url === '/v3/auth/refresh')) {
            toast.success("Success", {
                description: getResponseMessage(response),
                duration: 5000,
            });
        }
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig;

        // If error is 401 and we haven't tried refreshing yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (!getAccessToken() && !getRefreshToken()) {
                return Promise.reject(error);
            }

            try {
                // Try to refresh the token
                const tokens = await refreshTokens();

                // Update the failed request with new token and retry
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
                }
                return apiClient(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login
                clearTokens();
                toast.error("Session Expired", {
                    description:
                        "Your session has expired. Please log in again.",
                    duration: 5000,
                });
                //window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }

        // Show error toast for all other errors
        if (error.response?.status !== 401 && error.response?.status !== 404) {
            toast.error("Error", {
                description: getErrorMessage(error),
                duration: 5000,
            });
        }

        return Promise.reject(error);
    }
);

export {getAccessToken, getRefreshToken, setTokens, clearTokens};
