"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTranslation } from "react-i18next"
import { RocketLaunchIcon } from "@phosphor-icons/react"
import { useAuth } from "@/context/AuthContext"

export function Landing() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()

  return (
    <div className="relative min-h-svh overflow-hidden bg-gradient-to-b from-muted/80 via-background to-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />
      <div className="relative mx-auto flex min-h-svh max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16 md:flex-row md:items-stretch md:justify-between md:gap-16">
        <div className="flex max-w-xl flex-col justify-center gap-6 text-center md:text-left">
          <div className="inline-flex justify-center md:justify-start">
            <span className="rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              LANMS
            </span>
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            {t("landing.title")}
          </h1>
          <p className="text-pretty text-lg text-muted-foreground">
            {t("landing.description")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Button asChild size="lg">
              <Link href="/organiser">
                {t("landing.organiser_dashboard")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/attendee">
                {t("landing.attendee_dashboard")}
              </Link>
            </Button>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center md:justify-start">
            <Button asChild variant="secondary">
              <Link href="/signup">{t("landing.signup")}</Link>
            </Button>
            {!isAuthenticated ? (
              <Button asChild variant="ghost">
                <Link href="/login">{t("landing.login")}</Link>
              </Button>
            ) : (
              <p className="self-center text-sm text-muted-foreground md:self-start">
                You are logged in.
              </p>
            )}
          </div>
        </div>
        <Card className="w-full max-w-md border-border/80 shadow-lg md:mt-0">
          <CardHeader className="text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <RocketLaunchIcon className="size-8" weight="duotone" />
            </div>
            <CardTitle className="text-xl">{t("landing.title")}</CardTitle>
            <CardDescription>{t("landing.description")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
