import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { createCar } from '@/app/(site)/admin/actions'
import { CarForm } from '@/components/admin/car-form'

export default function NewCarPage() {
  return (
    <>
      <Link
        href="/admin/cars"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm font-medium"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Makinat
      </Link>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">
        Shto makinë të re
      </h1>

      <CarForm action={createCar} submitLabel="Shto makinën" />
    </>
  )
}
