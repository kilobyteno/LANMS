"use client"

import { useState } from "react"
import { authApi } from "@/lib/api/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { useTranslation } from "react-i18next"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon } from "@phosphor-icons/react"
import { AuthShell } from "@/auth/auth-shell"

export function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const reset_token = searchParams.get("reset_token")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const passwordConfirmation = formData.get("password_confirmation") as string

    if (!reset_token) {
      setError(t("auth.reset_password.form.error.invalid_reset_token"))
      setIsLoading(false)
      return
    }

    if (password !== passwordConfirmation) {
      setError(t("auth.reset_password.form.error.passwords_dont_match"))
      setIsLoading(false)
      return
    }

    try {
      await authApi.passwordReset({
        reset_token,
        password,
        password_confirmation: passwordConfirmation,
      })
      router.replace("/login")
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
          ? String(
              (err.response.data as { message?: string }).message ??
                t("auth.reset_password.form.error.failed")
            )
          : t("auth.reset_password.form.error.failed")
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <div className="mb-4">
            <Link
              href="/auth/forgot-password"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeftIcon className="mr-2 size-4" />
              {t("common.back")}
            </Link>
          </div>
          <CardTitle>{t("auth.reset_password.title")}</CardTitle>
          <CardDescription>{t("auth.reset_password.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.reset_password.form.password.label")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder={t("auth.reset_password.form.password.placeholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">
                {t("auth.reset_password.form.password_confirmation.label")}
              </Label>
              <Input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                required
                placeholder={t(
                  "auth.reset_password.form.password_confirmation.placeholder"
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner /> : null}
              {t("auth.reset_password.form.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
