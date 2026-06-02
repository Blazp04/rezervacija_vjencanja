import { useEffect, useState } from "react"
import { SettingsIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAgencySettings, useUpdateAgencySettings } from "@/services/settingsService"

interface FormState {
    companyName: string
    oib: string
    address: string
    phone: string
    email: string
}

const EMPTY: FormState = { companyName: "", oib: "", address: "", phone: "", email: "" }

interface FieldErrors {
    companyName?: string
    email?: string
}

export default function SettingsScreen() {
    const { data: settings, isLoading } = useAgencySettings()
    const update = useUpdateAgencySettings()
    const [form, setForm] = useState<FormState>(EMPTY)
    const [errors, setErrors] = useState<FieldErrors>({})

    useEffect(() => {
        if (settings) {
            setForm({
                companyName: settings.companyName ?? "",
                oib: settings.oib ?? "",
                address: settings.address ?? "",
                phone: settings.phone ?? "",
                email: settings.email ?? "",
            })
        }
    }, [settings])

    function set(key: keyof FormState) {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            setForm(prev => ({ ...prev, [key]: e.target.value }))
            if (errors[key as keyof FieldErrors]) setErrors(prev => ({ ...prev, [key]: undefined }))
        }
    }

    function validate(): FieldErrors {
        const errs: FieldErrors = {}
        if (!form.companyName.trim()) errs.companyName = "Naziv tvrtke je obavezan."
        if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            errs.email = "Unesite ispravan e-mail."
        }
        return errs
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length > 0) { setErrors(errs); return }
        try {
            await update.mutateAsync({
                companyName: form.companyName.trim(),
                oib: form.oib.trim() || null,
                address: form.address.trim() || null,
                phone: form.phone.trim() || null,
                email: form.email.trim() || null,
            })
        } catch { /* handled globally */ }
    }

    return (
        <div className="p-6 space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <SettingsIcon className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Postavke</h1>
                    <p className="text-sm text-muted-foreground">Konfiguracija aplikacije</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tvrtka</CardTitle>
                    <CardDescription>Podaci koji se prikazuju na ponudama i fakturama</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p className="text-sm text-muted-foreground">Ucitavanje...</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="grid gap-1.5">
                                <Label htmlFor="company-name">
                                    Naziv <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="company-name"
                                    name="company-name"
                                    value={form.companyName}
                                    onChange={set("companyName")}
                                    aria-invalid={!!errors.companyName}
                                />
                                {errors.companyName && (
                                    <p className="text-xs text-destructive">{errors.companyName}</p>
                                )}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="company-oib">OIB</Label>
                                <Input id="company-oib" name="company-oib" value={form.oib} onChange={set("oib")} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="company-address">Adresa</Label>
                                <Input id="company-address" name="company-address" value={form.address} onChange={set("address")} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="company-phone">Telefon</Label>
                                <Input id="company-phone" name="company-phone" value={form.phone} onChange={set("phone")} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="company-email">E-mail</Label>
                                <Input
                                    id="company-email"
                                    name="company-email"
                                    type="email"
                                    value={form.email}
                                    onChange={set("email")}
                                    aria-invalid={!!errors.email}
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive">{errors.email}</p>
                                )}
                            </div>
                            <Button type="submit" className="w-fit" disabled={update.isPending}>
                                {update.isPending ? "Spremanje..." : "Spremi"}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
