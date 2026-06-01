import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch, apiRequest, queryClient, API_BASE_URL } from "./apiClient";

export interface WeddingPartnerDto {
    id: number;
    weddingId: number;
    partnerId: number;
    partnerName: string;
    partnerTypeCode: string;
    partnerTypeName: string;
    catalogItemId: number | null;
    catalogItemName: string | null;
    status: string;
    plannedPrice: number | null;
    actualPrice: number | null;
    commissionPercent: number | null;
    commissionAmount: number | null;
    clientPrice: number | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateWeddingPartnerRequest {
    partnerId: number;
    catalogItemId: number | null;
    notes: string | null;
}

export interface UpdateWeddingPartnerRequest {
    catalogItemId: number | null;
    notes: string | null;
}

export interface UpdateWeddingPartnerStatusRequest {
    status: string;
}

export interface ConfirmWeddingPartnerRequest {
    actualPrice: number;
    startDateTime: string;
    endDateTime: string;
    notes: string | null;
}

export interface PricingResultDto {
    basePrice: number;
    appliedRule: string;
    calculatedPrice: number;
    ruleDescription: string;
}

export interface ConflictErrorDto {
    message: string;
    conflictingWeddingName: string;
    conflictingWeddingDate: string;
    conflictStart: string;
    conflictEnd: string;
}

const weddingPartnersQueryOptions = (weddingId: number) =>
    queryOptions({
        queryKey: ["weddingPartners", { weddingId }],
        queryFn: () => apiRequest<WeddingPartnerDto[]>(`/api/weddings/${weddingId}/partners`),
        enabled: weddingId > 0,
    });

const pricingQueryOptions = (weddingId: number, catalogItemId: number | null) =>
    queryOptions({
        queryKey: ["pricing", { weddingId, catalogItemId }],
        queryFn: () => apiRequest<PricingResultDto>(`/api/weddings/${weddingId}/pricing?catalogItemId=${catalogItemId}`),
        enabled: weddingId > 0 && catalogItemId != null,
    });

export function useWeddingPartners(weddingId: number) {
    return useQuery(weddingPartnersQueryOptions(weddingId));
}

export function usePricing(weddingId: number, catalogItemId: number | null) {
    return useQuery(pricingQueryOptions(weddingId, catalogItemId));
}

function invalidateWeddingPartners(weddingId: number) {
    queryClient.invalidateQueries({ queryKey: ["weddingPartners", { weddingId }] });
}

export function useAddWeddingPartner(weddingId: number) {
    return useMutation({
        mutationFn: (data: CreateWeddingPartnerRequest) =>
            apiRequest<WeddingPartnerDto>(`/api/weddings/${weddingId}/partners`, { method: "POST", data }),
        onSuccess: () => invalidateWeddingPartners(weddingId),
        meta: { successMessage: "Partner dodan na vjenčanje." },
    });
}

export function useUpdateWeddingPartner(weddingId: number) {
    return useMutation({
        mutationFn: ({ wpId, ...data }: UpdateWeddingPartnerRequest & { wpId: number }) =>
            apiRequest<WeddingPartnerDto>(`/api/weddings/${weddingId}/partners/${wpId}`, { method: "PUT", data }),
        onSuccess: () => invalidateWeddingPartners(weddingId),
        meta: { successMessage: "Dodjela ažurirana." },
    });
}

export function useRemoveWeddingPartner(weddingId: number) {
    return useMutation({
        mutationFn: (wpId: number) =>
            apiRequest<boolean>(`/api/weddings/${weddingId}/partners/${wpId}`, { method: "DELETE" }),
        onSuccess: () => invalidateWeddingPartners(weddingId),
        meta: { successMessage: "Partner uklonjen." },
    });
}

export function useUpdateWeddingPartnerStatus(weddingId: number) {
    return useMutation({
        mutationFn: ({ wpId, status }: { wpId: number; status: string }) =>
            apiRequest<WeddingPartnerDto>(`/api/weddings/${weddingId}/partners/${wpId}/status`, {
                method: "PATCH",
                data: { status },
            }),
        onSuccess: () => invalidateWeddingPartners(weddingId),
    });
}

export function useConfirmWeddingPartner(weddingId: number) {
    return useMutation({
        mutationFn: async ({ wpId, ...data }: ConfirmWeddingPartnerRequest & { wpId: number }) => {
            // Use apiFetch directly so we can handle 409 conflict
            const body = await apiFetch<{ data: WeddingPartnerDto | ConflictErrorDto | null; error: string | null }>(
                `/api/weddings/${weddingId}/partners/${wpId}/confirm`,
                { method: "PATCH", data }
            );
            if (body.error) throw new Error(body.error);
            return body.data as WeddingPartnerDto;
        },
        onSuccess: () => invalidateWeddingPartners(weddingId),
        meta: { successMessage: "Partner potvrđen." },
    });
}

export async function downloadPdf(weddingId: number, type: "invoice" | "internal-report", filename: string) {
    const endpoint = type === "invoice" ? "invoice" : "internal-report";
    const res = await fetch(`${API_BASE_URL}/api/weddings/${weddingId}/${endpoint}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("bearer_token") || ""}`,
        },
    });

    if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Failed to generate PDF (${res.status})`);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
