import { FileTextIcon, DownloadIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const reports = [
  { title: "Mjesečni izvještaj — Travanj 2026", desc: "Sva vjenčanja, prihodi i partnerske fakture", size: "PDF · 1.2 MB" },
  { title: "Pregled partnera Q1 2026", desc: "Aktivnost, ocjene i provizije", size: "PDF · 642 KB" },
  { title: "CSV export rezervacija", desc: "Sirovi podaci za vanjsko knjigovodstvo", size: "CSV · 84 KB" },
]

export default function ReportsScreen() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <FileTextIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Izvještaji</h1>
          <p className="text-sm text-muted-foreground">Generirani PDF i CSV izvještaji</p>
        </div>
      </div>

      <div className="grid gap-3">
        {reports.map((r) => (
          <Card key={r.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{r.title}</CardTitle>
                <CardDescription>{r.desc}</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <DownloadIcon className="h-4 w-4" /> Preuzmi
              </Button>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">{r.size}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
