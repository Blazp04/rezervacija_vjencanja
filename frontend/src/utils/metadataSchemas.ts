export type FieldType = "text" | "number" | "boolean" | "textarea"

export interface FieldDef {
    key: string
    label: string
    type: FieldType
}

// Key format: {PARTNER_TYPE_CODE}-{ITEM_TYPE}
export const METADATA_SCHEMAS: Record<string, FieldDef[]> = {
    "BAND-SERVICE": [
        { key: "durationHours", label: "Trajanje (sati)", type: "number" },
        { key: "setupMinutes",  label: "Priprema (min)",  type: "number" },
        { key: "includedItems", label: "Uključeno",       type: "text"   },
    ],
    "BAND-SONG": [
        { key: "artist",       label: "Izvođač",  type: "text" },
        { key: "genre",        label: "Žanr",     type: "text" },
        { key: "playlistName", label: "Playlist", type: "text" },
    ],
    "FLORIST-PRODUCT": [
        { key: "flowers",      label: "Cvijeće",          type: "text"    },
        { key: "materials",    label: "Materijali",        type: "text"    },
        { key: "photoUrl",     label: "URL fotografije",   type: "text"    },
        { key: "customizable", label: "Moguća prilagodba", type: "boolean" },
    ],
    "PASTRY-PRODUCT": [
        { key: "portionOptions", label: "Opcije porcija",  type: "text"    },
        { key: "flavors",        label: "Okusi",            type: "text"    },
        { key: "customizable",   label: "Moguća prilagodba", type: "boolean" },
    ],
    "PHOTOGRAPHER-SERVICE": [
        { key: "durationHours", label: "Trajanje (sati)",  type: "number"  },
        { key: "includesVideo", label: "Uključuje video",  type: "boolean" },
        { key: "includesDrone", label: "Uključuje dron",   type: "boolean" },
        { key: "includesAlbum", label: "Uključuje album",  type: "boolean" },
        { key: "photoCount",    label: "Broj fotografija", type: "number"  },
        { key: "deliveryDays",  label: "Isporuka (dani)",  type: "number"  },
    ],
    "VENUE-SERVICE": [
        { key: "menuType",  label: "Tip menija",  type: "text"     },
        { key: "priceType", label: "Tip cijene",  type: "text"     },
        { key: "includes",  label: "Uključuje",   type: "textarea" },
        { key: "dishes",    label: "Jela",         type: "textarea" },
    ],
    "CATERING-SERVICE": [
        { key: "priceType",  label: "Tip cijene",          type: "text"     },
        { key: "dishes",     label: "Jela",                type: "textarea" },
        { key: "minPersons", label: "Minimalan broj osoba", type: "number"  },
    ],
}

export function getMetadataSchema(partnerTypeCode: string, itemType: string): FieldDef[] | null {
    return METADATA_SCHEMAS[`${partnerTypeCode}-${itemType}`] ?? null
}

export function parseMetadata(metadata: string | null | undefined): Record<string, unknown> {
    if (!metadata) return {}
    try { return JSON.parse(metadata) }
    catch { return {} }
}

export function stringifyMetadata(obj: Record<string, unknown>): string | null {
    const cleaned = Object.fromEntries(
        Object.entries(obj).filter(([, v]) => v !== "" && v !== null && v !== undefined)
    )
    if (Object.keys(cleaned).length === 0) return null
    return JSON.stringify(cleaned)
}
