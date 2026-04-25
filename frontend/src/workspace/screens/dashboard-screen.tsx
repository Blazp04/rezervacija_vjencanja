import { LayoutDashboardIcon, HeartIcon, UsersIcon, CalendarIcon, TrendingUpIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWorkspaceNavigate } from "../use-workspace-navigate"

const stats = [
  { label: "Aktivna vjenčanja", value: "24", trend: "+3 ovaj mjesec", icon: HeartIcon },
  { label: "Partneri", value: "47", trend: "12 aktivnih", icon: UsersIcon },
  { label: "Termini ovaj tjedan", value: "8", trend: "2 nepotvrđena", icon: CalendarIcon },
  { label: "Prihod (mjesec)", value: "€18.420", trend: "+12% MoM", icon: TrendingUpIcon },
]

export default function DashboardScreen() {
  const navigate = useWorkspaceNavigate()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <LayoutDashboardIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Pregled rezervacija vjenčanja</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription className="text-sm font-medium">{s.label}</CardDescription>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">{s.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{s.trend}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Brze akcije</CardTitle>
            <CardDescription>Otvori često korištene ekrane</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate({ path: "/weddings", title: "Vjenčanja", icon: "Heart" })}>
              <HeartIcon className="h-4 w-4" /> Vjenčanja
            </Button>
            <Button variant="outline" onClick={() => navigate({ path: "/partners", title: "Partneri", icon: "Users" })}>
              <UsersIcon className="h-4 w-4" /> Partneri
            </Button>
            <Button variant="outline" onClick={() => navigate({ path: "/calendar", title: "Kalendar", icon: "Calendar" })}>
              <CalendarIcon className="h-4 w-4" /> Kalendar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workspace ipak</CardTitle>
            <CardDescription>Multi-tab sučelje s podijeljenim panelima</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Ctrl+\</Badge>
              <span className="text-muted-foreground">Podijeli ekran horizontalno</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Ctrl+W</Badge>
              <span className="text-muted-foreground">Zatvori aktivni tab</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Ctrl+Tab</Badge>
              <span className="text-muted-foreground">Sljedeći tab</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Ctrl+1…9</Badge>
              <span className="text-muted-foreground">Skoči na N-ti tab</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
