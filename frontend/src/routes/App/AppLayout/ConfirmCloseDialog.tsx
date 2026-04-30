import { useWorkspaceStore } from "@/services/store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function ConfirmCloseDialog() {
  const pendingId = useWorkspaceStore((s) => s.pendingDirtyClose)
  const tab = useWorkspaceStore((s) => s.tabs.find((t) => t.id === s.pendingDirtyClose) ?? null)
  const clear = useWorkspaceStore((s) => s.clearPendingDirtyClose)
  const closeForced = useWorkspaceStore((s) => s.closeTabForced)

  const open = pendingId !== null && tab !== null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && clear()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nesačuvane promjene</DialogTitle>
          <DialogDescription>
            Tab <span className="font-medium text-foreground">"{tab?.title}"</span> ima nesačuvane promjene. Jesi li siguran da ga želiš zatvoriti?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={clear}>
            Odustani
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (pendingId) closeForced(pendingId)
            }}
          >
            Zatvori bez čuvanja
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
