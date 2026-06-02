import { queryOptions, useMutation, useQuery } from "@tanstack/react-query"
import { apiRequest, queryClient } from "./apiClient"

export interface AgencySettingsDto {
    companyName: string
    oib: string | null
    address: string | null
    phone: string | null
    email: string | null
}

export interface UpdateAgencySettingsRequest {
    companyName: string
    oib: string | null
    address: string | null
    phone: string | null
    email: string | null
}

const settingsQueryOptions = () =>
    queryOptions({
        queryKey: ["agency-settings"],
        queryFn: () => apiRequest<AgencySettingsDto>("/api/settings"),
    })

export function useAgencySettings() {
    return useQuery(settingsQueryOptions())
}

export function useUpdateAgencySettings() {
    return useMutation({
        mutationFn: (data: UpdateAgencySettingsRequest) =>
            apiRequest<AgencySettingsDto>("/api/settings", { method: "PUT", data }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agency-settings"] }),
        meta: { successMessage: "Postavke spremljene." },
    })
}
