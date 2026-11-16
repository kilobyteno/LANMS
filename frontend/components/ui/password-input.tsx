"use client"

import * as React from "react"
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export type PasswordInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type"
>

function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false)

  return (
    <div className="relative w-full">
      <Input
        type={visible ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-1/2 right-0.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? <EyeSlashIcon /> : <EyeIcon />}
      </Button>
    </div>
  )
}

export { PasswordInput }
