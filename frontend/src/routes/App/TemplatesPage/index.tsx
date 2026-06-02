import { useMemo, useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { LayoutTemplateIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import { DataTable } from "@/components/DataTable"
import {
  useWeddingTemplates,
  useDeleteWeddingTemplate,
  type WeddingTemplateListDto,
} from "@/services/weddingTemplatesService"
import { TemplateSheet } from "./TemplateSheet"

export default function TemplatesListScreen() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WeddingTemplateListDto | null>(null)

  const { data: templates = [], isLoading, isError } = useWeddingTemplates()
  const del = useDeleteWeddingTemplate()

  const columns = useMemo<ColumnDef<WeddingTemplateListDto>[]>(() => [
    {
      accessorKey: "name",
      header: "Naziv",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "description",
      header: "Opis",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.description ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "requiredPartnerTypesCount",
      header: "Tipovi partnera",
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-normal tabular-nums">
          {row.original.requiredPartnerTypesCount}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation()
            setDeleteTarget(row.original)
          }}
          title="Obriši predložak"
        >
          <Trash2Icon className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ], [])

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-destructive">Greška pri učitavanju predložaka.</p>
      </div>
    )
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await del.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch { /* global toast */ }
  }

  function openNew() {
    setEditId(null)
    setSheetOpen(true)
  }

  function openEdit(id: number) {
    setEditId(id)
    setSheetOpen(true)
  }

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <LayoutTemplateIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Predlošci</h1>
                <p className="text-sm text-muted-foreground">
                  {isLoading ? "Učitavanje..." : `${templates.length} predložaka · presetovi za nova vjenčanja`}
                </p>
              </div>
            </div>
            <Button onClick={openNew}>
              <PlusIcon className="h-4 w-4" /> Novi predložak
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
          <DataTable
            columns={columns}
            data={templates}
            isLoading={isLoading}
            searchKey="name"
            searchPlaceholder="Pretraži predloške..."
            onRowClick={(row) => openEdit(row.id)}
          />
        </div>
      </div>

      <TemplateSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        templateId={editId}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Obriši predložak</DialogTitle>
            <DialogDescription>
              Obrisati &quot;{deleteTarget?.name}&quot;? Predložak će biti deaktiviran.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Odustani</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={del.isPending}>
              {del.isPending ? "Brisanje..." : "Obriši"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}