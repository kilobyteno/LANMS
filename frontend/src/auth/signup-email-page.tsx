"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { setSignupFlowEmail } from "@/lib/signup-flow-storage"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "react-i18next"
import { authApi } from "@/lib/api/auth"
import { AuthShell } from "@/auth/auth-shell"

export function SignupEmailPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const response = await authApi.signup(email)

      if (response) {
        setSignupFlowEmail(email)
        router.push("/signup/verify")
      }
    } catch {
      setError("Registration failed. Please try again.")
    }
  }

  return (
    <AuthShell>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("register.title")}</CardTitle>
          <CardDescription>{t("register.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">{t("global.form.email.label")}</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder={t("global.form.email.placeholder")}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
            <Button type="submit" className="w-full">
              {t("register.submit")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-center text-sm">
          {t("register.haveAccount")}{" "}
          <Link
            href="/login"
            className="text-primary underline underline-offset-4"
          >
            {t("register.signIn")}
          </Link>
        </CardFooter>
      </Card>
    </AuthShell>
  )
}
