import { CalendarIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const days = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"]

export default function CalendarScreen() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <CalendarIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kalendar</h1>
          <p className="text-sm text-muted-foreground">Lipanj 2026</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
            {days.map((d) => (
              <div key={d} className="py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
              <div
                key={d}
                className="aspect-square rounded-md border bg-background p-2 flex flex-col"
              >
                <span className="text-xs font-medium text-muted-foreground">{d}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Kalendar termina dolazi uskoro.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
