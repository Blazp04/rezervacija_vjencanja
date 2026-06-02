import { useState, useMemo } from "react"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, HeartIcon, ClockIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { apiRequest } from "@/services/apiClient"
import { useWorkspaceNavigate } from "@/routes/App/AppLayout/useWorkspaceNavigate"

interface CalendarWeddingDto {
    id: number
    name: string
    dateTime: string
    location: string | null
    status: string
}

interface CalendarBookingDto {
    id: number
    partnerId: number
    partnerName: string
    partnerTypeCode: string
    weddingId: number
    weddingName: string
    startDateTime: string
    endDateTime: string
}

interface CalendarMonthDto {
    weddings: CalendarWeddingDto[]
    bookings: CalendarBookingDto[]
}

function calendarQueryOptions(year: number, month: number) {
    return queryOptions({
        queryKey: ["calendar", year, month],
        queryFn: () => apiRequest<CalendarMonthDto>(`/api/calendar?year=${year}&month=${month}`),
    })
}

function useCalendar(year: number, month: number) {
    return useQuery(calendarQueryOptions(year, month))
}

const DAYS = ["Pon", "Uto", "Sri", "Cet", "Pet", "Sub", "Ned"]
const MONTHS = [
    "Sijecanj", "Veljaca", "Ozujak", "Travanj", "Svibanj", "Lipanj",
    "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac",
]

const WEDDING_STATUS_COLORS: Record<string, string> = {
    PREPARATION: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400",
    CONFIRMED: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400",
    COMPLETED: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400",
}

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month, 0).getDate()
}

function getFirstDow(year: number, month: number) {
    const d = new Date(year, month - 1, 1).getDay()
    return d === 0 ? 7 : d
}

export default function CalendarScreen() {
    const today = new Date()
    const [year, setYear] = useState(today.getFullYear())
    const [month, setMonth] = useState(today.getMonth() + 1)
    const navigate = useWorkspaceNavigate()

    const { data, isLoading, isError, refetch } = useCalendar(year, month)

    function prevMonth() {
        if (month === 1) { setYear(y => y - 1); setMonth(12) }
        else setMonth(m => m - 1)
    }
    function nextMonth() {
        if (month === 12) { setYear(y => y + 1); setMonth(1) }
        else setMonth(m => m + 1)
    }

    const daysInMonth = getDaysInMonth(year, month)
    const firstDow = getFirstDow(year, month)
    const todayDay = today.getFullYear() === year && today.getMonth() + 1 === month
        ? today.getDate() : -1

    const weddingsByDay = useMemo(() => {
        const map = new Map<number, CalendarWeddingDto[]>()
        for (const w of data?.weddings ?? []) {
            const d = new Date(w.dateTime).getDate()
            if (!map.has(d)) map.set(d, [])
            map.get(d)!.push(w)
        }
        return map
    }, [data])

    const bookingsByDay = useMemo(() => {
        const map = new Map<number, CalendarBookingDto[]>()
        for (const b of data?.bookings ?? []) {
            const start = new Date(b.startDateTime)
            const end = new Date(b.endDateTime)
            const mStart = new Date(year, month - 1, 1)
            const mEnd = new Date(year, month - 1, daysInMonth)
            const cur = new Date(Math.max(start.getTime(), mStart.getTime()))
            const last = new Date(Math.min(end.getTime(), mEnd.getTime()))
            while (cur <= last) {
                const d = cur.getDate()
                if (!map.has(d)) map.set(d, [])
                if (!map.get(d)!.some(x => x.id === b.id)) map.get(d)!.push(b)
                cur.setDate(cur.getDate() + 1)
            }
        }
        return map
    }, [data, year, month, daysInMonth])

    const cells: (number | null)[] = [
        ...Array<null>(firstDow - 1).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]
    while (cells.length % 7 !== 0) cells.push(null)

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <CalendarIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Kalendar</h1>
                            <p className="text-sm text-muted-foreground">{MONTHS[month - 1]} {year}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={prevMonth}>
                            <ChevronLeftIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth() + 1) }}>
                            Danas
                        </Button>
                        <Button variant="outline" size="icon" onClick={nextMonth}>
                            <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <HeartIcon className="h-3 w-3 text-primary" /> Vjencanje
                    </span>
                    <span className="flex items-center gap-1.5">
                        <ClockIcon className="h-3 w-3 text-amber-500" /> Zauzet partner
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-7 gap-1 mb-1">
                    {DAYS.map(d => (
                        <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
                    ))}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-sm text-muted-foreground">Ucitavanje kalendara...</p>
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <p className="text-sm text-destructive font-medium">Greska: /api/calendar nije dostupan.</p>
                        <p className="text-xs text-muted-foreground">Restartaj backend da se ucita novi CalendarController.</p>
                        <button onClick={() => refetch()} className="text-xs text-primary underline cursor-pointer hover:opacity-75">
                            Pokusaj ponovo
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-7 gap-1">
                        {cells.map((day, idx) => {
                            if (day === null) return <div key={`e-${idx}`} className="min-h-[90px]" />
                            const weddings = weddingsByDay.get(day) ?? []
                            const bookings = bookingsByDay.get(day) ?? []
                            const isToday = day === todayDay
                            const total = weddings.length + bookings.length
                            return (
                                <div
                                    key={day}
                                    className={[
                                        "min-h-[90px] rounded-md border p-1.5 flex flex-col gap-0.5",
                                        isToday ? "border-primary bg-primary/5" : "border-border bg-background",
                                    ].join(" ")}
                                >
                                    <span className={["text-[11px] font-semibold self-start px-0.5 mb-0.5", isToday ? "text-primary" : "text-muted-foreground"].join(" ")}>
                                        {day}
                                    </span>
                                    {weddings.map(w => (
                                        <button
                                            key={w.id}
                                            onClick={() => navigate({ path: `/weddings/${w.id}`, title: w.name })}
                                            className={["w-full text-left rounded px-1.5 py-0.5 border text-[10px] leading-snug font-medium truncate cursor-pointer hover:opacity-75 transition-opacity", WEDDING_STATUS_COLORS[w.status] ?? "bg-primary/10 text-primary border-primary/20"].join(" ")}
                                            title={w.name + (w.location ? ` - ${w.location}` : "")}
                                        >
                                            <HeartIcon className="h-2.5 w-2.5 inline mr-0.5 shrink-0" />
                                            {w.name}
                                        </button>
                                    ))}
                                    {bookings.slice(0, Math.max(0, 3 - weddings.length)).map(b => (
                                        <div
                                            key={b.id}
                                            className="w-full rounded px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 text-[10px] leading-snug truncate"
                                            title={`${b.partnerName} - ${b.weddingName}`}
                                        >
                                            <ClockIcon className="h-2.5 w-2.5 inline mr-0.5 shrink-0" />
                                            {b.partnerName}
                                        </div>
                                    ))}
                                    {total > 3 && (
                                        <span className="text-[10px] text-muted-foreground px-1">+{total - 3} vise</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                {!isLoading && !isError && (
                    <div className="flex gap-4 mt-3 justify-end text-xs text-muted-foreground">
                        {(data?.weddings.length ?? 0) === 0 && (data?.bookings.length ?? 0) === 0
                            ? <span>Nema dogadaja u ovom mjesecu.</span>
                            : <><span>{data?.weddings.length ?? 0} vjencanja</span><span>{data?.bookings.length ?? 0} rezervacija</span></>
                        }
                    </div>
                )}
            </div>
        </div>
    )
}
