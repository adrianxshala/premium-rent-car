'use client'

import * as React from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Dialog } from 'radix-ui'
import { Loader2, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  createCarBlock,
  type CarBlockFormState,
} from '@/app/(site)/admin/calendar/actions'

type CarOption = { id: string; make: string; model: string; year: number }

const selectCls =
  'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]'

export function AddBlockDialog({
  open,
  onClose,
  cars,
}: {
  open: boolean
  onClose: () => void
  cars: CarOption[]
}) {
  const [state, formAction] = useActionState<CarBlockFormState, FormData>(
    createCarBlock,
    null,
  )

  // Close once the server confirms the insert.
  React.useEffect(() => {
    if (state?.ok) onClose()
  }, [state?.ok, onClose])

  const err = state?.fieldErrors

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed z-50 bg-white shadow-float ring-1 ring-black/[0.06]',
            'inset-x-0 bottom-0 rounded-t-[28px] data-[state=open]:slide-in-from-bottom',
            'sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-[28rem] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[24px] sm:data-[state=open]:zoom-in-95',
          )}
        >
          <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
            <Dialog.Title className="text-base font-semibold tracking-tight">
              Shto bllokim
            </Dialog.Title>
            <Dialog.Close
              className="text-muted-foreground hover:text-foreground hover:bg-secondary flex size-8 items-center justify-center rounded-full transition-colors"
              aria-label="Mbyll"
            >
              <X className="size-4" aria-hidden />
            </Dialog.Close>
          </div>

          <form action={formAction} className="px-5 py-5">
            {state?.error && (
              <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-500/15">
                {state.error}
              </p>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="block-car">Makina</Label>
                <select id="block-car" name="carId" className={selectCls} required>
                  {cars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.make} {c.model} {c.year}
                    </option>
                  ))}
                </select>
                {err?.carId?.[0] && (
                  <p className="text-destructive text-xs">{err.carId[0]}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="block-kind">Lloji</Label>
                <select
                  id="block-kind"
                  name="kind"
                  defaultValue="maintenance"
                  className={selectCls}
                >
                  <option value="maintenance">Mirëmbajtje</option>
                  <option value="unavailable">E padisponueshme</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="block-start">Nga data</Label>
                  <input
                    id="block-start"
                    name="startDate"
                    type="date"
                    required
                    className={selectCls}
                  />
                  {err?.startDate?.[0] && (
                    <p className="text-destructive text-xs">
                      {err.startDate[0]}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="block-end">Deri më</Label>
                  <input
                    id="block-end"
                    name="endDate"
                    type="date"
                    required
                    className={selectCls}
                  />
                  {err?.endDate?.[0] && (
                    <p className="text-destructive text-xs">{err.endDate[0]}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="block-reason">Arsyeja (opsionale)</Label>
                <Input
                  id="block-reason"
                  name="reason"
                  placeholder="P.sh. Servis vaji, aksident, pastrim…"
                  autoComplete="off"
                />
              </div>
            </div>

            <p className="text-muted-foreground mt-3 text-xs">
              Dita e fundit e liron makinën (interval gjysmë-i-hapur). Bllokimi
              nuk pranon pagesë — vetëm shënon makinën si të zënë.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <Dialog.Close className="text-muted-foreground hover:text-foreground inline-flex h-9 items-center rounded-full px-4 text-sm font-medium">
                Anulo
              </Dialog.Close>
              <Submit />
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-primary-foreground inline-flex h-9 items-center gap-1.5 rounded-full px-5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      Ruaj
    </button>
  )
}
