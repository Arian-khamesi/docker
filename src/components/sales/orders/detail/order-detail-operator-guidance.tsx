"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Eye, ListChecks, Wand2 } from "lucide-react";

import {
  SALES_ORDERS_BASE_PATH,
  getSalesOrderDetailPath,
} from "@/components/sales/orders/sales-orders.constants";
import {
  OrderNextActionCard,
  OrderOperatorPageHeader,
  OrderOperatorSection,
  OrderTaskReason,
} from "@/components/sales/orders/ux/order-operator-guidance";
import {
  getOrderOperationalSummary,
  type OrderOperationalSignal,
  type OrderSignalStatus,
} from "@/lib/orders/order-next-action";
import type { SalesOrder } from "@/types/sales-order";

interface OrderDetailOperatorGuidanceProps {
  order: SalesOrder;
}

export function OrderDetailOperatorGuidance({
  order,
}: OrderDetailOperatorGuidanceProps) {
  const summary = getOrderOperationalSummary(order);

  return (
    <div className="space-y-4">
      <OrderOperatorPageHeader
        pageType="detail"
        eyebrow={`Order #${order.id}`}
        title={`جزئیات سفارش #${order.id}`}
        description="این صفحه مرکز تصمیم‌گیری برای یک سفارش است؛ اول وضعیت و اقدام پیشنهادی را ببین، بعد وارد بخش دیتا، پیگیری یا عملیات شو."
        breadcrumb={[
          {
            label: "سفارشات",
            href: SALES_ORDERS_BASE_PATH,
          },
          {
            label: `سفارش #${order.id}`,
            href: getSalesOrderDetailPath(order.id),
          },
        ]}
        goal={summary.goal}
        currentStatus={summary.currentStatus}
        recommendedAction={summary.recommendedAction}
        afterAction={summary.afterAction}
        primaryAction={
          summary.primaryAction
            ? {
                label: summary.primaryAction.label,
                href: summary.primaryAction.href,
                tone: summary.primaryAction.tone,
              }
            : undefined
        }
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <OrderOperatorSection
          title="وضعیت سریع سفارش"
          description="این بخش فقط برای فهم وضعیت فعلی سفارش است؛ قبل از انجام هر عملیات، این داده‌ها را چک کن."
          variant="status"
          icon={Eye}
        >
          <SignalGrid signals={summary.dataSignals} />
        </OrderOperatorSection>

        <OrderOperatorSection
          title="پیگیری‌ها و موارد قابل توجه"
          description="اینجا مشخص می‌شود چرا ممکن است این سفارش نیازمند بررسی باشد و کدام قسمت هنوز کامل نیست."
          variant="followup"
          icon={ListChecks}
        >
          <div className="space-y-3">
            <OrderTaskReason
              reason={summary.reason}
              expectedAction={summary.recommendedAction}
              tone={summary.primaryAction?.tone ?? "amber"}
            />

            <SignalGrid signals={summary.followupSignals} />
          </div>
        </OrderOperatorSection>

        <OrderOperatorSection
          title="عملیات‌های در دسترس"
          description="اینجا فقط ابزارهای عملیاتی سفارش قرار دارد؛ اگر می‌خواهی کاری انجام بدهی، از همین بخش وارد workflow مناسب شو."
          variant="actions"
          icon={Wand2}
          className="xl:col-span-2"
        >
          <div className="space-y-4">
            {summary.primaryAction ? (
              <OrderNextActionCard
                reason={summary.reason}
                actionLabel={summary.primaryAction.label}
                actionHref={summary.primaryAction.href}
                description={summary.afterAction}
                tone={summary.primaryAction.tone}
              />
            ) : (
              <div className="rounded-[1.8rem] bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5" />

                  <div>
                    <h3 className="text-sm font-black">
                      اقدام اصلی فوری مشخص نیست
                    </h3>

                    <p className="mt-2 text-xs font-bold leading-6">
                      {summary.recommendedAction}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <p className="mb-3 text-xs font-black text-muted-foreground">
                ابزارهای عملیاتی دیگر
              </p>

              <div className="flex flex-wrap gap-2">
                {summary.secondaryActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={[
                      "inline-flex h-11 items-center justify-center gap-2 rounded-[1.3rem] px-4 text-xs font-black text-white transition hover:-translate-y-0.5",
                      getActionButtonClass(action.tone),
                    ].join(" ")}
                  >
                    {action.label}
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>

            <SignalGrid signals={summary.operationSignals} />
          </div>
        </OrderOperatorSection>
      </section>
    </div>
  );
}

function SignalGrid({ signals }: { signals: OrderOperationalSignal[] }) {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {signals.map((signal) => (
        <SignalCard key={signal.id} signal={signal} />
      ))}
    </div>
  );
}

function SignalCard({ signal }: { signal: OrderOperationalSignal }) {
  return (
    <div
      className={[
        "rounded-[1.4rem] p-3",
        getSignalCardClass(signal.status),
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black opacity-75">{signal.label}</p>
          <p className="mt-1 text-sm font-black">{signal.value}</p>
        </div>

        <span className="rounded-full bg-white/50 px-2.5 py-1 text-[10px] font-black dark:bg-white/[0.08]">
          {getSignalStatusLabel(signal.status)}
        </span>
      </div>

      {signal.description ? (
        <p className="mt-2 text-[11px] font-bold leading-5 opacity-80">
          {signal.description}
        </p>
      ) : null}
    </div>
  );
}

function getSignalCardClass(status: OrderSignalStatus) {
  if (status === "ok") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  if (status === "warning") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  if (status === "danger") {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
  }

  if (status === "info") {
    return "bg-sky-500/10 text-sky-700 dark:text-sky-300";
  }

  return "bg-slate-500/10 text-slate-700 dark:text-slate-300";
}

function getSignalStatusLabel(status: OrderSignalStatus) {
  if (status === "ok") return "اوکی";
  if (status === "warning") return "نیازمند توجه";
  if (status === "danger") return "مهم";
  if (status === "info") return "اطلاعات";
  return "عادی";
}

function getActionButtonClass(tone: string) {
  if (tone === "sky") return "bg-sky-600";
  if (tone === "violet") return "bg-violet-600";
  if (tone === "rose") return "bg-rose-600";
  if (tone === "amber") return "bg-amber-600";
  if (tone === "emerald") return "bg-emerald-600";

  return "bg-slate-700";
}