/** Two-letter initials for avatar fallback. */
export function userInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return "?"
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    const a = parts[0][0]
    const b = parts[parts.length - 1][0]
    return `${a}${b}`.toUpperCase()
  }
  if (trimmed.length >= 2) return trimmed.slice(0, 2).toUpperCase()
  return trimmed.toUpperCase()
}
