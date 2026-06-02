import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import type { components } from "@/types/api";
import { apiRequest, queryClient } from "./apiClient";

export type WeddingTemplateListDto = components["schemas"]["WeddingTemplateListDto"];
export type WeddingTemplateDto = NonNullable<components["schemas"]["WeddingTemplateDto"]>;
export type TemplatePartnerTypeDto = components["schemas"]["TemplatePartnerTypeDto"];
export type CreateWeddingTemplateRequest = components["schemas"]["CreateWeddingTemplateRequest"];
export type UpdateWeddingTemplateRequest = components["schemas"]["UpdateWeddingTemplateRequest"];

const templatesQueryOptions = () =>
    queryOptions({
        queryKey: ["wedding-templates"],
        queryFn: () => apiRequest<WeddingTemplateListDto[]>("/api/wedding-templates"),
    });

const templateQueryOptions = (id: number) =>
    queryOptions({
        queryKey: ["wedding-templates", id],
        queryFn: () => apiRequest<WeddingTemplateDto>(`/api/wedding-templates/${id}`),
    });

export function useWeddingTemplates() {
    return useQuery(templatesQueryOptions());
}

export function useWeddingTemplate(id: number) {
    return useQuery({ ...templateQueryOptions(id), enabled: id > 0 });
}

export function useCreateWeddingTemplate() {
    return useMutation({
        mutationFn: (data: CreateWeddingTemplateRequest) =>
            apiRequest<WeddingTemplateDto>("/api/wedding-templates", { method: "POST", data }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wedding-templates"] }),
        meta: { successMessage: "Predložak kreiran." },
    });
}

export function useUpdateWeddingTemplate() {
    return useMutation({
        mutationFn: ({ id, ...data }: UpdateWeddingTemplateRequest & { id: number }) =>
            apiRequest<WeddingTemplateDto>(`/api/wedding-templates/${id}`, { method: "PUT", data }),
        onSuccess: (_res, vars) => {
            queryClient.invalidateQueries({ queryKey: ["wedding-templates"] });
            queryClient.invalidateQueries({ queryKey: ["wedding-templates", vars.id] });
        },
        meta: { successMessage: "Predložak ažuriran." },
    });
}

export function useDeleteWeddingTemplate() {
    return useMutation({
        mutationFn: (id: number) =>
            apiRequest<boolean>(`/api/wedding-templates/${id}`, { method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wedding-templates"] }),
        meta: { successMessage: "Predložak obrisan." },
    });
}