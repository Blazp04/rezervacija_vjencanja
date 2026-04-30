import { useHotkeys } from "react-hotkeys-hook"
import { useWorkspaceStore } from "@/services/store"

interface Options {
  onTogglePalette: () => void
}

/**
 * Centralized workspace keyboard shortcuts using react-hotkeys-hook.
 *
 * react-hotkeys-hook by default ignores INPUT/TEXTAREA/SELECT/contenteditable
 * unless `enableOnFormTags` / `enableOnContentEditable` is set. We only enable
 * Ctrl+K everywhere so the palette is reachable from inputs.
 */
export function useWorkspaceHotkeys({ onTogglePalette }: Options) {
  // Toggle command palette — works even when typing in inputs
  useHotkeys(
    "mod+k",
    (e) => {
      e.preventDefault()
      onTogglePalette()
    },
    { enableOnFormTags: true, enableOnContentEditable: true, preventDefault: true },
  )

  // Close active tab
  useHotkeys(
    "mod+w",
    (e) => {
      e.preventDefault()
      const s = useWorkspaceStore.getState()
      const id = s.focusedPanel === "A" ? s.panelAActiveId : s.panelBActiveId
      if (id) s.closeTab(id)
    },
    { preventDefault: true },
  )

  // Cycle tabs forward / backward
  useHotkeys(
    "ctrl+tab",
    (e) => {
      e.preventDefault()
      cycleTab(1)
    },
    { preventDefault: true },
  )
  useHotkeys(
    "ctrl+shift+tab",
    (e) => {
      e.preventDefault()
      cycleTab(-1)
    },
    { preventDefault: true },
  )

  // Jump to N-th tab
  useHotkeys(
    ["mod+1", "mod+2", "mod+3", "mod+4", "mod+5", "mod+6", "mod+7", "mod+8", "mod+9"],
    (e, handler) => {
      e.preventDefault()
      const key = handler.keys?.[0]
      if (!key) return
      const idx = parseInt(key, 10) - 1
      const s = useWorkspaceStore.getState()
      const list = s.focusedPanel === "A" ? s.panelATabs : s.panelBTabs
      if (list[idx]) s.setActiveTab(list[idx], s.focusedPanel)
    },
    { preventDefault: true },
  )

  // Toggle horizontal split
  useHotkeys(
    "mod+\\",
    (e) => {
      e.preventDefault()
      toggleSplit("horizontal")
    },
    { preventDefault: true },
  )
  // Toggle vertical split
  useHotkeys(
    "mod+shift+\\",
    (e) => {
      e.preventDefault()
      toggleSplit("vertical")
    },
    { preventDefault: true },
  )

  // Switch focus between panels (only when split active)
  useHotkeys(
    "mod+shift+f",
    (e) => {
      const s = useWorkspaceStore.getState()
      if (!s.splitEnabled) return
      e.preventDefault()
      s.setFocusedPanel(s.focusedPanel === "A" ? "B" : "A")
    },
    { preventDefault: true },
  )
}

function cycleTab(direction: 1 | -1) {
  const s = useWorkspaceStore.getState()
  const list = s.focusedPanel === "A" ? s.panelATabs : s.panelBTabs
  const activeId = s.focusedPanel === "A" ? s.panelAActiveId : s.panelBActiveId
  if (list.length === 0) return
  const idx = activeId ? list.indexOf(activeId) : -1
  const next = (idx + direction + list.length) % list.length
  s.setActiveTab(list[next], s.focusedPanel)
}

function toggleSplit(direction: "horizontal" | "vertical") {
  const s = useWorkspaceStore.getState()
  if (s.splitEnabled && s.splitDirection === direction) {
    s.disableSplit()
  } else {
    s.enableSplit(direction)
  }
}
