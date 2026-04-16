"use client"

import { AuthShell } from "@/auth/auth-shell"
import { LoginForm } from "@/auth/login-form"

export function LoginPage() {
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  )
}
