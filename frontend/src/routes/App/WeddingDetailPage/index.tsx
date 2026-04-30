import { useEffect } from "react"
import { HeartIcon, SaveIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useWorkspaceTab } from "@/routes/App/AppLayout/useWorkspaceTab"

export default function WeddingDetailScreen({ params }: { params: Record<string, string> }) {
  const { setDirty } = useWorkspaceTab()

  useEffect(() => {
    return () => setDirty(false)
  }, [setDirty])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <HeartIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Vjenčanje #{params.id}</h1>
            <p className="text-sm text-muted-foreground">Detalji rezervacije</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">U pripremi</Badge>
          <Button>
            <SaveIcon className="h-4 w-4" /> Spremi
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mladenci</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label>Mladenka</Label>
              <Input defaultValue="Ana Horvat" onChange={() => setDirty(true)} />
            </div>
            <div className="grid gap-2">
              <Label>Mladoženja</Label>
              <Input defaultValue="Marko Kovač" onChange={() => setDirty(true)} />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" defaultValue="ana.marko@example.com" onChange={() => setDirty(true)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Termin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label>Datum</Label>
              <Input type="date" defaultValue="2026-06-14" onChange={() => setDirty(true)} />
            </div>
            <div className="grid gap-2">
              <Label>Lokacija</Label>
              <Input defaultValue="Hotel Esplanade" onChange={() => setDirty(true)} />
            </div>
            <div className="grid gap-2">
              <Label>Broj uzvanika</Label>
              <Input type="number" defaultValue="120" onChange={() => setDirty(true)} />
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Tip: promijenite bilo koje polje da označite tab kao "dirty" — zatvaranje će tražiti potvrdu.
      </p>
    </div>
  )
}
