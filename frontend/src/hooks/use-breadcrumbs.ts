import { usePathname } from "next/navigation"
import { useTranslation } from "react-i18next"

/** Path patterns (with `:param` segments) for breadcrumb i18n keys — mirrors App Router URLs */
const BREADCRUMB_ROUTE_PATTERNS: { path: string; key: string }[] = [
  { path: "/", key: "home" },
  { path: "/organiser", key: "organiser" },
  { path: "/organiser/events", key: "events" },
  { path: "/organiser/events/create", key: "events_create" },
  { path: "/organiser/events/:id/edit", key: "events_edit" },
  { path: "/organiser/organisation/create", key: "organisation_create" },
  { path: "/organiser/organisation/:id/edit", key: "organisation_edit" },
]

function matchPath(pattern: string, pathname: string): boolean {
  const normalize = (p: string) =>
    p.endsWith("/") && p.length > 1 ? p.slice(0, -1) : p
  const p = normalize(pattern)
  const n = normalize(pathname)
  const pParts = p.split("/").filter(Boolean)
  const nParts = n.split("/").filter(Boolean)
  if (pParts.length !== nParts.length) return false
  return pParts.every((seg, i) => seg.startsWith(":") || seg === nParts[i])
}

export function useBreadcrumbs() {
  const pathname = usePathname()
  const { t } = useTranslation()

  const breadcrumbs = pathname
    .split("/")
    .filter(Boolean)
    .reduce<Array<{ label: string; path?: string }>>((acc, _part, index, parts) => {
      const path = `/${parts.slice(0, index + 1).join("/")}`

      const matchingRoute = BREADCRUMB_ROUTE_PATTERNS.find((r) =>
        matchPath(r.path, path)
      )

      if (matchingRoute) {
        acc.push({
          label: t(`breadcrumbs.${matchingRoute.key}`, matchingRoute.key),
          path: index === parts.length - 1 ? undefined : path,
        })
      } else {
        acc.push({
          label: t(`breadcrumbs.${parts[index]}`, parts[index]),
          path: index === parts.length - 1 ? undefined : path,
        })
      }

      return acc
    }, [])

  return breadcrumbs
}
