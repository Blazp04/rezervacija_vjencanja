import { useSession } from "@/services/auth"

export type AppPermission =
  | "dashboard.read"
  | "auditLogs.read"

const ROLE_PERMISSIONS: Record<string, readonly AppPermission[]> = {
  admin: [
    "dashboard.read",
    "auditLogs.read",
  ],
  viewer: ["dashboard.read"],
}

export function getPermissionsForRole(role: string | null): readonly AppPermission[] {
  if (!role) return []
  return ROLE_PERMISSIONS[role] ?? []
}

export function useUserRole(): string | null {
  const { data } = useSession()
  const user = data?.user as { role?: string } | undefined
  return user?.role ?? null
}

export function useHasPermission(permission: AppPermission): boolean {
  return getPermissionsForRole(useUserRole()).includes(permission)
}
