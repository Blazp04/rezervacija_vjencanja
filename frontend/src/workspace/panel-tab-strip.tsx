import { useDroppable } from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import { ArrowRightLeftIcon, LayoutPanelLeftIcon, PlusIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useWorkspaceStore, useTabsForPanel, type PanelId } from "./store"
import { TabItem } from "./tab-item"

interface PanelTabStripProps {
  panel: PanelId
  onOpenPalette: () => void
}

export function PanelTabStrip({ panel, onOpenPalette }: PanelTabStripProps) {
  const tabs = useTabsForPanel(panel)
  const activeId = useWorkspaceStore((s) => (panel === "A" ? s.panelAActiveId : s.panelBActiveId))
  const focusedPanel = useWorkspaceStore((s) => s.focusedPanel)
  const moveTabToPanel = useWorkspaceStore((s) => s.moveTabToPanel)
  const setFocusedPanel = useWorkspaceStore((s) => s.setFocusedPanel)

  const isFocused = focusedPanel === panel

  const { setNodeRef, isOver } = useDroppable({
    id: `panel-strip-${panel}`,
    data: { panel, isPanelStrip: true },
  })

  const otherPanel: PanelId = panel === "A" ? "B" : "A"

  const handleSwapTab = () => {
    if (activeId) moveTabToPanel(activeId, otherPanel)
  }

  return (
    <div
      ref={setNodeRef}
      onClick={() => setFocusedPanel(panel)}
      className={cn(
        "flex items-center bg-muted/20 h-8 border-b transition-colors",
        isFocused ? "border-primary" : "border-transparent",
        isOver && "ring-2 ring-primary/40 ring-inset",
      )}
    >
      <SortableContext items={tabs.map((t) => t.id)} strategy={horizontalListSortingStrategy}>
        <div className="flex items-center overflow-x-auto scrollbar-hide flex-1 min-w-0">
          {tabs.map((tab) => (
            <TabItem
              key={tab.id}
              tab={tab}
              panel={panel}
              variant="panel"
              isActive={tab.id === activeId}
            />
          ))}
        </div>
      </SortableContext>

      <div className="flex items-center gap-1 px-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onOpenPalette}
          title="Otvori novi ekran (Ctrl+K)"
        >
          <PlusIcon className="h-3 w-3" />
        </Button>
        {activeId && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleSwapTab}
            title={`Premjesti aktivni tab u Panel ${otherPanel}`}
          >
            <ArrowRightLeftIcon className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}

export function PanelEmptyState() {
  return (
    <div className="flex h-full items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <LayoutPanelLeftIcon className="h-6 w-6" />
        </div>
        <p className="text-sm text-muted-foreground">Nema otvorenog ekrana</p>
        <p className="text-xs text-muted-foreground">
          Pritisni <kbd className="border rounded px-1 py-0.5 text-[10px]">Ctrl</kbd>+
          <kbd className="border rounded px-1 py-0.5 text-[10px]">K</kbd> za otvaranje
        </p>
      </div>
    </div>
  )
}
