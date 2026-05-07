import { useState } from "react"
import { UserPlusIcon } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { FieldGroup, Field } from "@/components/ui/field"
import { useCreatePartner } from "@/services/partnersService"
import { usePartnerTypes } from "@/services/partnerTypesService"
import { useWorkspaceNavigate } from "@/routes/App/AppLayout/useWorkspaceNavigate"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const INITIAL_FORM = {
    name: "",
    partnerTypeId: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    commissionPercent: "0",
    notes: "",
}

export function NewPartnerSheet({ open, onOpenChange }: Props) {
    const [form, setForm] = useState(INITIAL_FORM)
    const [errors, setErrors] = useState<Partial<Record<keyof typeof INITIAL_FORM, string>>>({})

    const { data: partnerTypes = [] } = usePartnerTypes()
    const createPartner = useCreatePartner()
    const navigate = useWorkspaceNavigate()

    function set(key: keyof typeof INITIAL_FORM) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setForm((prev) => ({ ...prev, [key]: e.target.value }))
            if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
        }
    }

    function validate() {
        const next: typeof errors = {}
        if (!form.name.trim()) next.name = "Naziv je obavezan."
        if (!form.partnerTypeId) next.partnerTypeId = "Odaberite tip partnera."
        const commission = parseFloat(form.commissionPercent)
        if (isNaN(commission) || commission < 0) next.commissionPercent = "Provizija mora biti ≥ 0."
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

        try {
            const result = await createPartner.mutateAsync({
                name: form.name.trim(),
                partnerTypeId: Number(form.partnerTypeId),
                address: form.address.trim() || null,
                phone: form.phone.trim() || null,
                email: form.email.trim() || null,
                website: form.website.trim() || null,
                commissionPercent: parseFloat(form.commissionPercent),
                notes: form.notes.trim() || null,
                extraFields: null,
            })
            handleClose()
            navigate({ path: `/partners/${result.id}`, title: result.name })
        } catch {
            // apiClient handles error toasts globally
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="flex flex-col sm:max-w-md w-full overflow-y-auto">
                <SheetHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <UserPlusIcon className="h-4 w-4" />
                        </div>
                        <SheetTitle>Novi partner</SheetTitle>
                    </div>
                    <SheetDescription>
                        Unesite podatke o novom partneru. Katalog i cjenik možete dodati nakon kreiranja.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
                    <div className="flex-1 overflow-y-auto px-4 py-2">
                        <FieldGroup>
                            <Field>
                                <Label htmlFor="np-name">
                                    Naziv <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="np-name"
                                    placeholder="npr. Bend Melodija"
                                    value={form.name}
                                    onChange={set("name")}
                                    aria-invalid={!!errors.name}
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">{errors.name}</p>
                                )}
                            </Field>

                            <Field>
                                <Label htmlFor="np-type">
                                    Tip partnera <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={form.partnerTypeId}
                                    onValueChange={(val) => {
                                        setForm((prev) => ({ ...prev, partnerTypeId: val }))
                                        if (errors.partnerTypeId)
                                            setErrors((prev) => ({ ...prev, partnerTypeId: undefined }))
                                    }}
                                >
                                    <SelectTrigger
                                        id="np-type"
                                        className="w-full"
                                        aria-invalid={!!errors.partnerTypeId}
                                    >
                                        <SelectValue placeholder="Odaberite tip..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {partnerTypes.map((t) => (
                                            <SelectItem key={t.id} value={String(t.id)}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.partnerTypeId && (
                                    <p className="text-xs text-destructive">{errors.partnerTypeId}</p>
                                )}
                            </Field>

                            <Field>
                                <Label htmlFor="np-commission">
                                    Provizija (%) <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="np-commission"
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={0.1}
                                    placeholder="0.0"
                                    value={form.commissionPercent}
                                    onChange={set("commissionPercent")}
                                    aria-invalid={!!errors.commissionPercent}
                                />
                                {errors.commissionPercent && (
                                    <p className="text-xs text-destructive">{errors.commissionPercent}</p>
                                )}
                            </Field>

                            <div className="border-t pt-4">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                                    Kontakt
                                </p>
                                <FieldGroup>
                                    <Field>
                                        <Label htmlFor="np-address">Adresa</Label>
                                        <Input
                                            id="np-address"
                                            placeholder="Ulica i broj, Grad"
                                            value={form.address}
                                            onChange={set("address")}
                                        />
                                    </Field>

                                    <Field>
                                        <Label htmlFor="np-phone">Telefon</Label>
                                        <Input
                                            id="np-phone"
                                            type="tel"
                                            placeholder="+385 91 234 5678"
                                            value={form.phone}
                                            onChange={set("phone")}
                                        />
                                    </Field>

                                    <Field>
                                        <Label htmlFor="np-email">E-mail</Label>
                                        <Input
                                            id="np-email"
                                            type="email"
                                            placeholder="partner@primjer.hr"
                                            value={form.email}
                                            onChange={set("email")}
                                        />
                                    </Field>

                                    <Field>
                                        <Label htmlFor="np-website">Web stranica</Label>
                                        <Input
                                            id="np-website"
                                            type="url"
                                            placeholder="https://www.primjer.hr"
                                            value={form.website}
                                            onChange={set("website")}
                                        />
                                    </Field>
                                </FieldGroup>
                            </div>

                            <div className="border-t pt-4">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                                    Napomene
                                </p>
                                <Field>
                                    <Label htmlFor="np-notes" className="sr-only">Napomene</Label>
                                    <Textarea
                                        id="np-notes"
                                        placeholder="Interne napomene o partneru..."
                                        value={form.notes}
                                        onChange={set("notes")}
                                        rows={3}
                                    />
                                </Field>
                            </div>
                        </FieldGroup>
                    </div>

                    <SheetFooter className="border-t">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={createPartner.isPending}>
                            Odustani
                        </Button>
                        <Button type="submit" disabled={createPartner.isPending}>
                            {createPartner.isPending ? "Spremate..." : "Spremi partnera"}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}
