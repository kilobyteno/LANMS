"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  startTransition as startReactTransition,
  useEffect,
  useState,
  useTransition,
} from "react"
import {
  asArticleRecord,
  getArticle,
  putArticle,
} from "@/lib/api/articles"
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
import { Skeleton } from "@/components/ui/skeleton"

function slugFromTitle(title: string): string {
  const s = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
  return s.length > 0 ? s : "article"
}

function isoToDatetimeLocalValue(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function EditArticleForm() {
  const params = useParams()
  const router = useRouter()
  const eventId = typeof params.eventId === "string" ? params.eventId : ""
  const articleId =
    typeof params.articleId === "string" ? params.articleId : ""

  const [pending, startTransition] = useTransition()
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(() => !!(eventId && articleId))
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [publishedLocal, setPublishedLocal] = useState("")

  useEffect(() => {
    if (!eventId || !articleId) return
    let cancelled = false
    startReactTransition(() => {
      if (!cancelled) {
        setLoading(true)
        setLoadError(null)
      }
    })
    const token = getAccessToken()
    ;(async () => {
      const res = await getArticle(eventId, articleId, token ?? undefined)
      if (cancelled) return
      if (!res.ok) {
        startReactTransition(() => {
          if (!cancelled) {
            setLoadError(res.message)
            setLoading(false)
          }
        })
        return
      }
      const article = asArticleRecord(res.data)
      if (!article) {
        startReactTransition(() => {
          if (!cancelled) {
            setLoadError("Could not read article from the server.")
            setLoading(false)
          }
        })
        return
      }
      startReactTransition(() => {
        if (cancelled) return
        setTitle(article.title)
        setSlug(article.slug ?? "")
        setContent(article.content)
        setPublishedLocal(isoToDatetimeLocalValue(article.published_at))
        setLoadError(null)
        setLoading(false)
      })
    })()
    return () => {
      cancelled = true
    }
  }, [eventId, articleId])

  if (!eventId || !articleId) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Invalid article or event.</AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <Card className="max-w-2xl">
        <CardHeader>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-9 w-64" />
        </CardContent>
      </Card>
    )
  }

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{loadError}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Edit article</CardTitle>
        <CardDescription>
          Update content, slug, or publishing time. Clear the publish field to
          save as a draft.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault()
            setSubmitError(null)
            const token = getAccessToken()
            if (!token) {
              setSubmitError("You must be signed in.")
              return
            }
            const titleTrim = title.trim()
            const contentTrim = content.trim()
            const slugRaw = slug.trim()
            if (!titleTrim || !contentTrim) {
              setSubmitError("Title and content are required.")
              return
            }
            const slugValue =
              slugRaw.length > 0 ? slugRaw : slugFromTitle(titleTrim)
            const published_at =
              publishedLocal.trim().length > 0
                ? new Date(publishedLocal).toISOString()
                : null
            startTransition(async () => {
              const res = await putArticle(
                eventId,
                articleId,
                {
                  title: titleTrim,
                  slug: slugValue,
                  content: contentTrim,
                  published_at,
                },
                token,
              )
              if (!res.ok) {
                setSubmitError(res.message)
                return
              }
              router.push(`/dashboard/events/${eventId}/articles`)
            })
          }}
        >
          <FieldGroup>
            {submitError ? (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}
            <Field>
              <FieldLabel htmlFor="edit-title">Title</FieldLabel>
              <Input
                id="edit-title"
                name="title"
                required
                placeholder="Article title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-slug">Slug (optional)</FieldLabel>
              <Input
                id="edit-slug"
                name="slug"
                placeholder="auto-from-title"
                className="font-mono text-sm"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <FieldDescription>
                URL-friendly id; generated from title if left blank.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-content">Content</FieldLabel>
              <textarea
                id="edit-content"
                name="content"
                required
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-32 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Write your article…"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-published_at">
                Publish at (optional)
              </FieldLabel>
              <Input
                id="edit-published_at"
                name="published_at"
                type="datetime-local"
                value={publishedLocal}
                onChange={(e) => setPublishedLocal(e.target.value)}
              />
              <FieldDescription>
                Empty = draft (not shown in the public article list until
                published).
              </FieldDescription>
            </Field>
            <Field className="flex flex-wrap gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save changes"}
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
