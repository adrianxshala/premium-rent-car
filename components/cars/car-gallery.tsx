'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Car as CarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export function CarGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="bg-secondary text-muted-foreground shadow-soft flex aspect-[4/3] w-full items-center justify-center rounded-[28px] ring-1 ring-black/[0.04]">
        <CarIcon className="size-16" aria-hidden />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-secondary shadow-float relative aspect-[4/3] w-full overflow-hidden rounded-[28px] ring-1 ring-black/[0.04]">
        <Image
          src={images[active]}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2.5">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Foto ${i + 1}`}
              aria-current={i === active}
              className={cn(
                'bg-secondary relative aspect-[4/3] overflow-hidden rounded-[18px] outline-none transition-all duration-300',
                'focus-visible:ring-ring focus-visible:ring-2',
                i === active
                  ? 'ring-foreground shadow-soft ring-2'
                  : 'opacity-65 hover:opacity-100',
              )}
            >
              <Image
                src={src}
                alt={`${alt} — foto ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
