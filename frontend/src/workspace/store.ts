import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { nanoid } from "nanoid"

export interface Tab {
  id: string
  title: string
  path: string
  icon?: string
  isDirty: boolean
  closeable: boolean
  openedAt: number
}

export type PanelId = "A" | "B"
export type SplitDirection = "horizontal" | "vertical"

export const MAX_TABS = 12

interface WorkspaceState {
  tabs: Tab[]
  panelATabs: string[]
  panelAActiveId: string | null
  panelBTabs: string[]
  panelBActiveId: string | null
  splitEnabled: boolean
  splitDirection: SplitDirection
  splitRatio: number
  focusedPanel: PanelId
  // pending dirty close request — consumed by ConfirmCloseDialog
  pendingDirtyClose: string | null
}

export interface OpenTabConfig {
  title: string
  path: string
  icon?: string
  closeable?: boolean
}

interface WorkspaceActions {
  openTab: (config: OpenTabConfig) => string | null
  closeTab: (id: string) => void
  closeTabForced: (id: string) => void
  closeOtherTabs: (id: string, panel: PanelId) => void
  closeAllTabs: (panel: PanelId) => void
  setActiveTab: (id: string, panel?: PanelId) => void
  setFocusedPanel: (panel: PanelId) => void
  moveTabToPanel: (tabId: string, targetPanel: PanelId) => void
  reorderTabs: (panel: PanelId, fromIndex: number, toIndex: number) => void
  renameTab: (id: string, title: string) => void
  setTabDirty: (id: string, dirty: boolean) => void
  enableSplit: (direction: SplitDirection) => void
  disableSplit: () => void
  setSplitRatio: (ratio: number) => void
  swapPanels: () => void
  clearPendingDirtyClose: () => void
  validate: () => void
}

export type WorkspaceStore = WorkspaceState & WorkspaceActions

const initialState: WorkspaceState = {
  tabs: [],
  panelATabs: [],
  panelAActiveId: null,
  panelBTabs: [],
  panelBActiveId: null,
  splitEnabled: false,
  splitDirection: "horizontal",
  splitRatio: 0.5,
  focusedPanel: "A",
  pendingDirtyClose: null,
}

function panelKey(panel: PanelId): "panelATabs" | "panelBTabs" {
  return panel === "A" ? "panelATabs" : "panelBTabs"
}
function activeKey(panel: PanelId): "panelAActiveId" | "panelBActiveId" {
  return panel === "A" ? "panelAActiveId" : "panelBActiveId"
}

function findPanelOfTab(state: WorkspaceState, tabId: string): PanelId | null {
  if (state.panelATabs.includes(tabId)) return "A"
  if (state.panelBTabs.includes(tabId)) return "B"
  return null
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      openTab: (config) => {
        const state = get()
        const panel = state.focusedPanel
        const pTabsKey = panelKey(panel)
        const aIdKey = activeKey(panel)
        const tabsInPanel = state[pTabsKey]

        // duplicate in same panel
        const existingSamePanel = tabsInPanel
          .map((id) => state.tabs.find((t) => t.id === id))
          .find((t) => t && t.path === config.path)
        if (existingSamePanel) {
          set({ [aIdKey]: existingSamePanel.id } as Partial<WorkspaceState>)
          return existingSamePanel.id
        }

        // limit
        if (state.tabs.length >= MAX_TABS) {
          return null
        }

        const id = nanoid(8)
        const newTab: Tab = {
          id,
          title: config.title.slice(0, 32),
          path: config.path,
          icon: config.icon,
          isDirty: false,
          closeable: config.closeable ?? true,
          openedAt: Date.now(),
        }
        set({
          tabs: [...state.tabs, newTab],
          [pTabsKey]: [...tabsInPanel, id],
          [aIdKey]: id,
        } as Partial<WorkspaceState>)
        return id
      },

      closeTab: (id) => {
        const state = get()
        const tab = state.tabs.find((t) => t.id === id)
        if (!tab) return
        if (!tab.closeable) return
        if (tab.isDirty) {
          set({ pendingDirtyClose: id })
          return
        }
        get().closeTabForced(id)
      },

      closeTabForced: (id) => {
        const state = get()
        const tab = state.tabs.find((t) => t.id === id)
        if (!tab) return
        const panel = findPanelOfTab(state, id)
        const newTabs = state.tabs.filter((t) => t.id !== id)
        const newPanelA = state.panelATabs.filter((t) => t !== id)
        const newPanelB = state.panelBTabs.filter((t) => t !== id)
        const patch: Partial<WorkspaceState> = {
          tabs: newTabs,
          panelATabs: newPanelA,
          panelBTabs: newPanelB,
          pendingDirtyClose: state.pendingDirtyClose === id ? null : state.pendingDirtyClose,
        }
        if (panel) {
          const aIdKey = activeKey(panel)
          if (state[aIdKey] === id) {
            const remaining = (panel === "A" ? newPanelA : newPanelB)
              .map((tid) => newTabs.find((t) => t.id === tid))
              .filter((t): t is Tab => Boolean(t))
              .sort((a, b) => b.openedAt - a.openedAt)
            patch[aIdKey] = remaining[0]?.id ?? null
          }
        }
        // Auto-collapse split if one of the panels became empty.
        // If both panels are empty, drop split entirely and reset focus to A.
        if (state.splitEnabled) {
          if (newPanelA.length === 0 && newPanelB.length === 0) {
            patch.splitEnabled = false
            patch.focusedPanel = "A"
            patch.panelAActiveId = null
            patch.panelBActiveId = null
          } else if (newPanelA.length === 0) {
            // collapse: move B's tabs to A
            patch.panelATabs = [...newPanelB]
            patch.panelBTabs = []
            patch.panelAActiveId = state.panelBActiveId
            patch.panelBActiveId = null
            patch.splitEnabled = false
            patch.focusedPanel = "A"
          } else if (newPanelB.length === 0) {
            patch.panelBTabs = []
            patch.panelBActiveId = null
            patch.splitEnabled = false
            patch.focusedPanel = "A"
          }
        }
        set(patch as Partial<WorkspaceState>)
      },

      closeOtherTabs: (id, panel) => {
        const state = get()
        const pTabsKey = panelKey(panel)
        const tabsInPanel = state[pTabsKey]
        const toClose = tabsInPanel.filter((tid) => {
          if (tid === id) return false
          const t = state.tabs.find((x) => x.id === tid)
          return t && t.closeable && !t.isDirty
        })
        toClose.forEach((tid) => get().closeTabForced(tid))
      },

      closeAllTabs: (panel) => {
        const state = get()
        const pTabsKey = panelKey(panel)
        const toClose = [...state[pTabsKey]].filter((tid) => {
          const t = state.tabs.find((x) => x.id === tid)
          return t && t.closeable && !t.isDirty
        })
        toClose.forEach((tid) => get().closeTabForced(tid))
      },

      setActiveTab: (id, panel) => {
        const state = get()
        const targetPanel = panel ?? findPanelOfTab(state, id) ?? state.focusedPanel
        const aIdKey = activeKey(targetPanel)
        // Skip update when nothing would change to avoid re-render churn.
        if (state[aIdKey] === id && state.focusedPanel === targetPanel) return
        set({
          [aIdKey]: id,
          focusedPanel: targetPanel,
        } as Partial<WorkspaceState>)
      },

      setFocusedPanel: (panel) => {
        if (get().focusedPanel === panel) return
        set({ focusedPanel: panel })
      },

      moveTabToPanel: (tabId, targetPanel) => {
        const state = get()
        const sourcePanel = findPanelOfTab(state, tabId)
        if (!sourcePanel || sourcePanel === targetPanel) return
        const sKey = panelKey(sourcePanel)
        const tKey = panelKey(targetPanel)
        const sActive = activeKey(sourcePanel)
        const tActive = activeKey(targetPanel)
        const newSource = state[sKey].filter((t) => t !== tabId)
        const patch: Partial<WorkspaceState> = {
          [sKey]: newSource,
          [tKey]: [...state[tKey], tabId],
          [tActive]: tabId,
        }
        if (state[sActive] === tabId) {
          const remaining = newSource
            .map((tid) => state.tabs.find((t) => t.id === tid))
            .filter((t): t is Tab => Boolean(t))
            .sort((a, b) => b.openedAt - a.openedAt)
          patch[sActive] = remaining[0]?.id ?? null
        }
        set(patch as Partial<WorkspaceState>)
      },

      reorderTabs: (panel, fromIndex, toIndex) => {
        const state = get()
        const pKey = panelKey(panel)
        const list = [...state[pKey]]
        if (fromIndex < 0 || fromIndex >= list.length) return
        const [moved] = list.splice(fromIndex, 1)
        list.splice(toIndex, 0, moved)
        set({ [pKey]: list } as Partial<WorkspaceState>)
      },

      renameTab: (id, title) => {
        const next = title.slice(0, 32)
        const state = get()
        const tab = state.tabs.find((t) => t.id === id)
        if (!tab || tab.title === next) return
        set({
          tabs: state.tabs.map((t) => (t.id === id ? { ...t, title: next } : t)),
        })
      },

      setTabDirty: (id, dirty) => {
        const state = get()
        const tab = state.tabs.find((t) => t.id === id)
        if (!tab || tab.isDirty === dirty) return
        set({
          tabs: state.tabs.map((t) => (t.id === id ? { ...t, isDirty: dirty } : t)),
        })
      },

      enableSplit: (direction) => {
        // Always sets exactly one direction. Cannot have both at once.
        const state = get()
        // No-op if there are no tabs at all.
        if (state.tabs.length === 0) return
        if (state.splitEnabled && state.splitDirection === direction) return
        set({ splitEnabled: true, splitDirection: direction })
      },

      disableSplit: () => {
        const state = get()
        set({
          panelATabs: [...state.panelATabs, ...state.panelBTabs],
          panelBTabs: [],
          panelBActiveId: null,
          splitEnabled: false,
          focusedPanel: "A",
        })
      },

      setSplitRatio: (ratio) => {
        const clamped = Math.min(0.8, Math.max(0.2, ratio))
        if (Math.abs(get().splitRatio - clamped) < 0.0005) return
        set({ splitRatio: clamped })
      },

      swapPanels: () => {
        const state = get()
        set({
          panelATabs: state.panelBTabs,
          panelBTabs: state.panelATabs,
          panelAActiveId: state.panelBActiveId,
          panelBActiveId: state.panelAActiveId,
        })
      },

      clearPendingDirtyClose: () => set({ pendingDirtyClose: null }),

      validate: () => {
        const state = get()
        const tabIds = new Set(state.tabs.map((t) => t.id))
        const panelATabs = state.panelATabs.filter((id) => tabIds.has(id))
        const panelBTabs = state.panelBTabs.filter((id) => tabIds.has(id))
        let panelAActiveId = state.panelAActiveId
        let panelBActiveId = state.panelBActiveId
        if (panelAActiveId && !panelATabs.includes(panelAActiveId)) {
          panelAActiveId = panelATabs[panelATabs.length - 1] ?? null
        }
        if (panelBActiveId && !panelBTabs.includes(panelBActiveId)) {
          panelBActiveId = panelBTabs[panelBTabs.length - 1] ?? null
        }
        let splitRatio = state.splitRatio
        if (splitRatio < 0.2 || splitRatio > 0.8) splitRatio = 0.5
        // Migration: every tab is closeable now (Dashboard included).
        const tabs = state.tabs.some((t) => !t.closeable)
          ? state.tabs.map((t) => (t.closeable ? t : { ...t, closeable: true }))
          : state.tabs
        set({ tabs, panelATabs, panelBTabs, panelAActiveId, panelBActiveId, splitRatio })
      },
    }),
    {
      name: "rv-workspace-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tabs: state.tabs,
        panelATabs: state.panelATabs,
        panelBTabs: state.panelBTabs,
        panelAActiveId: state.panelAActiveId,
        panelBActiveId: state.panelBActiveId,
        splitEnabled: state.splitEnabled,
        splitDirection: state.splitDirection,
        splitRatio: state.splitRatio,
      }),
      onRehydrateStorage: () => (state) => {
        // reset focused panel
        if (state) state.focusedPanel = "A"
      },
    },
  ),
)

// Hooks (stable refs; derive arrays via useMemo to avoid render loops)
import { useMemo } from "react"

export function usePanelTabIds(panel: PanelId): string[] {
  return useWorkspaceStore((s) => (panel === "A" ? s.panelATabs : s.panelBTabs))
}

export function usePanelActiveId(panel: PanelId): string | null {
  return useWorkspaceStore((s) => (panel === "A" ? s.panelAActiveId : s.panelBActiveId))
}

export function useTabsForPanel(panel: PanelId): Tab[] {
  const ids = usePanelTabIds(panel)
  const tabs = useWorkspaceStore((s) => s.tabs)
  return useMemo(
    () => ids.map((id) => tabs.find((t) => t.id === id)).filter((t): t is Tab => Boolean(t)),
    [ids, tabs],
  )
}

export function useActiveTab(panel: PanelId): Tab | null {
  const id = usePanelActiveId(panel)
  const tabs = useWorkspaceStore((s) => s.tabs)
  return useMemo(() => (id ? tabs.find((t) => t.id === id) ?? null : null), [id, tabs])
}
