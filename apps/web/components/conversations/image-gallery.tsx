"use client"

import * as React from "react"
import { Icons } from "@/components/global/icons"

// ─── Message Image ──────────────────────────────────────

function MessageImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = React.useState(false)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 bg-muted/50 p-3 aspect-square">
        <Icons.alertCircle className="size-5 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">Không tải được ảnh</span>
      </div>
    )
  }

  return (
    <div className="aspect-square overflow-hidden">
      <img
        src={src}
        alt={alt}
        className="size-full object-cover"
        loading="lazy"
        onError={() => setError(true)}
      />
    </div>
  )
}

// ─── Image Gallery ──────────────────────────────────────

export function ImageGallery({ images }: { images: { id: string; src: string; alt: string }[] }) {
  const count = images.length
  const maxVisible = 4
  const overflow = count - maxVisible

  if (count === 1) {
    return <MessageImage src={images[0]!.src} alt={images[0]!.alt} />
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-px">
        {images.map((img) => (
          <MessageImage key={img.id} src={img.src} alt={img.alt} />
        ))}
      </div>
    )
  }

  if (count === 3) {
    return (
      <div className="grid grid-cols-2 gap-px">
        <div className="col-span-2">
          <MessageImage src={images[0]!.src} alt={images[0]!.alt} />
        </div>
        <MessageImage src={images[1]!.src} alt={images[1]!.alt} />
        <MessageImage src={images[2]!.src} alt={images[2]!.alt} />
      </div>
    )
  }

  const visible = images.slice(0, maxVisible)
  return (
    <div className="grid grid-cols-2 gap-px">
      {visible.map((img, i) => (
        <div key={img.id} className="relative">
          <MessageImage src={img.src} alt={img.alt} />
          {i === maxVisible - 1 && overflow > 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-lg font-semibold">+{overflow}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
