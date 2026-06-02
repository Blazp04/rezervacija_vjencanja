import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "./apiClient";

export interface WeddingListDto {
    id: number;
    name: string;
    dateTime: string;
    location: string | null;
    status: string;
    templateName: string | null;
}

export interface WeddingDto {
    id: number;
    name: string;
    dateTime: string;
    location: string | null;
    templateId: number | null;
    templateName: string | null;
    status: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateWeddingRequest {
    name: string;
    dateTime: string;
    location: string | null;
    templateId: number | null;
    notes: string | null;
}

export interface UpdateWeddingRequest {
    name: string;
    dateTime: string;
    location: string | null;
    templateId: number | null;
    notes: string | null;
    status: string;
}

export interface UpdateWeddingStatusRequest {
    newStatus: string;
}

const weddingsQueryOptions = (status?: string) =>
    queryOptions({
        queryKey: ["weddings", { status }],
        queryFn: () => {
            const qs = status ? `?status=${status}` : "";
            return apiRequest<WeddingListDto[]>(`/api/weddings${qs}`);
        },
    });

const weddingQueryOptions = (id: number) =>
    queryOptions({
        queryKey: ["weddings", id],
        queryFn: () => apiRequest<WeddingDto>(`/api/weddings/${id}`),
        enabled: id > 0,
    });

export function useWeddings(status?: string) {
    return useQuery(weddingsQueryOptions(status));
}

export function useWedding(id: number) {
    return useQuery(weddingQueryOptions(id));
}

export function useCreateWedding() {
    return useMutation({
        mutationFn: (data: CreateWeddingRequest) =>
            apiRequest<WeddingDto>("/api/weddings", { method: "POST", data }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["weddings"] }),
        meta: { successMessage: "Vjenčanje kreirano." },
    });
}

export function useUpdateWedding() {
    return useMutation({
        mutationFn: ({ id, ...data }: UpdateWeddingRequest & { id: number }) =>
            apiRequest<WeddingDto>(`/api/weddings/${id}`, { method: "PUT", data }),
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["weddings"] });
            queryClient.invalidateQueries({ queryKey: ["weddings", id] });
        },
        meta: { successMessage: "Vjenčanje ažurirano." },
    });
}

export function useChangeWeddingStatus() {
    return useMutation({
        mutationFn: ({ id, newStatus }: { id: number; newStatus: string }) =>
            apiRequest<WeddingDto>(`/api/weddings/${id}/status`, {
                method: "POST",
                data: { newStatus },
            }),
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["weddings"] });
            queryClient.invalidateQueries({ queryKey: ["weddings", id] });
        },
        meta: { successMessage: "Status promijenjen." },
    });
}

export function useDeleteWedding() {
    return useMutation({
        mutationFn: (id: number) =>
            apiRequest<boolean>(`/api/weddings/${id}`, { method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["weddings"] }),
        meta: { successMessage: "Vjenčanje otkazano." },
    });
}