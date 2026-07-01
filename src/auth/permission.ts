import type { Permission, User } from "./auth.types";
import { useAuthStore } from "./auth.store";

export function can(
  user: User | null | undefined,
  permission?: Permission | null
) {
  if (!permission) return true;
  if (!user) return false;

  return user.permissions.includes(permission);
}

export function canAny(
  user: User | null | undefined,
  permissions: Permission[]
) {
  if (!permissions.length) return true;
  if (!user) return false;

  return permissions.some((permission) => user.permissions.includes(permission));
}

export function canAll(
  user: User | null | undefined,
  permissions: Permission[]
) {
  if (!permissions.length) return true;
  if (!user) return false;

  return permissions.every((permission) => user.permissions.includes(permission));
}

export function hasPermission(permission: Permission) {
  const user = useAuthStore.getState().user;

  return can(user, permission);
}

export function useHasPermission(permission: Permission) {
  const user = useAuthStore((state) => state.user);

  return can(user, permission);
}