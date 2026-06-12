// src/config/navigation.ts
import {
  LayoutDashboard,
  FileText,
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  Settings,
  ShieldCheck,
  Layers,
  Megaphone,
  Workflow,
  LineChart,
} from "lucide-react"

import { Permission } from "@/auth/auth.types"

export interface NavItem {
  id: string
  title: string
  icon?: any
  href?: string
  permission?: Permission
  children?: NavItem[]
}

/**
 * ✅ SINGLE SOURCE OF TRUTH
 * - Sidebar rendering
 * - Route permission
 * - Menu hierarchy
 */
export const NAV_ITEMS: NavItem[] = [
  // 1️⃣ داشبورد
  {
    id: "dashboard",
    title: "داشبورد",
    icon: LayoutDashboard,
    permission: "dashboard.view",
    children: [
      {
        id: "dashboard-home",
        title: "نمای کلی",
        href: "/dashboard",
        permission: "dashboard.view",
      },
      {
        id: "dashboard-reports",
        title: "گزارشات",
        href: "/dashboard/reports",
        permission: "reports.view",
      },
    ],
  },

  // 2️⃣ محتوا و سایت
  {
    id: "content",
    title: "محتوا و سایت",
    icon: FileText,
    permission: "content.view",
    children: [
       {
        id: "content-pages",
        title: "مدیریت منو ها",
        href: "/dashboard/content/menu-management",
        permission: "content.view",
      },
      {
        id: "content-mainSLider",
        title: "مدیریت اسلایدر",
        href: "/dashboard/content/slider-management",
        permission: "content.view",
      },
      {
        id: "content-blog",
        title: "بلاگ",
        href: "/dashboard/content/blog",
        permission: "content.manage",
      },
    ],
  },

  // 3️⃣ محصولات
  {
    id: "products",
    title: "محصولات",
    icon: Package,
    permission: "products.view",
    children: [
      {
        id: "products-list",
        title: "همه محصولات",
        href: "/dashboard/products",
        permission: "products.view",
      },
      {
        id: "products-categories",
        title: "دسته‌بندی‌ها",
        href: "/dashboard/products/categories",
        permission: "products.manage",
      },
      {
        id: "products-new",
        title: "ایجاد محصول",
        href: "/dashboard/products/new",
        permission: "products.create",
      },
    ],
  },

  // 4️⃣ CRM
  {
    id: "crm",
    title: "CRM",
    icon: Users,
    permission: "crm.view",
    children: [
      {
        id: "crm-customers",
        title: "مشتریان",
        href: "/dashboard/crm/customers",
        permission: "crm.view",
      },
      {
        id: "crm-tickets",
        title: "تیکت‌ها",
        href: "/dashboard/crm/tickets",
        permission: "crm.manage",
      },
    ],
  },

  // 5️⃣ سفارشات و فروش
  {
    id: "orders",
    title: "سفارشات و فروش",
    icon: ShoppingCart,
    permission: "orders.view",
    children: [
      {
        id: "orders-list",
        title: "سفارشات",
        href: "/dashboard/orders",
        permission: "orders.view",
      },
      {
        id: "orders-returns",
        title: "بازگشت‌ها",
        href: "/dashboard/orders/returns",
        permission: "orders.manage",
      },
    ],
  },

  // 6️⃣ انبار
  {
    id: "inventory",
    title: "انبار",
    icon: Layers,
    permission: "inventory.view",
    children: [
      {
        id: "inventory-stock",
        title: "موجودی",
        href: "/dashboard/inventory",
        permission: "inventory.view",
      },
      {
        id: "inventory-movements",
        title: "گردش انبار",
        href: "/dashboard/inventory/movements",
        permission: "inventory.manage",
      },
    ],
  },

  // 7️⃣ کانال‌های فروش
  {
    id: "sales-channels",
    title: "کانال‌های فروش",
    icon: Megaphone,
    href: "/dashboard/sales-channels",
    permission: "sales_channels.view",
  },

  // 8️⃣ کمپین و پیام‌رسانی
  {
    id: "campaigns",
    title: "کمپین و پیام‌رسانی",
    icon: Megaphone,
    href: "/dashboard/campaigns",
    permission: "campaigns.view",
  },

  // 9️⃣ گزارش و سلامت سیستم
  {
    id: "system-reports",
    title: "گزارش و سلامت سیستم",
    icon: BarChart3,
    href: "/dashboard/system-reports",
    permission: "reports.view",
  },

  // 🔟 آنالیتیکس
  {
    id: "analytics",
    title: "آنالیتیکس",
    icon: LineChart,
    href: "/dashboard/analytics",
    permission: "analytics.view",
  },

  // 1️⃣1️⃣ درخواست‌ها و گردش کار
  {
    id: "workflows",
    title: "درخواست‌ها و گردش کار",
    icon: Workflow,
    href: "/dashboard/workflows",
    permission: "workflows.view",
  },

  // 1️⃣2️⃣ تنظیمات و امنیت
  {
    id: "settings",
    title: "تنظیمات",
    icon: Settings,
    permission: "settings.view",
    children: [
      {
        id: "settings-general",
        title: "تنظیمات عمومی",
        href: "/dashboard/settings",
        permission: "settings.manage",
      },
      {
        id: "settings-security",
        title: "امنیت",
        href: "/dashboard/settings/security",
        permission: "security.manage",
      },
    ],
  },
]
