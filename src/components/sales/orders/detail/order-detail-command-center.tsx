"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileSearch,
  Wand2,
} from "lucide-react";

import {
  SALES_ORDERS_BASE_PATH,
  getSalesOrderDetailPath,
} from "@/components/sales/orders/sales-orders.constants";
import {
  getOrderOperationalSummary,
  type OrderActionTone,
} from "@/lib/orders/order-next-action";
import type { SalesOrder } from "@/types/sales-order";

interface OrderDetailCommandCenterProps {
  order: SalesOrder;
}

export function OrderDetailCommandCenter({
  order,
}: OrderDetailCommandCenterProps) {
  const summary = getOrderOperationalSummary(order);

  return (
    <section className="relative overflow-hidden rounded-[2.2rem] bg-white/55 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
      <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-black text-muted-foreground">
            <Link href={SALES_ORDERS_BASE_PATH} className="hover:text-foreground">
              سفارشات
            </Link>

            <ArrowLeft className="h-3.5 w-3.5" />

            <Link
              href={getSalesOrderDetailPath(order.id)}
              className="text-foreground"
            >
              سفارش #{order.id}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-black text-sky-700 dark:text-sky-300">
              <FileSearch className="h-4 w-4" />
              مرکز تصمیم‌گیری سفارش
            </span>

            <span className="rounded-full bg-white/50 px-3 py-1 text-xs font-black text-muted-foreground dark:bg-white/[0.05]">
              Order #{order.id}
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-black text-foreground">
            {summary.currentStatus}
          </h1>

          <p className="mt-3 max-w-4xl text-sm font-bold leading-7 text-muted-foreground">
            {summary.reason}
          </p>
        </div>

        <div className="w-full shrink-0 xl:w-[360px]">
          {summary.primaryAction ? (
            <Link
              href={summary.primaryAction.href}
              className={[
                "flex h-13 items-center justify-center gap-2 rounded-[1.5rem] px-5 text-sm font-black text-white shadow-[0_16px_36px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5",
                getButtonClass(summary.primaryAction.tone),
              ].join(" ")}
            >
              {summary.primaryAction.label}
              <ArrowLeft className="h-4 w-4" />
            </Link>
          ) : (
            <div className="rounded-[1.5rem] bg-emerald-500/10 px-4 py-3 text-sm font-black text-emerald-700 dark:text-emerald-300">
              اقدام فوری مشخص نیست
            </div>
          )}

          <p className="mt-3 text-xs font-bold leading-6 text-muted-foreground">
            {summary.afterAction}
          </p>
        </div>
      </div>

      <div className="relative mt-5 grid gap-3 md:grid-cols-3">
        <MiniGuideBox
          icon={Eye}
          title="دیتا"
          description="اطلاعات مشتری، محصولات، پرداخت و ارسال را در تب دیتا ببین."
          tone="sky"
        />

        <MiniGuideBox
          icon={Wand2}
          title="عملیات"
          description="ثبت کیان، مرجوعی، تعویض و آپدیت اسنپ در تب عملیات است."
          tone="violet"
        />

        <MiniGuideBox
          icon={ClipboardList}
          title="پیگیری"
          description="لاگ‌ها، وضعیت‌های ناقص و sync خارجی در تب پیگیری است."
          tone="amber"
        />
      </div>

      {summary.secondaryActions.length ? (
        <div className="relative mt-4 flex flex-wrap gap-2">
          {summary.secondaryActions.slice(0, 4).map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={[
                "inline-flex h-10 items-center justify-center rounded-[1.2rem] px-4 text-xs font-black text-white transition hover:-translate-y-0.5",
                getButtonClass(action.tone),
              ].join(" ")}
            >
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function MiniGuideBox({
  icon: Icon,
  title,
  description,
  tone,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  tone: OrderActionTone;
}) {
  return (
    <div className="rounded-[1.6rem] bg-white/45 p-4 dark:bg-white/[0.04]">
      <div className="flex items-start gap-3">
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
            getSoftClass(tone),
          ].join(" ")}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-black text-foreground">{title}</p>
          <p className="mt-1 text-xs font-bold leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function getButtonClass(tone: OrderActionTone) {
  if (tone === "sky") return "bg-sky-600";
  if (tone === "violet") return "bg-violet-600";
  if (tone === "rose") return "bg-rose-600";
  if (tone === "amber") return "bg-amber-600";
  if (tone === "emerald") return "bg-emerald-600";

  return "bg-slate-700";
}

function getSoftClass(tone: OrderActionTone) {
  if (tone === "sky") {
    return "bg-sky-500/10 text-sky-700 dark:text-sky-300";
  }

  if (tone === "violet") {
    return "bg-violet-500/10 text-violet-700 dark:text-violet-300";
  }

  if (tone === "rose") {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
  }

  if (tone === "amber") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  if (tone === "emerald") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  return "bg-slate-500/10 text-slate-700 dark:text-slate-300";
}