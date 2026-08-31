'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Lock, Mail, User } from 'lucide-react'

import { register, type AuthState } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { AuthCard, AuthField } from '@/components/auth/auth-ui'

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    register,
    null,
  )

  if (state?.message) {
    return (
      <AuthCard title="Konfirmo email-in" description={state.message}>
        <Link
          href="/login"
          className="text-foreground text-sm font-medium underline-offset-4 hover:underline"
        >
          ← Kthehu te hyrja
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Krijo llogari"
      description="Regjistrohu për të rezervuar makinën tënde."
    >
      <form action={action} className="flex flex-col gap-4">
        <AuthField
          id="fullName"
          name="fullName"
          label="Emri i plotë"
          autoComplete="name"
          placeholder="Emri Mbiemri"
          icon={<User className="size-4" />}
          required
          error={state?.fieldErrors?.fullName?.[0]}
        />

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
          autoComplete="new-password"
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
          {pending ? 'Duke regjistruar…' : 'Regjistrohu'}
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          Ke llogari?{' '}
          <Link
            href="/login"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Hyr
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}
