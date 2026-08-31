'use client'

import * as React from 'react'
import Link from 'next/link'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

import type { CarFormState } from '@/app/(site)/admin/actions'
import type { Car } from '@/types/database'
import {
  CATEGORY_LABELS,
  FUEL_LABELS,
  STATUS_LABELS,
  TRANSMISSION_LABELS,
} from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUploader } from '@/components/admin/image-uploader'

type Action = (
  state: CarFormState,
  formData: FormData,
) => Promise<CarFormState> | CarFormState

export function CarForm({
  action,
  car,
  submitLabel,
}: {
  action: Action
  car?: Car
  submitLabel: string
}) {
  const [state, formAction] = useActionState<CarFormState, FormData>(
    action,
    null,
  )
  const [images, setImages] = React.useState<string[]>(car?.image_urls ?? [])
  const fieldErr = state?.fieldErrors

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state?.error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-500/15">
          {state.error}
        </p>
      )}

      <section className="panel p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight">Detajet</h2>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Marka" name="make" error={fieldErr?.make}>
            <Input name="make" defaultValue={car?.make} required />
          </Field>
          <Field label="Modeli" name="model" error={fieldErr?.model}>
            <Input name="model" defaultValue={car?.model} required />
          </Field>
          <Field label="Viti" name="year" error={fieldErr?.year}>
            <Input
              name="year"
              type="number"
              min={1980}
              max={2100}
              defaultValue={car?.year ?? new Date().getFullYear()}
              required
            />
          </Field>
          <Field label="Kategoria" name="category" error={fieldErr?.category}>
            <Select name="category" defaultValue={car?.category ?? 'suv'}>
              {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Transmisioni"
            name="transmission"
            error={fieldErr?.transmission}
          >
            <Select
              name="transmission"
              defaultValue={car?.transmission ?? 'automatic'}
            >
              {Object.entries(TRANSMISSION_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Karburanti" name="fuel_type" error={fieldErr?.fuel_type}>
            <Select name="fuel_type" defaultValue={car?.fuel_type ?? 'petrol'}>
              {Object.entries(FUEL_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="mt-5">
          <Field
            label="Përshkrimi"
            name="description"
            error={fieldErr?.description}
          >
            <textarea
              name="description"
              rows={3}
              defaultValue={car?.description ?? ''}
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
            />
          </Field>
        </div>
      </section>

      <section className="panel p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight">
          Çmimi & disponueshmëria
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            label="Çmimi / ditë (€)"
            name="price_per_day"
            error={fieldErr?.price_per_day}
          >
            <Input
              name="price_per_day"
              type="number"
              min={0}
              step="0.01"
              defaultValue={car?.price_per_day}
              required
            />
          </Field>
          <Field label="Statusi" name="status" error={fieldErr?.status}>
            <Select name="status" defaultValue={car?.status ?? 'available'}>
              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </section>

      <section className="panel p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight">Fotot</h2>
        <div className="mt-5">
          <ImageUploader value={images} onChange={setImages} />
        </div>
        <input type="hidden" name="imageUrls" value={JSON.stringify(images)} />
      </section>

      <div className="flex items-center justify-end gap-2">
        <Button asChild variant="ghost" className="rounded-full">
          <Link href="/admin/cars">Anulo</Link>
        </Button>
        <Submit label={submitLabel} />
      </div>
    </form>
  )
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="rounded-full" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {label}
    </Button>
  )
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string
  name: string
  error?: string[]
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error?.[0] && <p className="text-destructive text-xs">{error[0]}</p>}
    </div>
  )
}

function Select({
  className,
  ...props
}: React.ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]',
        className,
      )}
      {...props}
    />
  )
}
