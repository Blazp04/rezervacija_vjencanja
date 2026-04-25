import { useCallback } from "react"
import { toast } from "sonner"
import { useWorkspaceStore } from "./store"

export interface NavigateConfig {
  path: string
  title: string
  icon?: string
  closeable?: boolean
}

export function useWorkspaceNavigate() {
  const openTab = useWorkspaceStore((s) => s.openTab)

  return useCallback(
    (config: NavigateConfig) => {
      const id = openTab(config)
      if (id === null) {
        toast.warning("Dostignut maksimalni broj tabova (12). Zatvori neki tab prije otvaranja novog.")
      }
      return id
    },
    [openTab],
  )
}
