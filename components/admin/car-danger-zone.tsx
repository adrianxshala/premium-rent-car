'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Archive, Loader2, Trash2 } from 'lucide-react'

import { deleteCar, retireCar } from '@/app/(site)/admin/actions'
import { Button } from '@/components/ui/button'

export function CarDangerZone({
  carId,
  retired,
}: {
  carId: string
  retired: boolean
}) {
  const router = useRouter()
  const [pending, start] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  function onRetire() {
    if (!confirm('Ta tërheqësh këtë makinë nga flota? Nuk do shfaqet më te klientët.'))
      return
    start(async () => {
      await retireCar(carId)
      router.push('/admin/cars')
    })
  }

  function onDelete() {
    if (
      !confirm(
        'Ta fshish përgjithmonë? Kjo s’kthehet. Funksionon vetëm nëse makina s’ka rezervime.',
      )
    )
      return
    start(async () => {
      const res = await deleteCar(carId)
      if (res?.error) {
        setError(res.error)
        return
      }
      router.push('/admin/cars')
    })
  }

  return (
    <section className="mt-6 rounded-[24px] bg-white p-6 ring-1 ring-red-500/15 sm:p-8">
      <h2 className="text-lg font-semibold tracking-tight text-red-700">
        Zona e rrezikut
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Tërhiqe makinën kur e shet (ruan historikun e rezervimeve), ose fshije
        përgjithmonë nëse s’është përdorur kurrë.
      </p>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        {!retired && (
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={pending}
            onClick={onRetire}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Archive className="size-4" aria-hidden />
            )}
            Tërhiq nga flota
          </Button>
        )}
        <Button
          type="button"
          variant="destructive"
          className="rounded-full"
          disabled={pending}
          onClick={onDelete}
        >
          <Trash2 className="size-4" aria-hidden />
          Fshi përgjithmonë
        </Button>
      </div>
    </section>
  )
}
