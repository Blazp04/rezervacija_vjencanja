import { CalendarIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const days = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"]
const events: Record<number, { label: string; color: string }> = {
  4: { label: "Ana & Marko", color: "bg-primary/15 text-primary" },
  11: { label: "Iva & Luka", color: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  18: { label: "Petra & Filip", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
}

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
            {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
              const e = events[d]
              return (
                <div
                  key={d}
                  className="aspect-square rounded-md border bg-background p-2 flex flex-col"
                >
                  <span className="text-xs font-medium text-muted-foreground">{d}</span>
                  {e && (
                    <div className={`mt-auto text-[10px] rounded px-1 py-0.5 truncate ${e.color}`}>
                      {e.label}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
