"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  startTransition as startReactTransition,
  useEffect,
  useState,
  useTransition,
} from "react"
import { cn } from "@/lib/utils"
import { postPasswordChange } from "@/lib/api/auth"
import { PASSWORD_MIN_LENGTH } from "@/lib/auth/constants"
import { getAccessToken } from "@/lib/auth/session"
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
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ChangePasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const t = getAccessToken()
    if (!t) {
      router.replace("/auth/login")
      return
    }
    startReactTransition(() => {
      setToken(t)
    })
  }, [router])

  if (!token) {
    return null
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Change password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setError(null)
              setSuccess(null)
              const form = e.currentTarget
              const fd = new FormData(form)
              const old_password = String(fd.get("old_password") ?? "")
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
                setError("New passwords do not match.")
                return
              }
              startTransition(async () => {
                const res = await postPasswordChange(token, {
                  old_password,
                  password,
                  password_confirmation,
                })
                if (!res.ok) {
                  setError(res.message)
                  return
                }
                setSuccess(res.message)
                form.reset()
              })
            }}
          >
            <FieldGroup>
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              {success ? (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              ) : null}
              <Field>
                <FieldLabel htmlFor="old_password">Current password</FieldLabel>
                <Input
                  id="old_password"
                  name="old_password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">New password</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      autoComplete="new-password"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password_confirmation">
                      Confirm
                    </FieldLabel>
                    <Input
                      id="password_confirmation"
                      name="password_confirmation"
                      type="password"
                      required
                      autoComplete="new-password"
                    />
                  </Field>
                </Field>
                <FieldDescription>
                  Must be at least {PASSWORD_MIN_LENGTH} characters.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={pending}>
                  {pending ? "Updating…" : "Update password"}
                </Button>
                <FieldDescription className="text-center">
                  <Link
                    href="/organisor"
                    className="underline-offset-4 hover:underline"
                  >
                    Back to organisor
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
