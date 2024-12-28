import { cn } from "@/lib/utils";
import { CircleNotch } from "@phosphor-icons/react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-10 h-10"
  };

  return (
    <CircleNotch
      className={cn(
        "animate-spin",
        sizeClasses[size],
        className
      )}
    />
  );
} 