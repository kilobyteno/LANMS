"use client"

import Link from "next/link"
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

export function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-4xl font-semibold">404</CardTitle>
          <CardDescription>{t("error.not_found.title")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("error.not_found.description")}</p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button asChild>
            <Link href="/">{t("error.not_found.back_home")}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
