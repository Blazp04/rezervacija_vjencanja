import { memo, useMemo } from "react"
import { useWorkspaceStore, useTabsForPanel, type PanelId, type Tab } from "./store"
import { resolveScreen } from "./registry"
import { TabContext } from "./use-workspace-tab"
import { PanelEmptyState } from "./panel-tab-strip"
import NotFoundScreen from "./screens/not-found-screen"

interface PanelContentProps {
  panel: PanelId
}

interface ScreenWrapperProps {
  tab: Tab
  panel: PanelId
  visible: boolean
}

const ScreenWrapper = memo(function ScreenWrapper({ tab, panel, visible }: ScreenWrapperProps) {
  const resolved = resolveScreen(tab.path)
  const Component = resolved?.Component
  // Stable context value: only changes when tabId or panel actually change,
  // so consumers' useCallback / useEffect deps don't fire on every render.
  const ctxValue = useMemo(() => ({ tabId: tab.id, panel }), [tab.id, panel])
  return (
    <div
      style={{ display: visible ? "block" : "none" }}
      className="h-full overflow-auto"
      role="tabpanel"
      id={`panel-${panel}-${tab.id}`}
      aria-labelledby={`tab-${tab.id}`}
    >
      <TabContext.Provider value={ctxValue}>
        {Component ? <Component params={resolved!.params} /> : <NotFoundScreen />}
      </TabContext.Provider>
    </div>
  )
})

export function PanelContent({ panel }: PanelContentProps) {
  const tabs = useTabsForPanel(panel)
  const activeId = useWorkspaceStore((s) => (panel === "A" ? s.panelAActiveId : s.panelBActiveId))

  if (tabs.length === 0 || !activeId) {
    return <PanelEmptyState />
  }

  return (
    <div className="relative h-full bg-background overflow-hidden">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className="absolute inset-0"
          style={{ display: tab.id === activeId ? "block" : "none" }}
        >
          <ScreenWrapper tab={tab} panel={panel} visible={tab.id === activeId} />
        </div>
      ))}
    </div>
  )
}
