import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import {
  PanelLeftOpenIcon,
  PanelTopOpenIcon,
  ArrowLeftRightIcon,
  XIcon,
  PlusIcon,
} from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useWorkspaceStore, useTabsForPanel } from "@/services/store"
import { TabItem } from "./TabItem"

interface GlobalTabBarProps {
  onOpenPalette: () => void
}

export function GlobalTabBar({ onOpenPalette }: GlobalTabBarProps) {
  const focusedPanel = useWorkspaceStore((s) => s.focusedPanel)
  const tabs = useTabsForPanel(focusedPanel)
  const activeId = useWorkspaceStore((s) =>
    focusedPanel === "A" ? s.panelAActiveId : s.panelBActiveId,
  )
  const splitEnabled = useWorkspaceStore((s) => s.splitEnabled)
  const splitDirection = useWorkspaceStore((s) => s.splitDirection)
  const enableSplit = useWorkspaceStore((s) => s.enableSplit)
  const disableSplit = useWorkspaceStore((s) => s.disableSplit)
  const swapPanels = useWorkspaceStore((s) => s.swapPanels)

  return (
    <div
      role="tablist"
      className="flex items-center h-10 bg-card border-b border-border shrink-0 px-1 min-w-0 overflow-hidden"
    >
      <SidebarTrigger className="h-8 w-8 shrink-0 mx-1" />
      <Separator orientation="vertical" className="h-5 mr-1 shrink-0" />

      {/* Tabs are shown here only when there is no split (each panel renders its own strip when split) */}
      {!splitEnabled ? (
        <SortableContext items={tabs.map((t) => t.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex items-center overflow-x-auto scrollbar-hide flex-1 min-w-0">
            {tabs.map((tab) => (
              <TabItem
                key={tab.id}
                tab={tab}
                panel={focusedPanel}
                variant="global"
                isActive={tab.id === activeId}
              />
            ))}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onOpenPalette}
                  className="flex items-center justify-center h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors shrink-0 cursor-pointer"
                  aria-label="Otvori novi tab"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Otvori novi tab (Ctrl+K)</TooltipContent>
            </Tooltip>
          </div>
        </SortableContext>
      ) : (
        <div className="flex-1 flex items-center min-w-0 text-xs text-muted-foreground px-2">
          <span className="truncate">
            Split aktivan — povuci tab na rub za premještanje · Ctrl+Shift+F za preklop
          </span>
        </div>
      )}

      <div className="flex items-center gap-1 px-1 shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${splitEnabled && splitDirection === "horizontal" ? "text-primary" : ""}`}
              onClick={() => {
                if (splitEnabled && splitDirection === "horizontal") disableSplit()
                else enableSplit("horizontal")
              }}
            >
              <PanelLeftOpenIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Podijeli horizontalno (Ctrl+\)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${splitEnabled && splitDirection === "vertical" ? "text-primary" : ""}`}
              onClick={() => {
                if (splitEnabled && splitDirection === "vertical") disableSplit()
                else enableSplit("vertical")
              }}
            >
              <PanelTopOpenIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Podijeli vertikalno (Ctrl+Shift+\)</TooltipContent>
        </Tooltip>
        {splitEnabled && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={swapPanels}>
                  <ArrowLeftRightIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zamijeni panele</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={disableSplit}>
                  <XIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zatvori split</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </div>
  )
}
