import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "./apiClient";

// Defined inline — these types are not present in the auto-generated api.d.ts schema.
export interface TemplatePartnerTypeDto {
    typeCode: string;
    required: boolean;
}

export interface WeddingTemplateListDto {
    id: number;
    name: string;
    description: string | null;
    requiredPartnerTypesCount: number;
}

export interface WeddingTemplateDto {
    id: number;
    name: string;
    description: string | null;
    defaultNotes: string | null;
    requiredPartnerTypes: TemplatePartnerTypeDto[];
    isActive: boolean;
    createdAt: string;
}

export interface CreateWeddingTemplateRequest {
    name: string;
    description: string | null;
    defaultNotes: string | null;
    requiredPartnerTypes: TemplatePartnerTypeDto[] | null;
}

export interface UpdateWeddingTemplateRequest {
    id: number;
    name: string;
    description: string | null;
    defaultNotes: string | null;
    requiredPartnerTypes: TemplatePartnerTypeDto[] | null;
    isActive: boolean;
}

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
