import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import type { components } from "@/types/api";
import { apiRequest, queryClient } from "./apiClient";

export type PricingRuleDto = components["schemas"]["PricingRuleDto"];
export type CreatePricingRuleRequest = components["schemas"]["CreatePricingRuleRequest"];
export type UpdatePricingRuleRequest = components["schemas"]["UpdatePricingRuleRequest"];

const pricingRulesQueryOptions = (catalogItemId: number) =>
    queryOptions({
        queryKey: ["pricingRules", { catalogItemId }],
        queryFn: () => apiRequest<PricingRuleDto[]>(`/api/catalog-items/${catalogItemId}/pricing-rules`),
    });

export function usePricingRules(catalogItemId: number) {
    return useQuery(pricingRulesQueryOptions(catalogItemId));
}

export function useCreatePricingRule() {
    return useMutation({
        mutationFn: (data: CreatePricingRuleRequest) =>
            apiRequest<PricingRuleDto>("/api/pricing-rules", { method: "POST", data }),
        onSuccess: (_data, variables) =>
            queryClient.invalidateQueries({ queryKey: ["pricingRules", { catalogItemId: variables.catalogItemId }] }),
        meta: { successMessage: "Cjenovni pravilo kreirano." },
    });
}

export function useUpdatePricingRule() {
    return useMutation({
        mutationFn: ({ id, ...data }: UpdatePricingRuleRequest & { id: number }) =>
            apiRequest<PricingRuleDto>(`/api/pricing-rules/${id}`, { method: "PUT", data }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pricingRules"] }),
        meta: { successMessage: "Cjenovni pravilo ažurirano." },
    });
}

export function useDeletePricingRule() {
    return useMutation({
        mutationFn: (id: number) =>
            apiRequest<boolean>(`/api/pricing-rules/${id}`, { method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pricingRules"] }),
        meta: { successMessage: "Cjenovni pravilo obrisano." },
    });
}
