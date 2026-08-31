'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'

import { cn } from '@/lib/utils'
import { EASE_OUT } from '@/components/motion/primitives'

/* ── AuthCard ────────────────────────────────────────────────────────────── *
 * Premium liquid-glass card with the same entrance as the booking calendar /
 * mobile menu: fade + lift + scale, easeOut.
 * ────────────────────────────────────────────────────────────────────────── */

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.96, y: 20 }}
      animate={reduce ? undefined : { opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="shadow-float rounded-[28px] border border-white/60 bg-white/80 p-6 backdrop-blur-[26px] backdrop-saturate-150 sm:p-8"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1.5 text-sm text-pretty">
            {description}
          </p>
        )}
      </div>
      {children}
    </motion.div>
  )
}

/* ── AuthField ───────────────────────────────────────────────────────────── *
 * Touch-friendly input (44px) with a leading icon and a soft focus ring.
 * ────────────────────────────────────────────────────────────────────────── */

type AuthFieldProps = React.ComponentProps<'input'> & {
  label: string
  icon?: React.ReactNode
  error?: string
}

export function AuthField({
  id,
  label,
  icon,
  error,
  className,
  ...props
}: AuthFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div
        className={cn(
          'flex items-center gap-3 rounded-2xl border bg-white/70 px-3.5 transition-[color,box-shadow]',
          'focus-within:border-ring focus-within:ring-ring/40 focus-within:ring-[3px]',
          error
            ? 'border-destructive ring-destructive/20'
            : 'border-black/[0.08]',
        )}
      >
        {icon && (
          <span className="text-muted-foreground shrink-0" aria-hidden>
            {icon}
          </span>
        )}
        <input
          id={id}
          aria-invalid={Boolean(error)}
          className={cn(
            'placeholder:text-muted-foreground/60 h-11 w-full min-w-0 bg-transparent text-sm outline-none',
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  )
}
