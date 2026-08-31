import type { CalendarStatus, EventPhase } from '@/lib/calendar/types'

/** Albanian label for a timeline event phase. */
export const PHASE_LABELS: Record<EventPhase, string> = {
  pending: 'Në pritje',
  reserved: 'Rezervuar',
  rented: 'Në qira',
  completed: 'Përfunduar',
  maintenance: 'Mirëmbajtje',
  unavailable: 'E padisponueshme',
}

/**
 * Bar appearance per phase — soft, Apple-style semantic pastels: a very light
 * tinted fill, deeper text, and a hairline inset ring. No saturated fills, no
 * gradients, no hatching; blocks are distinguished by an icon, not noise.
 */
export const PHASE_BAR: Record<EventPhase, string> = {
  pending: 'bg-amber-50 text-amber-800 ring-amber-500/15',
  reserved: 'bg-blue-50 text-blue-800 ring-blue-500/15',
  rented: 'bg-emerald-50 text-emerald-800 ring-emerald-500/15',
  completed: 'bg-slate-50 text-slate-500 ring-slate-400/15',
  maintenance: 'bg-orange-50 text-orange-800 ring-orange-500/20',
  unavailable: 'bg-red-50 text-red-800 ring-red-500/15',
}

/** Solid dot color per phase (tooltip + drawer status pip). */
export const PHASE_DOT: Record<EventPhase, string> = {
  pending: 'bg-amber-500',
  reserved: 'bg-blue-500',
  rented: 'bg-emerald-500',
  completed: 'bg-slate-400',
  maintenance: 'bg-orange-500',
  unavailable: 'bg-red-500',
}

/** Legend / filter metadata for derived availability states. */
export const STATUS_META: Record<
  CalendarStatus,
  { label: string; dot: string }
> = {
  available: { label: 'E lirë', dot: 'bg-emerald-500' },
  reserved: { label: 'Rezervuar', dot: 'bg-blue-500' },
  rented: { label: 'Në qira', dot: 'bg-emerald-600' },
  maintenance: { label: 'Mirëmbajtje', dot: 'bg-orange-500' },
  unavailable: { label: 'E padisponueshme', dot: 'bg-red-500' },
}

/** Order for legend + status filter chips. */
export const STATUS_ORDER: CalendarStatus[] = [
  'available',
  'reserved',
  'rented',
  'maintenance',
  'unavailable',
]
