import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { updateCar } from '@/app/(site)/admin/actions'
import { createClient } from '@/lib/supabase/server'
import { CarForm } from '@/components/admin/car-form'
import { CarDangerZone } from '@/components/admin/car-danger-zone'

export default async function EditCarPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: car } = await supabase
    .from('cars')
    .select('*')
    .eq('id', id)
    .single()

  if (!car) notFound()

  // Bind the car id so the form action keeps its (state, formData) shape.
  const action = updateCar.bind(null, id)

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
        {car.make} {car.model}
      </h1>

      <CarForm action={action} car={car} submitLabel="Ruaj ndryshimet" />

      <CarDangerZone carId={car.id} retired={car.status === 'retired'} />
    </>
  )
}
