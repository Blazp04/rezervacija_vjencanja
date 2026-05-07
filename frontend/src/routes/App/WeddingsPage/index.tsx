import { HeartIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WeddingsListScreen() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <HeartIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Vjenčanja</h1>
            <p className="text-sm text-muted-foreground">Upravljanje rezervacijama vjenčanja</p>
          </div>
        </div>
        <Button disabled>
          <PlusIcon className="h-4 w-4" /> Novo vjenčanje
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <HeartIcon className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-muted-foreground text-sm">Modul vjenčanja dolazi uskoro.</p>
      </div>
    </div>
  )
}
