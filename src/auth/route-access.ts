import { routePermissions } from "@/config/route-permissions"
import { Permission } from "./auth.types"

export function getRoutePermission(pathname: string): Permission | null {
  return routePermissions[pathname] ?? null
}
