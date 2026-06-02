import { useState, useEffect } from "react"
import { HeartIcon, AlertCircleIcon, CheckCircle2Icon } from "lucide-react"
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Field, FieldGroup } from "@/components/ui/field"
import { useCreateWedding } from "@/services/weddingsService"
import { useWeddingTemplates, useWeddingTemplate } from "@/services/weddingTemplatesService"
import { usePartners } from "@/services/partnersService"
import { usePartnerTypes } from "@/services/partnerTypesService"
import { apiRequest, queryClient } from "@/services/apiClient"
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

// ── Step 2 – partner selection per type ───────────────────────────────────────

interface PartnerSelectionEntry {
    typeCode: string
    typeName: string
    required: boolean
    selectedPartnerId: string   // "" means none
}

interface Step2Props {
    selections: PartnerSelectionEntry[]
    onChange: (code: string, partnerId: string) => void
    partnersByTypeCode: Record<string, { id: number; name: string }[]>
}

function PartnerSelectionStep({ selections, onChange, partnersByTypeCode }: Step2Props) {
    const required = selections.filter(s => s.required)
    const optional = selections.filter(s => !s.required)

    const renderRow = (s: PartnerSelectionEntry) => {
        const partners = partnersByTypeCode[s.typeCode] ?? []
        const hasSelection = !!s.selectedPartnerId

        return (
            <div
                key={s.typeCode}
                className={`rounded-md border p-3 space-y-2 ${s.required && !hasSelection
                    ? "border-destructive/40 bg-destructive/5"
                    : hasSelection
                        ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
                        : "border-border"}`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{s.typeName}</span>
                        {s.required ? (
                            <Badge variant="destructive" className="text-[10px] h-4 px-1.5">Obavezan</Badge>
                        ) : (
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5">Opcionalan</Badge>
                        )}
                    </div>
                    {hasSelection && <CheckCircle2Icon className="h-4 w-4 text-green-600 shrink-0" />}
                    {s.required && !hasSelection && <AlertCircleIcon className="h-4 w-4 text-destructive shrink-0" />}
                </div>

                <Select
                    value={s.selectedPartnerId || "__none__"}
                    onValueChange={v => onChange(s.typeCode, v === "__none__" ? "" : v)}
                >
                    <SelectTrigger className="w-full h-8 text-sm">
                        <SelectValue placeholder={s.required ? "Odaberite partnera..." : "Preskočite ili odaberite..."} />
                    </SelectTrigger>
                    <SelectContent>
                        {!s.required && (
                            <SelectItem value="__none__">— Preskočite —</SelectItem>
                        )}
                        {partners.length === 0 ? (
                            <SelectItem value="__no_partners__" disabled>Nema dostupnih partnera ovog tipa</SelectItem>
                        ) : (
                            partners.map(p => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                    {p.name}
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {required.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-destructive">
                        Obavezni partneri — morate odabrati
                    </p>
                    {required.map(renderRow)}
                </div>
            )}
            {optional.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Opcionalni partneri — po želji
                    </p>
                    {optional.map(renderRow)}
                </div>
            )}
        </div>
    )
}

// ── Main component ────────────────────────────────────────────────────────────

export function NewWeddingSheet({ open, onOpenChange }: Props) {
    const [step, setStep] = useState<1 | 2>(1)
    const [form, setForm] = useState(INITIAL_FORM)
    const [errors, setErrors] = useState<Partial<Record<keyof typeof INITIAL_FORM, string>>>({})
    const [selections, setSelections] = useState<PartnerSelectionEntry[]>([])
    const createWedding = useCreateWedding()
    const navigate = useWorkspaceNavigate()
    const { data: templates = [] } = useWeddingTemplates()
    const { data: partnerTypes = [] } = usePartnerTypes()
    const { data: allPartners = [] } = usePartners()

    const selectedTemplateId = form.templateId ? Number(form.templateId) : 0
    const { data: templateDetail } = useWeddingTemplate(selectedTemplateId)

    // When template changes rebuild selections
    useEffect(() => {
        if (!templateDetail || !templateDetail.requiredPartnerTypes.length) {
            setSelections([])
            return
        }
        setSelections(
            templateDetail.requiredPartnerTypes.map(rpt => {
                const pt = partnerTypes.find(t => t.code === rpt.typeCode)
                return {
                    typeCode: rpt.typeCode,
                    typeName: pt?.name ?? rpt.typeCode,
                    required: rpt.required,
                    selectedPartnerId: "",
                }
            })
        )
    }, [templateDetail, partnerTypes])

    // Partners by type code (only active ones)
    const partnersByTypeCode: Record<string, { id: number; name: string }[]> = {}
    for (const p of allPartners) {
        if (!p.isActive) continue
        const code = (p as { partnerTypeCode?: string }).partnerTypeCode ?? ""
        if (!partnersByTypeCode[code]) partnersByTypeCode[code] = []
        partnersByTypeCode[code].push({ id: p.id, name: p.name })
    }

    const hasTemplate = !!form.templateId
    const hasPartnerTypes = selections.length > 0

    function set(key: keyof typeof INITIAL_FORM) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setForm(prev => ({ ...prev, [key]: e.target.value }))
            if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
        }
    }

    function validateStep1() {
        const next: typeof errors = {}
        if (!form.name.trim()) next.name = "Naziv je obavezan."
        if (!form.date) next.date = "Datum je obavezan."
        return next
    }

    function validateStep2(): string | null {
        const missing = selections.filter(s => s.required && !s.selectedPartnerId)
        if (missing.length > 0) {
            return `Morate odabrati partnere za: ${missing.map(s => s.typeName).join(", ")}`
        }
        return null
    }

    function handleClose() {
        setForm(INITIAL_FORM)
        setErrors({})
        setStep(1)
        setSelections([])
        onOpenChange(false)
    }

    async function handleStep1Next(e: React.FormEvent) {
        e.preventDefault()
        const errs = validateStep1()
        if (Object.keys(errs).length > 0) { setErrors(errs); return }

        if (hasTemplate && hasPartnerTypes) {
            setStep(2)
        } else {
            // No template partner types — create directly and navigate
            const result = await doCreate()
            if (result) {
                handleClose()
                navigate({ path: `/weddings/${result.id}`, title: result.name })
            }
        }
    }

    /** Creates the wedding and returns the result, or null on error. */
    async function doCreate() {
        const dateTime = new Date(`${form.date}T${form.time || "12:00"}:00`).toISOString()
        try {
            return await createWedding.mutateAsync({
                name: form.name.trim(),
                dateTime,
                location: form.location.trim() || null,
                templateId: form.templateId ? Number(form.templateId) : null,
                notes: form.notes.trim() || null,
            })
        } catch {
            return null
        }
    }

    async function handleStep2Submit(e: React.FormEvent) {
        e.preventDefault()
        const err = validateStep2()
        if (err) { alert(err); return }

        const result = await doCreate()
        if (!result) return

        // Add selected partners via direct API (hooks can't be called conditionally)
        for (const sel of selections) {
            if (!sel.selectedPartnerId) continue
            try {
                await apiRequest(`/api/weddings/${result.id}/partners`, {
                    method: "POST",
                    data: { partnerId: Number(sel.selectedPartnerId), catalogItemId: null, notes: null },
                })
            } catch { /* best-effort — detail page will show partial state */ }
        }
        queryClient.invalidateQueries({ queryKey: ["wedding-partners", result.id] })

        handleClose()
        navigate({ path: `/weddings/${result.id}`, title: result.name })
    }

    // Step indicator
    const totalSteps = hasTemplate && hasPartnerTypes ? 2 : 1

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="flex flex-col sm:max-w-md w-full overflow-y-auto">
                <SheetHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <HeartIcon className="h-4 w-4" />
                        </div>
                        <SheetTitle>Novo vjenčanje</SheetTitle>
                        {totalSteps > 1 && (
                            <span className="ml-auto text-xs text-muted-foreground">
                                Korak {step} / {totalSteps}
                            </span>
                        )}
                    </div>
                    <SheetDescription>
                        {step === 1
                            ? "Unesite osnovne podatke za novo vjenčanje."
                            : "Odaberite partnere prema predlošku. Crveno = obavezno."}
                    </SheetDescription>
                </SheetHeader>

                {/* ── STEP 1 ── */}
                {step === 1 && (
                    <form onSubmit={handleStep1Next} className="flex flex-col flex-1 overflow-y-auto">
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
                                            value={form.templateId || "__none__"}
                                            onValueChange={v => setForm(prev => ({ ...prev, templateId: v === "__none__" ? "" : v }))}
                                        >
                                            <SelectTrigger id="nw-template" name="nw-template" className="w-full">
                                                <SelectValue placeholder="Bez predloška..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__none__">— Bez predloška —</SelectItem>
                                                {templates.map(t => (
                                                    <SelectItem key={t.id} value={String(t.id)}>
                                                        {t.name}
                                                        {t.requiredPartnerTypesCount > 0 && (
                                                            <span className="ml-2 text-muted-foreground text-xs">
                                                                ({t.requiredPartnerTypesCount} tipova partnera)
                                                            </span>
                                                        )}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {hasTemplate && hasPartnerTypes && (
                                            <p className="text-xs text-primary mt-1">
                                                Sljedeći korak: odabir partnera prema predlošku
                                            </p>
                                        )}
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
                                {hasTemplate && hasPartnerTypes
                                    ? "Dalje – odabir partnera →"
                                    : createWedding.isPending ? "Spremate..." : "Spremi vjenčanje"}
                            </Button>
                        </SheetFooter>
                    </form>
                )}

                {/* ── STEP 2 ── */}
                {step === 2 && (
                    <form onSubmit={handleStep2Submit} className="flex flex-col flex-1 overflow-y-auto">
                        <div className="flex-1 overflow-y-auto px-4 py-2">
                            <PartnerSelectionStep
                                selections={selections}
                                partnersByTypeCode={partnersByTypeCode}
                                onChange={(code, partnerId) => {
                                    setSelections(prev =>
                                        prev.map(s => s.typeCode === code ? { ...s, selectedPartnerId: partnerId } : s)
                                    )
                                }}
                            />
                        </div>

                        <SheetFooter className="border-t">
                            <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={createWedding.isPending}>
                                ← Natrag
                            </Button>
                            <Button type="submit" disabled={createWedding.isPending}>
                                {createWedding.isPending ? "Kreiranje..." : "Spremi vjenčanje"}
                            </Button>
                        </SheetFooter>
                    </form>
                )}
            </SheetContent>
        </Sheet>
    )
}
