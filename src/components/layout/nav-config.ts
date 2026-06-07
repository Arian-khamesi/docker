import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  ShieldCheck 
} from "lucide-react";

export const NAV_ITEMS = [
  {
    id: "dashboard",
    title: "داشبورد",
    icon: LayoutDashboard,
    subItems: [
      { title: "آمار کلی", href: "/dashboard" },
      { title: "گزارشات روزانه", href: "/dashboard/reports" },
    ],
  },
  {
    id: "content",
    title: "محتوا",
    icon: FileText,
    subItems: [
      { title: "لیست مقالات", href: "/dashboard/posts" },
      { title: "دسته‌بندی‌ها", href: "/dashboard/categories" },
      { title: "برچسب‌ها", href: "/dashboard/tags" },
    ],
  },
  {
    id: "users",
    title: "کاربران",
    icon: Users,
    subItems: [
      { title: "لیست کاربران", href: "/dashboard/users" },
      { title: "سطوح دسترسی", href: "/dashboard/users/roles" },
    ],
  },
  // ... سایر ۸ مورد را اینجا اضافه کن
];
