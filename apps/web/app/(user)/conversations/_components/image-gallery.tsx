"use client"

import * as React from "react"
import { Icons } from "@/components/global/icons"
import { cn } from "@workspace/ui/lib/utils"

// ─── Message Image ──────────────────────────────────────

function MessageImage({ src, alt, square }: { src: string; alt: string; square?: boolean }) {
  const [error, setError] = React.useState(false)
  const frameClass = square ? "h-[150px] w-full sm:h-[170px]" : "h-[220px] w-full sm:h-[260px]"

  if (error) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-1 bg-muted/50 p-3", frameClass)}>
        <Icons.alertCircle className="size-5 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">Không tải được ảnh</span>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", frameClass)}>
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
      />
    </div>
  )
}

// ─── Image Gallery ──────────────────────────────────────

export function ImageGallery({ images }: { images: { id: string; src: string; alt: string }[] }) {
  const count = images.length
  if (count <= 0) return null

  if (count === 1) {
    return <MessageImage src={images[0]!.src} alt={images[0]!.alt} />
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-1">
        {images.map((img) => (
          <div key={img.id} className="relative">
            <MessageImage src={img.src} alt={img.alt} square />
          </div>
        ))}
      </div>
    )
  }

  const topRowCount = Math.min(5, Math.floor(count / 2))
  const bottomRowCount = Math.min(5, count - topRowCount)
  const topRow = images.slice(0, topRowCount)
  const bottomRow = images.slice(topRowCount, topRowCount + bottomRowCount)
  const overflow = images.slice(topRowCount + bottomRowCount)

  const topColsClass =
    topRowCount <= 1
      ? "grid-cols-1"
      : topRowCount === 2
        ? "grid-cols-2"
        : topRowCount === 3
          ? "grid-cols-3"
          : topRowCount === 4
            ? "grid-cols-4"
            : "grid-cols-5"
  const bottomColsClass =
    bottomRowCount <= 1
      ? "grid-cols-1"
      : bottomRowCount === 2
        ? "grid-cols-2"
        : bottomRowCount === 3
          ? "grid-cols-3"
          : bottomRowCount === 4
            ? "grid-cols-4"
            : "grid-cols-5"

  return (
    <div className="grid gap-1">
      {topRow.length > 0 && (
        <div className={cn("grid gap-1", topColsClass)}>
          {topRow.map((img) => (
            <div key={img.id} className="relative">
              <MessageImage src={img.src} alt={img.alt} square={topRowCount > 2} />
            </div>
          ))}
        </div>
      )}

      {bottomRow.length > 0 && (
        <div className={cn("grid gap-1", bottomColsClass)}>
          {bottomRow.map((img) => (
            <div key={img.id} className="relative">
              <MessageImage src={img.src} alt={img.alt} square />
            </div>
          ))}
        </div>
      )}

      {overflow.length > 0 && (
        <div className="grid grid-cols-5 gap-1">
          {overflow.map((img) => (
            <div key={img.id} className="relative">
              <MessageImage src={img.src} alt={img.alt} square />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
