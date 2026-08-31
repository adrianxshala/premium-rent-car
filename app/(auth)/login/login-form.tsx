'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Lock, Mail } from 'lucide-react'

import { login, type AuthState } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { AuthCard, AuthField } from '@/components/auth/auth-ui'

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    login,
    null,
  )

  return (
    <AuthCard
      title="Hyr në llogari"
      description="Vendos email-in dhe fjalëkalimin për të vazhduar."
    >
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="redirect" value={redirectTo} />

        <AuthField
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          placeholder="ti@shembull.com"
          icon={<Mail className="size-4" />}
          required
          error={state?.fieldErrors?.email?.[0]}
        />

        <AuthField
          id="password"
          name="password"
          type="password"
          label="Fjalëkalimi"
          autoComplete="current-password"
          placeholder="••••••••"
          icon={<Lock className="size-4" />}
          required
          error={state?.fieldErrors?.password?.[0]}
        />

        {state?.error && (
          <p className="bg-destructive/5 text-destructive rounded-xl px-3.5 py-2.5 text-sm">
            {state.error}
          </p>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="mt-2 h-11 w-full rounded-2xl text-base"
        >
          {pending ? 'Duke hyrë…' : 'Hyr'}
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          Nuk ke llogari?{' '}
          <Link
            href="/register"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Regjistrohu
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}
