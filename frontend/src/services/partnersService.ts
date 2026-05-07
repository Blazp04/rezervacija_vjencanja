import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import type { components } from "@/types/api";
import { apiRequest, queryClient } from "./apiClient";

export type PartnerListDto = components["schemas"]["PartnerListDto"];
export type PartnerDto = NonNullable<components["schemas"]["PartnerDto"]>;
export type CreatePartnerRequest = components["schemas"]["CreatePartnerRequest"];
export type UpdatePartnerRequest = components["schemas"]["UpdatePartnerRequest"];

const partnersQueryOptions = (partnerTypeId?: number) =>
    queryOptions({
        queryKey: ["partners", { partnerTypeId }],
        queryFn: () => {
            const qs = partnerTypeId != null ? `?partnerTypeId=${partnerTypeId}` : "";
            return apiRequest<PartnerListDto[]>(`/api/partners${qs}`);
        },
    });

const partnerQueryOptions = (id: number) =>
    queryOptions({
        queryKey: ["partners", id],
        queryFn: () => apiRequest<PartnerDto>(`/api/partners/${id}`),
    });

export function usePartners(partnerTypeId?: number) {
    return useQuery(partnersQueryOptions(partnerTypeId));
}

export function usePartner(id: number) {
    return useQuery(partnerQueryOptions(id));
}

export function useCreatePartner() {
    return useMutation({
        mutationFn: (data: CreatePartnerRequest) =>
            apiRequest<PartnerDto>("/api/partners", { method: "POST", data }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partners"] }),
        meta: { successMessage: "Partner kreiran." },
    });
}

export function useUpdatePartner() {
    return useMutation({
        mutationFn: ({ id, ...data }: UpdatePartnerRequest & { id: number }) =>
            apiRequest<PartnerDto>(`/api/partners/${id}`, { method: "PUT", data }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partners"] }),
        meta: { successMessage: "Partner ažuriran." },
    });
}

export function useDeletePartner() {
    return useMutation({
        mutationFn: (id: number) =>
            apiRequest<boolean>(`/api/partners/${id}`, { method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partners"] }),
        meta: { successMessage: "Partner obrisan." },
    });
}
