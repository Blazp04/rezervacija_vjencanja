import { useMemo } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { HeartIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/DataTable"
import { useWorkspaceNavigate } from "@/routes/App/AppLayout/useWorkspaceNavigate"

interface Wedding {
  id: string
  couple: string
  date: string
  venue: string
  status: "CONFIRMED" | "PREPARATION" | "COMPLETED" | "CANCELLED"
}

const weddings: Wedding[] = [
  { id: "101", couple: "Ana & Marko", date: "2026-06-14", venue: "Hotel Esplanade", status: "CONFIRMED" },
  { id: "102", couple: "Iva & Luka", date: "2026-07-02", venue: "Vila Dvor", status: "PREPARATION" },
  { id: "103", couple: "Petra & Filip", date: "2026-08-23", venue: "Restoran Pinia", status: "PREPARATION" },
  { id: "104", couple: "Maja & Tin", date: "2026-09-05", venue: "Klet Tomšić", status: "COMPLETED" },
  { id: "105", couple: "Dora & Stipe", date: "2026-09-21", venue: "Plaža Bačvice", status: "CANCELLED" },
  { id: "106", couple: "Lana & Ivan", date: "2026-10-12", venue: "Restoran Konavle", status: "CONFIRMED" },
  { id: "107", couple: "Tea & Boris", date: "2026-10-19", venue: "Vila Lovor", status: "PREPARATION" },
  { id: "108", couple: "Mia & Karlo", date: "2026-11-03", venue: "Hotel Bellevue", status: "CONFIRMED" },
]

const statusVariants: Record<Wedding["status"], "default" | "secondary" | "destructive" | "outline"> = {
  CONFIRMED: "default",
  PREPARATION: "secondary",
  COMPLETED: "outline",
  CANCELLED: "destructive",
}

const statusLabels: Record<Wedding["status"], string> = {
  CONFIRMED: "Potvrđeno",
  PREPARATION: "U pripremi",
  COMPLETED: "Završeno",
  CANCELLED: "Otkazano",
}

export default function WeddingsListScreen() {
  const navigate = useWorkspaceNavigate()

  const columns = useMemo<ColumnDef<Wedding>[]>(
    () => [
      {
        accessorKey: "couple",
        header: "Par",
        cell: ({ row }) => <span className="font-medium">{row.original.couple}</span>,
      },
      {
        accessorKey: "date",
        header: "Datum",
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.date}</span>,
      },
      {
        accessorKey: "venue",
        header: "Lokacija",
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.venue}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={statusVariants[row.original.status]}>
            {statusLabels[row.original.status]}
          </Badge>
        ),
        sortingFn: (a, b) =>
          statusLabels[a.original.status].localeCompare(statusLabels[b.original.status]),
      },
    ],
    [],
  )

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <HeartIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Vjenčanja</h1>
            <p className="text-sm text-muted-foreground">{weddings.length} aktivnih zapisa</p>
          </div>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4" /> Novo vjenčanje
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={weddings}
        searchKey="couple"
        searchPlaceholder="Pretraži po paru..."
        onRowClick={(w: Wedding) =>
          navigate({ path: `/weddings/${w.id}`, title: w.couple, icon: "Heart" })
        }
      />
    </div>
  )
}
