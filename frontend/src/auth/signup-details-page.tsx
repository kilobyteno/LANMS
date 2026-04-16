"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  getSignupFlowEmail,
  clearSignupFlowEmail,
} from "@/lib/signup-flow-storage"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { authApi } from "@/lib/api/auth"
import { isValidPhoneNumber, parsePhoneNumber } from "react-phone-number-input"
import { PhoneInput } from "@/components/ui/phone-input"
import { AuthShell } from "@/auth/auth-shell"

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    password: z.string().min(12, {
      message: "Password must be at least 12 characters.",
    }),
    confirmPassword: z.string(),
    phone: z
      .string()
      .refine(isValidPhoneNumber, { message: "Invalid phone number" })
      .or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type FormData = z.infer<typeof formSchema>

export function SignupDetailsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    setEmail(getSignupFlowEmail())
  }, [])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
      phone: "",
    },
  })

  const onSubmit = async (data: FormData) => {
    if (!email) return
    try {
      const { confirmPassword: _c, phone, ...submitData } = data

      let phoneNumber = ""
      let phoneCode = ""

      if (phone) {
        const parsedPhone = parsePhoneNumber(phone)
        if (parsedPhone) {
          phoneNumber = parsedPhone.nationalNumber
          phoneCode = parsedPhone.countryCallingCode
        }
      }

      const response = await authApi.signupDetails({
        email,
        phone_number: phoneNumber,
        phone_code: `+${phoneCode}`,
        ...submitData,
      })

      if (response) {
        clearSignupFlowEmail()
        router.replace("/organiser")
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <AuthShell>
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>{t("signup.details.title")}</CardTitle>
              <CardDescription>{t("signup.details.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("signup.details.name")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("signup.details.password")}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("signup.details.confirmPassword")}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-stretch">
                    <FormLabel>{t("signup.details.phone")}</FormLabel>
                    <FormControl>
                      <PhoneInput
                        placeholder={t("signup.details.phonePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                {t("signup.details.submit")}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </AuthShell>
  )
}
