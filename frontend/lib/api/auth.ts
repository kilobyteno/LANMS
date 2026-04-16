import { coreFetch } from "@/lib/api/client"

export type LoginTokenPayload = {
  access_token: string
  refresh_token: string
  token_type: string
}

export type RefreshPayload = {
  access_token: string
  token_type: string
}

export type UserResponse = {
  id: string
  name: string
  email: string | null
  phone_code: string | null
  phone_number: string | null
  referrer: string | null
  photo_url: string | null
  email_verified_at: string | null
  privacy_policy_accepted_at: string | null
  terms_of_service_accepted_at: string | null
  refresh_token: string | null
}

export function postSignupEmail(body: { email: string }) {
  return coreFetch<unknown>("/auth/signup", { method: "POST", body })
}

export function postSignupResend(body: { email: string }) {
  return coreFetch<unknown>("/auth/signup/resend", { method: "POST", body })
}

export function postSignupVerify(body: { email: string; code: string }) {
  return coreFetch<unknown>("/auth/signup/verify", { method: "POST", body })
}

export function postSignupDetails(body: {
  name: string
  phone_code: string
  phone_number: string
  email: string
  password: string
  referrer?: string | null
}) {
  return coreFetch<UserResponse>("/auth/signup/details", {
    method: "POST",
    body,
  })
}

export function postLogin(body: { email: string; password: string }) {
  return coreFetch<LoginTokenPayload>("/auth/login", { method: "POST", body })
}

export function postLogout(token: string) {
  return coreFetch<RefreshPayload>("/auth/logout", {
    method: "POST",
    token,
  })
}

export function postRefresh(body: { refresh_token: string }) {
  return coreFetch<RefreshPayload>("/auth/refresh", { method: "POST", body })
}

export function postPasswordChange(
  token: string,
  body: {
    old_password: string
    password: string
    password_confirmation: string
  },
) {
  return coreFetch<unknown>("/auth/password/change", {
    method: "POST",
    body,
    token,
  })
}

export function postPasswordForgot(body: { email: string }) {
  return coreFetch<unknown>("/auth/password/forgot", { method: "POST", body })
}

export function postPasswordReset(body: {
  reset_token: string
  password: string
  password_confirmation: string
}) {
  return coreFetch<unknown>("/auth/password/reset", { method: "POST", body })
}
