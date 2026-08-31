'use client'

import * as React from 'react'
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  type Transition,
  type Variants,
} from 'motion/react'

import { cn } from '@/lib/utils'

/* ── Motion language ───────────────────────────────────────────────────────
 * A small, shared vocabulary so every animation on the page feels like one
 * product. Calm, decelerating, almost-imperceptible. Less movement = more
 * premium. Everything here respects prefers-reduced-motion.
 * ────────────────────────────────────────────────────────────────────────── */

/** Premium decelerating ease — entrances settle softly, never bounce. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const

/** Gentle settle for reveals / card lifts (the spec's recommended spring). */
export const springGentle: Transition = {
  type: 'spring',
  stiffness: 120,
  damping: 20,
}

/** Snappier settle for tap/press micro-interactions — feels native. */
export const springTap: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 28,
}

/* ── PageReveal ────────────────────────────────────────────────────────────
 * The whole page eases in on load: fade + a small upward drift. Subtle enough
 * to read as "polished", not "animated".
 * ────────────────────────────────────────────────────────────────────────── */

export function PageReveal({
  children,
  className,
  ...props
}: React.ComponentProps<typeof motion.div>) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_OUT }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/* ── Reveal ────────────────────────────────────────────────────────────────
 * Scroll-reveal for a section as a single unit: opacity 0 → 1, y 30 → 0.
 * Fires once when it enters the viewport.
 * ────────────────────────────────────────────────────────────────────────── */

type RevealProps = React.ComponentProps<typeof motion.div> & {
  y?: number
  delay?: number
  duration?: number
  amount?: number
}

export function Reveal({
  children,
  className,
  y = 30,
  delay = 0,
  duration = 0.6,
  amount = 0.2,
  ...props
}: RevealProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, ease: EASE_OUT, delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/* ── Stagger group / item ──────────────────────────────────────────────────
 * A grid (or list) whose children reveal one after another as the group
 * enters view. Items can optionally lift on hover with a soft spring.
 * ────────────────────────────────────────────────────────────────────────── */

type StaggerGroupProps = React.ComponentProps<typeof motion.div> & {
  stagger?: number
  delayChildren?: number
  amount?: number
  /**
   * Trigger when the group scrolls into view (default). Set `false` to play
   * once on mount instead — use this for a tall primary list (e.g. a 1-column
   * mobile grid), where the in-view threshold may never be met and would leave
   * the items stuck hidden.
   */
  inView?: boolean
}

export function StaggerGroup({
  children,
  className,
  stagger = 0.1,
  delayChildren = 0,
  amount = 0.2,
  inView = true,
  ...props
}: StaggerGroupProps) {
  const reduce = useReducedMotion()
  // In-view: reveal on scroll. On-mount: reveal immediately — guaranteed to
  // end visible regardless of viewport size or scroll position.
  const trigger = inView
    ? {
        whileInView: reduce ? undefined : ('show' as const),
        viewport: { once: true, amount },
      }
    : { animate: reduce ? undefined : ('show' as const) }
  return (
    <motion.div
      className={className}
      initial={reduce ? false : 'hidden'}
      {...trigger}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
}

type StaggerItemProps = React.ComponentProps<typeof motion.div> & {
  /** Hover translateY in px (negative lifts up). Omit for no hover motion. */
  lift?: number
  /** Hover scale. Omit for none. */
  liftScale?: number
}

export function StaggerItem({
  children,
  className,
  lift,
  liftScale,
  ...props
}: StaggerItemProps) {
  const reduce = useReducedMotion()
  const canHover = !reduce && (lift !== undefined || liftScale !== undefined)

  return (
    <motion.div
      className={className}
      variants={reduce ? undefined : itemVariants}
      whileHover={
        canHover ? { y: lift ?? 0, scale: liftScale ?? 1 } : undefined
      }
      transition={springGentle}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/* ── Tappable ──────────────────────────────────────────────────────────────
 * Native-feeling press micro-interaction for buttons / links: scale up a hair
 * on hover, press in on tap. Wraps its child without changing layout.
 * ────────────────────────────────────────────────────────────────────────── */

export function Tappable({
  children,
  className,
  ...props
}: React.ComponentProps<typeof motion.div>) {
  const reduce = useReducedMotion()
  if (reduce)
    return (
      <div className={cn('inline-flex', className)}>
        {children as React.ReactNode}
      </div>
    )
  return (
    <motion.div
      className={cn('inline-flex', className)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={springTap}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/* ── FloatCard ─────────────────────────────────────────────────────────────
 * An almost-imperceptible vertical float (0 → -6 → 0) on a long, slow loop.
 * Keep it on an element that is NOT also running an entrance transform.
 * ────────────────────────────────────────────────────────────────────────── */

export function FloatCard({
  children,
  className,
  ...props
}: React.ComponentProps<typeof motion.div>) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      animate={reduce ? undefined : { y: [0, -6, 0] }}
      transition={
        reduce
          ? undefined
          : { duration: 5, ease: 'easeInOut', repeat: Infinity }
      }
      {...props}
    >
      {children}
    </motion.div>
  )
}

/* ── CountUp ───────────────────────────────────────────────────────────────
 * Counts from 0 → value once, the first time it scrolls into view.
 * ────────────────────────────────────────────────────────────────────────── */

type CountUpProps = {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

export function CountUp({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1.4,
  className,
}: CountUpProps) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const mv = useMotionValue(0)

  const fmt = React.useCallback(
    (v: number) => `${prefix}${v.toFixed(decimals)}${suffix}`,
    [prefix, decimals, suffix],
  )

  React.useEffect(() => {
    if (reduce) {
      if (ref.current) ref.current.textContent = fmt(value)
      return
    }
    if (!inView) return
    const controls = animate(mv, value, { duration, ease: EASE_OUT })
    const unsub = mv.on('change', (v) => {
      if (ref.current) ref.current.textContent = fmt(v)
    })
    return () => {
      controls.stop()
      unsub()
    }
  }, [inView, value, duration, reduce, mv, fmt])

  // Render formatted 0 initially; the subscription drives it to `value`.
  return (
    <span ref={ref} className={className}>
      {fmt(reduce ? value : 0)}
    </span>
  )
}
