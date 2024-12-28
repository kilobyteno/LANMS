import {ApiResponse} from "../api/client";
import {TokenPair} from "@/lib/api/auth.ts";


export interface SignupResponseData {
    requiresOtp: boolean;
}

export type SignupResponse = ApiResponse<SignupResponseData>;

export interface LoginResponseData {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export type LoginResponse = ApiResponse<LoginResponseData>;

export interface OtpVerifyResponseData {
    tokens: TokenPair;
}

export type OtpVerifyResponse = ApiResponse<OtpVerifyResponseData>;

export interface SignupDetailsData {
    name: string;
    phone_code: string;
    phone_number: string;
    email: string;
    password: string;
}

export interface SignupDetailsResponseData {
    user: {
        id: string;
        email: string;
        fullName: string;
        phoneNumber: string;
    };
}

export type SignupDetailsResponse = ApiResponse<SignupDetailsResponseData>;

