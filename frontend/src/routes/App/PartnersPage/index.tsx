import { useMemo } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { UsersIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/DataTable"

interface Partner {
  id: string
  name: string
  category: string
  rating: number
  bookings: number
}

const partners: Partner[] = [
  { id: "1", name: "Studio Foto Adria", category: "Fotografija", rating: 4.9, bookings: 32 },
  { id: "2", name: "Bend Mareta", category: "Glazba", rating: 4.7, bookings: 18 },
  { id: "3", name: "Cvijet & List", category: "Cvjećara", rating: 4.8, bookings: 41 },
  { id: "4", name: "Catering Mediteran", category: "Catering", rating: 4.6, bookings: 25 },
  { id: "5", name: "Limuzine Premium", category: "Prijevoz", rating: 4.5, bookings: 12 },
  { id: "6", name: "DJ Krešo", category: "DJ", rating: 4.9, bookings: 27 },
  { id: "7", name: "Slastičarna Bonbon", category: "Torta", rating: 4.8, bookings: 22 },
  { id: "8", name: "Cvjećara Lavanda", category: "Cvjećara", rating: 4.6, bookings: 19 },
]

export default function PartnersListScreen() {
  const columns = useMemo<ColumnDef<Partner>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Naziv",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "category",
        header: "Kategorija",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-normal">
            {row.original.category}
          </Badge>
        ),
      },
      {
        accessorKey: "rating",
        header: "Ocjena",
        cell: ({ row }) => (
          <span className="tabular-nums">★ {row.original.rating.toFixed(1)}</span>
        ),
      },
      {
        accessorKey: "bookings",
        header: "Rezervacije",
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">{row.original.bookings}</span>
        ),
      },
    ],
    [],
  )

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <UsersIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Partneri</h1>
            <p className="text-sm text-muted-foreground">Vanjski dobavljači i izvođači</p>
          </div>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4" /> Novi partner
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={partners}
        searchKey="name"
        searchPlaceholder="Pretraži partnere..."
      />
    </div>
  )
}
