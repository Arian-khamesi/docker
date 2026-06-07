import { Permission } from "@/auth/auth.types"

export const routePermissions: Record<string, Permission> = {
  // Dashboard
  "/dashboard": "dashboard.view",
  "/dashboard/reports": "reports.view",

  // Content & Site
  "/dashboard/content/pages": "content.view",
  "/dashboard/content/blog": "content.manage",

  // Products
  "/dashboard/products": "products.view",
  "/dashboard/products/new": "products.create",
  "/dashboard/products/categories": "products.manage",

  // CRM
  "/dashboard/crm/customers": "crm.view",
  "/dashboard/crm/tickets": "crm.manage",

  // Orders
  "/dashboard/orders": "orders.view",
  "/dashboard/orders/returns": "orders.manage",

  // Inventory
  "/dashboard/inventory": "inventory.view",
  "/dashboard/inventory/movements": "inventory.manage",

  // Sales Channels
  "/dashboard/sales-channels": "sales_channels.view",

  // Campaigns
  "/dashboard/campaigns": "campaigns.view",

  // System Reports (گزارش و سلامت سیستم)
  "/dashboard/system-reports": "reports.view",

  // Analytics
  "/dashboard/analytics": "analytics.view",

  // Workflows
  "/dashboard/workflows": "workflows.view",

  // Settings & Security
  "/dashboard/settings": "settings.view",
  "/dashboard/settings/security": "security.view",
}

export function getRoutePermission(pathname: string) {
  return routePermissions[pathname]
}
