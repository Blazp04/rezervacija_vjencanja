import { createContext, useContext, useCallback } from "react"
import { useWorkspaceStore } from "./store"

interface TabContextValue {
  tabId: string
  panel: "A" | "B"
}

export const TabContext = createContext<TabContextValue | null>(null)

export function useWorkspaceTab() {
  const ctx = useContext(TabContext)
  const setTabDirty = useWorkspaceStore((s) => s.setTabDirty)
  const renameTab = useWorkspaceStore((s) => s.renameTab)
  const closeTab = useWorkspaceStore((s) => s.closeTab)

  const setDirty = useCallback(
    (dirty: boolean) => {
      if (ctx) setTabDirty(ctx.tabId, dirty)
    },
    [ctx, setTabDirty],
  )

  const rename = useCallback(
    (title: string) => {
      if (ctx) renameTab(ctx.tabId, title)
    },
    [ctx, renameTab],
  )

  const close = useCallback(() => {
    if (ctx) closeTab(ctx.tabId)
  }, [ctx, closeTab])

  return {
    tabId: ctx?.tabId ?? null,
    panel: ctx?.panel ?? null,
    setDirty,
    rename,
    close,
  }
}
