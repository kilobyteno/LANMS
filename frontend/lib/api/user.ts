import { coreFetch } from "@/lib/api/client"
import type { UserResponse } from "@/lib/api/auth"

export function getCurrentUser(token: string) {
  return coreFetch<UserResponse>("/user/me", { method: "GET", token })
}
