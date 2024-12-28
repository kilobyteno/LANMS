import {apiClient, ApiResponse, setTokens} from './client';
import {
    LoginResponse,
    OtpVerifyResponse,
    SignupResponse,
    SignupDetailsData,
    SignupDetailsResponse
} from '../types/auth';

export interface TokenPair {
    access_token: string;
    refresh_token: string;
}

export interface A6Input {
    refresh_token: string;
}

export interface RefreshTokenResponse {
    access_token: string;
    token_type: string;
}

export type A6Output = ApiResponse<RefreshTokenResponse>;

export interface A7Input {
    old_password: string;
    password: string;
    password_confirmation: string;
}
export type A7Output = ApiResponse<[]>;

export interface A8Input {
    email: string;
}
export type A8Output = ApiResponse<[]>;

export interface A9Input {
    reset_token: string;
    password: string;
    password_confirmation: string;
}
export type A9Output = ApiResponse<[]>;

export const authApi = {
    login: async (email: string, password: string) => {
        const response = await apiClient.post<LoginResponse>('/auth/login', {
            email,
            password,
        });
        setTokens({
            access_token: response.data.data.access_token,
            refresh_token: response.data.data.refresh_token,
        })
        return response.data;
    },

    signup: async (email: string) => {
        const response = await apiClient.post<SignupResponse>('/auth/signup', {
            email,
        });
        return response.data;
    },

    verifyOtp: async (email: string, code: string) => {
        const response = await apiClient.post<OtpVerifyResponse>('/auth/signup/verify', {
            email,
            code,
        });
        return response.data;
    },

    resendOtp: async (email: string) => {
        const response = await apiClient.post<OtpVerifyResponse>('/auth/signup/resend', {
            email,
        });
        return response.data;
    },

    logout: async () => {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    },

    signupDetails: async (data: SignupDetailsData): Promise<SignupDetailsResponse> => {
        const response = await apiClient.post<SignupDetailsResponse>('/auth/signup/details', data);
        return response.data;
    },

    refreshToken: (data: A6Input) => apiClient.post<A6Output>('/auth/refresh', data),
    passwordChange: (data: A7Input) => apiClient.post<A7Output>('/auth/password/change', data),
    passwordForgot: (data: A8Input) => apiClient.post<A8Output>('/auth/password/forgot', data),
    passwordReset: (data: A9Input) => apiClient.post<A9Output>('/auth/password/reset', data),
};
