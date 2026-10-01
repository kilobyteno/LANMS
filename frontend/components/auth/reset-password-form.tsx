"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { cn } from "@/lib/utils"
import { postPasswordReset } from "@/lib/api/auth"
import { PASSWORD_MIN_LENGTH } from "@/lib/auth/constants"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { PasswordInput } from "@/components/ui/password-input"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ResetPasswordForm({
  resetToken,
  className,
  ...props
}: React.ComponentProps<"div"> & { resetToken: string | null }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (!resetToken) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Invalid link</CardTitle>
            <CardDescription>
              This reset link is missing a token. Open the link from your email
              or request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/forgot-password">Request new link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset password</CardTitle>
          <CardDescription>Choose a new password for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setError(null)
              const form = e.currentTarget
              const fd = new FormData(form)
              const password = String(fd.get("password") ?? "")
              const password_confirmation = String(
                fd.get("password_confirmation") ?? "",
              )
              if (password.length < PASSWORD_MIN_LENGTH) {
                setError(
                  `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
                )
                return
              }
              if (password !== password_confirmation) {
                setError("Passwords do not match.")
                return
              }
              startTransition(async () => {
                const res = await postPasswordReset({
                  reset_token: resetToken,
                  password,
                  password_confirmation,
                })
                if (!res.ok) {
                  setError(res.message)
                  return
                }
                router.push("/auth/login")
              })
            }}
          >
            <FieldGroup>
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <Field>
                <FieldLabel htmlFor="password">New password</FieldLabel>
                <PasswordInput
                  id="password"
                  name="password"
                  required
                  autoComplete="new-password"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password_confirmation">
                  Confirm
                </FieldLabel>
                <PasswordInput
                  id="password_confirmation"
                  name="password_confirmation"
                  required
                  autoComplete="new-password"
                />
              </Field>
              <Field>
                <FieldDescription>
                  Must be at least {PASSWORD_MIN_LENGTH} characters.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={pending}>
                  {pending ? "Saving…" : "Update password"}
                </Button>
                <FieldDescription className="text-center">
                  <Link
                    href="/auth/login"
                    className="underline-offset-4 hover:underline"
                  >
                    Back to sign in
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
