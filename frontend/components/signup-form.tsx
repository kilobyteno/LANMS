"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { cn } from "@/lib/utils"
import {
  postSignupDetails,
  postSignupEmail,
  postSignupResend,
  postSignupVerify,
} from "@/lib/api/auth"
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
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Step = 1 | 2 | 3

const PHONE_CODE_RE = /^\+\d{1,3}$/

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            {step === 1 && "Enter your email to receive a verification code"}
            {step === 2 && "Enter the code we sent to your email"}
            {step === 3 && "Complete your profile"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setError(null)
                setInfo(null)
                const form = e.currentTarget
                const fd = new FormData(form)
                const rawEmail = String(fd.get("email") ?? "").trim()
                startTransition(async () => {
                  const res = await postSignupEmail({ email: rawEmail })
                  if (!res.ok) {
                    setError(res.message)
                    return
                  }
                  setEmail(rawEmail)
                  setInfo(res.message)
                  setStep(2)
                })
              }}
            >
              <FieldGroup>
                {error ? (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}
                {info ? (
                  <Alert>
                    <AlertDescription>{info}</AlertDescription>
                  </Alert>
                ) : null}
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    autoComplete="email"
                  />
                </Field>
                <Field>
                  <Button type="submit" disabled={pending}>
                    {pending ? "Sending…" : "Continue"}
                  </Button>
                  <FieldDescription className="text-center">
                    Already have an account?{" "}
                    <Link
                      href="/auth/login"
                      className="underline-offset-4 hover:underline"
                    >
                      Sign in
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          ) : null}

          {step === 2 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setError(null)
                setInfo(null)
                const form = e.currentTarget
                const fd = new FormData(form)
                const code = String(fd.get("code") ?? "").trim()
                startTransition(async () => {
                  const res = await postSignupVerify({ email, code })
                  if (!res.ok) {
                    setError(res.message)
                    return
                  }
                  setInfo(res.message)
                  setStep(3)
                })
              }}
            >
              <FieldGroup>
                {error ? (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}
                {info ? (
                  <Alert>
                    <AlertDescription>{info}</AlertDescription>
                  </Alert>
                ) : null}
                <Field>
                  <FieldLabel htmlFor="code">Verification code</FieldLabel>
                  <Input
                    id="code"
                    name="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    required
                  />
                </Field>
                <Field className="flex flex-col gap-2 sm:flex-row">
                  <Button type="submit" className="flex-1" disabled={pending}>
                    {pending ? "Verifying…" : "Verify"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={pending}
                    onClick={() => {
                      setError(null)
                      setInfo(null)
                      startTransition(async () => {
                        const res = await postSignupResend({ email })
                        if (!res.ok) {
                          setError(res.message)
                          return
                        }
                        setInfo(res.message)
                      })
                    }}
                  >
                    Resend code
                  </Button>
                </Field>
                <Field>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setStep(1)
                      setError(null)
                      setInfo(null)
                    }}
                  >
                    Use a different email
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          ) : null}

          {step === 3 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setError(null)
                setInfo(null)
                const form = e.currentTarget
                const fd = new FormData(form)
                const name = String(fd.get("name") ?? "").trim()
                const phone_code = String(fd.get("phone_code") ?? "").trim()
                const phone_number = String(fd.get("phone_number") ?? "").trim()
                const password = String(fd.get("password") ?? "")
                const password_confirmation = String(
                  fd.get("password_confirmation") ?? "",
                )
                const referrerRaw = String(fd.get("referrer") ?? "").trim()

                if (!PHONE_CODE_RE.test(phone_code)) {
                  setError(
                    'Country code must look like "+1", "+44", etc. (1–3 digits after +).',
                  )
                  return
                }
                if (!/^\d+$/.test(phone_number)) {
                  setError("Phone number must contain only digits.")
                  return
                }
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
                  const res = await postSignupDetails({
                    name,
                    phone_code,
                    phone_number,
                    email,
                    password,
                    referrer: referrerRaw || null,
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
                  <FieldLabel htmlFor="name">Full name</FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Jane Doe"
                    required
                    autoComplete="name"
                  />
                </Field>
                <Field className="grid grid-cols-3 gap-3">
                  <Field className="col-span-1">
                    <FieldLabel htmlFor="phone_code">Code</FieldLabel>
                    <Input
                      id="phone_code"
                      name="phone_code"
                      placeholder="+1"
                      required
                      autoComplete="tel-country-code"
                    />
                  </Field>
                  <Field className="col-span-2">
                    <FieldLabel htmlFor="phone_number">Phone</FieldLabel>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      placeholder="5551234567"
                      required
                      inputMode="numeric"
                      autoComplete="tel-national"
                    />
                  </Field>
                </Field>
                <Field>
                  <FieldLabel htmlFor="email-readonly">Email</FieldLabel>
                  <Input
                    id="email-readonly"
                    value={email}
                    readOnly
                    className="bg-muted"
                  />
                </Field>
                <Field>
                  <Field className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
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
                  <FieldLabel htmlFor="referrer">Referrer (optional)</FieldLabel>
                  <Input
                    id="referrer"
                    name="referrer"
                    type="text"
                    placeholder="Code or name"
                  />
                </Field>
                <Field>
                  <Button type="submit" disabled={pending}>
                    {pending ? "Creating account…" : "Create account"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          ) : null}
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline-offset-4 hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline-offset-4 hover:underline">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  )
}
