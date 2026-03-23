"use client"

import * as React from "react"
import Image from "next/image"
import { Icons } from "@/components/global/icons"
import { cn } from "@workspace/ui/lib/utils"

// ─── Message Image ──────────────────────────────────────

function MessageImage({ src, alt, square }: { src: string; alt: string; square?: boolean }) {
  const [error, setError] = React.useState(false)

  if (error) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-1 bg-muted/50 p-3", square ? "aspect-square" : "aspect-video")}>
        <Icons.alertCircle className="size-5 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">Không tải được ảnh</span>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", square ? "aspect-square" : "aspect-video")}>
      <Image src={src} alt={alt} fill className="object-cover" sizes="420px" onError={() => setError(true)} unoptimized />
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
          <MessageImage key={img.id} src={img.src} alt={img.alt} square />
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
        <MessageImage src={images[1]!.src} alt={images[1]!.alt} square />
        <MessageImage src={images[2]!.src} alt={images[2]!.alt} square />
      </div>
    )
  }

  const visible = images.slice(0, maxVisible)
  return (
    <div className="grid grid-cols-2 gap-px">
      {visible.map((img, i) => (
        <div key={img.id} className="relative">
          <MessageImage src={img.src} alt={img.alt} square />
          {i === maxVisible - 1 && overflow > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-lg font-semibold text-white">+{overflow}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
