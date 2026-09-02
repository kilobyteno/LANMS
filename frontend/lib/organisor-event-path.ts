/**
 * Rewrite an organisor event-scoped URL to use `newEventId`.
 * Returns `null` if `pathname` is not under `/organisor/events/[eventId]`.
 *
 * Article edit routes are sent to the new event's articles list, since article
 * IDs are not valid across events.
 */
export function organisorPathAfterEventSwitch(
  pathname: string,
  newEventId: string,
): string | null {
  const m = pathname.match(/^\/organisor\/events\/([^/]+)(\/.*)?$/)
  if (!m) return null
  const rest = m[2] ?? ""
  if (rest === "" || rest === "/") {
    return `/organisor/events/${newEventId}/articles`
  }
  if (/^\/articles\/[^/]+\/edit\/?$/.test(rest)) {
    return `/organisor/events/${newEventId}/articles`
  }
  return `/organisor/events/${newEventId}${rest}`
}
