"use client"

import { Button } from "@workspace/ui/components/button"
import React, { useEffect, useState } from "react"

const LoginZaloOA = () => {
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    setError(null)
    setQrImage(null)
    setSessionId(null)
    setStatus(null)
    setDisplayName(null)

    try {
      const response = await fetch("http://localhost:8000/zalo-personal/login-qr", {
        method: "POST",
      })

      const json = await response.json()
      const session = json.data

      setQrImage(session.qrImage ?? null)
      setSessionId(session.id ?? null)
      setStatus(session.status ?? null)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Request failed")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!sessionId) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/zalo-personal/login-qr/${sessionId}`,
          { cache: "no-store" },
        )

        const json = await response.json()
        const session = json.data

        setStatus(session.status ?? null)
        setDisplayName(session.displayName ?? null)

        if (session.status === "authenticated" || session.status === "failed") {
          clearInterval(interval)
        }
      } catch (error) {
        clearInterval(interval)
        setError(error instanceof Error ? error.message : "Polling failed")
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [sessionId])

  return (
    <div className="space-y-4">
      <Button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? "Loading..." : "Login with Zalo"}
      </Button>

      {qrImage ? (
        <img src={qrImage} alt="Zalo QR" className="h-64 w-64 rounded border" />
      ) : null}

      {status ? <p>Status: {status}</p> : null}
      {displayName ? <p>Scanned by: {displayName}</p> : null}
      {error ? <p className="text-red-500">{error}</p> : null}
    </div>
  )
}

export default LoginZaloOA
