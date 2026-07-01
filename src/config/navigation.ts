// src/config/navigation.ts

import {
  BarChart3,
  FileText,
  Layers,
  LayoutDashboard,
  LineChart,
  Megaphone,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Workflow,
  ReceiptText,
  RotateCcw,
  BadgeDollarSign,
  PlusCircle,
  Repeat2,
  ShoppingBag,
  Smartphone,
  UserCog,
  type LucideIcon,
} from "lucide-react";

import { Permission } from "@/auth/auth.types";
import { ROUTES } from "@/config/routes";

export interface NavItem {
  id: string;
  title: string;
  icon?: LucideIcon;
  href?: string;
  permission?: Permission;
  children?: NavItem[];
}

/**
 * ساختار اصلی منوی داشبورد
 *
 * نکته مهم:
 * - routeها از ROUTES می‌آیند.
 * - permissionها فعلاً همین‌جا برای نمایش منو استفاده می‌شوند.
 * - در فاز بعدی permission routeها را هم با همین ساختار هماهنگ می‌کنیم.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    title: "داشبورد",
    icon: LayoutDashboard,
    permission: "dashboard.view",
    children: [
      {
        id: "dashboard-home",
        title: "نمای کلی",
        href: ROUTES.dashboard.home,
        permission: "dashboard.view",
      },
      {
        id: "dashboard-reports",
        title: "گزارشات",
        href: ROUTES.dashboard.reports,
        permission: "reports.view",
      },
    ],
  },

  {
    id: "content",
    title: "محتوا و سایت",
    icon: FileText,
    permission: "content.view",
    children: [
      {
        id: "content-menu-management",
        title: "مدیریت منوها",
        href: ROUTES.content.menuManagement,
        permission: "content.view",
      },
      {
        id: "content-slider-management",
        title: "مدیریت اسلایدر",
        href: ROUTES.content.sliderManagement,
        permission: "content.view",
      },
      {
        id: "content-homepage-highlights",
        title: "هایلایت‌های صفحه اصلی",
        href: ROUTES.content.homepageHighlights,
        permission: "content.view",
      },
      {
        id: "content-product-carousels",
        title: "کروسل‌های محصولات",
        href: ROUTES.content.productCarousels,
        permission: "content.view",
      },
      {
        id: "content-category-carousels",
        title: "کروسل‌های دسته‌بندی",
        href: ROUTES.content.categoryCarousels,
        permission: "content.view",
      },
      {
        id: "content-blog",
        title: "بلاگ",
        href: ROUTES.content.blog,
        permission: "content.manage",
      },
    ],
  },

  {
    id: "products",
    title: "محصولات",
    icon: Package,
    permission: "products.view",
    children: [
      {
        id: "products-list",
        title: "همه محصولات",
        href: ROUTES.products.list,
        permission: "products.view",
      },
      {
        id: "products-categories",
        title: "دسته‌بندی‌ها",
        href: ROUTES.products.categories,
        permission: "products.manage",
      },
      {
        id: "products-new",
        title: "ایجاد محصول",
        href: ROUTES.products.new,
        permission: "products.create",
      },
    ],
  },

  {
    id: "crm",
    title: "CRM",
    icon: Users,
    permission: "crm.view",
    children: [
      {
        id: "crm-customers",
        title: "مشتریان",
        href: ROUTES.crm.customers,
        permission: "crm.view",
      },
      {
        id: "crm-tickets",
        title: "تیکت‌ها",
        href: ROUTES.crm.tickets,
        permission: "crm.manage",
      },
    ],
  },

 {
  id: "orders",
  title: "سفارشات و فروش",
  icon: ShoppingBag,
  children: [
    {
      id: "orders-list",
      title: "همه سفارشات",
      href: ROUTES.orders.list,
      icon: ReceiptText,
      permission: "content.view",
    },
    {
      id: "orders-new",
      title: "ثبت سفارش دستی",
      href: ROUTES.orders.new,
      icon: PlusCircle,
      permission: "content.view",
    },
    {
      id: "orders-returns",
      title: "مرجوعی‌ها",
      href: ROUTES.orders.returns,
      icon: RotateCcw,
      permission: "content.view",
    },
    {
      id: "orders-exchanges",
      title: "تعویض‌ها",
      href: ROUTES.orders.exchanges,
      icon: Repeat2,
      permission: "content.view",
    },
    {
      id: "orders-snapp",
      title: "سفارش‌های اسنپ",
      href: ROUTES.orders.snapp,
      icon: Smartphone,
      permission: "content.view",
    },
    {
      id: "orders-manual",
      title: "سفارش‌های دستی",
      href: ROUTES.orders.manual,
      icon: UserCog,
      permission: "content.view",
    },
    {
      id: "orders-kiyan-sale",
      title: "ثبت در کیان",
      href: ROUTES.orders.kiyanSale,
      icon: BadgeDollarSign,
      permission: "content.view",
    },
  ],
},

  {
    id: "inventory",
    title: "انبار",
    icon: Layers,
    permission: "inventory.view",
    children: [
      {
        id: "inventory-stock",
        title: "موجودی",
        href: ROUTES.inventory.stock,
        permission: "inventory.view",
      },
      {
        id: "inventory-movements",
        title: "گردش انبار",
        href: ROUTES.inventory.movements,
        permission: "inventory.manage",
      },
    ],
  },

  {
    id: "sales-channels",
    title: "کانال‌های فروش",
    icon: Megaphone,
    href: ROUTES.salesChannels.list,
    permission: "sales_channels.view",
  },

  {
    id: "campaigns",
    title: "کمپین و پیام‌رسانی",
    icon: Megaphone,
    href: ROUTES.campaigns.list,
    permission: "campaigns.view",
  },

  {
    id: "system-reports",
    title: "گزارش و سلامت سیستم",
    icon: BarChart3,
    href: ROUTES.systemReports.list,
    permission: "reports.view",
  },

  {
    id: "analytics",
    title: "آنالیتیکس",
    icon: LineChart,
    href: ROUTES.analytics.list,
    permission: "analytics.view",
  },

  {
    id: "workflows",
    title: "درخواست‌ها و گردش کار",
    icon: Workflow,
    href: ROUTES.workflows.list,
    permission: "workflows.view",
  },

  {
    id: "settings",
    title: "تنظیمات",
    icon: Settings,
    permission: "settings.view",
    children: [
      {
        id: "settings-general",
        title: "تنظیمات عمومی",
        href: ROUTES.settings.general,
        permission: "settings.manage",
      },
      {
        id: "settings-security",
        title: "امنیت",
        href: ROUTES.settings.security,
        permission: "security.manage",
      },
    ],
  },
];