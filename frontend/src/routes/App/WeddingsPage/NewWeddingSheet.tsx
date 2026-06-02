import { useState } from "react"
import { HeartIcon } from "lucide-react"
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
import { useCreateWedding } from "@/services/weddingsService"
import { useWeddingTemplates } from "@/services/weddingTemplatesService"
import { useWorkspaceNavigate } from "@/routes/App/AppLayout/useWorkspaceNavigate"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const INITIAL_FORM = {
    name: "",
    date: "",
    time: "12:00",
    location: "",
    templateId: "",
    notes: "",
}

export function NewWeddingSheet({ open, onOpenChange }: Props) {
    const [form, setForm] = useState(INITIAL_FORM)
    const [errors, setErrors] = useState<Partial<Record<keyof typeof INITIAL_FORM, string>>>({})

    const createWedding = useCreateWedding()
    const navigate = useWorkspaceNavigate()
    const { data: templates = [] } = useWeddingTemplates()

    function set(key: keyof typeof INITIAL_FORM) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setForm(prev => ({ ...prev, [key]: e.target.value }))
            if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
        }
    }

    function validate() {
        const next: typeof errors = {}
        if (!form.name.trim()) next.name = "Naziv je obavezan."
        if (!form.date) next.date = "Datum je obavezan."
        return next
    }

    function handleClose() {
        setForm(INITIAL_FORM)
        setErrors({})
        onOpenChange(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length > 0) {
            setErrors(errs)
            return
        }

        const dateTime = new Date(`${form.date}T${form.time || "12:00"}:00`).toISOString()

        try {
            const result = await createWedding.mutateAsync({
                name: form.name.trim(),
                dateTime,
                location: form.location.trim() || null,
                templateId: form.templateId ? Number(form.templateId) : null,
                notes: form.notes.trim() || null,
            })
            handleClose()
            navigate({ path: `/weddings/${result.id}`, title: result.name })
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
                            <HeartIcon className="h-4 w-4" />
                        </div>
                        <SheetTitle>Novo vjenčanje</SheetTitle>
                    </div>
                    <SheetDescription>
                        Unesite osnovne podatke za novo vjenčanje.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
                    <div className="flex-1 overflow-y-auto px-4 py-2">
                        <FieldGroup>
                            <Field>
                                <Label htmlFor="nw-name">Naziv vjenčanja *</Label>
                                <Input
                                    id="nw-name"
                                    name="nw-name"
                                    placeholder="npr. Pero i Ana Kovač"
                                    value={form.name}
                                    onChange={set("name")}
                                    aria-invalid={!!errors.name}
                                />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field>
                                    <Label htmlFor="nw-date">Datum *</Label>
                                    <Input
                                        id="nw-date"
                                        name="nw-date"
                                        type="date"
                                        value={form.date}
                                        onChange={set("date")}
                                        aria-invalid={!!errors.date}
                                    />
                                    {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
                                </Field>
                                <Field>
                                    <Label htmlFor="nw-time">Vrijeme</Label>
                                    <Input
                                        id="nw-time"
                                        name="nw-time"
                                        type="time"
                                        value={form.time}
                                        onChange={set("time")}
                                    />
                                </Field>
                            </div>

                            <Field>
                                <Label htmlFor="nw-location">Lokacija</Label>
                                <Input
                                    id="nw-location"
                                    name="nw-location"
                                    placeholder="npr. Hotel Grand, Sarajevo"
                                    value={form.location}
                                    onChange={set("location")}
                                />
                            </Field>

                            {templates.length > 0 && (
                                <Field>
                                    <Label htmlFor="nw-template">Predložak</Label>
                                    <Select
                                        value={form.templateId}
                                        onValueChange={v => setForm(prev => ({ ...prev, templateId: v }))}
                                    >
                                        <SelectTrigger id="nw-template" name="nw-template" className="w-full">
                                            <SelectValue placeholder="Bez predloška..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {templates.map(t => (
                                                <SelectItem key={t.id} value={String(t.id)}>
                                                    {t.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}

                            <Field>
                                <Label htmlFor="nw-notes">Napomene</Label>
                                <Textarea
                                    id="nw-notes"
                                    name="nw-notes"
                                    placeholder="Interne napomene o vjenčanju..."
                                    value={form.notes}
                                    onChange={set("notes")}
                                    rows={3}
                                />
                            </Field>
                        </FieldGroup>
                    </div>

                    <SheetFooter className="border-t">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={createWedding.isPending}>
                            Odustani
                        </Button>
                        <Button type="submit" disabled={createWedding.isPending}>
                            {createWedding.isPending ? "Spremate..." : "Spremi vjenčanje"}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}