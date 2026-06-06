import {
    UsersIcon, PlusIcon, Trash2Icon, PencilIcon, CheckIcon, XIcon,
    CopyIcon, ChevronDownIcon, ChevronRightIcon, CalendarIcon, UploadIcon, DownloadIcon
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field, FieldGroup } from "@/components/ui/field"
import { usePartner, useClonePartner } from "@/services/partnersService"
import { useCatalogItems, useCreateCatalogItem, useUpdateCatalogItem, useDeleteCatalogItem } from "@/services/catalogItemsService"
import { usePricingRules, useCreatePricingRule, useDeletePricingRule } from "@/services/pricingRulesService"
import { useBandMembers, useCreateBandMember, useUpdateBandMember, useDeleteBandMember } from "@/services/bandMembersService"
import { useBookings, useAvailability } from "@/services/bookingsService"
import { MetadataForm } from "@/components/MetadataForm"
import { useWorkspaceNavigate } from "@/routes/App/AppLayout/useWorkspaceNavigate"
import { API_BASE_URL } from "@/services/apiClient"
import type { CatalogItemDto } from "@/services/catalogItemsService"
import type { BandMemberDto } from "@/services/bandMembersService"

const DAYS_OF_WEEK = [
    { value: 1, label: "Ponedjeljak" },
    { value: 2, label: "Utorak" },
    { value: 3, label: "Srijeda" },
    { value: 4, label: "Četvrtak" },
    { value: 5, label: "Petak" },
    { value: 6, label: "Subota" },
    { value: 7, label: "Nedjelja" },
]

function AddPricingRuleForm({ itemId, onClose }: { itemId: number; onClose: () => void }) {
    const [ruleType, setRuleType] = useState<"SPECIAL_DAY" | "SPECIFIC_DATE">("SPECIAL_DAY")
    const [dayOfWeek, setDayOfWeek] = useState("6")
    const [specificDate, setSpecificDate] = useState("")
    const [price, setPrice] = useState("")
    const [validFrom, setValidFrom] = useState("")
    const [validTo, setValidTo] = useState("")
    const create = useCreatePricingRule()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!price) return toast.error("Cijena je obavezna.")
        try {
            await create.mutateAsync({
                catalogItemId: itemId,
                ruleType,
                dayOfWeek: ruleType === "SPECIAL_DAY" ? Number(dayOfWeek) : null,
                specificDate: ruleType === "SPECIFIC_DATE" && specificDate ? specificDate : null,
                price: parseFloat(price),
                validFrom: validFrom || null,
                validTo: validTo || null,
            })
            onClose()
        } catch { /* global error toast handles it */ }
    }

    return (
        <form onSubmit={handleSubmit} className="mt-3 space-y-3 border rounded-md p-3 bg-muted/30">
            <FieldGroup>
                <Field>
                    <Label>Tip pravila</Label>
                    <Select value={ruleType} onValueChange={(v) => setRuleType(v as "SPECIAL_DAY" | "SPECIFIC_DATE")}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SPECIAL_DAY">Poseban dan</SelectItem>
                            <SelectItem value="SPECIFIC_DATE">Određeni datum</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                {ruleType === "SPECIAL_DAY" ? (
                    <Field>
                        <Label>Dan u tjednu</Label>
                        <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {DAYS_OF_WEEK.map((d) => (
                                    <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                ) : (
                    <Field>
                        <Label>Datum</Label>
                        <Input type="date" value={specificDate} onChange={(e) => setSpecificDate(e.target.value)} required />
                    </Field>
                )}
                <Field>
                    <Label>Cijena (EUR)</Label>
                    <Input type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                    <Field>
                        <Label>Vrijedi od</Label>
                        <Input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
                    </Field>
                    <Field>
                        <Label>Vrijedi do</Label>
                        <Input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} />
                    </Field>
                </div>
            </FieldGroup>
            <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={onClose}>Odustani</Button>
                <Button type="submit" size="sm" disabled={create.isPending}>Dodaj pravilo</Button>
            </div>
        </form>
    )
}

function PricingRulesSection({ item }: { item: CatalogItemDto }) {
    const [open, setOpen] = useState(false)
    const [showAddForm, setShowAddForm] = useState(false)
    const { data: rules = [], isLoading } = usePricingRules(item.id)
    const deleteRule = useDeletePricingRule()

    if (item.itemType === "SONG") return null

    const sorted = [...rules].sort((a, b) => {
        if (a.ruleType === "SPECIFIC_DATE" && b.ruleType !== "SPECIFIC_DATE") return -1
        if (a.ruleType !== "SPECIFIC_DATE" && b.ruleType === "SPECIFIC_DATE") return 1
        return 0
    })

    function dayLabel(day: number | null | undefined) {
        return DAYS_OF_WEEK.find((d) => d.value === day)?.label ?? `Dan ${day}`
    }

    return (
        <div className="mt-1">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
                {open ? <ChevronDownIcon className="h-3 w-3" /> : <ChevronRightIcon className="h-3 w-3" />}
                Cjenik ({rules.length} pravila)
            </button>

            {open && (
                <div className="mt-2 pl-2 space-y-2">
                    {item.basePrice != null && (
                        <p className="text-xs text-muted-foreground">
                            Osnovna cijena:{" "}
                            <span className="font-medium text-foreground">
                                {item.basePrice.toFixed(2)} KM
                            </span>
                        </p>
                    )}
                    {(item.priceMin != null || item.priceMax != null) && (
                        <p className="text-xs text-muted-foreground">
                            Raspon:{" "}
                            <span className="font-medium text-foreground">
                                {item.priceMin != null ? `${item.priceMin.toFixed(2)} KM` : "—"}
                                {" – "}
                                {item.priceMax != null ? `${item.priceMax.toFixed(2)} KM` : "—"}
                            </span>
                        </p>
                    )}

                    {isLoading ? (
                        <p className="text-xs text-muted-foreground">Učitavanje...</p>
                    ) : sorted.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Nema posebnih pravila cijena.</p>
                    ) : (
                        <div className="divide-y border rounded-md text-xs">
                            {sorted.map((rule) => (
                                <div key={rule.id} className="flex items-center justify-between px-3 py-1.5">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Badge variant="outline" className="text-[10px] font-normal">
                                            {rule.ruleType === "SPECIAL_DAY" ? "Poseban dan" : "Datum"}
                                        </Badge>
                                        {rule.dayOfWeek != null && <span>{dayLabel(rule.dayOfWeek)}</span>}
                                        {rule.specificDate && <span>{String(rule.specificDate)}</span>}
                                        {(rule.validFrom || rule.validTo) && (
                                            <span className="text-[10px]">
                                                {rule.validFrom ? String(rule.validFrom) : "—"} →{" "}
                                                {rule.validTo ? String(rule.validTo) : "—"}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="tabular-nums font-medium text-foreground">
                                            {rule.price.toLocaleString("hr-HR", { style: "currency", currency: "EUR" })}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => deleteRule.mutate(rule.id)}
                                            disabled={deleteRule.isPending}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2Icon className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {showAddForm ? (
                        <AddPricingRuleForm itemId={item.id} onClose={() => setShowAddForm(false)} />
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => setShowAddForm(true)}
                        >
                            <PlusIcon className="h-3 w-3" /> Dodaj pravilo
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}

interface CatalogItemFormProps {
    partnerId: number
    partnerTypeCode: string
    item?: CatalogItemDto
    onClose: () => void
}

function CatalogItemForm({ partnerId, partnerTypeCode, item, onClose }: CatalogItemFormProps) {
    const isEdit = !!item
    const [name, setName] = useState(item?.name ?? "")
    const [category, setCategory] = useState(item?.category ?? "")
    const [description] = useState(item?.description ?? "")
    const defaultItemType = ["FLORIST", "PASTRY"].includes(partnerTypeCode) ? "PRODUCT" : "SERVICE"
    const [itemType, setItemType] = useState(item?.itemType ?? defaultItemType)
    const [basePrice, setBasePrice] = useState(item?.basePrice?.toString() ?? "")
    const [priceMin, setPriceMin] = useState(item?.priceMin?.toString() ?? "")
    const [priceMax, setPriceMax] = useState(item?.priceMax?.toString() ?? "")
    const [metadata, setMetadata] = useState<string | null>(item?.metadata ?? null)

    const create = useCreateCatalogItem()
    const update = useUpdateCatalogItem()
    const isPending = create.isPending || update.isPending

    const showBasePrice = itemType !== "SONG"
    const showItemTypeSelector = partnerTypeCode === "BAND"

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) return toast.error("Naziv je obavezan.")
        const parsedMin = showBasePrice && priceMin ? parseFloat(priceMin) : null
        const parsedMax = showBasePrice && priceMax ? parseFloat(priceMax) : null
        if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
            return toast.error("Cijena od ne smije biti veća od cijene do.")
        }
        try {
            if (isEdit) {
                await update.mutateAsync({
                    id: item.id,
                    name: name.trim(),
                    category: category.trim() || null,
                    description: description.trim() || null,
                    itemType,
                    basePrice: showBasePrice && basePrice ? parseFloat(basePrice) : null,
                    priceMin: parsedMin,
                    priceMax: parsedMax,
                    metadata,
                    isActive: item.isActive,
                    sortOrder: item.sortOrder,
                })
            } else {
                await create.mutateAsync({
                    partnerId,
                    name: name.trim(),
                    category: category.trim() || null,
                    description: description.trim() || null,
                    itemType,
                    basePrice: showBasePrice && basePrice ? parseFloat(basePrice) : null,
                    priceMin: parsedMin,
                    priceMax: parsedMax,
                    metadata,
                })
            }
            onClose()
        } catch { /* global error toast */ }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FieldGroup>
                <Field>
                    <Label>Naziv <span className="text-destructive">*</span></Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Naziv stavke" />
                </Field>
                <Field>
                    <Label>Kategorija</Label>
                    <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="npr. Premium" />
                </Field>
                {showItemTypeSelector && (
                    <Field>
                        <Label>Tip</Label>
                        <Select value={itemType} onValueChange={setItemType}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SERVICE">Usluga</SelectItem>
                                <SelectItem value="SONG">Pjesma</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                )}
                {showBasePrice && (
                    <>
                        <Field>
                            <Label>Osnovna cijena (KM)</Label>
                            <Input
                                type="number" min={0} step="0.01"
                                value={basePrice}
                                onChange={(e) => setBasePrice(e.target.value)}
                                placeholder="Fiksna cijena koja uvijek vrijedi"
                            />
                            <p className="text-xs text-muted-foreground">Vrijedi uvijek — može se nadjačati posebnim cjenama</p>
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field>
                                <Label>Cijena od (KM)</Label>
                                <Input
                                    type="number" min={0} step="0.01"
                                    value={priceMin}
                                    onChange={(e) => setPriceMin(e.target.value)}
                                    placeholder="Minimum"
                                />
                            </Field>
                            <Field>
                                <Label>Cijena do (KM)</Label>
                                <Input
                                    type="number" min={0} step="0.01"
                                    value={priceMax}
                                    onChange={(e) => setPriceMax(e.target.value)}
                                    placeholder="Maksimum"
                                />
                            </Field>
                        </div>
                        <p className="text-xs text-muted-foreground -mt-2">Raspon za prikaz klijentu — informativno</p>
                    </>
                )}
            </FieldGroup>

            <div className="border-t pt-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Detalji</p>
                <MetadataForm
                    partnerTypeCode={partnerTypeCode}
                    itemType={itemType}
                    value={metadata}
                    onChange={setMetadata}
                />
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>Odustani</Button>
                <Button type="submit" size="sm" disabled={isPending}>
                    {isPending ? "Spremate..." : isEdit ? "Spremi promjene" : "Dodaj stavku"}
                </Button>
            </div>
        </form>
    )
}

function CatalogTab({
    partnerId,
    partnerTypeCode,
    onImport,
    onExport,
}: {
    partnerId: number
    partnerTypeCode: string
    onImport: () => void
    onExport: () => void
}) {
    const { data: items = [], isLoading } = useCatalogItems(partnerId)
    const deleteItem = useDeleteCatalogItem()
    const [addOpen, setAddOpen] = useState(false)
    const [editItem, setEditItem] = useState<CatalogItemDto | null>(null)
    const [deleteCandidate, setDeleteCandidate] = useState<CatalogItemDto | null>(null)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{items.length} stavki u katalogu</p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onExport}>
                        <DownloadIcon className="h-3.5 w-3.5" /> CSV izvoz
                    </Button>
                    <Button variant="outline" size="sm" onClick={onImport}>
                        <UploadIcon className="h-3.5 w-3.5" /> Uvezi CSV
                    </Button>
                    <Button size="sm" onClick={() => setAddOpen(true)}>
                        <PlusIcon className="h-3.5 w-3.5" /> Dodaj stavku
                    </Button>
                </div>
            </div>

            {addOpen && (
                <Card>
                    <CardHeader><CardTitle className="text-sm">Nova stavka kataloga</CardTitle></CardHeader>
                    <CardContent>
                        <CatalogItemForm
                            partnerId={partnerId}
                            partnerTypeCode={partnerTypeCode}
                            onClose={() => setAddOpen(false)}
                        />
                    </CardContent>
                </Card>
            )}

            {isLoading ? (
                <p className="text-sm text-muted-foreground">Učitavanje...</p>
            ) : items.length === 0 && !addOpen ? (
                <p className="text-sm text-muted-foreground">Nema stavki u katalogu.</p>
            ) : (
                <div className="divide-y border rounded-md">
                    {items.map((item) => (
                        <div key={item.id} className="py-3 px-4">
                            {editItem?.id === item.id ? (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Uredi stavku
                                    </p>
                                    <CatalogItemForm
                                        partnerId={partnerId}
                                        partnerTypeCode={partnerTypeCode}
                                        item={item}
                                        onClose={() => setEditItem(null)}
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">{item.name}</span>
                                                {item.category && (
                                                    <Badge variant="secondary" className="text-xs font-normal">{item.category}</Badge>
                                                )}
                                                <Badge variant="outline" className="text-xs font-normal">{item.itemType}</Badge>
                                                {!item.isActive && (
                                                    <Badge variant="outline" className="text-xs text-muted-foreground">Neaktivno</Badge>
                                                )}
                                            </div>
                                            {item.description && (
                                                <p className="text-xs text-muted-foreground">{item.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 ml-4 shrink-0">
                                            <div className="text-right space-y-0.5">
                                                {item.basePrice != null && (
                                                    <span className="tabular-nums text-sm font-medium block">
                                                        {item.basePrice.toFixed(2)} KM
                                                    </span>
                                                )}
                                                {(item.priceMin != null || item.priceMax != null) && (
                                                    <span className="tabular-nums text-xs text-muted-foreground block">
                                                        {item.priceMin != null ? `${item.priceMin.toFixed(2)}` : "—"}
                                                        {" – "}
                                                        {item.priceMax != null ? `${item.priceMax.toFixed(2)} KM` : "—"}
                                                    </span>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost" size="icon-sm"
                                                onClick={() => setEditItem(item)}
                                            >
                                                <PencilIcon className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost" size="icon-sm"
                                                onClick={() => setDeleteCandidate(item)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2Icon className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                    <PricingRulesSection item={item} />
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Delete confirmation dialog */}
            <Dialog open={!!deleteCandidate} onOpenChange={(o) => !o && setDeleteCandidate(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Obriši stavku</DialogTitle>
                        <DialogDescription>
                            Jeste li sigurni da želite obrisati &quot;{deleteCandidate?.name}&quot;? Ova akcija je nepovratna.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteCandidate(null)}>Odustani</Button>
                        <Button
                            variant="destructive"
                            disabled={deleteItem.isPending}
                            onClick={async () => {
                                await deleteItem.mutateAsync(deleteCandidate!.id)
                                setDeleteCandidate(null)
                            }}
                        >
                            Obriši
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

interface InlineMemberRowProps {
    partnerId: number
    member?: BandMemberDto
    onClose: () => void
}

function InlineMemberRow({ partnerId, member, onClose }: InlineMemberRowProps) {
    const isEdit = !!member
    const [name, setName] = useState(member?.name ?? "")
    const [role, setRole] = useState(member?.role ?? "")
    const [phone, setPhone] = useState(member?.phone ?? "")
    const [email, setEmail] = useState(member?.email ?? "")
    const create = useCreateBandMember(partnerId)
    const update = useUpdateBandMember(partnerId)
    const isPending = create.isPending || update.isPending

    async function handleSave() {
        if (!name.trim()) return toast.error("Ime je obavezno.")
        try {
            if (isEdit) {
                await update.mutateAsync({
                    id: member.id,
                    name: name.trim(),
                    role: role.trim() || null,
                    phone: phone.trim() || null,
                    email: email.trim() || null,
                })
            } else {
                await create.mutateAsync({
                    name: name.trim(),
                    role: role.trim() || null,
                    phone: phone.trim() || null,
                    email: email.trim() || null,
                })
            }
            onClose()
        } catch { /* global toast */ }
    }

    return (
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 px-3 py-2 bg-muted/30 border rounded-md text-sm">
            <Input placeholder="Ime *" value={name} onChange={(e) => setName(e.target.value)} className="h-7 text-xs" />
            <Input placeholder="Uloga" value={role} onChange={(e) => setRole(e.target.value)} className="h-7 text-xs" />
            <Input placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-7 text-xs" />
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-7 text-xs" />
            <div className="flex gap-1">
                <Button variant="ghost" size="icon-sm" onClick={handleSave} disabled={isPending}>
                    <CheckIcon className="h-3.5 w-3.5 text-green-600" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={onClose}>
                    <XIcon className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    )
}

function BandMembersTab({ partnerId }: { partnerId: number }) {
    const { data: members = [], isLoading } = useBandMembers(partnerId)
    const deleteMember = useDeleteBandMember(partnerId)
    const [showAdd, setShowAdd] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)
    const [deleteCandidate, setDeleteCandidate] = useState<BandMemberDto | null>(null)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{members.length} članova benda</p>
                <Button size="sm" onClick={() => { setShowAdd(true); setEditId(null) }}>
                    <PlusIcon className="h-3.5 w-3.5" /> Dodaj člana
                </Button>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <span>Ime</span>
                <span>Uloga</span>
                <span>Telefon</span>
                <span>Email</span>
                <span className="w-16"></span>
            </div>

            {isLoading ? (
                <p className="text-sm text-muted-foreground">Učitavanje...</p>
            ) : members.length === 0 && !showAdd ? (
                <p className="text-sm text-muted-foreground">Nema dodanih članova benda.</p>
            ) : (
                <div className="space-y-1">
                    {members.map((member) => (
                        editId === member.id ? (
                            <InlineMemberRow
                                key={member.id}
                                partnerId={partnerId}
                                member={member}
                                onClose={() => setEditId(null)}
                            />
                        ) : (
                            <div key={member.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 px-3 py-2 border rounded-md text-sm items-center">
                                <span className="font-medium">{member.name}</span>
                                <span className="text-muted-foreground">{member.role ?? "—"}</span>
                                <span className="text-muted-foreground">{member.phone ?? "—"}</span>
                                <span className="text-muted-foreground">{member.email ?? "—"}</span>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon-sm" onClick={() => setEditId(member.id)}>
                                        <PencilIcon className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost" size="icon-sm"
                                        onClick={() => setDeleteCandidate(member)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2Icon className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}

            {showAdd && (
                <InlineMemberRow partnerId={partnerId} onClose={() => setShowAdd(false)} />
            )}

            <Dialog open={!!deleteCandidate} onOpenChange={(o) => !o && setDeleteCandidate(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Obriši člana</DialogTitle>
                        <DialogDescription>
                            Jeste li sigurni da želite obrisati &quot;{deleteCandidate?.name}&quot;?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteCandidate(null)}>Odustani</Button>
                        <Button
                            variant="destructive"
                            disabled={deleteMember.isPending}
                            onClick={async () => {
                                await deleteMember.mutateAsync(deleteCandidate!.id)
                                setDeleteCandidate(null)
                            }}
                        >
                            Obriši
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function AvailabilityTab({ partnerId }: { partnerId: number }) {
    const { data: bookings = [], isLoading } = useBookings(partnerId)
    const [checkStart, setCheckStart] = useState("")
    const [checkEnd, setCheckEnd] = useState("")
    const [shouldCheck, setShouldCheck] = useState(false)
    const { data: availability, isFetching } = useAvailability(
        partnerId, checkStart, checkEnd, shouldCheck && !!checkStart && !!checkEnd
    )

    const now = new Date()
    const upcoming = bookings.filter((b) => new Date(b.startDateTime) >= now)
    const past = bookings.filter((b) => new Date(b.startDateTime) < now)

    function formatDt(dt: string) {
        return new Date(dt).toLocaleString("hr-HR", { dateStyle: "short", timeStyle: "short" })
    }

    const statusColors: Record<string, string> = {
        PROPOSED: "bg-gray-100 text-gray-700",
        OFFERED: "bg-yellow-100 text-yellow-700",
        CONFIRMED: "bg-green-100 text-green-700",
        CANCELLED: "bg-red-100 text-red-700",
    }

    return (
        <div className="space-y-6">
            {/* Availability check */}
            <Card>
                <CardHeader><CardTitle className="text-sm">Provjera dostupnosti</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Field>
                            <Label>Početak</Label>
                            <Input
                                type="datetime-local"
                                value={checkStart}
                                min="2020-01-01T00:00"
                                max="2099-12-31T23:59"
                                onChange={(e) => {
                                    const year = e.target.value.split("-")[0]
                                    if (year && year.length > 4) return
                                    setCheckStart(e.target.value)
                                    setShouldCheck(false)
                                }}
                            />
                        </Field>
                        <Field>
                            <Label>Kraj</Label>
                            <Input
                                type="datetime-local"
                                value={checkEnd}
                                min="2020-01-01T00:00"
                                max="2099-12-31T23:59"
                                onChange={(e) => {
                                    const year = e.target.value.split("-")[0]
                                    if (year && year.length > 4) return
                                    setCheckEnd(e.target.value)
                                    setShouldCheck(false)
                                }}
                            />
                        </Field>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => setShouldCheck(true)}
                        disabled={!checkStart || !checkEnd || isFetching}
                    >
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {isFetching ? "Provjeravam..." : "Provjeri dostupnost"}
                    </Button>
                    {availability && (
                        <div className={`rounded-md px-3 py-2 text-sm font-medium ${availability.available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                            {availability.available
                                ? "Partner je dostupan u odabranom terminu."
                                : `Partner nije dostupan — ${availability.conflicts.length} preklapanje(a).`}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Upcoming bookings */}
            <div>
                <h3 className="text-sm font-medium mb-2">Predstojeći termini ({upcoming.length})</h3>
                {isLoading ? (
                    <p className="text-sm text-muted-foreground">Učitavanje...</p>
                ) : upcoming.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nema predstojećih termina.</p>
                ) : (
                    <div className="divide-y border rounded-md">
                        {upcoming.map((b) => (
                            <div key={b.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                                <div>
                                    <p className="font-medium">{b.weddingName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDt(b.startDateTime)} — {formatDt(b.endDateTime)}
                                    </p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[b.weddingPartnerStatus] ?? ""}`}>
                                    {b.weddingPartnerStatus}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Past bookings */}
            {past.length > 0 && (
                <details>
                    <summary className="text-sm font-medium cursor-pointer text-muted-foreground hover:text-foreground">
                        Prošli termini ({past.length})
                    </summary>
                    <div className="mt-2 divide-y border rounded-md">
                        {past.map((b) => (
                            <div key={b.id} className="flex items-center justify-between px-4 py-2.5 text-sm opacity-60">
                                <div>
                                    <p className="font-medium">{b.weddingName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDt(b.startDateTime)} — {formatDt(b.endDateTime)}
                                    </p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[b.weddingPartnerStatus] ?? ""}`}>
                                    {b.weddingPartnerStatus}
                                </span>
                            </div>
                        ))}
                    </div>
                </details>
            )}
        </div>
    )
}

interface CsvImportModalProps {
    partnerId: number
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

type ImportStep = "upload" | "map" | "review"

interface PreviewData {
    headers: string[]
    preview: string[][]
}

interface ColumnMapping {
    name: string
    category: string
    description: string
    itemType: string
    basePrice: string
    metadata: string
}

const TARGET_FIELDS: Array<{ key: keyof ColumnMapping; label: string; required: boolean }> = [
    { key: "name", label: "Naziv", required: true },
    { key: "category", label: "Kategorija", required: false },
    { key: "description", label: "Opis", required: false },
    { key: "itemType", label: "Tip stavke", required: false },
    { key: "basePrice", label: "Osnovna cijena", required: false },
    { key: "metadata", label: "Metadata", required: false },
]

function downloadCsvTemplate() {
    const rows = [
        ["name", "category", "description", "itemType", "basePrice", "metadata"],
        ["Primjer usluge", "Premium", "Opis usluge", "SERVICE", "1500.00", ""],
    ]
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n")
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "catalog-template.csv"
    a.click()
    URL.revokeObjectURL(url)
}

function CsvImportModal({ partnerId, open, onOpenChange, onSuccess }: CsvImportModalProps) {
    const [step, setStep] = useState<ImportStep>("upload")
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<PreviewData | null>(null)
    const [mapping, setMapping] = useState<ColumnMapping>({
        name: "", category: "", description: "", itemType: "", basePrice: "", metadata: "",
    })
    const [isLoading, setIsLoading] = useState(false)
    const [totalRows, setTotalRows] = useState<number | null>(null)
    const [importResult, setImportResult] = useState<{ imported: number; skipped: number; skippedRows: Array<{ rowNumber: number; reason: string }> } | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault()
        setIsDragOver(false)
        const dropped = e.dataTransfer.files?.[0]
        if (dropped && dropped.name.endsWith(".csv")) {
            setFile(dropped)
        } else {
            toast.error("Molimo odaberite CSV datoteku.")
        }
    }

    function reset() {
        setStep("upload")
        setFile(null)
        setPreview(null)
        setTotalRows(null)
        setMapping({ name: "", category: "", description: "", itemType: "", basePrice: "", metadata: "" })
        setImportResult(null)
    }

    async function handlePreview() {
        if (!file) return
        setIsLoading(true)
        try {
            const text = await file.text()
            const dataLines = text.split("\n").filter((l) => l.trim().length > 0).length - 1
            setTotalRows(Math.max(0, dataLines))

            const form = new FormData()
            form.append("file", file)
            const token = localStorage.getItem("bearer_token") || ""
            const res = await fetch(`${API_BASE_URL}/api/partners/${partnerId}/catalog/import/preview`, {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: form,
            })
            const body = await res.json()
            if (!res.ok) throw new Error(body?.error ?? "Greška pri pregledu.")
            setPreview(body.data)
            setStep("map")
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Greška pri pregledu.")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleImport() {
        if (!file || !preview) return
        if (!mapping.name) { toast.error("Morate mapirati polje 'Naziv'."); return }
        setIsLoading(true)
        try {
            const mappingPayload = {
                name: mapping.name || null,
                category: mapping.category || null,
                description: mapping.description || null,
                itemType: mapping.itemType || null,
                basePrice: mapping.basePrice || null,
                metadata: mapping.metadata || null,
            }
            const form = new FormData()
            form.append("file", file)
            form.append("mapping", JSON.stringify(mappingPayload))
            const token = localStorage.getItem("bearer_token") || ""
            const res = await fetch(`${API_BASE_URL}/api/partners/${partnerId}/catalog/import`, {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: form,
            })
            const body = await res.json()
            if (!res.ok) throw new Error(body?.error ?? "Greška pri uvozu.")
            setImportResult(body.data)
            setStep("review")
            onSuccess()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Greška pri uvozu.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o) }}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Uvoz kataloga iz CSV-a</DialogTitle>
                    <DialogDescription>
                        {step === "upload" && "Korak 1/3 — Odaberite CSV datoteku"}
                        {step === "map" && "Korak 2/3 — Mapiranje stupaca"}
                        {step === "review" && "Korak 3/3 — Rezultati uvoza"}
                    </DialogDescription>
                </DialogHeader>

                {step === "upload" && (
                    <div className="space-y-4">
                        {/* Drag & drop zone */}
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                            onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true) }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={handleDrop}
                            className={[
                                "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors cursor-pointer",
                                isDragOver
                                    ? "border-primary bg-primary/5"
                                    : file
                                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                        : "border-muted-foreground/25 hover:border-muted-foreground/50",
                            ].join(" ")}
                            onClick={() => document.getElementById("csv-file-input")?.click()}
                        >
                            <UploadIcon className={["h-8 w-8", file ? "text-green-600" : "text-muted-foreground"].join(" ")} />
                            {file ? (
                                <>
                                    <p className="text-sm font-medium text-green-700 dark:text-green-400">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(file.size / 1024).toFixed(1)} KB — kliknite za zamjenu
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm font-medium">Povucite CSV ovdje ili kliknite za odabir</p>
                                    <p className="text-xs text-muted-foreground">Podržane datoteke: .csv</p>
                                </>
                            )}
                            <input
                                id="csv-file-input"
                                type="file"
                                accept=".csv"
                                className="sr-only"
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            />
                        </div>

                        <Button variant="link" size="sm" className="p-0 text-xs" onClick={downloadCsvTemplate}>
                            Preuzmi predložak CSV-a
                        </Button>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Odustani</Button>
                            <Button onClick={handlePreview} disabled={!file || isLoading}>
                                {isLoading ? "Učitavanje..." : "Dalje"}
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === "map" && preview && (
                    <div className="flex flex-col flex-1 min-h-0 gap-4 overflow-hidden">
                        <div className="overflow-y-auto flex-1 min-h-0 space-y-4 pr-1">
                            <div className="space-y-2">
                                {TARGET_FIELDS.map(({ key, label, required }) => (
                                    <div key={key} className="grid grid-cols-2 gap-3 items-center">
                                        <Label className="text-sm">
                                            {label}
                                            {required && <span className="text-destructive ml-1">*</span>}
                                        </Label>
                                        <Select
                                            value={mapping[key]}
                                            onValueChange={(v) => setMapping((m) => ({ ...m, [key]: v === "__skip__" ? "" : v }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="— preskoči —" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__skip__">— preskoči —</SelectItem>
                                                {preview.headers.map((h) => (
                                                    <SelectItem key={h} value={h}>{h}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </div>

                            {/* Preview table */}
                            <div>
                                <p className="text-xs text-muted-foreground mb-2">
                                    Pregled prvih redova iz datoteke:
                                </p>
                                <div className="overflow-x-auto border rounded-md">
                                    <table className="text-xs min-w-full">
                                        <thead>
                                            <tr className="bg-muted">
                                                {preview.headers.map((h) => (
                                                    <th key={h} className="px-3 py-1.5 text-left font-medium whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {preview.preview.map((row, i) => (
                                                <tr key={i} className="border-t">
                                                    {(row as string[]).map((cell, j) => (
                                                        <td key={j} className="px-3 py-1.5 text-muted-foreground whitespace-nowrap">{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setStep("upload")}>Nazad</Button>
                            <Button onClick={() => setStep("review")} disabled={!mapping.name}>
                                Dalje
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === "review" && !importResult && (
                    <div className="space-y-4">
                        <p className="text-sm">
                            Uvozit ćete <strong>{totalRows ?? "?"}</strong> {totalRows === 1 ? "red" : "redova"}.
                        </p>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setStep("map")}>Nazad</Button>
                            <Button onClick={handleImport} disabled={isLoading}>
                                {isLoading ? "Uvoz u tijeku..." : "Uvezi"}
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === "review" && importResult && (
                    <div className="space-y-4">
                        <div className="rounded-md border p-4 space-y-2">
                            <p className="font-medium text-sm">
                                ✓ Uvezeno {importResult.imported} stavki
                                {importResult.skipped > 0 && `, preskočeno ${importResult.skipped}`}
                            </p>
                        </div>
                        {importResult.skippedRows.length > 0 && (
                            <details>
                                <summary className="text-xs text-muted-foreground cursor-pointer">
                                    Preskočeni redovi ({importResult.skippedRows.length})
                                </summary>
                                <div className="mt-2 space-y-1 text-xs">
                                    {importResult.skippedRows.map((r) => (
                                        <p key={r.rowNumber} className="text-destructive">
                                            Red {r.rowNumber}: {r.reason}
                                        </p>
                                    ))}
                                </div>
                            </details>
                        )}
                        <DialogFooter>
                            <Button onClick={() => { reset(); onOpenChange(false) }}>Zatvori</Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default function PartnerDetailScreen({ params }: { params: Record<string, string> }) {
    const id = Number(params.id)
    const { data: partner, isLoading, isError } = usePartner(id)
    const clone = useClonePartner()
    const navigate = useWorkspaceNavigate()
    const [cloneDialogOpen, setCloneDialogOpen] = useState(false)
    const [importOpen, setImportOpen] = useState(false)
    const { data: items = [], refetch: refetchCatalog } = useCatalogItems(id)

    if (isLoading) {
        return <div className="p-6"><p className="text-muted-foreground">Učitavanje...</p></div>
    }

    if (isError || !partner) {
        return <div className="p-6"><p className="text-destructive">Partner nije pronađen.</p></div>
    }

    const isBand = partner.partnerTypeCode === "BAND"
    const hasBooking = ["BAND", "PHOTOGRAPHER", "VENUE"].includes(partner.partnerTypeCode)

    async function handleClone() {
        try {
            const cloned = await clone.mutateAsync(id)
            setCloneDialogOpen(false)
            navigate({ path: `/partners/${cloned.id}`, title: cloned.name })
        } catch { /* global toast */ }
    }

    function handleExport() {
        const token = localStorage.getItem("bearer_token") || ""
        const url = `${API_BASE_URL}/api/partners/${id}/catalog/export`
        const a = document.createElement("a")
        a.href = url
        if (token) {
            // For authenticated export, use fetch + blob
            fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
                .then((r) => r.blob())
                .then((blob) => {
                    const blobUrl = URL.createObjectURL(blob)
                    a.href = blobUrl
                    a.download = `catalog-${partner!.name}-${new Date().toISOString().slice(0, 10)}.csv`
                    a.click()
                    URL.revokeObjectURL(blobUrl)
                })
        } else {
            a.download = `catalog-${partner!.name}.csv`
            a.click()
        }
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                    <UsersIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-semibold tracking-tight truncate">{partner.name}</h1>
                    <p className="text-sm text-muted-foreground">{partner.partnerTypeName}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={partner.isActive ? "default" : "outline"}>
                        {partner.isActive ? "Aktivan" : "Neaktivan"}
                    </Badge>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCloneDialogOpen(true)}
                        disabled={clone.isPending}
                    >
                        <CopyIcon className="h-3.5 w-3.5" /> Kloniraj
                    </Button>
                </div>
            </div>

            {/* Info cards */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Kontakt</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {partner.address && <p><span className="text-muted-foreground">Adresa:</span> {partner.address}</p>}
                        {partner.phone && <p><span className="text-muted-foreground">Telefon:</span> {partner.phone}</p>}
                        {partner.email && <p><span className="text-muted-foreground">Email:</span> {partner.email}</p>}
                        {partner.website && (
                            <p>
                                <span className="text-muted-foreground">Web:</span>{" "}
                                <a href={partner.website} target="_blank" rel="noopener noreferrer" className="underline">
                                    {partner.website}
                                </a>
                            </p>
                        )}
                        {!partner.address && !partner.phone && !partner.email && !partner.website && (
                            <p className="text-muted-foreground">Nema kontakt podataka.</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Uvjeti suradnje</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Provizija:</span> {partner.commissionPercent.toFixed(1)} %</p>
                        {partner.notes && <p><span className="text-muted-foreground">Napomene:</span> {partner.notes}</p>}
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="catalog">
                <TabsList>
                    <TabsTrigger value="catalog">Katalog ({items.length})</TabsTrigger>
                    {isBand && <TabsTrigger value="members">Članovi benda</TabsTrigger>}
                    {hasBooking && <TabsTrigger value="availability">Dostupnost</TabsTrigger>}
                </TabsList>

                <TabsContent value="catalog" className="mt-4">
                    <CatalogTab
                        partnerId={id}
                        partnerTypeCode={partner.partnerTypeCode}
                        onImport={() => setImportOpen(true)}
                        onExport={handleExport}
                    />
                </TabsContent>

                {isBand && (
                    <TabsContent value="members" className="mt-4">
                        <BandMembersTab partnerId={id} />
                    </TabsContent>
                )}

                {hasBooking && (
                    <TabsContent value="availability" className="mt-4">
                        <AvailabilityTab partnerId={id} />
                    </TabsContent>
                )}
            </Tabs>

            {/* Clone dialog */}
            <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Kloniraj partnera</DialogTitle>
                        <DialogDescription>
                            Kloniraj &quot;{partner.name}&quot;? Bit će kreirana kopija s cijelim katalogom, cjenikom
                            {isBand ? " i članovima benda" : ""}. Naziv kopije bit će &quot;{partner.name} (kopija)&quot;.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCloneDialogOpen(false)}>Odustani</Button>
                        <Button onClick={handleClone} disabled={clone.isPending}>
                            {clone.isPending ? "Kloniranje..." : "Kloniraj"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* CSV Import modal */}
            <CsvImportModal
                partnerId={id}
                open={importOpen}
                onOpenChange={setImportOpen}
                onSuccess={() => refetchCatalog()}
            />
        </div>
    )
}
