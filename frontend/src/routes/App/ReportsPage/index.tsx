import { FileTextIcon } from "lucide-react"

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

      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <FileTextIcon className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-muted-foreground text-sm">Nema dostupnih izvještaja.</p>
      </div>
    </div>
  )
}
