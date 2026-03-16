import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/auth-store"

export function useStoreHydration() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const unsubHydrate = useAuthStore.persist.onHydrate(() => setHydrated(false))
    const unsubFinishHydration = useAuthStore.persist.onFinishHydration(() => setHydrated(true))
    setHydrated(useAuthStore.persist.hasHydrated())

    return () => {
      unsubHydrate()
      unsubFinishHydration()
    }
  }, [])

  return hydrated
}
