import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ reset_token?: string }>
}) {
  const sp = await searchParams
  return <ResetPasswordForm resetToken={sp.reset_token ?? null} />
}
