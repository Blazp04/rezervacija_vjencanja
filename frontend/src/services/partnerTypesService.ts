import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import type { components } from "@/types/api";
import { apiRequest, queryClient } from "./apiClient";

export type PartnerTypeDto = components["schemas"]["PartnerTypeDto"];
export type CreatePartnerTypeRequest = components["schemas"]["CreatePartnerTypeRequest"];
export type UpdatePartnerTypeRequest = components["schemas"]["UpdatePartnerTypeRequest"];

const partnerTypesQueryOptions = queryOptions({
    queryKey: ["partnerTypes"],
    queryFn: () => apiRequest<PartnerTypeDto[]>("/api/partner-types"),
});

export function usePartnerTypes() {
    return useQuery(partnerTypesQueryOptions);
}

export function useCreatePartnerType() {
    return useMutation({
        mutationFn: (data: CreatePartnerTypeRequest) =>
            apiRequest<PartnerTypeDto>("/api/partner-types", { method: "POST", data }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partnerTypes"] }),
        meta: { successMessage: "Tip partnera kreiran." },
    });
}

export function useUpdatePartnerType() {
    return useMutation({
        mutationFn: ({ id, ...data }: UpdatePartnerTypeRequest & { id: number }) =>
            apiRequest<PartnerTypeDto>(`/api/partner-types/${id}`, { method: "PUT", data }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partnerTypes"] }),
        meta: { successMessage: "Tip partnera ažuriran." },
    });
}

export function useDeletePartnerType() {
    return useMutation({
        mutationFn: (id: number) =>
            apiRequest<boolean>(`/api/partner-types/${id}`, { method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partnerTypes"] }),
        meta: { successMessage: "Tip partnera obrisan." },
    });
}
