import { useMemo, useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { LayoutDashboardIcon, HeartIcon, ClockIcon, CheckCircleIcon, PlusIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/DataTable"
import { useWeddings, type WeddingListDto } from "@/services/weddingsService"
import { useWorkspaceNavigate } from "@/routes/App/AppLayout/useWorkspaceNavigate"
import { NewWeddingSheet } from "@/routes/App/WeddingsPage/NewWeddingSheet"

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

export default function DashboardScreen() {
  const navigate = useWorkspaceNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const { data: allWeddings = [], isLoading, isError } = useWeddings(
    statusFilter !== "all" ? statusFilter : undefined
  )

  // Filtriranje po rasponu datuma (frontend)
  const weddings = useMemo(() => {
    return allWeddings.filter((w) => {
      const d = new Date(w.dateTime)
      if (dateFrom && d < new Date(dateFrom)) return false
      if (dateTo && d > new Date(dateTo + "T23:59:59")) return false
      return true
    })
  }, [allWeddings, dateFrom, dateTo])

  // KPI statistika (iz svih vjenčanja, ne filtriranih)
  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = allWeddings.filter((w) => {
      const d = new Date(w.dateTime)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
    const inPreparation = allWeddings.filter((w) => w.status === "PREPARATION").length
    return {
      total: allWeddings.length,
      thisMonth,
      inPreparation,
    }
  }, [allWeddings])

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

  const kpis = [
    { label: "Ukupno vjenčanja", value: stats.total, icon: HeartIcon },
    { label: "Ovaj mjesec", value: stats.thisMonth, icon: CheckCircleIcon },
    { label: "U pripremi", value: stats.inPreparation, icon: ClockIcon },
  ]

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
                <LayoutDashboardIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Pregled svih vjenčanja</p>
              </div>
            </div>
            <Button onClick={() => setSheetOpen(true)}>
              <PlusIcon className="h-4 w-4" /> Novo vjenčanje
            </Button>
          </div>

          {/* KPI kartice */}
          <div className="grid gap-4 sm:grid-cols-3">
            {kpis.map((k) => {
              const Icon = k.icon
              return (
                <Card key={k.label}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardDescription className="text-sm font-medium">{k.label}</CardDescription>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold tracking-tight tabular-nums">
                      {isLoading ? "—" : k.value}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Filteri */}
          <div className="space-y-3">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList variant="line" className="w-full justify-start">
                {STATUS_FILTER_TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex items-end gap-3">
              <div className="space-y-1">
                <Label htmlFor="db-from" className="text-xs text-muted-foreground">Od datuma</Label>
                <Input
                  id="db-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-auto"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="db-to" className="text-xs text-muted-foreground">Do datuma</Label>
                <Input
                  id="db-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-auto"
                />
              </div>
              {(dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setDateFrom(""); setDateTo("") }}
                >
                  Očisti datume
                </Button>
              )}
            </div>
          </div>
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