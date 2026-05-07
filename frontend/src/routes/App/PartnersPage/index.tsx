import { useMemo, useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { UsersIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/DataTable"
import { usePartners, type PartnerListDto } from "@/services/partnersService"
import { usePartnerTypes } from "@/services/partnerTypesService"
import { useWorkspaceNavigate } from "@/routes/App/AppLayout/useWorkspaceNavigate"
import { NewPartnerSheet } from "./NewPartnerSheet"
import { NewPartnerTypeSheet } from "./NewPartnerTypeSheet"

export default function PartnersListScreen() {
  const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>(undefined)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [typeSheetOpen, setTypeSheetOpen] = useState(false)
  const { data: partners = [], isLoading, isError } = usePartners(selectedTypeId)
  const { data: partnerTypes = [] } = usePartnerTypes()
  const navigate = useWorkspaceNavigate()

  const columns = useMemo<ColumnDef<PartnerListDto>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Naziv",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "partnerTypeName",
        header: "Kategorija",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-normal">
            {row.original.partnerTypeName}
          </Badge>
        ),
      },
      {
        accessorKey: "commissionPercent",
        header: "Provizija",
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.commissionPercent.toFixed(1)} %</span>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "default" : "outline"}>
            {row.original.isActive ? "Aktivan" : "Neaktivan"}
          </Badge>
        ),
      },
    ],
    [],
  )

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-destructive">Greška pri učitavanju partnera.</p>
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
                <UsersIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Partneri</h1>
                <p className="text-sm text-muted-foreground">
                  {isLoading ? "Učitavanje..." : `${partners.length} partnera · vanjski dobavljači i izvođači`}
                </p>
              </div>
            </div>
            <Button onClick={() => setSheetOpen(true)}>
              <PlusIcon className="h-4 w-4" /> Novi partner
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Tabs
              value={selectedTypeId === undefined ? "all" : String(selectedTypeId)}
              onValueChange={(v) => setSelectedTypeId(v === "all" ? undefined : Number(v))}
              className="flex-1 min-w-0"
            >
              <TabsList variant="line" className=" w-full justify-start">
                <TabsTrigger value="all">Svi</TabsTrigger>
                {partnerTypes.map((type) => (
                  <TabsTrigger key={type.id} value={String(type.id)}>
                    {type.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setTypeSheetOpen(true)}
              title="Dodaj tip partnera"
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
          <DataTable
            columns={columns}
            data={partners}
            isLoading={isLoading}
            searchKey="name"
            searchPlaceholder="Pretraži partnere..."
            onRowClick={(row) => navigate({ path: `/partners/${row.id}`, title: row.name })}
          />
        </div>
      </div>

      <NewPartnerSheet open={sheetOpen} onOpenChange={setSheetOpen} />
      <NewPartnerTypeSheet open={typeSheetOpen} onOpenChange={setTypeSheetOpen} />
    </>
  )
}

