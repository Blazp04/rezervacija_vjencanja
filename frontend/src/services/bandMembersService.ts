import { queryOptions, useMutation, useQuery } from "@tanstack/react-query"
import { apiRequest, queryClient } from "./apiClient"

export interface BandMemberDto {
    id: number
    partnerId: number
    name: string
    role: string | null
    phone: string | null
    email: string | null
}

export interface CreateBandMemberRequest {
    name: string
    role: string | null
    phone: string | null
    email: string | null
}

export interface UpdateBandMemberRequest {
    name: string
    role: string | null
    phone: string | null
    email: string | null
}

const bandMembersQueryOptions = (partnerId: number) =>
    queryOptions({
        queryKey: ["bandMembers", { partnerId }],
        queryFn: () => apiRequest<BandMemberDto[]>(`/api/partners/${partnerId}/members`),
    })

export function useBandMembers(partnerId: number) {
    return useQuery(bandMembersQueryOptions(partnerId))
}

export function useCreateBandMember(partnerId: number) {
    return useMutation({
        mutationFn: (data: CreateBandMemberRequest) =>
            apiRequest<BandMemberDto>(`/api/partners/${partnerId}/members`, { method: "POST", data }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bandMembers", { partnerId }] }),
        meta: { successMessage: "Član benda dodan." },
    })
}

export function useUpdateBandMember(partnerId: number) {
    return useMutation({
        mutationFn: ({ id, ...data }: UpdateBandMemberRequest & { id: number }) =>
            apiRequest<BandMemberDto>(`/api/partners/${partnerId}/members/${id}`, { method: "PUT", data }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bandMembers", { partnerId }] }),
        meta: { successMessage: "Član benda ažuriran." },
    })
}

export function useDeleteBandMember(partnerId: number) {
    return useMutation({
        mutationFn: (memberId: number) =>
            apiRequest<boolean>(`/api/partners/${partnerId}/members/${memberId}`, { method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bandMembers", { partnerId }] }),
        meta: { successMessage: "Član benda obrisan." },
    })
}
