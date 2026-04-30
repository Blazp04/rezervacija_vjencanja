import { AlertCircleIcon } from "lucide-react"

export default function NotFoundScreen() {
  return (
    <div className="flex h-full items-center justify-center p-12">
      <div className="text-center max-w-md space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircleIcon className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold">Nedostupan ekran</h2>
        <p className="text-sm text-muted-foreground">
          Ruta nije pronađena ili nemate pristup. Možete zatvoriti ovaj tab.
        </p>
      </div>
    </div>
  )
}
