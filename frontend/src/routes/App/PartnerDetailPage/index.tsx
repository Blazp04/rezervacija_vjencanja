import { UsersIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePartner } from "@/services/partnersService"
import { useCatalogItems, type CatalogItemDto } from "@/services/catalogItemsService"
import { usePricingRules } from "@/services/pricingRulesService"

function PricingRulesList({ itemId }: { itemId: number }) {
    const { data: rules = [], isLoading } = usePricingRules(itemId)
    if (isLoading) return <p className="text-xs text-muted-foreground px-2 py-1">Učitavanje cijena...</p>
    if (rules.length === 0) return <p className="text-xs text-muted-foreground px-2 py-1">Nema posebnih cijena.</p>
    return (
        <div className="mt-2 divide-y border rounded-md">
            {rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between px-3 py-1.5 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] font-normal">{rule.ruleType}</Badge>
                        {rule.dayOfWeek != null && <span>Dan {rule.dayOfWeek}</span>}
                        {rule.specificDate && <span>{rule.specificDate}</span>}
                        {(rule.validFrom || rule.validTo) && (
                            <span>{rule.validFrom ?? "—"} → {rule.validTo ?? "—"}</span>
                        )}
                    </div>
                    {rule.price != null && (
                        <span className="tabular-nums font-medium text-foreground">
                            {rule.price.toLocaleString("hr-HR", { style: "currency", currency: "EUR" })}
                        </span>
                    )}
                </div>
            ))}
        </div>
    )
}

function CatalogItemRow({ item }: { item: CatalogItemDto }) {
    const [open, setOpen] = useState(false)
    return (
        <div className="py-2">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setOpen((v) => !v)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Prikaži cjenike"
                    >
                        {open ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                    </button>
                    <span className="font-medium">{item.name}</span>
                    {item.category && (
                        <Badge variant="secondary" className="ml-1 font-normal text-xs">
                            {item.category}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                    <span>{item.itemType}</span>
                    {item.basePrice != null && (
                        <span className="tabular-nums font-medium text-foreground">
                            {item.basePrice.toLocaleString("hr-HR", { style: "currency", currency: "EUR" })}
                        </span>
                    )}
                    {!item.isActive && <Badge variant="outline" className="text-xs">Neaktivno</Badge>}
                </div>
            </div>
            {open && <PricingRulesList itemId={item.id} />}
        </div>
    )
}

export default function PartnerDetailScreen({ params }: { params: Record<string, string> }) {
    const id = Number(params.id)
    const { data: partner, isLoading, isError } = usePartner(id)
    const { data: catalogItems = [] } = useCatalogItems(id)

    if (isLoading) {
        return (
            <div className="p-6">
                <p className="text-muted-foreground">Učitavanje...</p>
            </div>
        )
    }

    if (isError || !partner) {
        return (
            <div className="p-6">
                <p className="text-destructive">Partner nije pronađen.</p>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <UsersIcon className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{partner.name}</h1>
                    <p className="text-sm text-muted-foreground">{partner.partnerTypeName}</p>
                </div>
                <Badge variant={partner.isActive ? "default" : "outline"} className="ml-auto">
                    {partner.isActive ? "Aktivan" : "Neaktivan"}
                </Badge>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Kontakt</CardTitle>
                    </CardHeader>
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
                    <CardHeader>
                        <CardTitle>Uvjeti suradnje</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Provizija:</span> {partner.commissionPercent.toFixed(1)} %</p>
                        {partner.notes && <p><span className="text-muted-foreground">Napomene:</span> {partner.notes}</p>}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Katalog usluga ({catalogItems.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {catalogItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nema stavki u katalogu.</p>
                    ) : (
                        <div className="divide-y">
                            {catalogItems.map((item) => (
                                <CatalogItemRow key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
