import { postLogout } from "@/lib/api/auth"
import { clearTokens, getAccessToken } from "@/lib/auth/session"
import { clearEventSelections } from "@/lib/event/storage"
import { clearActiveOrganisationId } from "@/lib/organisation/storage"

/**
 * Calls the backend logout endpoint (best-effort) and clears local tokens.
 */
export async function logoutAndClear(): Promise<void> {
  const token = getAccessToken()
  if (token) {
    try {
      await postLogout(token)
    } catch {
      /* still clear local session */
    }
  }
  clearTokens()
  clearActiveOrganisationId()
  clearEventSelections()
}
