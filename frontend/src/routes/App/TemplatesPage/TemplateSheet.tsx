import { useEffect, useState } from "react"
import { LayoutTemplateIcon } from "lucide-react"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { FieldGroup, Field } from "@/components/ui/field"
import { usePartnerTypes } from "@/services/partnerTypesService"
import {
  useWeddingTemplate,
  useCreateWeddingTemplate,
  useUpdateWeddingTemplate,
  type TemplatePartnerTypeDto,
} from "@/services/weddingTemplatesService"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  templateId: number | null
}

interface FormState {
  name: string
  description: string
  defaultNotes: string
  partnerTypes: Record<string, { selected: boolean; required: boolean }>
}

const EMPTY: FormState = {
  name: "",
  description: "",
  defaultNotes: "",
  partnerTypes: {},
}

export function TemplateSheet({ open, onOpenChange, templateId }: Props) {
  const isEdit = templateId !== null
  const [form, setForm] = useState<FormState>(EMPTY)
  const [nameError, setNameError] = useState<string | undefined>()

  const { data: partnerTypes = [] } = usePartnerTypes()
  const { data: existing } = useWeddingTemplate(templateId ?? 0)
  const create = useCreateWeddingTemplate()
  const update = useUpdateWeddingTemplate()
  const isPending = create.isPending || update.isPending

  useEffect(() => {
    if (!open) return
    if (isEdit && existing) {
      const map: FormState["partnerTypes"] = {}
      for (const pt of existing.requiredPartnerTypes) {
        map[pt.typeCode] = { selected: true, required: pt.required }
      }
      setForm({
        name: existing.name,
        description: existing.description ?? "",
        defaultNotes: existing.defaultNotes ?? "",
        partnerTypes: map,
      })
    } else if (!isEdit) {
      setForm(EMPTY)
    }
    setNameError(undefined)
  }, [open, isEdit, existing])

  function toggleType(code: string, selected: boolean) {
    setForm((prev) => ({
      ...prev,
      partnerTypes: {
        ...prev.partnerTypes,
        [code]: { selected, required: prev.partnerTypes[code]?.required ?? true },
      },
    }))
  }

  function toggleRequired(code: string, required: boolean) {
    setForm((prev) => ({
      ...prev,
      partnerTypes: {
        ...prev.partnerTypes,
        [code]: { selected: prev.partnerTypes[code]?.selected ?? true, required },
      },
    }))
  }

  function buildRequiredPartnerTypes(): TemplatePartnerTypeDto[] {
    return Object.entries(form.partnerTypes)
      .filter(([, v]) => v.selected)
      .map(([typeCode, v]) => ({ typeCode, required: v.required }))
  }

  function handleClose() {
    setForm(EMPTY)
    setNameError(undefined)
    onOpenChange(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setNameError("Naziv je obavezan.")
      return
    }
    const requiredPartnerTypes = buildRequiredPartnerTypes()
    try {
      if (isEdit && templateId !== null) {
        await update.mutateAsync({
          id: templateId,
          name: form.name.trim(),
          description: form.description.trim() || null,
          defaultNotes: form.defaultNotes.trim() || null,
          requiredPartnerTypes,
          isActive: true,
        })
      } else {
        await create.mutateAsync({
          name: form.name.trim(),
          description: form.description.trim() || null,
          defaultNotes: form.defaultNotes.trim() || null,
          requiredPartnerTypes,
        })
      }
      handleClose()
    } catch { /* global toast */ }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col sm:max-w-md w-full overflow-y-auto">
        <SheetHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <LayoutTemplateIcon className="h-4 w-4" />
            </div>
            <SheetTitle>{isEdit ? "Uredi predložak" : "Novi predložak"}</SheetTitle>
          </div>
          <SheetDescription>
            Predložak definira koje tipove partnera vjenčanje očekuje i zadane napomene.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex-1 overflow-y-auto px-4 py-2">
            <FieldGroup>
              <Field>
                <Label htmlFor="tpl-name">
                  Naziv <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tpl-name"
                  placeholder="npr. Veliko vjenčanje"
                  value={form.name}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, name: e.target.value }))
                    if (nameError) setNameError(undefined)
                  }}
                  aria-invalid={!!nameError}
                />
                {nameError && <p className="text-xs text-destructive">{nameError}</p>}
              </Field>

              <Field>
                <Label htmlFor="tpl-desc">Opis</Label>
                <Textarea
                  id="tpl-desc"
                  placeholder="Kratak opis predloška..."
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={2}
                />
              </Field>

              <Field>
                <Label htmlFor="tpl-notes">Zadane napomene</Label>
                <Textarea
                  id="tpl-notes"
                  placeholder="Smjernice koje se kopiraju u novo vjenčanje..."
                  value={form.defaultNotes}
                  onChange={(e) => setForm((p) => ({ ...p, defaultNotes: e.target.value }))}
                  rows={3}
                />
              </Field>

              <div className="border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Traženi tipovi partnera
                </p>
                <div className="space-y-2">
                  {partnerTypes.map((pt) => {
                    const state = form.partnerTypes[pt.code]
                    const selected = state?.selected ?? false
                    return (
                      <div
                        key={pt.id}
                        className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`pt-${pt.code}`}
                            checked={selected}
                            onCheckedChange={(c) => toggleType(pt.code, c === true)}
                          />
                          <Label htmlFor={`pt-${pt.code}`} className="cursor-pointer font-normal">
                            {pt.name}
                          </Label>
                        </div>
                        {selected && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {state?.required ? "Obavezan" : "Opcionalan"}
                            </span>
                            <Switch
                              checked={state?.required ?? true}
                              onCheckedChange={(c) => toggleRequired(pt.code, c)}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </FieldGroup>
          </div>

          <SheetFooter className="border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Odustani
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Spremanje..." : isEdit ? "Spremi promjene" : "Spremi predložak"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}