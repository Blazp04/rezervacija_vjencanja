import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { SearchIcon } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { cn } from "@/utils/utils"
import { navItems } from "./registry"
import { useWorkspaceNavigate } from "./useWorkspaceNavigate"

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

interface PaletteItem {
  title: string
  path: string
  icon: string
  closeable?: boolean
  hint?: string
}

const baseItems: PaletteItem[] = navItems.map((n) => {
  // derive icon name back from LucideIcon component (component.displayName like "LayoutDashboard")
  const name = (n.icon as unknown as { displayName?: string }).displayName ?? "FileText"
  return { title: n.title, path: n.path, icon: name, closeable: n.closeable }
})

// Demo wedding details for command palette
const demoItems: PaletteItem[] = [
  { title: "Vjenčanje #1042", path: "/weddings/1042", icon: "Heart", hint: "demo zapis" },
  { title: "Vjenčanje #1043", path: "/weddings/1043", icon: "Heart", hint: "demo zapis" },
  { title: "Vjenčanje #1044", path: "/weddings/1044", icon: "Heart", hint: "demo zapis" },
]

const ALL_ITEMS: PaletteItem[] = [...baseItems, ...demoItems]

function getIcon(name: string) {
  const all = LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>
  return all[`${name}Icon`] ?? all[name] ?? LucideIcons.FileTextIcon
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useWorkspaceNavigate()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ALL_ITEMS
    return ALL_ITEMS.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        it.path.toLowerCase().includes(q) ||
        (it.hint?.toLowerCase().includes(q) ?? false),
    )
  }, [query])

  useEffect(() => {
    if (open) {
      setQuery("")
      setActiveIndex(0)
      // delay focus until after dialog renders
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  if (!open) return null

  const handleSelect = (item: PaletteItem) => {
    navigate({
      path: item.path,
      title: item.title,
      icon: item.icon,
      closeable: item.closeable,
    })
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault()
      onClose()
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1))
      return
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(0, i - 1))
      return
    }
    if (e.key === "Enter") {
      e.preventDefault()
      const item = filtered[activeIndex]
      if (item) handleSelect(item)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl mx-4 rounded-xl border bg-popover shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 h-12 border-b">
          <SearchIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            id="command-palette-search"
            name="command-palette-search"
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Otvori ekran... (npr. vjenčanja, partneri)"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] text-muted-foreground border rounded px-1.5 py-0.5">esc</kbd>
        </div>
        <div className="max-h-80 overflow-auto p-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Nema rezultata
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = getIcon(item.icon)
              const isActive = idx === activeIndex
              return (
                <button
                  key={`${item.path}-${idx}`}
                  type="button"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => handleSelect(item)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-left transition-colors",
                    isActive ? "bg-accent text-accent-foreground" : "text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate">{item.title}</span>
                  {item.hint && (
                    <span className="text-xs text-muted-foreground">{item.hint}</span>
                  )}
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {item.path}
                  </span>
                </button>
              )
            })
          )}
        </div>
        <div className="flex items-center justify-between px-3 py-2 text-[11px] text-muted-foreground border-t bg-muted/30">
          <div className="flex gap-3">
            <span><kbd className="border rounded px-1 py-0.5">↑</kbd> <kbd className="border rounded px-1 py-0.5">↓</kbd> kreći se</span>
            <span><kbd className="border rounded px-1 py-0.5">↵</kbd> otvori</span>
          </div>
          <span>{filtered.length} {filtered.length === 1 ? "rezultat" : "rezultata"}</span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
