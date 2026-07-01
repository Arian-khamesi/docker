"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeDollarSign,
  CheckCircle2,
  ClipboardCheck,
  PackageCheck,
  ReceiptText,
  RotateCcw,
  Search,
  Smartphone,
} from "lucide-react";

import {
  getSalesOrderDetailPath,
  getSalesOrderReturnCreatePath,
} from "@/components/sales/orders/sales-orders.constants";
import { OrdersWorkspaceShell } from "@/components/sales/orders/workspaces/orders-workspace-shell";
import { getGatewayLabel, getStatusLabel } from "@/lib/orders/order-labels";
import { useSalesOrdersStore } from "@/store/sales-orders.store";
import type { SalesOrder } from "@/types/sales-order";

type ReturnInfo = NonNullable<SalesOrder["returnInfo"]>;

type ReturnStatusFilter =
  | "all"
  | "needs_follow_up"
  | "kiyan_registered"
  | "completed"
  | "snapp_sync"
  | "missing_kiyan"
  | "cancelled";

type ReturnAmountFilter = "all" | "has_amount" | "no_amount";

export default function ReturnsWorkspacePage() {
  const { orders } = useSalesOrdersStore();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReturnStatusFilter>("all");
  const [amountFilter, setAmountFilter] = useState<ReturnAmountFilter>("all");

  const returnOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          Boolean(order.returnInfo) && order.returnInfo?.status !== "none"
      ),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return returnOrders
      .filter((order) => {
        const returnInfo = order.returnInfo;

        if (!returnInfo || returnInfo.status === "none") return false;

        if (amountFilter === "has_amount") {
          if (!returnInfo.returnedAmount || returnInfo.returnedAmount <= 0) {
            return false;
          }
        }

        if (amountFilter === "no_amount") {
          if (returnInfo.returnedAmount && returnInfo.returnedAmount > 0) {
            return false;
          }
        }

        if (statusFilter === "needs_follow_up") {
          if (!isReturnNeedsFollowUp(order)) return false;
        }

        if (statusFilter === "kiyan_registered") {
          if (!returnInfo.returnKiyanBarcode) return false;
        }

        if (statusFilter === "completed") {
          if (returnInfo.status !== "completed") return false;
        }

        if (statusFilter === "snapp_sync") {
          if (!isSnappReturnNeedsSync(order)) return false;
        }

        if (statusFilter === "missing_kiyan") {
          if (returnInfo.returnKiyanBarcode) return false;
        }

        if (statusFilter === "cancelled") {
          if (returnInfo.status !== "cancelled") return false;
        }

        if (!normalizedQuery) return true;

        return buildReturnSearchText(order).includes(normalizedQuery);
      })
      .sort((a, b) => {
        const aTime = new Date(
          a.returnInfo?.createdAt ?? a.createdAt
        ).getTime();
        const bTime = new Date(
          b.returnInfo?.createdAt ?? b.createdAt
        ).getTime();

        return bTime - aTime;
      });
  }, [amountFilter, query, returnOrders, statusFilter]);

  const stats = useMemo(() => {
    const total = returnOrders.length;

    const kiyanRegistered = returnOrders.filter((order) =>
      Boolean(order.returnInfo?.returnKiyanBarcode)
    ).length;

    const completed = returnOrders.filter(
      (order) => order.returnInfo?.status === "completed"
    ).length;

    const needsFollowUp = returnOrders.filter(isReturnNeedsFollowUp).length;

    const snappSync = returnOrders.filter(isSnappReturnNeedsSync).length;

    const missingKiyan = returnOrders.filter(
      (order) => !order.returnInfo?.returnKiyanBarcode
    ).length;

    const totalReturnedAmount = returnOrders.reduce(
      (totalAmount, order) =>
        totalAmount + Number(order.returnInfo?.returnedAmount || 0),
      0
    );

    return {
      total,
      kiyanRegistered,
      completed,
      needsFollowUp,
      snappSync,
      missingKiyan,
      totalReturnedAmount,
    };
  }, [returnOrders]);

  return (
    <OrdersWorkspaceShell
      eyebrow="Returns Workspace"
      title="مرجوعی‌ها"
      description="نمای عملیاتی مرجوعی سفارش‌ها؛ شامل وضعیت سند کیان، کالاهای برگشتی، مبلغ مرجوعی، دلیل مرجوعی و پیگیری سفارش‌های ناقص."
      icon={RotateCcw}
      tone="rose"
      actionLabel="همه سفارشات"
      actionHref="/dashboard/orders"
      cards={[
        {
          label: "کل مرجوعی‌ها",
          value: stats.total.toLocaleString("fa-IR"),
          description: "مرجوعی‌های ثبت‌شده در سفارش‌ها",
        },
        {
          label: "دارای سند کیان",
          value: stats.kiyanRegistered.toLocaleString("fa-IR"),
          description: "دارای بارکد فاکتور مرجوعی",
        },
        {
          label: "بدون سند کیان",
          value: stats.missingKiyan.toLocaleString("fa-IR"),
          description: "نیازمند ثبت یا اصلاح در کیان",
        },
        {
          label: "مبلغ مرجوعی",
          value: `${stats.totalReturnedAmount.toLocaleString("fa-IR")} تومان`,
          description: "جمع مبالغ ثبت‌شده داخلی",
        },
      ]}
    >
      <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-lg font-black text-foreground">
              مدیریت و پیگیری مرجوعی‌ها
            </h2>

            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              این صفحه وضعیت مرجوعی‌هایی را نمایش می‌دهد که از workflow مرجوعی
              یا اصلاحات داخلی سفارش ثبت شده‌اند.
            </p>
          </div>

          <div className="grid gap-2 md:grid-cols-[260px_190px_170px]">
            <div className="relative">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="جستجو سفارش، مشتری، موبایل، بارکد..."
                className="h-12 w-full rounded-[1.4rem] bg-white/60 pr-11 pl-4 text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground/70 focus:bg-white/80 dark:bg-white/[0.05] dark:focus:bg-white/[0.07]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as ReturnStatusFilter)
              }
              className="h-12 rounded-[1.4rem] bg-white/60 px-4 text-sm font-black text-foreground outline-none dark:bg-white/[0.05]"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="needs_follow_up">نیازمند پیگیری</option>
              <option value="kiyan_registered">ثبت‌شده در کیان</option>
              <option value="completed">تکمیل‌شده</option>
              <option value="snapp_sync">نیازمند sync اسنپ</option>
              <option value="missing_kiyan">بدون سند کیان</option>
              <option value="cancelled">لغوشده</option>
            </select>

            <select
              value={amountFilter}
              onChange={(event) =>
                setAmountFilter(event.target.value as ReturnAmountFilter)
              }
              className="h-12 rounded-[1.4rem] bg-white/60 px-4 text-sm font-black text-foreground outline-none dark:bg-white/[0.05]"
            >
              <option value="all">همه مبالغ</option>
              <option value="has_amount">دارای مبلغ مرجوعی</option>
              <option value="no_amount">بدون مبلغ مرجوعی</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MiniStat
            icon={AlertTriangle}
            label="نیازمند پیگیری"
            value={stats.needsFollowUp.toLocaleString("fa-IR")}
            tone="rose"
          />

          <MiniStat
            icon={ReceiptText}
            label="بدون سند کیان"
            value={stats.missingKiyan.toLocaleString("fa-IR")}
            tone="amber"
          />

          <MiniStat
            icon={Smartphone}
            label="اسنپ نیازمند sync"
            value={stats.snappSync.toLocaleString("fa-IR")}
            tone="sky"
          />

          <MiniStat
            icon={CheckCircle2}
            label="تکمیل‌شده"
            value={stats.completed.toLocaleString("fa-IR")}
            tone="emerald"
          />
        </div>
      </section>

      <section className="grid gap-3">
        {filteredOrders.length ? (
          filteredOrders.map((order) => (
            <ReturnOrderCard key={order.id} order={order} />
          ))
        ) : (
          <EmptyState
            hasAnyReturn={returnOrders.length > 0}
            hasQuery={Boolean(query.trim())}
          />
        )}
      </section>
    </OrdersWorkspaceShell>
  );
}

function ReturnOrderCard({ order }: { order: SalesOrder }) {
  const returnInfo = order.returnInfo as ReturnInfo;

  const returnedProducts = getReturnedProducts(order);
  const returnedQuantity = getReturnedQuantity(order);
  const returnDocumentBarcode =
    returnInfo.returnKiyanBarcode || findReturnDocumentBarcode(order);

  const needsFollowUp = isReturnNeedsFollowUp(order);
  const snappNeedsSync = isSnappReturnNeedsSync(order);

  return (
    <article className="group rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/70 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr_auto] xl:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={getSalesOrderDetailPath(order.id)}
              className="text-base font-black text-foreground transition hover:text-rose-700 dark:hover:text-rose-300"
            >
              سفارش #{order.id}
            </Link>

            <StatusPill status={returnInfo.status} />

            {needsFollowUp ? (
              <span className="rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-black text-rose-700 dark:text-rose-300">
                نیازمند پیگیری
              </span>
            ) : null}

            {snappNeedsSync ? (
              <span className="rounded-full bg-sky-500/10 px-3 py-1 text-[11px] font-black text-sky-700 dark:text-sky-300">
                sync اسنپ
              </span>
            ) : null}
          </div>

          <p className="mt-2 text-sm font-bold text-muted-foreground">
            {order.customer.fullName} · {order.customer.mobile} ·{" "}
            {order.customer.city}
          </p>

          <p className="mt-1 text-xs font-bold text-muted-foreground">
            وضعیت سفارش: {getStatusLabel(order.status)} · درگاه:{" "}
            {getGatewayLabel(order.payment.gateway)}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <SoftChip
              label="تعداد برگشتی"
              value={`${returnedQuantity.toLocaleString("fa-IR")} عدد`}
            />

            <SoftChip
              label="مبلغ مرجوعی"
              value={
                returnInfo.returnedAmount
                  ? `${returnInfo.returnedAmount.toLocaleString(
                      "fa-IR"
                    )} تومان`
                  : "ثبت نشده"
              }
            />

            <SoftChip
              label="تاریخ ثبت"
              value={formatDate(returnInfo.createdAt)}
            />
          </div>

          {returnInfo.reason ? (
            <p className="mt-3 rounded-[1.4rem] bg-white/45 px-3 py-2 text-xs font-bold leading-6 text-muted-foreground dark:bg-white/[0.04]">
              <span className="font-black text-foreground">دلیل: </span>
              {returnInfo.reason}
            </p>
          ) : null}
        </div>

        <div className="rounded-[1.5rem] bg-white/45 p-3 dark:bg-white/[0.04]">
          <h3 className="flex items-center gap-2 text-sm font-black text-foreground">
            <ClipboardCheck className="h-4 w-4 text-rose-700 dark:text-rose-300" />
            اسناد کیان
          </h3>

          <div className="mt-3 grid gap-2">
            <InfoRow
              label="فروش اصلی"
              value={order.kiyanInvoice.code || "ثبت نشده"}
              dir="ltr"
            />

            <InfoRow
              label="فاکتور مرجوعی"
              value={returnDocumentBarcode || "ثبت نشده"}
              dir="ltr"
            />

            <InfoRow
              label="وضعیت سند"
              value={
                returnDocumentBarcode
                  ? "دارای بارکد مرجوعی"
                  : "بدون سند مرجوعی"
              }
            />
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-white/45 p-3 dark:bg-white/[0.04]">
          <h3 className="flex items-center gap-2 text-sm font-black text-foreground">
            <PackageCheck className="h-4 w-4 text-rose-700 dark:text-rose-300" />
            کالاهای برگشتی
          </h3>

          <div className="mt-3 grid gap-2">
            {returnedProducts.length ? (
              returnedProducts.slice(0, 3).map((product) => (
                <div
                  key={product.id}
                  className="rounded-[1.1rem] bg-white/45 px-3 py-2 dark:bg-white/[0.04]"
                >
                  <p className="truncate text-xs font-black text-foreground">
                    {product.title}
                  </p>

                  <p className="mt-1 text-[11px] font-bold text-muted-foreground">
                    {product.productCode} · {product.color ?? "-"} ·{" "}
                    {product.size ?? "-"} · {product.quantity} عدد
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-[1.1rem] bg-rose-500/10 px-3 py-2 text-xs font-black text-rose-700 dark:text-rose-300">
                کالای برگشتی مشخص نشده است.
              </p>
            )}

            {returnedProducts.length > 3 ? (
              <p className="text-xs font-black text-muted-foreground">
                +{returnedProducts.length - 3} مورد دیگر
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2 xl:min-w-[150px]">
          <Link
            href={getSalesOrderDetailPath(order.id)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[1.3rem] bg-white/65 px-4 text-xs font-black text-foreground transition hover:-translate-y-0.5 dark:bg-white/[0.06]"
          >
            جزئیات
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <Link
            href={getSalesOrderReturnCreatePath(order.id)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[1.3rem] bg-rose-600 px-4 text-xs font-black text-white shadow-[0_14px_32px_rgba(225,29,72,0.18)] transition hover:-translate-y-0.5"
          >
            ادامه / اصلاح مرجوعی
          </Link>
        </div>
      </div>
    </article>
  );
}

function EmptyState({
  hasAnyReturn,
  hasQuery,
}: {
  hasAnyReturn: boolean;
  hasQuery: boolean;
}) {
  return (
    <section className="rounded-[2rem] bg-white/55 p-8 text-center shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-700 dark:text-rose-300">
        <RotateCcw className="h-7 w-7" />
      </div>

      <h2 className="mt-4 text-lg font-black text-foreground">
        {hasAnyReturn
          ? "مرجوعی با این فیلتر پیدا نشد"
          : "هنوز مرجوعی ثبت نشده است"}
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
        {hasQuery
          ? "عبارت جستجو یا فیلترها را تغییر بده."
          : "وقتی از صفحه جزئیات سفارش، workflow مرجوعی ثبت شود، اینجا نمایش داده می‌شود."}
      </p>
    </section>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "sky" | "amber" | "rose" | "emerald";
}) {
  const toneClass = {
    sky: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    rose: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  }[tone];

  return (
    <div className="flex items-center gap-3 rounded-[1.5rem] bg-white/45 p-3 dark:bg-white/[0.04]">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toneClass}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="text-xs font-black text-muted-foreground">{label}</p>
        <p className="mt-1 text-lg font-black text-foreground">{value}</p>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: ReturnInfo["status"] }) {
  const config = getReturnStatusConfig(status);

  return (
    <span
      className={[
        "rounded-full px-3 py-1 text-[11px] font-black",
        config.className,
      ].join(" ")}
    >
      {config.label}
    </span>
  );
}

function InfoRow({
  label,
  value,
  dir = "rtl",
}: {
  label: string;
  value: string;
  dir?: "rtl" | "ltr";
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.1rem] bg-white/45 px-3 py-2 dark:bg-white/[0.04]">
      <span className="shrink-0 text-[11px] font-black text-muted-foreground">
        {label}
      </span>

      <span
        dir={dir}
        className={[
          "truncate text-[11px] font-black text-foreground",
          dir === "ltr" ? "text-left" : "text-right",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function SoftChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/55 px-3 py-1 text-[11px] font-black text-muted-foreground dark:bg-white/[0.05]">
      {label}:
      <strong className="text-foreground">{value}</strong>
    </span>
  );
}

function getReturnStatusConfig(status: ReturnInfo["status"]) {
  if (status === "completed") {
    return {
      label: "تکمیل‌شده",
      className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    };
  }

  if (status === "kiyan_return_registered") {
    return {
      label: "ثبت‌شده در کیان",
      className: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    };
  }

  if (status === "approved") {
    return {
      label: "تاییدشده",
      className: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    };
  }

  if (status === "requested") {
    return {
      label: "درخواست مرجوعی",
      className: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    };
  }

  if (status === "cancelled") {
    return {
      label: "لغوشده",
      className: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
    };
  }

  return {
    label: "نامشخص",
    className: "bg-white/65 text-foreground dark:bg-white/[0.06]",
  };
}

function isReturnNeedsFollowUp(order: SalesOrder) {
  const returnInfo = order.returnInfo;

  if (!returnInfo || returnInfo.status === "none") return false;

  if (order.needsFollowUp) return true;

  if (returnInfo.status === "requested") return true;

  if (returnInfo.status === "approved" && !returnInfo.returnKiyanBarcode) {
    return true;
  }

  if (!returnInfo.returnKiyanBarcode && returnInfo.status !== "cancelled") {
    return true;
  }

  if (isSnappReturnNeedsSync(order)) return true;

  return false;
}

function isSnappReturnNeedsSync(order: SalesOrder) {
  const returnInfo = order.returnInfo;

  if (!returnInfo || returnInfo.status === "none") return false;

  return (
    order.payment.gateway === "snapp_pay" &&
    returnInfo.status === "kiyan_return_registered"
  );
}

function getReturnedProducts(order: SalesOrder) {
  const returnInfo = order.returnInfo;

  if (!returnInfo || returnInfo.status === "none") return [];

  if (returnInfo.returnedItems?.length) {
    return returnInfo.returnedItems.map((returnedItem) => {
      const product = order.products.find(
        (item) => item.id === returnedItem.productId
      );

      if (!product) {
        return {
          id: returnedItem.productId,
          title: `محصول ${returnedItem.productId}`,
          productCode: returnedItem.productId,
          barcode: returnedItem.productId,
          quantity: returnedItem.quantity,
        };
      }

      return {
        ...product,
        quantity: returnedItem.quantity,
      };
    });
  }

  return order.products.filter((product) =>
    returnInfo.returnedProductIds.includes(product.id)
  );
}

function getReturnedQuantity(order: SalesOrder) {
  const returnInfo = order.returnInfo;

  if (!returnInfo || returnInfo.status === "none") return 0;

  if (returnInfo.returnedItems?.length) {
    return returnInfo.returnedItems.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    );
  }

  return returnInfo.returnedProductIds.length;
}

function findReturnDocumentBarcode(order: SalesOrder) {
  const returnDocument = order.kiyanDocuments?.find(
    (document) => document.type === "return"
  );

  return returnDocument?.barcode;
}

function buildReturnSearchText(order: SalesOrder) {
  const returnInfo = order.returnInfo;
  const returnedProducts = getReturnedProducts(order);

  return [
    order.id,
    order.customer.fullName,
    order.customer.mobile,
    order.customer.city,
    order.status,
    order.payment.gateway,
    order.kiyanInvoice.code,
    returnInfo?.status,
    returnInfo?.reason,
    returnInfo?.returnKiyanBarcode,
    returnInfo?.returnedAmount,
    ...returnedProducts.flatMap((product) => [
      product.title,
      product.productCode,
      product.barcode,
      product.color,
      product.size,
    ]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function formatDate(value?: string) {
  if (!value) return "ثبت نشده";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("fa-IR");
}