"use client"

import { useRouter } from "next/navigation"
import {
  startTransition as startReactTransition,
  useEffect,
  useState,
} from "react"
import { getAccessToken } from "@/lib/auth/session"

export function RequireAuthenticated({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      router.replace("/auth/login")
      return
    }
    startReactTransition(() => {
      setAuthorized(true)
    })
  }, [router])

  if (!authorized) {
    return null
  }

  return <>{children}</>
}
