import { LoginForm } from './login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect } = await searchParams
  // Empty when no explicit target → the login action picks role-based
  // (admins → /admin, everyone else → /dashboard).
  return <LoginForm redirectTo={redirect ?? ''} />
}
