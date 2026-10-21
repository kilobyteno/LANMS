import { DashboardShell } from "@/components/dashboard-shell"
import { RequireAuthenticated } from "@/components/require-authenticated"
import { Toaster } from "@/components/ui/sonner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireAuthenticated>
      <DashboardShell>{children}</DashboardShell>
      <Toaster />
    </RequireAuthenticated>
  )
}
