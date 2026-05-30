import { queryOptions, useQuery } from "@tanstack/react-query"
import { apiRequest } from "./apiClient"

export interface BookingDto {
    id: number
    partnerId: number
    weddingId: number
    weddingName: string
    startDateTime: string
    endDateTime: string
    weddingPartnerStatus: string
    notes: string | null
}

export interface AvailabilityDto {
    available: boolean
    conflicts: BookingDto[]
}

const bookingsQueryOptions = (partnerId: number) =>
    queryOptions({
        queryKey: ["bookings", { partnerId }],
        queryFn: () => apiRequest<BookingDto[]>(`/api/partners/${partnerId}/bookings`),
    })

const availabilityQueryOptions = (partnerId: number, start: string, end: string, enabled: boolean) =>
    queryOptions({
        queryKey: ["availability", { partnerId, start, end }],
        queryFn: () =>
            apiRequest<AvailabilityDto>(
                `/api/partners/${partnerId}/availability?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
            ),
        enabled,
    })

export function useBookings(partnerId: number) {
    return useQuery(bookingsQueryOptions(partnerId))
}

export function useAvailability(partnerId: number, start: string, end: string, enabled: boolean) {
    return useQuery(availabilityQueryOptions(partnerId, start, end, enabled))
}
