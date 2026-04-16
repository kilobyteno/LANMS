const SIGNUP_EMAIL_KEY = "lanms_signup_email";

export function setSignupFlowEmail(email: string): void {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(SIGNUP_EMAIL_KEY, email);
}

export function getSignupFlowEmail(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(SIGNUP_EMAIL_KEY);
}

export function clearSignupFlowEmail(): void {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(SIGNUP_EMAIL_KEY);
}
