import { useState } from "react"
import {
    HeartIcon, PlusIcon, Trash2Icon, CheckCircleIcon, FileTextIcon, FileBarChartIcon,
    ChevronDownIcon, AlertTriangleIcon, DownloadIcon, ClockIcon, PencilIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup } from "@/components/ui/field"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useWedding, useChangeWeddingStatus } from "@/services/weddingsService"
import { EditWeddingSheet } from "./EditWeddingSheet"
import { usePartners } from "@/services/partnersService"
import { useCatalogItems } from "@/services/catalogItemsService"
import {
    useWeddingPartners, useAddWeddingPartner, useRemoveWeddingPartner,
    useUpdateWeddingPartner, useUpdateWeddingPartnerStatus, useConfirmWeddingPartner,
    usePricing, downloadPdf, type WeddingPartnerDto
} from "@/services/weddingPartnersService"
import { toast } from "sonner"

const STATUS_LABELS: Record<string, string> = {
    PROPOSED: "Predložen",
    OFFERED: "Ponuđen",
    CONFIRMED: "Potvrđen",
    CANCELLED: "Otkazan",
}

function statusBadgeVariant(status: string): "secondary" | "outline" | "default" | "destructive" {
    if (status === "CANCELLED") return "destructive"
    return "outline"
}

function statusBadgeClass(status: string): string {
    if (status === "CONFIRMED") return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
    if (status === "OFFERED") return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
    return ""
}

function getAllowedTransitions(current: string): string[] {
    if (current === "PROPOSED") return ["OFFERED", "CANCELLED"]
    if (current === "OFFERED") return ["CONFIRMED", "CANCELLED"]
    if (current === "CONFIRMED") return ["CANCELLED"]
    return []
}

function fmt(value: number | null | undefined): string {
    if (value == null) return "—"
    return value.toLocaleString("hr-HR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " KM"
}

interface AddPartnerDialogProps {
    weddingId: number
    open: boolean
    onOpenChange: (open: boolean) => void
}

function AddPartnerDialog({ weddingId, open, onOpenChange }: AddPartnerDialogProps) {
    const [selectedPartnerId, setSelectedPartnerId] = useState("")
    const [selectedCatalogItemId, setSelectedCatalogItemId] = useState("")
    const [notes, setNotes] = useState("")

    const { data: partners = [] } = usePartners()

    const partnerId = selectedPartnerId ? Number(selectedPartnerId) : 0
    const catalogItemId = selectedCatalogItemId ? Number(selectedCatalogItemId) : null

    const { data: catalogItems = [] } = useCatalogItems(partnerId)
    const { data: pricing, isLoading: pricingLoading } = usePricing(weddingId, catalogItemId)

    const addPartner = useAddWeddingPartner(weddingId)

    function handleClose() {
        setSelectedPartnerId("")
        setSelectedCatalogItemId("")
        setNotes("")
        onOpenChange(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedPartnerId) return

        try {
            await addPartner.mutateAsync({
                partnerId: Number(selectedPartnerId),
                catalogItemId: catalogItemId,
                notes: notes.trim() || null,
            })
            handleClose()
        } catch {
            // Error handled globally
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Dodaj partnera</DialogTitle>
                    <DialogDescription>
                        Odaberite partnera i po želji uslugu iz kataloga.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="ap-partner">Partner *</Label>
                            <Select
                                value={selectedPartnerId}
                                onValueChange={(v) => {
                                    setSelectedPartnerId(v)
                                    setSelectedCatalogItemId("")
                                }}
                            >
                                <SelectTrigger id="ap-partner" name="ap-partner" className="w-full">
                                    <SelectValue placeholder="Odaberite partnera..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {partners.map(p => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.name}
                                            <span className="ml-2 text-muted-foreground text-xs">
                                                ({p.partnerTypeName})
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        {partnerId > 0 && (
                            <Field>
                                <Label htmlFor="ap-catalog">Usluga iz kataloga</Label>
                                <Select
                                    value={selectedCatalogItemId}
                                    onValueChange={setSelectedCatalogItemId}
                                >
                                    <SelectTrigger id="ap-catalog" name="ap-catalog" className="w-full">
                                        <SelectValue placeholder="Bez specifične usluge..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {catalogItems.filter(ci => ci.isActive).map(ci => (
                                            <SelectItem key={ci.id} value={String(ci.id)}>
                                                {ci.name}
                                                {ci.basePrice != null && (
                                                    <span className="ml-2 text-muted-foreground text-xs">
                                                        ({ci.basePrice.toFixed(2)} KM)
                                                    </span>
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {catalogItemId != null && (
                                    <div className="mt-1 rounded-md bg-muted px-3 py-2 text-sm">
                                        {pricingLoading ? (
                                            <span className="text-muted-foreground">Računam cijenu...</span>
                                        ) : pricing ? (
                                            pricing.appliedRule === "N/A" ? (
                                                <span className="text-muted-foreground">Cijena: N/A</span>
                                            ) : (
                                                <span>
                                                    <span className="font-medium">Planirana cijena: {fmt(pricing.calculatedPrice)}</span>
                                                    <span className="text-muted-foreground ml-2 text-xs">
                                                        ({pricing.ruleDescription})
                                                    </span>
                                                </span>
                                            )
                                        ) : null}
                                    </div>
                                )}
                            </Field>
                        )}

                        <Field>
                            <Label htmlFor="ap-notes">Napomene</Label>
                            <Textarea
                                id="ap-notes"
                                name="ap-notes"
                                placeholder="Interne napomene..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                rows={2}
                            />
                        </Field>
                    </FieldGroup>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={addPartner.isPending}>
                            Odustani
                        </Button>
                        <Button type="submit" disabled={!selectedPartnerId || addPartner.isPending}>
                            {addPartner.isPending ? "Dodajem..." : "Dodaj partnera"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

interface EditPartnerDialogProps {
    weddingId: number
    wp: WeddingPartnerDto
    open: boolean
    onOpenChange: (open: boolean) => void
}

function EditPartnerDialog({ weddingId, wp, open, onOpenChange }: EditPartnerDialogProps) {
    const [selectedCatalogItemId, setSelectedCatalogItemId] = useState(
        wp.catalogItemId ? String(wp.catalogItemId) : ""
    )
    const [notes, setNotes] = useState(wp.notes ?? "")

    const catalogItemId = selectedCatalogItemId ? Number(selectedCatalogItemId) : null
    const { data: catalogItems = [] } = useCatalogItems(wp.partnerId)
    const { data: pricing, isLoading: pricingLoading } = usePricing(weddingId, catalogItemId)
    const updatePartner = useUpdateWeddingPartner(weddingId)

    function handleClose() {
        onOpenChange(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        try {
            await updatePartner.mutateAsync({
                wpId: wp.id,
                catalogItemId,
                notes: notes.trim() || null,
            })
            handleClose()
        } catch {
            // Error handled globally
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Uredi dodjelu partnera</DialogTitle>
                    <DialogDescription>
                        {wp.partnerName} — {wp.partnerTypeName}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="ep-catalog">Usluga iz kataloga</Label>
                            <Select
                                value={selectedCatalogItemId}
                                onValueChange={setSelectedCatalogItemId}
                            >
                                <SelectTrigger id="ep-catalog" name="ep-catalog" className="w-full">
                                    <SelectValue placeholder="Bez specifične usluge..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {catalogItems.filter(ci => ci.isActive).map(ci => (
                                        <SelectItem key={ci.id} value={String(ci.id)}>
                                            {ci.name}
                                            {ci.basePrice != null && (
                                                <span className="ml-2 text-muted-foreground text-xs">
                                                    ({ci.basePrice.toFixed(2)} KM)
                                                </span>
                                            )}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {catalogItemId != null && (
                                <div className="mt-1 rounded-md bg-muted px-3 py-2 text-sm">
                                    {pricingLoading ? (
                                        <span className="text-muted-foreground">Računam cijenu...</span>
                                    ) : pricing ? (
                                        pricing.appliedRule === "N/A" ? (
                                            <span className="text-muted-foreground">Cijena: N/A</span>
                                        ) : (
                                            <span>
                                                <span className="font-medium">Planirana cijena: {fmt(pricing.calculatedPrice)}</span>
                                                <span className="text-muted-foreground ml-2 text-xs">
                                                    ({pricing.ruleDescription})
                                                </span>
                                            </span>
                                        )
                                    ) : null}
                                </div>
                            )}
                        </Field>

                        <Field>
                            <Label htmlFor="ep-notes">Napomene</Label>
                            <Textarea
                                id="ep-notes"
                                name="ep-notes"
                                placeholder="Interne napomene..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                rows={2}
                            />
                        </Field>
                    </FieldGroup>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={updatePartner.isPending}>
                            Odustani
                        </Button>
                        <Button type="submit" disabled={updatePartner.isPending}>
                            {updatePartner.isPending ? "Spreman..." : "Spremi"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

interface ConfirmDialogProps {
    weddingId: number
    wp: WeddingPartnerDto
    weddingDateTime: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

function ConfirmPartnerDialog({ weddingId, wp, weddingDateTime, open, onOpenChange }: ConfirmDialogProps) {
    const defaultStart = weddingDateTime.substring(0, 16)
    const defaultEnd = new Date(new Date(weddingDateTime).getTime() + 4 * 3600000)
        .toISOString().substring(0, 16)

    const [actualPrice, setActualPrice] = useState(String(wp.plannedPrice ?? ""))
    const [startDateTime, setStartDateTime] = useState(defaultStart)
    const [endDateTime, setEndDateTime] = useState(defaultEnd)
    const [notes, setNotes] = useState("")
    const [conflictError, setConflictError] = useState<string | null>(null)

    const confirm = useConfirmWeddingPartner(weddingId)

    function handleClose() {
        setConflictError(null)
        setNotes("")
        onOpenChange(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setConflictError(null)

        const price = parseFloat(actualPrice)
        if (isNaN(price) || price <= 0) {
            toast.error("Stvarna cijena mora biti veća od 0.")
            return
        }

        try {
            await confirm.mutateAsync({
                wpId: wp.id,
                actualPrice: price,
                startDateTime: new Date(startDateTime).toISOString(),
                endDateTime: new Date(endDateTime).toISOString(),
                notes: notes.trim() || null,
            })
            handleClose()
        } catch (err: unknown) {
            const status = (err as Error & { status?: number })?.status
            const msg = err instanceof Error ? err.message : "Greška"
            if (status === 409) {
                setConflictError(msg)
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Potvrdi partnera</DialogTitle>
                    <DialogDescription>
                        {wp.partnerName} — {wp.catalogItemName ?? wp.partnerTypeName}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="cp-price">Stvarna cijena (KM) *</Label>
                            <Input
                                id="cp-price"
                                name="cp-price"
                                type="number"
                                min={0.01}
                                step={0.01}
                                placeholder="0.00"
                                value={actualPrice}
                                onChange={e => setActualPrice(e.target.value)}
                            />
                            {wp.plannedPrice != null && (
                                <p className="text-xs text-muted-foreground">
                                    Planirana cijena: {fmt(wp.plannedPrice)}
                                </p>
                            )}
                        </Field>

                        <Field>
                            <Label htmlFor="cp-start">Početak usluge *</Label>
                            <Input
                                id="cp-start"
                                name="cp-start"
                                type="datetime-local"
                                value={startDateTime}
                                onChange={e => setStartDateTime(e.target.value)}
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="cp-end">Kraj usluge *</Label>
                            <Input
                                id="cp-end"
                                name="cp-end"
                                type="datetime-local"
                                value={endDateTime}
                                onChange={e => setEndDateTime(e.target.value)}
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="cp-notes">Napomene</Label>
                            <Textarea
                                id="cp-notes"
                                name="cp-notes"
                                placeholder="Napomene o rezervaciji..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                rows={2}
                            />
                        </Field>
                    </FieldGroup>

                    {conflictError && (
                        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                            <AlertTriangleIcon className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>{conflictError}</span>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={confirm.isPending}>
                            Odustani
                        </Button>
                        <Button type="submit" disabled={confirm.isPending}>
                            {confirm.isPending ? "Potvrđujem..." : "Potvrdi"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

interface StatusBadgeProps {
    wp: WeddingPartnerDto
    weddingId: number
    weddingDateTime: string
    onConfirmClick: (wp: WeddingPartnerDto) => void
}

function StatusBadgeDropdown({ wp, weddingId, weddingDateTime: _dt, onConfirmClick }: StatusBadgeProps) {
    const updateStatus = useUpdateWeddingPartnerStatus(weddingId)
    const allowed = getAllowedTransitions(wp.status)

    if (allowed.length === 0) {
        return (
            <Badge variant={statusBadgeVariant(wp.status)} className={statusBadgeClass(wp.status)}>
                {STATUS_LABELS[wp.status] ?? wp.status}
            </Badge>
        )
    }

    async function handleSelect(target: string) {
        if (target === "CONFIRMED") {
            onConfirmClick(wp)
            return
        }
        try {
            await updateStatus.mutateAsync({ wpId: wp.id, status: target })
        } catch {
            // handled globally
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 focus:outline-none">
                    <Badge variant={statusBadgeVariant(wp.status)} className={`cursor-pointer hover:opacity-80 transition-opacity ${statusBadgeClass(wp.status)}`}>
                        {STATUS_LABELS[wp.status] ?? wp.status}
                    </Badge>
                    <ChevronDownIcon className="h-3 w-3 text-muted-foreground" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {allowed.map(target => (
                    <DropdownMenuItem
                        key={target}
                        onClick={() => handleSelect(target)}
                        disabled={updateStatus.isPending}
                    >
                        {target === "CONFIRMED" && <CheckCircleIcon className="h-3.5 w-3.5 mr-1.5 text-green-600" />}
                        → {STATUS_LABELS[target] ?? target}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

interface PartnersTabProps {
    weddingId: number
    weddingDateTime: string
}

function PartnersTab({ weddingId, weddingDateTime }: PartnersTabProps) {
    const [addOpen, setAddOpen] = useState(false)
    const [editWp, setEditWp] = useState<WeddingPartnerDto | null>(null)
    const [confirmWp, setConfirmWp] = useState<WeddingPartnerDto | null>(null)
    const [removeWpId, setRemoveWpId] = useState<number | null>(null)

    const { data: wps = [], isLoading } = useWeddingPartners(weddingId)
    const removePartner = useRemoveWeddingPartner(weddingId)

    const confirmedWps = wps.filter(wp => wp.status === "CONFIRMED")
    const totalPlanned = confirmedWps.reduce((s, wp) => s + (wp.plannedPrice ?? 0), 0)
    const totalActual = confirmedWps.reduce((s, wp) => s + (wp.actualPrice ?? 0), 0)
    const totalCommission = confirmedWps.reduce((s, wp) => s + (wp.commissionAmount ?? 0), 0)
    const totalClient = confirmedWps.reduce((s, wp) => s + (wp.clientPrice ?? 0), 0)

    async function handleRemove() {
        if (!removeWpId) return
        try {
            await removePartner.mutateAsync(removeWpId)
        } catch {
            // handled globally
        } finally {
            setRemoveWpId(null)
        }
    }

    if (isLoading) {
        return <p className="text-sm text-muted-foreground py-8 text-center">Učitavanje partnera...</p>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{wps.length} partnera dodano</p>
                <Button size="sm" onClick={() => setAddOpen(true)}>
                    <PlusIcon className="h-4 w-4" /> Dodaj partnera
                </Button>
            </div>

            {wps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                    <HeartIcon className="h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                        Nema dodanih partnera. Kliknite "Dodaj partnera" da počnete.
                    </p>
                </div>
            ) : (
                <div className="rounded-md border overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Partner</th>
                                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Usluga</th>
                                <th className="text-right px-3 py-2 font-medium text-muted-foreground">Planirana</th>
                                <th className="text-right px-3 py-2 font-medium text-muted-foreground">Stvarna</th>
                                <th className="text-right px-3 py-2 font-medium text-muted-foreground">Prov. %</th>
                                <th className="text-right px-3 py-2 font-medium text-muted-foreground">Provizija</th>
                                <th className="text-right px-3 py-2 font-medium text-muted-foreground">Klijent</th>
                                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Status</th>
                                <th className="px-3 py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {wps.map(wp => (
                                <tr
                                    key={wp.id}
                                    className={`border-b last:border-0 transition-colors ${wp.status === "CANCELLED"
                                        ? "opacity-50"
                                        : "hover:bg-muted/30"
                                        }`}
                                >
                                    <td className="px-3 py-2">
                                        <span className={`font-medium ${wp.status === "CANCELLED" ? "line-through" : ""}`}>
                                            {wp.partnerName}
                                        </span>
                                        <div className="text-xs text-muted-foreground">
                                            <Badge variant="outline" className="text-[10px] font-normal py-0 px-1 h-4">
                                                {wp.partnerTypeName}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-muted-foreground">
                                        {wp.catalogItemName ?? <span className="italic text-xs">—</span>}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums">{fmt(wp.plannedPrice)}</td>
                                    <td className="px-3 py-2 text-right tabular-nums">{fmt(wp.actualPrice)}</td>
                                    <td className="px-3 py-2 text-right tabular-nums">
                                        {wp.commissionPercent != null ? `${wp.commissionPercent.toFixed(1)} %` : "—"}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums">{fmt(wp.commissionAmount)}</td>
                                    <td className="px-3 py-2 text-right tabular-nums font-medium">{fmt(wp.clientPrice)}</td>
                                    <td className="px-3 py-2">
                                        <StatusBadgeDropdown
                                            wp={wp}
                                            weddingId={weddingId}
                                            weddingDateTime={weddingDateTime}
                                            onConfirmClick={setConfirmWp}
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        {wp.status !== "CONFIRMED" && (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setEditWp(wp)}
                                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                                    title="Uredi dodjelu"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setRemoveWpId(wp.id)}
                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                    title="Ukloni partnera"
                                                >
                                                    <Trash2Icon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                        {wps.length > 0 && (
                            <tfoot>
                                <tr className="border-t bg-muted/50 font-medium">
                                    <td colSpan={2} className="px-3 py-2 text-sm">Ukupno</td>
                                    <td className="px-3 py-2 text-right tabular-nums text-sm">{fmt(totalPlanned)}</td>
                                    <td className="px-3 py-2 text-right tabular-nums text-sm">{fmt(totalActual)}</td>
                                    <td />
                                    <td className="px-3 py-2 text-right tabular-nums text-sm text-green-700">{fmt(totalCommission)}</td>
                                    <td className="px-3 py-2 text-right tabular-nums text-sm font-bold">{fmt(totalClient)}</td>
                                    <td colSpan={2} />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            )}

            <AddPartnerDialog weddingId={weddingId} open={addOpen} onOpenChange={setAddOpen} />

            {editWp && (
                <EditPartnerDialog
                    weddingId={weddingId}
                    wp={editWp}
                    open={editWp !== null}
                    onOpenChange={(open) => { if (!open) setEditWp(null) }}
                />
            )}

            {confirmWp && (
                <ConfirmPartnerDialog
                    weddingId={weddingId}
                    wp={confirmWp}
                    weddingDateTime={weddingDateTime}
                    open={confirmWp !== null}
                    onOpenChange={(open) => { if (!open) setConfirmWp(null) }}
                />
            )}

            <Dialog open={removeWpId !== null} onOpenChange={open => { if (!open) setRemoveWpId(null) }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Ukloni partnera?</DialogTitle>
                        <DialogDescription>
                            Ova akcija se ne može poništiti. Partner će biti uklonjen s ovog vjenčanja.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRemoveWpId(null)}>Odustani</Button>
                        <Button variant="destructive" onClick={handleRemove} disabled={removePartner.isPending}>
                            {removePartner.isPending ? "Uklanjam..." : "Ukloni"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

interface DocumentsTabProps {
    weddingId: number
    weddingName: string
    weddingDateTime: string
}

function DocumentsTab({ weddingId, weddingName, weddingDateTime }: DocumentsTabProps) {
    const [loading, setLoading] = useState<"invoice" | "report" | null>(null)
    const { data: wps = [] } = useWeddingPartners(weddingId)

    const hasUnconfirmed = wps.some(wp => wp.status !== "CONFIRMED" && wp.status !== "CANCELLED")
    const hasPartners = wps.length > 0

    const datePart = weddingDateTime ? new Date(weddingDateTime).toISOString().split("T")[0] : "datum"
    const safeName = weddingName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")

    async function handleDownload(type: "invoice" | "internal-report") {
        const loadingKey = type === "invoice" ? "invoice" : "report"
        setLoading(loadingKey as "invoice" | "report")
        try {
            const filename = type === "invoice"
                ? `racun-${safeName}-${datePart}.pdf`
                : `interni-obracun-${safeName}-${datePart}.pdf`
            await downloadPdf(weddingId, type, filename)
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Greška pri generiranju dokumenta.")
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="space-y-4">
            {!hasPartners && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Nema dodanih partnera. Dodajte i potvrdite partnere kako biste mogli generirati dokumente.
                </div>
            )}
            {hasPartners && hasUnconfirmed && (
                <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <AlertTriangleIcon className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                        Svi partneri moraju biti potvrđeni (ili otkazani) da bi se generirali dokumenti.
                    </span>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileTextIcon className="h-5 w-5 text-primary" />
                            Faktura za klijenta
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Dokument koji se predaje klijentu — prikazuje stvarne cijene s provizijom.
                        </p>
                        <Button
                            className="w-full"
                            disabled={hasUnconfirmed || !hasPartners || loading !== null}
                            onClick={() => handleDownload("invoice")}
                        >
                            {loading === "invoice" ? (
                                <span className="flex items-center gap-2">
                                    <ClockIcon className="h-4 w-4 animate-spin" /> Generiranje...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <DownloadIcon className="h-4 w-4" /> Generiraj fakturu
                                </span>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileBarChartIcon className="h-5 w-5 text-orange-600" />
                            Interni obračun
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Interni dokument agencije — razrada prihoda, troškova i zarade.{" "}
                            <span className="font-medium text-destructive">Nije za klijenta.</span>
                        </p>
                        <Button
                            variant="outline"
                            className="w-full"
                            disabled={hasUnconfirmed || !hasPartners || loading !== null}
                            onClick={() => handleDownload("internal-report")}
                        >
                            {loading === "report" ? (
                                <span className="flex items-center gap-2">
                                    <ClockIcon className="h-4 w-4 animate-spin" /> Generiranje...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <DownloadIcon className="h-4 w-4" /> Generiraj interni obračun
                                </span>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

const WEDDING_STATUS_LABELS: Record<string, string> = {
    PREPARATION: "Priprema",
    CONFIRMED: "Potvrđeno",
    COMPLETED: "Završeno",
    CANCELLED: "Otkazano",
}

function getWeddingTransitions(current: string): string[] {
    if (current === "PREPARATION") return ["CONFIRMED", "CANCELLED"]
    if (current === "CONFIRMED") return ["COMPLETED", "CANCELLED"]
    return []
}

export default function WeddingDetailScreen({ params }: { params: Record<string, string> }) {
    const id = Number(params.id)
    const { data: wedding, isLoading, isError } = useWedding(id)
    const changeStatus = useChangeWeddingStatus()
    const [editOpen, setEditOpen] = useState(false)

    if (isLoading) {
        return (
            <div className="p-6">
                <p className="text-sm text-muted-foreground">Učitavanje vjenčanja...</p>
            </div>
        )
    }

    if (isError || !wedding) {
        return (
            <div className="p-6">
                <p className="text-destructive text-sm">Vjenčanje nije pronađeno.</p>
            </div>
        )
    }

    const weddingDate = new Date(wedding.dateTime)
    const formattedDate = weddingDate.toLocaleDateString("hr-HR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    })
    const formattedTime = weddingDate.toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit" })

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <HeartIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-semibold tracking-tight truncate">{wedding.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {formattedDate} u {formattedTime}
                            {wedding.location && ` · ${wedding.location}`}
                        </p>
                    </div>
                    {(() => {
                        const transitions = getWeddingTransitions(wedding.status)
                        const badge = (
                            <Badge variant={wedding.status === "CONFIRMED" ? "default" : wedding.status === "CANCELLED" ? "destructive" : "secondary"}>
                                {WEDDING_STATUS_LABELS[wedding.status] ?? wedding.status}
                            </Badge>
                        )
                        if (transitions.length === 0) return badge
                        return (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-1 focus:outline-none">
                                        {badge}
                                        <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {transitions.map((target) => (
                                        <DropdownMenuItem
                                            key={target}
                                            disabled={changeStatus.isPending}
                                            onClick={() => changeStatus.mutate({ id, newStatus: target })}
                                        >
                                            → {WEDDING_STATUS_LABELS[target] ?? target}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )
                    })()}
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
                <Tabs defaultValue="info" className="flex flex-col h-full">
                    <div className="px-6 pt-4 border-b">
                        <TabsList variant="line" className="w-full justify-start">
                            <TabsTrigger value="info">Podaci</TabsTrigger>
                            <TabsTrigger value="partners">Partneri</TabsTrigger>
                            <TabsTrigger value="documents">Dokumenti</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <TabsContent value="info">
                            <div className="mb-4">
                                <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                                    <PencilIcon className="h-4 w-4" /> Uredi vjenčanje
                                </Button>
                            </div>
                            <div className="grid gap-4 lg:grid-cols-2 max-w-2xl">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Osnovni podaci</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <p><span className="text-muted-foreground">Naziv:</span> {wedding.name}</p>
                                        <p><span className="text-muted-foreground">Datum i vrijeme:</span> {formattedDate} u {formattedTime}</p>
                                        {wedding.location && (
                                            <p><span className="text-muted-foreground">Lokacija:</span> {wedding.location}</p>
                                        )}
                                        {wedding.templateName && (
                                            <p><span className="text-muted-foreground">Predložak:</span> {wedding.templateName}</p>
                                        )}
                                        <p><span className="text-muted-foreground">Status:</span> {WEDDING_STATUS_LABELS[wedding.status] ?? wedding.status}</p>
                                    </CardContent>
                                </Card>

                                {wedding.notes && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Napomene</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm whitespace-pre-wrap">{wedding.notes}</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="partners">
                            <PartnersTab weddingId={id} weddingDateTime={wedding.dateTime} />
                        </TabsContent>

                        <TabsContent value="documents">
                            <DocumentsTab
                                weddingId={id}
                                weddingName={wedding.name}
                                weddingDateTime={wedding.dateTime}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            <EditWeddingSheet wedding={wedding} open={editOpen} onOpenChange={setEditOpen} />
        </div>
    )
}