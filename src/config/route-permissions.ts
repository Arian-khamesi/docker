import { ROUTES } from "@/config/routes";
import type { Permission } from "@/auth/auth.types";

export const routePermissions = {
  // Dashboard
  [ROUTES.dashboard.home]: "dashboard.view",
  [ROUTES.dashboard.reports]: "reports.view",

  // Content & Site
  [ROUTES.content.menuManagement]: "content.view",
  [ROUTES.content.sliderManagement]: "content.view",
  [ROUTES.content.blog]: "content.manage",
  [ROUTES.content.homepageHighlights]: "content.view",
  [ROUTES.content.productCarousels]: "content.view",
  [ROUTES.content.categoryCarousels]: "content.view",


  "/dashboard/content/category-carousels/new": "content.view",
  "/dashboard/content/category-carousels/[id]/edit": "content.view",
  "/dashboard/content/product-carousels/new": "content.view",

  // Products
  [ROUTES.products.list]: "products.view",
  [ROUTES.products.new]: "products.create",
  [ROUTES.products.categories]: "products.manage",

  // CRM
  [ROUTES.crm.customers]: "crm.view",
  [ROUTES.crm.tickets]: "crm.manage",

  // Orders
  [ROUTES.orders.list]: "content.view",
  [ROUTES.orders.new]: "content.view",
  "/dashboard/orders/[id]": "content.view",
  [ROUTES.orders.returns]: "content.view",
  [ROUTES.orders.exchanges]: "content.view",
  [ROUTES.orders.snapp]: "content.view",
  [ROUTES.orders.manual]: "content.view",
  [ROUTES.orders.kiyanSale]: "content.view",

  "/dashboard/orders/[id]/return/new": "content.view",
  "/dashboard/orders/[id]/exchange/new": "content.view",
  "/dashboard/orders/[id]/kiyan/sale/new": "content.view",
  "/dashboard/orders/[id]/snapp/update": "content.view",

  // Inventory
  [ROUTES.inventory.stock]: "inventory.view",
  [ROUTES.inventory.movements]: "inventory.manage",

  // Sales Channels
  [ROUTES.salesChannels.list]: "sales_channels.view",

  // Campaigns
  [ROUTES.campaigns.list]: "campaigns.view",

  // Reports / Analytics
  [ROUTES.systemReports.list]: "reports.view",
  [ROUTES.analytics.list]: "analytics.view",

  // Workflows
  [ROUTES.workflows.list]: "workflows.view",

  // Settings & Security
  [ROUTES.settings.general]: "settings.manage",
  [ROUTES.settings.security]: "security.manage",
} satisfies Record<string, Permission>;

export function getRoutePermission(pathname: string): Permission | null {
  const normalizedPath = normalizePath(pathname);

  const matchedRoute = Object.keys(routePermissions)
    .sort((a, b) => b.length - a.length)
    .find((route) => {
      const normalizedRoute = normalizePath(route);

      return (
        normalizedPath === normalizedRoute ||
        normalizedPath.startsWith(`${normalizedRoute}/`)
      );
    });

  if (!matchedRoute) return null;

  return routePermissions[matchedRoute];
}

function normalizePath(pathname: string) {
  if (!pathname) return "/";

  const cleanPath = pathname.split("?")[0].split("#")[0];

  if (cleanPath.length > 1 && cleanPath.endsWith("/")) {
    return cleanPath.slice(0, -1);
  }

  return cleanPath;
}