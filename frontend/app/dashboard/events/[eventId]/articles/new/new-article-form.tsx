"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { postArticle } from "@/lib/api/articles"
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

function slugFromTitle(title: string): string {
  const s = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
  return s.length > 0 ? s : "article"
}

export function NewArticleForm() {
  const params = useParams()
  const router = useRouter()
  const eventId = typeof params.eventId === "string" ? params.eventId : ""
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (!eventId) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Invalid event.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>New article</CardTitle>
        <CardDescription>
          Create content for this event. Leave publish date empty to save as a
          draft (backend may still require a slug).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault()
            setError(null)
            const token = getAccessToken()
            if (!token) {
              setError("You must be signed in.")
              return
            }
            const form = e.currentTarget
            const fd = new FormData(form)
            const title = String(fd.get("title") ?? "").trim()
            const slugRaw = String(fd.get("slug") ?? "").trim()
            const content = String(fd.get("content") ?? "").trim()
            const publishedRaw = String(fd.get("published_at") ?? "").trim()
            if (!title || !content) {
              setError("Title and content are required.")
              return
            }
            const slug = slugRaw.length > 0 ? slugRaw : slugFromTitle(title)
            const published_at =
              publishedRaw.length > 0
                ? new Date(publishedRaw).toISOString()
                : null
            startTransition(async () => {
              const res = await postArticle(
                eventId,
                {
                  title,
                  slug,
                  content,
                  published_at,
                },
                token,
              )
              if (!res.ok) {
                setError(res.message)
                return
              }
              router.push(`/dashboard/events/${eventId}/articles`)
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
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input id="title" name="title" required placeholder="Article title" />
            </Field>
            <Field>
              <FieldLabel htmlFor="slug">Slug (optional)</FieldLabel>
              <Input
                id="slug"
                name="slug"
                placeholder="auto-from-title"
                className="font-mono text-sm"
              />
              <FieldDescription>
                URL-friendly id; generated from title if left blank.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="content">Content</FieldLabel>
              <textarea
                id="content"
                name="content"
                required
                rows={12}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-32 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Write your article…"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="published_at">Publish at (optional)</FieldLabel>
              <Input
                id="published_at"
                name="published_at"
                type="datetime-local"
              />
              <FieldDescription>
                Empty = draft (not shown in public article list until published).
              </FieldDescription>
            </Field>
            <Field className="flex flex-wrap gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Create article"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/dashboard/events/${eventId}/articles`}>
                  Cancel
                </Link>
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
