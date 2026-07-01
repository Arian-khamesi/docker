import { NAV_ITEMS, type NavItem } from "@/config/navigation";
import {
  getRoutePermission as resolveRoutePermission,
  routePermissions,
} from "@/config/route-permissions";
import type { Permission, User } from "@/auth/auth.types";

export interface ActiveNavigationResult {
  rootItem: NavItem | null;
  activeItem: NavItem | null;
  rootId: string | null;
  activeItemId: string | null;
}

export function getRoutePermission(pathname: string): Permission | null {
  return resolveRoutePermission(pathname);
}

export function can(user: User | null | undefined, permission?: Permission | null) {
  if (!permission) return true;
  if (!user) return false;

  return user.permissions.includes(permission);
}

export function canAccessRoute(
  user: User | null | undefined,
  pathname: string
) {
  const permission = getRoutePermission(pathname);

  if (!permission) return true;

  return can(user, permission);
}

export function canAccessNavItem(
  user: User | null | undefined,
  item: NavItem
) {
  return can(user, item.permission);
}

export function filterNavItemsByPermissions(
  user: User | null | undefined,
  items: NavItem[] = NAV_ITEMS
): NavItem[] {
  return items
    .map((item) => {
      if (!canAccessNavItem(user, item)) {
        return null;
      }

      const children = item.children
        ?.filter((child) => canAccessNavItem(user, child))
        .map((child) => ({ ...child }));

      if (item.children?.length && !children?.length) {
        return null;
      }

      return {
        ...item,
        children,
      };
    })
    .filter(Boolean) as NavItem[];
}

export function resolveActiveNavigation(
  pathname: string,
  items: NavItem[] = NAV_ITEMS
): ActiveNavigationResult {
  const normalizedPath = normalizePath(pathname);

  let bestMatch:
    | {
        rootItem: NavItem;
        activeItem: NavItem;
        rootId: string;
        activeItemId: string;
        hrefLength: number;
      }
    | null = null;

  const registerMatch = (rootItem: NavItem, activeItem: NavItem) => {
    if (!activeItem.href) return;

    const normalizedHref = normalizePath(activeItem.href);

    if (!isPathActive(normalizedPath, normalizedHref)) return;

    if (!bestMatch || normalizedHref.length > bestMatch.hrefLength) {
      bestMatch = {
        rootItem,
        activeItem,
        rootId: rootItem.id,
        activeItemId: activeItem.id,
        hrefLength: normalizedHref.length,
      };
    }
  };

  for (const rootItem of items) {
    registerMatch(rootItem, rootItem);

    rootItem.children?.forEach((child) => {
      registerMatch(rootItem, child);
    });
  }

  if (bestMatch) {
    return {
      rootItem: bestMatch.rootItem,
      activeItem: bestMatch.activeItem,
      rootId: bestMatch.rootId,
      activeItemId: bestMatch.activeItemId,
    };
  }

  return {
    rootItem: null,
    activeItem: null,
    rootId: null,
    activeItemId: null,
  };
}

export function isKnownDashboardRoute(pathname: string) {
  const normalizedPath = normalizePath(pathname);

  return Object.keys(routePermissions).some((route) => {
    const normalizedRoute = normalizePath(route);

    return (
      normalizedPath === normalizedRoute ||
      normalizedPath.startsWith(`${normalizedRoute}/`)
    );
  });
}

function isPathActive(pathname: string, href: string) {
  const normalizedHref = normalizePath(href);

  return pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`);
}

function normalizePath(pathname: string) {
  if (!pathname) return "/";

  const cleanPath = pathname.split("?")[0].split("#")[0];

  if (cleanPath.length > 1 && cleanPath.endsWith("/")) {
    return cleanPath.slice(0, -1);
  }

  return cleanPath;
}