import Link from "next/link"
import { RowsIcon } from "@phosphor-icons/react"

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <RowsIcon className="size-4" weight="bold" />
          </div>
          LANMS
        </Link>
        {children}
      </div>
    </div>
  )
}
