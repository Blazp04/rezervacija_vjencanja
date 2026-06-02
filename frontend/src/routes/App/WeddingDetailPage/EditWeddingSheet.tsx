import { useEffect, useState } from "react"
import { PencilIcon } from "lucide-react"
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Field, FieldGroup } from "@/components/ui/field"
import { useUpdateWedding, type WeddingDto } from "@/services/weddingsService"
import { useWeddingTemplates } from "@/services/weddingTemplatesService"

interface Props {
    wedding: WeddingDto
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditWeddingSheet({ wedding, open, onOpenChange }: Props) {
    const update = useUpdateWedding()
    const { data: templates = [] } = useWeddingTemplates()

    const [name, setName] = useState("")
    const [date, setDate] = useState("")
    const [time, setTime] = useState("12:00")
    const [location, setLocation] = useState("")
    const [templateId, setTemplateId] = useState("")
    const [notes, setNotes] = useState("")
    const [nameError, setNameError] = useState<string | undefined>()

    // Popuni formu iz vjencanja svaki put kad se Sheet otvori
    useEffect(() => {
        if (!open) return
        const d = new Date(wedding.dateTime)
        const pad = (n: number) => String(n).padStart(2, "0")
        setName(wedding.name)
        setDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`)
        setTime(`${pad(d.getHours())}:${pad(d.getMinutes())}`)
        setLocation(wedding.location ?? "")
        setTemplateId(wedding.templateId ? String(wedding.templateId) : "")
        setNotes(wedding.notes ?? "")
        setNameError(undefined)
    }, [open, wedding])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) {
            setNameError("Naziv je obavezan.")
            return
        }
        const dateTime = new Date(`${date}T${time || "12:00"}:00`).toISOString()
        try {
            await update.mutateAsync({
                id: wedding.id,
                name: name.trim(),
                dateTime,
                location: location.trim() || null,
                templateId: templateId ? Number(templateId) : null,
                notes: notes.trim() || null,
                status: wedding.status, // status se mijenja preko status dropdowna, ne ovdje
            })
            onOpenChange(false)
        } catch {
            // handled globally
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="flex flex-col sm:max-w-md w-full overflow-y-auto">
                <SheetHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <PencilIcon className="h-4 w-4" />
                        </div>
                        <SheetTitle>Uredi vjenčanje</SheetTitle>
                    </div>
                    <SheetDescription>
                        Promijenite osnovne podatke vjenčanja.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
                    <div className="flex-1 overflow-y-auto px-4 py-2">
                        <FieldGroup>
                            <Field>
                                <Label htmlFor="ew-name">Naziv vjenčanja *</Label>
                                <Input
                                    id="ew-name"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value)
                                        if (nameError) setNameError(undefined)
                                    }}
                                    aria-invalid={!!nameError}
                                />
                                {nameError && <p className="text-xs text-destructive">{nameError}</p>}
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field>
                                    <Label htmlFor="ew-date">Datum *</Label>
                                    <Input
                                        id="ew-date"
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="ew-time">Vrijeme</Label>
                                    <Input
                                        id="ew-time"
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                    />
                                </Field>
                            </div>

                            <Field>
                                <Label htmlFor="ew-location">Lokacija</Label>
                                <Input
                                    id="ew-location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </Field>

                            {templates.length > 0 && (
                                <Field>
                                    <Label htmlFor="ew-template">Predložak</Label>
                                    <Select
                                        value={templateId}
                                        onValueChange={setTemplateId}
                                    >
                                        <SelectTrigger id="ew-template" className="w-full">
                                            <SelectValue placeholder="Bez predloška..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {templates.map((t) => (
                                                <SelectItem key={t.id} value={String(t.id)}>
                                                    {t.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}

                            <Field>
                                <Label htmlFor="ew-notes">Napomene</Label>
                                <Textarea
                                    id="ew-notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                />
                            </Field>
                        </FieldGroup>
                    </div>

                    <SheetFooter className="border-t">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={update.isPending}>
                            Odustani
                        </Button>
                        <Button type="submit" disabled={update.isPending}>
                            {update.isPending ? "Spremanje..." : "Spremi promjene"}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}