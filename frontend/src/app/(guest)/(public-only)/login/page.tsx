import { Suspense } from "react"
import { LoginPage } from "@/auth/login-page"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  )
}
