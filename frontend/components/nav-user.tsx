"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  startTransition as startReactTransition,
  useEffect,
  useState,
  useTransition,
} from "react"
import { getCurrentUser } from "@/lib/api/user"
import { logoutAndClear } from "@/lib/auth/logout-action"
import { clearTokens, getAccessToken } from "@/lib/auth/session"
import { userInitials } from "@/lib/user-display"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { CaretUpDownIcon, SparkleIcon, CheckCircleIcon, CreditCardIcon, BellIcon, SignOutIcon } from "@phosphor-icons/react"

export function NavUser() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [logoutPending, startLogout] = useTransition()
  const [user, setUser] = useState<{
    name: string
    email: string
    avatar: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const token = getAccessToken()
    if (!token) {
      startReactTransition(() => {
        if (cancelled) return
        setUser({
          name: "Guest",
          email: "Not signed in",
          avatar: null,
        })
        setLoading(false)
      })
      return () => {
        cancelled = true
      }
    }
    ;(async () => {
      const res = await getCurrentUser(token)
      if (cancelled) return
      if (!res.ok || !res.data) {
        if (res.status === 401) {
          startReactTransition(() => {
            clearTokens()
            router.replace("/auth/login")
          })
          return
        }
        startReactTransition(() => {
          if (cancelled) return
          setUser({
            name: "Guest",
            email: res.message || "Could not load profile",
            avatar: null,
          })
          setLoading(false)
        })
        return
      }
      const u = res.data
      const displayName =
        u.name?.trim() ||
        (u.email && u.email.includes("@") ? u.email.split("@")[0] : null) ||
        "User"
      startReactTransition(() => {
        if (cancelled) return
        setUser({
          name: displayName,
          email: u.email ?? "",
          avatar: u.photo_url,
        })
        setLoading(false)
      })
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  if (loading || !user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled className="pointer-events-none">
            <Skeleton className="size-8 rounded-lg" />
            <div className="grid flex-1 gap-1.5 text-left">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const fallback = userInitials(user.name)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : null}
                <AvatarFallback className="rounded-lg">{fallback}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <CaretUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="rounded-lg">{fallback}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <SparkleIcon
                />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href="/auth/change-password"
                  className="cursor-pointer"
                >
                  <CheckCircleIcon />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon
                />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon
                />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={logoutPending}
              onSelect={() => {
                startLogout(async () => {
                  await logoutAndClear()
                  router.push("/auth/login")
                })
              }}
            >
              <SignOutIcon
              />
              {logoutPending ? "Signing out…" : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
