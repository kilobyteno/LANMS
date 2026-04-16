/**
 * Rewrite a dashboard event-scoped URL to use `newEventId`.
 * Returns `null` if `pathname` is not under `/dashboard/events/[eventId]`.
 *
 * Article edit routes are sent to the new event's articles list, since article
 * IDs are not valid across events.
 */
export function dashboardPathAfterEventSwitch(
  pathname: string,
  newEventId: string,
): string | null {
  const m = pathname.match(/^\/dashboard\/events\/([^/]+)(\/.*)?$/)
  if (!m) return null
  const rest = m[2] ?? ""
  if (rest === "" || rest === "/") {
    return `/dashboard/events/${newEventId}/articles`
  }
  if (/^\/articles\/[^/]+\/edit\/?$/.test(rest)) {
    return `/dashboard/events/${newEventId}/articles`
  }
  return `/dashboard/events/${newEventId}${rest}`
}
