import { Permission } from "./auth.types"
import { useAuthStore } from "./auth.store"

export function hasPermission(permission: Permission) {
  const user = useAuthStore.getState().user
  return !!user?.permissions.includes(permission)
}

export function useHasPermission(permission: Permission) {
  const user = useAuthStore((state) => state.user)
  return !!user?.permissions.includes(permission)
}
