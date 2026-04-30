// Store entry point — re-exports all slices and composed store
// Add new slices here as the app grows

export {
  useWorkspaceStore,
  useTabsForPanel,
  usePanelTabIds,
  usePanelActiveId,
  useActiveTab,
  MAX_TABS,
  type Tab,
  type PanelId,
  type SplitDirection,
  type OpenTabConfig,
  type WorkspaceStore,
} from "./workspaceSlice"

// Selector helper — use for derived reads that combine multiple fields
// to avoid unnecessary re-renders (zustand shallow comparison)
export { useShallow } from "zustand/shallow"
