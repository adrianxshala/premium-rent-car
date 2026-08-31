'use client'

import * as React from 'react'
import { ImagePlus, Loader2, Plus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

/**
 * Controlled photo manager. Uploads files to the `car-images` bucket via
 * /api/admin/upload and also accepts pasted URLs as a fallback. The parent
 * serializes `value` into a hidden field for the car form action.
 */
export function ImageUploader({
  value,
  onChange,
}: {
  value: string[]
  onChange: (urls: string[]) => void
}) {
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [url, setUrl] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  async function uploadFiles(files: FileList) {
    setError(null)
    setBusy(true)
    const next = [...value]
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: fd,
        })
        const json = await res.json()
        if (!res.ok) {
          setError(json.error ?? 'Ngarkimi dështoi.')
          break
        }
        next.push(json.url)
      }
      onChange(next)
    } catch {
      setError('Ngarkimi dështoi. Provo sërish.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function addUrl() {
    const trimmed = url.trim()
    if (!trimmed) return
    onChange([...value, trimmed])
    setUrl('')
  }

  function removeAt(i: number) {
    onChange(value.filter((_, idx) => idx !== i))
  }

  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {value.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="bg-secondary group relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-black/[0.06]"
            >
              {/* next/image needs known hosts; plain img is safe for any URL. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Foto ${i + 1}`}
                className="size-full object-cover"
              />
              {i === 0 && (
                <span className="glass absolute top-2 left-2 rounded-full px-2 py-0.5 text-[11px] font-medium">
                  Kryesore
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Hiq foton"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <ImagePlus className="size-4" aria-hidden />
          )}
          {busy ? 'Duke ngarkuar…' : 'Ngarko foto'}
        </Button>

        <div className="flex flex-1 items-center gap-2">
          <Input
            type="url"
            placeholder="ose ngjit një URL foto…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addUrl()
              }
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={addUrl}
            aria-label="Shto URL"
          >
            <Plus className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
      <p className="text-muted-foreground text-xs">
        Foto e parë përdoret si kryesore. JPG/PNG/WebP, deri 5 MB.
      </p>
    </div>
  )
}
