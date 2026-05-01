import { DashboardShell } from "@/components/dashboard-shell"
import { RequireAuthenticated } from "@/components/require-authenticated"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireAuthenticated>
      <DashboardShell>{children}</DashboardShell>
    </RequireAuthenticated>
  )
}
