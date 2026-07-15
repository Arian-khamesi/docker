"use client";

import {
  ArrowUpLeft,
  BarChart3,
  Boxes,
  FileText,
  LayoutDashboard,
  LineChart,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";


const stats = [
  {
    label: "تعداد کاربران",
    value: "1,248",
    change: "+۱۲٪",
    tone: "success",
    icon: Users,
  },
  {
    label: "سفارش‌های امروز",
    value: "87",
    change: "+۸٪",
    tone: "info",
    icon: ShoppingCart,
  },
  {
    label: "بازدید این ماه",
    value: "72,344",
    change: "+۲۱٪",
    tone: "success",
    icon: LineChart,
  },
  {
    label: "محصولات فعال",
    value: "3,482",
    change: "۱۲ کم‌موجود",
    tone: "warning",
    icon: Package,
  },
];

const quickActions = [
  {
    title: "مدیریت اسلایدر",
    description: "ویرایش بنرهای صفحه اصلی",
    href: "/dashboard/content/slider-management",
    icon: LayoutDashboard,
  },
  {
    title: "مدیریت منوها",
    description: "ساختار ناوبری سایت",
    href: "/dashboard/content/menu-management",
    icon: FileText,
  },
  {
    title: "محصولات",
    description: "مدیریت کالاها و دسته‌بندی‌ها",
    href: "/dashboard/products",
    icon: Boxes,
  },
  {
    title: "سفارشات",
    description: "بررسی سفارش‌ها و بازگشت‌ها",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
];

const activities = [
  {
    title: "اسلایدر صفحه اصلی ویرایش شد",
    meta: "۱۲ دقیقه پیش",
    tone: "info",
  },
  {
    title: "۸۷ سفارش جدید ثبت شد",
    meta: "امروز",
    tone: "success",
  },
  {
    title: "۱۲ محصول به حداقل موجودی رسید",
    meta: "نیازمند بررسی",
    tone: "warning",
  },
  {
    title: "گزارش فروش روزانه آماده است",
    meta: "۱ ساعت پیش",
    tone: "muted",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="glass-panel relative overflow-hidden rounded-[2rem] p-6">
        <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-56 w-56 rounded-full bg-info/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <LayoutDashboard size={14} />
              نمای کلی سیستم
            </div>

            <h1 className="text-3xl font-black tracking-tight text-foreground">
              خوش آمدید 👋
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              اینجا مرکز کنترل فروشگاه، محتوا، سفارشات و وضعیت عملیاتی سیستم
              است. شاخص‌های مهم را سریع ببینید و به بخش‌های اصلی وارد شوید.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[520px]">
            {stats.map((item) => (
              <StatCard key={item.label} item={item} />
            ))}
          </div>
        </div>
      </section>
      

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="glass-panel overflow-hidden rounded-[2rem]">
          <div className="flex items-center justify-between border-b glass-divider p-5">
            <div>
              <h2 className="text-base font-black text-foreground">
                روند فروش
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                نمای نمایشی از عملکرد فروش در روزهای اخیر
              </p>
            </div>

            <span className="status-badge status-badge-info">
              <BarChart3 size={13} />
              ماه جاری
            </span>
          </div>

          <div className="p-5">
            <div className="glass-card relative h-80 overflow-hidden rounded-[2rem] p-5">
              <div className="absolute inset-x-5 bottom-5 top-8 flex items-end gap-3">
                {[32, 58, 42, 78, 66, 88, 54, 72, 95, 64, 84, 76].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <div
                        className="w-full rounded-t-2xl bg-gradient-to-t from-primary/90 to-primary/35 shadow-[0_12px_30px_hsl(var(--primary)/0.18)]"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {index + 1}
                      </span>
                    </div>
                  )
                )}
              </div>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
            </div>
          </div>
        </div>

        <div className="glass-panel overflow-hidden rounded-[2rem]">
          <div className="border-b glass-divider p-5">
            <h2 className="text-base font-black text-foreground">
              عملیات سریع
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              دسترسی مستقیم به بخش‌های پرکاربرد
            </p>
          </div>

          <div className="grid gap-3 p-5">
            {quickActions.map((action) => (
              <QuickAction key={action.href} action={action} />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel overflow-hidden rounded-[2rem]">
          <div className="border-b glass-divider p-5">
            <h2 className="text-base font-black text-foreground">
              فعالیت‌های اخیر
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              آخرین تغییرات مهم در سیستم
            </p>
          </div>

          <div className="space-y-3 p-5">
            {activities.map((activity) => (
              <ActivityItem key={activity.title} activity={activity} />
            ))}
          </div>
        </div>

        <div className="glass-panel overflow-hidden rounded-[2rem]">
          <div className="border-b glass-divider p-5">
            <h2 className="text-base font-black text-foreground">
              وضعیت عملیاتی
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              خلاصه سلامت بخش‌های اصلی فروشگاه
            </p>
          </div>

          <div className="grid gap-3 p-5 md:grid-cols-3">
            <HealthTile label="سایت" value="پایدار" tone="success" />
            <HealthTile label="موجودی" value="نیازمند بررسی" tone="warning" />
            <HealthTile label="پرداخت" value="فعال" tone="info" />
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  item,
}: {
  item: {
    label: string;
    value: string;
    change: string;
    tone: string;
    icon: React.ElementType;
  };
}) {
  const Icon = item.icon;

  return (
    <div className="glass-card rounded-3xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon size={18} />
        </div>

        <span
          className={
            item.tone === "success"
              ? "status-badge status-badge-success"
              : item.tone === "warning"
                ? "status-badge status-badge-warning"
                : "status-badge status-badge-info"
          }
        >
          {item.change}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">{item.label}</p>

      <p className="mt-2 text-2xl font-black text-foreground">{item.value}</p>
    </div>
  );
}

function QuickAction({
  action,
}: {
  action: {
    title: string;
    description: string;
    href: string;
    icon: React.ElementType;
  };
}) {
  const Icon = action.icon;

  return (
    <Link
      href={action.href}
      className="glass-menu-item group flex items-center justify-between rounded-3xl p-4 transition-all hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon size={19} />
        </div>

        <div>
          <p className="text-sm font-bold text-foreground">{action.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {action.description}
          </p>
        </div>
      </div>

      <ArrowUpLeft
        size={17}
        className="text-muted-foreground transition-transform group-hover:-translate-x-1 group-hover:translate-y-[-2px]"
      />
    </Link>
  );
}

function ActivityItem({
  activity,
}: {
  activity: {
    title: string;
    meta: string;
    tone: string;
  };
}) {
  const dotClass =
    activity.tone === "success"
      ? "bg-success"
      : activity.tone === "warning"
        ? "bg-warning"
        : activity.tone === "info"
          ? "bg-info"
          : "bg-muted-foreground";

  return (
    <div className="glass-card flex items-start gap-3 rounded-3xl p-4">
      <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${dotClass}`} />

      <div>
        <p className="text-sm font-bold text-foreground">{activity.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{activity.meta}</p>
      </div>
    </div>
  );
}

function HealthTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "warning" | "info";
}) {
  return (
    <div className="glass-card rounded-3xl p-4">
      <p className="text-xs text-muted-foreground">{label}</p>

      <p className="mt-2 text-sm font-black text-foreground">{value}</p>

      <div
        className={
          tone === "success"
            ? "mt-4 h-1.5 rounded-full bg-success/70"
            : tone === "warning"
              ? "mt-4 h-1.5 rounded-full bg-warning/70"
              : "mt-4 h-1.5 rounded-full bg-info/70"
        }
      />
    </div>
  );
}