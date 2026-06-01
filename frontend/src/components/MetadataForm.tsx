import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup } from "@/components/ui/field"
import { getMetadataSchema, parseMetadata, stringifyMetadata } from "@/utils/metadataSchemas"

interface Props {
    partnerTypeCode: string
    itemType: string
    value: string | null | undefined
    onChange: (json: string | null) => void
}

export function MetadataForm({ partnerTypeCode, itemType, value, onChange }: Props) {
    const schema = getMetadataSchema(partnerTypeCode, itemType)
    const parsed = parseMetadata(value)

    function handleFieldChange(key: string, fieldValue: unknown) {
        const updated = { ...parsed, [key]: fieldValue }
        onChange(stringifyMetadata(updated as Record<string, unknown>))
    }

    // No schema → freeform JSON textarea
    if (!schema) {
        return (
            <Field>
                <Label>Metadata (JSON)</Label>
                <Textarea
                    value={value ?? ""}
                    onChange={(e) => onChange(e.target.value.trim() || null)}
                    placeholder='{"key": "value"}'
                    rows={4}
                    className="font-mono text-xs"
                />
            </Field>
        )
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
