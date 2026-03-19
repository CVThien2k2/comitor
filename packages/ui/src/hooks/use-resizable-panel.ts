"use client"

import * as React from "react"

interface UseResizablePanelOptions {
  storageKey: string
  minWidth: number
  defaultWidth: number
  maxWidth: number
}

export function useResizablePanel({
  storageKey,
  minWidth,
  defaultWidth,
  maxWidth,
}: UseResizablePanelOptions) {
  const [width, setWidth] = React.useState(defaultWidth)
  const [isResizing, setIsResizing] = React.useState(false)
  const widthRef = React.useRef(defaultWidth)

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = Number(stored)
        if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
          setWidth(parsed)
          widthRef.current = parsed
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [storageKey, minWidth, maxWidth])

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsResizing(true)

      const startX = e.clientX
      const startWidth = widthRef.current

      const onMouseMove = (e: MouseEvent) => {
        const delta = e.clientX - startX
        const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + delta))
        widthRef.current = newWidth
        setWidth(newWidth)
      }

      const onMouseUp = () => {
        setIsResizing(false)
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)
        document.body.style.cursor = ""
        document.body.style.userSelect = ""

        try {
          localStorage.setItem(storageKey, String(widthRef.current))
        } catch {
          // Ignore
        }
      }

      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    },
    [minWidth, maxWidth, storageKey]
  )

  return { width, isResizing, handleMouseDown }
}