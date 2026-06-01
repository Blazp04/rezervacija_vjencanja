import { useState } from "react"
import { TagIcon } from "lucide-react"
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
import { Field, FieldGroup } from "@/components/ui/field"
import { useCreatePartnerType } from "@/services/partnerTypesService"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const INITIAL = { name: "", code: "", hasBooking: false }

function toCode(name: string) {
    return name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "")
}

export function NewPartnerTypeSheet({ open, onOpenChange }: Props) {
    const [form, setForm] = useState(INITIAL)
    const [codeManual, setCodeManual] = useState(false)
    const [errors, setErrors] = useState<Partial<Record<"name" | "code", string>>>({})

    const createType = useCreatePartnerType()

    function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        const name = e.target.value
        setForm((prev) => ({
            ...prev,
            name,
            code: codeManual ? prev.code : toCode(name),
        }))
        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
    }

    function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
        setCodeManual(true)
        setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
        if (errors.code) setErrors((prev) => ({ ...prev, code: undefined }))
    }

    function handleClose() {
        setForm(INITIAL)
        setCodeManual(false)
        setErrors({})
        onOpenChange(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const errs: typeof errors = {}
        if (!form.name.trim()) errs.name = "Naziv je obavezan."
        if (!form.code.trim()) errs.code = "Kod je obavezan."
        if (Object.keys(errs).length > 0) { setErrors(errs); return }

        try {
            await createType.mutateAsync({
                name: form.name.trim(),
                code: form.code.trim(),
                hasBooking: form.hasBooking,
                fieldSchema: null,
            })
            handleClose()
        } catch {
            // apiClient handles error toasts globally
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="flex flex-col sm:max-w-sm w-full">
                <SheetHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <TagIcon className="h-4 w-4" />
                        </div>
                        <SheetTitle>Novi tip partnera</SheetTitle>
                    </div>
                    <SheetDescription>
                        Definirajte naziv i interni kod za novi tip partnera.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                    <div className="flex-1 px-4 py-2">
                        <FieldGroup>
                            <Field>
                                <Label htmlFor="npt-name">
                                    Naziv <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="npt-name"
                                    placeholder="npr. Dekorater"
                                    value={form.name}
                                    onChange={handleNameChange}
                                    aria-invalid={!!errors.name}
                                />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </Field>

                            <Field>
                                <Label htmlFor="npt-code">
                                    Interni kod <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="npt-code"
                                    placeholder="DEKORATER"
                                    value={form.code}
                                    onChange={handleCodeChange}
                                    aria-invalid={!!errors.code}
                                    className="font-mono uppercase"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Automatski se generira iz naziva. Može se ručno izmijeniti.
                                </p>
                                {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
                            </Field>

                            <Field orientation="horizontal">
                                <input
                                    id="npt-booking"
                                    name="npt-booking"
                                    type="checkbox"
                                    checked={form.hasBooking}
                                    onChange={(e) => setForm((prev) => ({ ...prev, hasBooking: e.target.checked }))}
                                    className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                                />
                                <div>
                                    <Label htmlFor="npt-booking">Podrška za rezervacije</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Ovaj tip partnera koristi kalendar i termine.
                                    </p>
                                </div>
                            </Field>
                        </FieldGroup>
                    </div>

                    <SheetFooter className="border-t">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={createType.isPending}>
                            Odustani
                        </Button>
                        <Button type="submit" disabled={createType.isPending}>
                            {createType.isPending ? "Spremate..." : "Spremi"}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}
