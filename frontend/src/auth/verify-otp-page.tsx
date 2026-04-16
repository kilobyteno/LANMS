"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTranslation } from "react-i18next"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { authApi } from "@/lib/api/auth"
import { getSignupFlowEmail } from "@/lib/signup-flow-storage"
import { AuthShell } from "@/auth/auth-shell"

const FormSchema = z.object({
  code: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
})

export function VerifyOtpPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [isResending, setIsResending] = useState(false)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    setEmail(getSignupFlowEmail())
  }, [])

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      code: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!email) return

    try {
      const response = await authApi.verifyOtp(email, data.code)
      if (response) {
        router.push("/signup/details")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleResendCode = async () => {
    if (!email || isResending) return

    setIsResending(true)
    try {
      await authApi.resendOtp(email)
      form.reset()
    } catch (err) {
      console.error(err)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthShell>
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>{t("otp.title")}</CardTitle>
              <CardDescription>{t("otp.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("otp.form.label")}</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full">
                {t("otp.submit")}
              </Button>
              <div className="space-y-2 text-center text-sm">
                <p>
                  {t("otp.noCode")}{" "}
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    type="button"
                    onClick={handleResendCode}
                    disabled={isResending}
                  >
                    {t("otp.resend")}
                  </Button>
                </p>
                <p>
                  <Link
                    href="/login"
                    className="text-primary underline underline-offset-4"
                  >
                    {t("otp.backToLogin")}
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </AuthShell>
  )
}
