import { memo, useEffect, useRef, useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { XIcon, ArrowLeftIcon, ArrowRightIcon, CopyIcon, PencilIcon, Trash2Icon } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { cn } from "@/utils/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useWorkspaceStore, type Tab, type PanelId } from "@/services/store"
import { useWorkspaceNavigate } from "./useWorkspaceNavigate"

interface TabItemProps {
  tab: Tab
  panel: PanelId
  variant?: "global" | "panel"
  isActive: boolean
}

function getIcon(name?: string) {
  if (!name) return null
  const all = LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>
  return all[`${name}Icon`] ?? all[name] ?? null
}

export const TabItem = memo(function TabItem({ tab, panel, variant = "global", isActive }: TabItemProps) {
  const setActiveTab = useWorkspaceStore((s) => s.setActiveTab)
  const closeTab = useWorkspaceStore((s) => s.closeTab)
  const closeOtherTabs = useWorkspaceStore((s) => s.closeOtherTabs)
  const closeAllTabs = useWorkspaceStore((s) => s.closeAllTabs)
  const renameTab = useWorkspaceStore((s) => s.renameTab)
  const moveTabToPanel = useWorkspaceStore((s) => s.moveTabToPanel)
  const splitEnabled = useWorkspaceStore((s) => s.splitEnabled)
  const tabsCountInPanel = useWorkspaceStore(
    (s) => (panel === "A" ? s.panelATabs.length : s.panelBTabs.length),
  )
  const navigate = useWorkspaceNavigate()

  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(tab.title)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tab.id,
    data: { panel, tabId: tab.id },
    disabled: isRenaming,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  useEffect(() => {
    if (isRenaming) inputRef.current?.select()
  }, [isRenaming])

  useEffect(() => {
    if (!isRenaming) setRenameValue(tab.title)
  }, [tab.title, isRenaming])

  const Icon = getIcon(tab.icon)
  const isCompact = variant === "panel"

  const commitRename = () => {
    const next = renameValue.trim()
    if (next.length > 0 && next !== tab.title) {
      renameTab(tab.id, next)
    } else {
      setRenameValue(tab.title)
    }
    setIsRenaming(false)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        role="tab"
        aria-selected={isActive}
        aria-controls={`panel-${panel}`}
        tabIndex={isActive ? 0 : -1}
        onClick={() => setActiveTab(tab.id, panel)}
        onAuxClick={(e) => {
          if (e.button === 1) {
            e.preventDefault()
            closeTab(tab.id)
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault()
          setMenuPos({ x: e.clientX, y: e.clientY })
          setMenuOpen(true)
        }}
        className={cn(
          "group relative flex items-center gap-2 select-none cursor-pointer border-r border-border/60 transition-colors",
          isCompact ? "h-8 px-2.5 text-xs" : "h-10 px-3 text-sm",
          isActive
            ? "bg-background text-foreground"
            : "bg-muted/30 text-muted-foreground hover:bg-accent/50 hover:text-foreground",
          isActive && "before:absolute before:inset-x-0 before:bottom-0 before:h-0.5 before:bg-primary",
        )}
      >
        {Icon && <Icon className={cn(isCompact ? "h-3 w-3" : "h-4 w-4", "shrink-0")} />}
        {isRenaming ? (
          <input
            ref={inputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value.slice(0, 32))}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename()
              if (e.key === "Escape") {
                setRenameValue(tab.title)
                setIsRenaming(false)
              }
              e.stopPropagation()
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="bg-transparent outline-none border-b border-primary px-0.5 max-w-[180px] text-foreground"
          />
        ) : (
          <span className="truncate max-w-[200px]">{tab.title}</span>
        )}

        {tab.isDirty ? (
          <span
            aria-label="nesačuvane promjene"
            className="h-2 w-2 rounded-full bg-amber-500 shrink-0"
          />
        ) : tab.closeable ? (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              closeTab(tab.id)
            }}
            className="rounded-sm p-0.5 hover:bg-accent text-muted-foreground hover:text-foreground transition"
            aria-label={`Zatvori tab ${tab.title}`}
          >
            <XIcon className={isCompact ? "h-3 w-3" : "h-3.5 w-3.5"} />
          </button>
        ) : (
          <span className="w-3.5" />
        )}
      </div>

      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuContent
          style={
            menuPos
              ? ({ position: "fixed", left: menuPos.x, top: menuPos.y } as React.CSSProperties)
              : undefined
          }
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuItem onSelect={() => setIsRenaming(true)}>
            <PencilIcon className="h-4 w-4" /> Preimenuj tab
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => navigate({ path: tab.path, title: tab.title, icon: tab.icon })}
          >
            <CopyIcon className="h-4 w-4" /> Otvori u novom tabu
          </DropdownMenuItem>
          {splitEnabled && panel === "A" && (
            <DropdownMenuItem onSelect={() => moveTabToPanel(tab.id, "B")}>
              <ArrowRightIcon className="h-4 w-4" /> Premjesti u Panel B
            </DropdownMenuItem>
          )}
          {splitEnabled && panel === "B" && (
            <DropdownMenuItem onSelect={() => moveTabToPanel(tab.id, "A")}>
              <ArrowLeftIcon className="h-4 w-4" /> Premjesti u Panel A
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {tab.closeable && (
            <DropdownMenuItem onSelect={() => closeTab(tab.id)}>
              <XIcon className="h-4 w-4" /> Zatvori tab
            </DropdownMenuItem>
          )}
          {tabsCountInPanel > 1 && (
            <DropdownMenuItem onSelect={() => closeOtherTabs(tab.id, panel)}>
              <XIcon className="h-4 w-4" /> Zatvori ostale tabove
            </DropdownMenuItem>
          )}
          {tabsCountInPanel > 0 && (
            <DropdownMenuItem onSelect={() => closeAllTabs(panel)}>
              <Trash2Icon className="h-4 w-4" /> Zatvori sve tabove
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
})
