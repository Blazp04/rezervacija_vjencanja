import type { ReactNode } from "react";
import { useHasPermission, type AppPermission } from "@/lib/permissions";

export function Authorize({
  permission,
  fallback = null,
  children,
}: {
  permission: AppPermission;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const allowed = useHasPermission(permission);
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
