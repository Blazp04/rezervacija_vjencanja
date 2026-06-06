import { useState } from "react"
import { PlusIcon, XIcon } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import { getMetadataSchema, parseMetadata, stringifyMetadata } from "@/utils/metadataSchemas"

interface Props {
    partnerTypeCode: string
    itemType: string
    value: string | null | undefined
    onChange: (json: string | null) => void
}

function KVEditor({ value, onChange }: { value: string | null | undefined; onChange: (json: string | null) => void }) {
    const parsed = parseMetadata(value)
    const initPairs = Object.entries(parsed).map(([k, v]) => ({ key: k, value: String(v ?? "") }))

    const [pairs, setPairs] = useState<{ key: string; value: string }[]>(
        initPairs.length > 0 ? initPairs : [{ key: "", value: "" }]
    )

    function emit(next: { key: string; value: string }[]) {
        const obj: Record<string, string> = {}
        for (const { key, value } of next) {
            if (key.trim()) obj[key.trim()] = value
        }
        onChange(Object.keys(obj).length > 0 ? JSON.stringify(obj) : null)
    }

    function update(index: number, field: "key" | "value", val: string) {
        const next = pairs.map((p, i) => (i === index ? { ...p, [field]: val } : p))
        setPairs(next)
        emit(next)
    }

    function addPair() {
        setPairs((prev) => [...prev, { key: "", value: "" }])
    }

    function removePair(index: number) {
        const next = pairs.filter((_, i) => i !== index)
        const final = next.length > 0 ? next : [{ key: "", value: "" }]
        setPairs(final)
        emit(final)
    }

    return (
        <div className="space-y-2">
            <Label>Dodatna polja</Label>
            {pairs.map((pair, i) => (
                <div key={i} className="flex gap-2 items-center">
                    <Input
                        placeholder="Ključ"
                        value={pair.key}
                        onChange={(e) => update(i, "key", e.target.value)}
                        className="flex-1"
                    />
                    <Input
                        placeholder="Vrijednost"
                        value={pair.value}
                        onChange={(e) => update(i, "value", e.target.value)}
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removePair(i)}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                        <XIcon className="h-3.5 w-3.5" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="text-xs" onClick={addPair}>
                <PlusIcon className="h-3 w-3" /> Dodaj polje
            </Button>
        </div>
    )
}

export function MetadataForm({ partnerTypeCode, itemType, value, onChange }: Props) {
    const schema = getMetadataSchema(partnerTypeCode, itemType)
    const parsed = parseMetadata(value)

    function handleFieldChange(key: string, fieldValue: unknown) {
        const updated = { ...parsed, [key]: fieldValue }
        onChange(stringifyMetadata(updated as Record<string, unknown>))
    }

    // No schema → dynamic KV editor
    if (!schema) {
        return <KVEditor value={value} onChange={onChange} />
    }

    return (
        <FieldGroup>
            {schema.map((field) => {
                const fieldValue = parsed[field.key]

                if (field.type === "boolean") {
                    return (
                        <div key={field.key} className="flex items-center gap-2">
                            <Checkbox
                                id={`meta-${field.key}`}
                                checked={!!fieldValue}
                                onCheckedChange={(checked) => handleFieldChange(field.key, checked)}
                            />
                            <Label htmlFor={`meta-${field.key}`}>{field.label}</Label>
                        </div>
                    )
                }

                if (field.type === "textarea") {
                    return (
                        <Field key={field.key}>
                            <Label htmlFor={`meta-${field.key}`}>{field.label}</Label>
                            <Textarea
                                id={`meta-${field.key}`}
                                value={String(fieldValue ?? "")}
                                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                rows={3}
                            />
                        </Field>
                    )
                }

                return (
                    <Field key={field.key}>
                        <Label htmlFor={`meta-${field.key}`}>{field.label}</Label>
                        <Input
                            id={`meta-${field.key}`}
                            type={field.type === "number" ? "number" : "text"}
                            value={String(fieldValue ?? "")}
                            onChange={(e) => {
                                const v = field.type === "number"
                                    ? (e.target.value === "" ? "" : Number(e.target.value))
                                    : e.target.value
                                handleFieldChange(field.key, v)
                            }}
                            step={field.type === "number" ? "any" : undefined}
                        />
                    </Field>
                )
            })}
        </FieldGroup>
    )
}
