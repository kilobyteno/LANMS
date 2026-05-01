"use client"

import Link from "next/link"
import { GameControllerIcon } from "@phosphor-icons/react"

export function AuthBrand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 self-center font-medium"
    >
      <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <GameControllerIcon className="size-4" />
      </div>
      LANMS
    </Link>
  )
}
