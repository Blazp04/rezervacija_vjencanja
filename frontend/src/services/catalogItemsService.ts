import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import type { components } from "@/types/api";
import { apiRequest, queryClient } from "./apiClient";

export type CatalogItemDto = components["schemas"]["CatalogItemDto"];
export type CreateCatalogItemRequest = components["schemas"]["CreateCatalogItemRequest"];
export type UpdateCatalogItemRequest = components["schemas"]["UpdateCatalogItemRequest"];

const catalogItemsQueryOptions = (partnerId: number) =>
    queryOptions({
        queryKey: ["catalogItems", { partnerId }],
        queryFn: () => apiRequest<CatalogItemDto[]>(`/api/partners/${partnerId}/catalog-items`),
        enabled: partnerId > 0,
    });

export function useCatalogItems(partnerId: number) {
    return useQuery(catalogItemsQueryOptions(partnerId));
}

export function useCreateCatalogItem() {
    return useMutation({
        mutationFn: (data: CreateCatalogItemRequest) =>
            apiRequest<CatalogItemDto>("/api/catalog-items", { method: "POST", data }),
        onSuccess: (_data, variables) =>
            queryClient.invalidateQueries({ queryKey: ["catalogItems", { partnerId: variables.partnerId }] }),
        meta: { successMessage: "Stavka kataloga kreirana." },
    });
}

export function useUpdateCatalogItem() {
    return useMutation({
        mutationFn: ({ id, ...data }: UpdateCatalogItemRequest & { id: number }) =>
            apiRequest<CatalogItemDto>(`/api/catalog-items/${id}`, { method: "PUT", data }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalogItems"] }),
        meta: { successMessage: "Stavka kataloga ažurirana." },
    });
}

export function useDeleteCatalogItem() {
    return useMutation({
        mutationFn: (id: number) =>
            apiRequest<boolean>(`/api/catalog-items/${id}`, { method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalogItems"] }),
        meta: { successMessage: "Stavka kataloga obrisana." },
    });
}
