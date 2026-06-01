import { useMemo, useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { HeartIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/DataTable"
import { useWeddings, type WeddingListDto } from "@/services/weddingsService"
import { useWorkspaceNavigate } from "@/routes/App/AppLayout/useWorkspaceNavigate"
import { NewWeddingSheet } from "./NewWeddingSheet"

const STATUS_LABELS: Record<string, string> = {
    PREPARATION: "Priprema",
    CONFIRMED: "Potvrđeno",
    COMPLETED: "Završeno",
    CANCELLED: "Otkazano",
}

const STATUS_FILTER_TABS = [
    { value: "all", label: "Sva" },
    { value: "PREPARATION", label: "Priprema" },
    { value: "CONFIRMED", label: "Potvrđena" },
    { value: "COMPLETED", label: "Završena" },
    { value: "CANCELLED", label: "Otkazana" },
]

function statusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
    if (status === "CONFIRMED") return "default"
    if (status === "CANCELLED") return "destructive"
    if (status === "COMPLETED") return "secondary"
    return "outline"
}

export default function WeddingsListScreen() {
    const [statusFilter, setStatusFilter] = useState("all")
    const [sheetOpen, setSheetOpen] = useState(false)
    const navigate = useWorkspaceNavigate()

    const { data: weddings = [], isLoading, isError } = useWeddings(
        statusFilter !== "all" ? statusFilter : undefined
    )

    const columns = useMemo<ColumnDef<WeddingListDto>[]>(() => [
        {
            accessorKey: "name",
            header: "Naziv",
            cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
        },
        {
            accessorKey: "dateTime",
            header: "Datum",
            cell: ({ row }) => {
                const d = new Date(row.original.dateTime)
                return (
                    <span className="tabular-nums text-muted-foreground">
                        {d.toLocaleDateString("hr-HR", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                )
            },
        },
        {
            accessorKey: "location",
            header: "Lokacija",
            cell: ({ row }) => (
                <span className="text-muted-foreground">{row.original.location ?? "—"}</span>
            ),
        },
        {
            accessorKey: "templateName",
            header: "Predložak",
            cell: ({ row }) => (
                row.original.templateName
                    ? <Badge variant="outline" className="font-normal">{row.original.templateName}</Badge>
                    : <span className="text-muted-foreground text-xs">—</span>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={statusVariant(row.original.status)}>
                    {STATUS_LABELS[row.original.status] ?? row.original.status}
                </Badge>
            ),
        },
    ], [])

    if (isError) {
        return (
            <div className="p-6">
                <p className="text-destructive">Greška pri učitavanju vjenčanja.</p>
            </div>
        )
    }

    return (
        <>
            <div className="flex flex-col h-full overflow-hidden">
                <div className="px-6 pt-6 pb-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <HeartIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">Vjenčanja</h1>
                                <p className="text-sm text-muted-foreground">
                                    {isLoading ? "Učitavanje..." : `${weddings.length} vjenčanja`}
                                </p>
                            </div>
                        </div>
                        <Button onClick={() => setSheetOpen(true)}>
                            <PlusIcon className="h-4 w-4" /> Novo vjenčanje
                        </Button>
                    </div>

                    <Tabs
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <TabsList variant="line" className="w-full justify-start">
                            {STATUS_FILTER_TABS.map(tab => (
                                <TabsTrigger key={tab.value} value={tab.value}>
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
                    <DataTable
                        columns={columns}
                        data={weddings}
                        isLoading={isLoading}
                        searchKey="name"
                        searchPlaceholder="Pretraži vjenčanja..."
                        onRowClick={(row) => navigate({ path: `/weddings/${row.id}`, title: row.name })}
                    />
                </div>
            </div>

            <NewWeddingSheet open={sheetOpen} onOpenChange={setSheetOpen} />
        </>
    )
}
