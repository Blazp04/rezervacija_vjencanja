import { useEffect, useRef, useCallback, useState } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  Group as PanelGroup,
  Panel,
  Separator as PanelResizeHandle,
  type PanelSize,
} from "react-resizable-panels"
import * as LucideIcons from "lucide-react"
import { useWorkspaceStore, type PanelId, type SplitDirection } from "@/services/store"
import { GlobalTabBar } from "./GlobalTabBar"
import { PanelTabStrip } from "./PanelTabStrip"
import { PanelContent } from "./PanelContent"
import { ConfirmCloseDialog } from "./ConfirmCloseDialog"
import { CommandPalette } from "./CommandPalette"
import { useWorkspaceHotkeys } from "./useWorkspaceHotkeys"
import { cn } from "@/utils/utils"

type EdgeId = "left" | "right" | "top" | "bottom"

interface EdgeDropZoneProps {
  edge: EdgeId
  visible: boolean
}

function EdgeDropZone({ edge, visible }: EdgeDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `edge-${edge}`,
    data: { edge, isEdge: true },
  })

  const positionClass = {
    left: "left-0 top-0 bottom-0 w-[14%]",
    right: "right-0 top-0 bottom-0 w-[14%]",
    top: "top-0 left-0 right-0 h-[14%]",
    bottom: "bottom-0 left-0 right-0 h-[14%]",
  }[edge]

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute z-30 transition-opacity",
        positionClass,
        visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      )}
    >
      <div
        className={cn(
          "absolute inset-2 rounded-lg border-2 border-dashed transition-all",
          isOver
            ? "border-primary bg-primary/15 ring-2 ring-primary/30"
            : "border-primary/30 bg-primary/5",
        )}
      />
    </div>
  )
}

function getIcon(name?: string) {
  if (!name) return null
  const all = LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>
  return all[`${name}Icon`] ?? all[name] ?? null
}

export function WorkspaceShell() {
  const splitEnabled = useWorkspaceStore((s) => s.splitEnabled)
  const splitDirection = useWorkspaceStore((s) => s.splitDirection)
  const splitRatio = useWorkspaceStore((s) => s.splitRatio)
  const setSplitRatio = useWorkspaceStore((s) => s.setSplitRatio)
  const focusedPanel = useWorkspaceStore((s) => s.focusedPanel)
  const setFocusedPanel = useWorkspaceStore((s) => s.setFocusedPanel)
  const reorderTabs = useWorkspaceStore((s) => s.reorderTabs)
  const moveTabToPanel = useWorkspaceStore((s) => s.moveTabToPanel)
  const enableSplit = useWorkspaceStore((s) => s.enableSplit)
  const validate = useWorkspaceStore((s) => s.validate)
  const tabs = useWorkspaceStore((s) => s.tabs)

  const [paletteOpen, setPaletteOpen] = useState(false)
  const [draggingTabId, setDraggingTabId] = useState<string | null>(null)
  const draggingTab = draggingTabId ? tabs.find((t) => t.id === draggingTabId) ?? null : null
  const DragIcon = getIcon(draggingTab?.icon)

  useEffect(() => {
    validate()
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const ratioTimeoutRef = useRef<number | null>(null)
  const handleResizeA = useCallback(
    (size: PanelSize) => {
      const ratio = size.asPercentage / 100
      if (ratioTimeoutRef.current) window.clearTimeout(ratioTimeoutRef.current)
      ratioTimeoutRef.current = window.setTimeout(() => {
        setSplitRatio(ratio)
      }, 300)
    },
    [setSplitRatio],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.data.current?.tabId as string | undefined
    if (id) setDraggingTabId(id)
  }

  const handleDragCancel = () => setDraggingTabId(null)

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingTabId(null)
    const { active, over } = event
    if (!over) return
    const activePanel = active.data.current?.panel as PanelId | undefined
    const activeTabId = active.data.current?.tabId as string | undefined
    if (!activePanel || !activeTabId) return

    const overData = over.data.current as
      | {
          panel?: PanelId
          isPanelStrip?: boolean
          tabId?: string
          edge?: EdgeId
          isEdge?: boolean
        }
      | undefined

    // Edge drop -> auto-split (single direction at a time)
    if (overData?.isEdge && overData.edge) {
      const edge = overData.edge
      const direction: SplitDirection =
        edge === "left" || edge === "right" ? "horizontal" : "vertical"
      const targetPanel: PanelId = edge === "left" || edge === "top" ? "A" : "B"
      const state = useWorkspaceStore.getState()

      if (!state.splitEnabled) {
        enableSplit(direction)
        if (targetPanel === "B") {
          moveTabToPanel(activeTabId, "B")
          setFocusedPanel("B")
        } else {
          // dragged stays in A, push others to B
          const others = state.panelATabs.filter((id) => id !== activeTabId)
          others.forEach((id) => moveTabToPanel(id, "B"))
          setFocusedPanel("A")
        }
      } else if (state.splitDirection !== direction) {
        // Already split in the other direction — switch direction, place dragged
        // tab in the requested panel, keep all other tabs in the opposite panel.
        enableSplit(direction)
        if (activePanel !== targetPanel) {
          moveTabToPanel(activeTabId, targetPanel)
          setFocusedPanel(targetPanel)
        }
      } else if (activePanel !== targetPanel) {
        moveTabToPanel(activeTabId, targetPanel)
        setFocusedPanel(targetPanel)
      }
      return
    }

    if (overData?.isPanelStrip && overData.panel && overData.panel !== activePanel) {
      moveTabToPanel(activeTabId, overData.panel)
      setFocusedPanel(overData.panel)
      return
    }

    if (overData?.tabId && overData.panel === activePanel && active.id !== over.id) {
      const state = useWorkspaceStore.getState()
      const list = activePanel === "A" ? state.panelATabs : state.panelBTabs
      const fromIndex = list.indexOf(active.id as string)
      const toIndex = list.indexOf(over.id as string)
      if (fromIndex >= 0 && toIndex >= 0) {
        reorderTabs(activePanel, fromIndex, toIndex)
      }
      return
    }

    if (overData?.tabId && overData.panel && overData.panel !== activePanel) {
      moveTabToPanel(activeTabId, overData.panel)
      setFocusedPanel(overData.panel)
    }
  }

  // Keyboard shortcuts via react-hotkeys-hook
  useWorkspaceHotkeys({ onTogglePalette: () => setPaletteOpen((v) => !v) })

  const aPercent = `${(splitRatio * 100).toFixed(2)}%`
  const bPercent = `${((1 - splitRatio) * 100).toFixed(2)}%`

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col h-full min-h-0">
        <GlobalTabBar onOpenPalette={() => setPaletteOpen(true)} />
        <div className="flex-1 min-h-0 relative">
          <PanelGroup
            key={`${splitEnabled}-${splitDirection}`}
            id="workspace-group"
            orientation={splitEnabled ? splitDirection : "horizontal"}
            className="h-full w-full"
          >
            <Panel
              id="panel-A"
              defaultSize={splitEnabled ? aPercent : "100%"}
              minSize="20%"
              onResize={splitEnabled ? handleResizeA : undefined}
            >
              <div
                onClick={() => setFocusedPanel("A")}
                className={cn(
                  "flex flex-col h-full min-h-0 bg-background",
                  splitEnabled && focusedPanel === "A" && "ring-1 ring-primary/30 ring-inset",
                )}
              >
                {splitEnabled && (
                  <PanelTabStrip panel="A" onOpenPalette={() => setPaletteOpen(true)} />
                )}
                <div className="flex-1 min-h-0">
                  <PanelContent panel="A" />
                </div>
              </div>
            </Panel>

            {splitEnabled && (
              <>
                <PanelResizeHandle
                  className={cn(
                    "bg-border hover:bg-primary/40 active:bg-primary/70 transition-colors shrink-0",
                    splitDirection === "horizontal"
                      ? "w-1 cursor-col-resize"
                      : "h-1 cursor-row-resize",
                  )}
                />
                <Panel id="panel-B" defaultSize={bPercent} minSize="20%">
                  <div
                    onClick={() => setFocusedPanel("B")}
                    className={cn(
                      "flex flex-col h-full min-h-0 bg-background",
                      focusedPanel === "B" && "ring-1 ring-primary/30 ring-inset",
                    )}
                  >
                    <PanelTabStrip panel="B" onOpenPalette={() => setPaletteOpen(true)} />
                    <div className="flex-1 min-h-0">
                      <PanelContent panel="B" />
                    </div>
                  </div>
                </Panel>
              </>
            )}
          </PanelGroup>

          <EdgeDropZone edge="left" visible={!!draggingTabId} />
          <EdgeDropZone edge="right" visible={!!draggingTabId} />
          <EdgeDropZone edge="top" visible={!!draggingTabId} />
          <EdgeDropZone edge="bottom" visible={!!draggingTabId} />
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {draggingTab ? (
          <div className="flex items-center gap-2 h-9 px-3 rounded-md bg-popover text-popover-foreground shadow-xl border text-sm pointer-events-none">
            {DragIcon && <DragIcon className="h-4 w-4 text-muted-foreground" />}
            <span className="truncate max-w-[200px] font-medium">{draggingTab.title}</span>
            {draggingTab.isDirty && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            )}
          </div>
        ) : null}
      </DragOverlay>

      <ConfirmCloseDialog />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </DndContext>
  )
}
