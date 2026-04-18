"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import {
  asArticleList,
  getEventArticlesAll,
  type ArticleRecord,
} from "@/lib/api/articles"
import { getAccessToken } from "@/lib/auth/session"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { NewspaperIcon, PencilSimpleIcon, PlusIcon } from "@phosphor-icons/react"

function formatDt(iso: string | null) {
  if (!iso) return "—"
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function contentPreview(text: string, max = 64) {
  const one = text.replace(/\s+/g, " ").trim()
  if (one.length <= max) return one
  return `${one.slice(0, max)}…`
}

export function EventArticlesList() {
  const params = useParams()
  const eventId = typeof params.eventId === "string" ? params.eventId : ""
  const [articles, setArticles] = useState<ArticleRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!eventId) return
    let cancelled = false
    const token = getAccessToken()
    ;(async () => {
      const res = await getEventArticlesAll(eventId, token ?? undefined)
      if (cancelled) return
      if (!res.ok) {
        setError(res.message)
        setArticles([])
        setLoading(false)
        return
      }
      const list = asArticleList(res.data)
      setArticles(list)
      setError(null)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [eventId])

  if (!eventId) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Invalid event.</AlertDescription>
      </Alert>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            Articles
          </h1>
          <p className="text-sm text-muted-foreground">
            All articles for this event, including drafts.
          </p>
        </div>
        {articles.length > 0 && (
          <Button asChild className="shrink-0 gap-1.5">
            <Link href={`/organisor/events/${eventId}/articles/new`}>
              <PlusIcon className="size-4" />
              Create article
            </Link>
          </Button>
        )}
      </div>

      {loading ? (
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ) : articles.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <NewspaperIcon />
            </EmptyMedia>
            <EmptyTitle>No articles yet</EmptyTitle>
            <EmptyDescription>
              Write updates, rules, or schedules for attendees.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild className="gap-1.5">
              <Link href={`/organisor/events/${eventId}/articles/new`}>
                <PlusIcon className="size-4" />
                Create article
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[10rem]">Title</TableHead>
              <TableHead className="hidden md:table-cell min-w-[12rem]">
                Preview
              </TableHead>
              <TableHead className="w-[6.5rem] whitespace-nowrap">
                Status
              </TableHead>
              <TableHead className="hidden sm:table-cell whitespace-nowrap">
                Updated
              </TableHead>
              <TableHead className="hidden lg:table-cell whitespace-nowrap">
                Published
              </TableHead>
              <TableHead className="w-[1%] text-right pr-3"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/organisor/events/${eventId}/articles/${a.id}/edit`}
                    className="text-foreground hover:text-primary hover:underline underline-offset-4"
                  >
                    {a.title}
                  </Link>
                  {a.slug ? (
                    <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {a.slug}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell className="hidden md:table-cell max-w-[18rem] text-muted-foreground">
                  {contentPreview(a.content)}
                </TableCell>
                <TableCell>
                  {a.published_at ? (
                    <Badge variant="success">Published</Badge>
                  ) : (
                    <Badge variant="warning">Draft</Badge>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground whitespace-nowrap">
                  {formatDt(a.updated_at)}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground whitespace-nowrap">
                  {formatDt(a.published_at)}
                </TableCell>
                <TableCell className="text-right pr-2">
                  <Button variant="ghost" size="sm" className="gap-1" asChild>
                    <Link
                      href={`/organisor/events/${eventId}/articles/${a.id}/edit`}
                    >
                      <PencilSimpleIcon className="size-4" />
                      Edit
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
