import { coreFetch } from "@/lib/api/client"

export type ArticleRecord = {
  id: string
  title: string
  slug: string | null
  content: string
  published_at: string | null
  event_id: string
  created_by: unknown
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export function asArticleList(data: unknown): ArticleRecord[] {
  if (Array.isArray(data)) return data as ArticleRecord[]
  if (typeof data === "string") {
    try {
      const p = JSON.parse(data) as unknown
      return Array.isArray(p) ? (p as ArticleRecord[]) : []
    } catch {
      return []
    }
  }
  return []
}

export function getEventArticlesAll(eventId: string, token?: string | null) {
  return coreFetch<unknown>(`/events/${eventId}/articles/all`, {
    method: "GET",
    ...(token ? { token } : {}),
  })
}

export type ArticleWriteBody = {
  title: string
  slug: string | null
  content: string
  published_at: string | null
}

export function asArticleRecord(data: unknown): ArticleRecord | null {
  if (!data || typeof data !== "object") return null
  const o = data as Record<string, unknown>
  if (
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    typeof o.content === "string"
  ) {
    return data as ArticleRecord
  }
  return null
}

export function getArticle(
  eventId: string,
  articleId: string,
  token?: string | null,
) {
  return coreFetch<unknown>(`/events/${eventId}/articles/${articleId}`, {
    method: "GET",
    ...(token ? { token } : {}),
  })
}

export function postArticle(eventId: string, body: ArticleWriteBody, token: string) {
  return coreFetch<ArticleRecord>(`/events/${eventId}/articles`, {
    method: "POST",
    body,
    token,
  })
}

export function putArticle(
  eventId: string,
  articleId: string,
  body: ArticleWriteBody,
  token: string,
) {
  return coreFetch<unknown>(`/events/${eventId}/articles/${articleId}`, {
    method: "PUT",
    body,
    token,
  })
}
