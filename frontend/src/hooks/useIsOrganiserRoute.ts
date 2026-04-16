import { usePathname } from "next/navigation"

export function useIsOrganiserRoute() {
  const pathname = usePathname()
  return pathname.startsWith("/organiser")
}
