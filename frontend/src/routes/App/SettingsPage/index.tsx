import { SettingsIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SettingsScreen() {
  return (
    <div className="p-6 space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <SettingsIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Postavke</h1>
          <p className="text-sm text-muted-foreground">Konfiguracija aplikacije</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tvrtka</CardTitle>
          <CardDescription>Podaci koji se prikazuju na ponudama i fakturama</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            <Label>Naziv</Label>
            <Input />
          </div>
          <div className="grid gap-2">
            <Label>OIB</Label>
            <Input />
          </div>
          <div className="grid gap-2">
            <Label>Adresa</Label>
            <Input />
          </div>
          <Button className="w-fit" disabled>Spremi</Button>
        </CardContent>
      </Card>
    </div>
  )
}
