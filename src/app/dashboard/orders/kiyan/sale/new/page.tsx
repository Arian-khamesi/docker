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
  CreditCard,
  FileWarning,
  PackageCheck,
  ReceiptText,
  Repeat2,
  RotateCcw,
  Search,
  Smartphone,
} from "lucide-react";

import {
  getSalesOrderDetailPath,
  getSalesOrderExchangeCreatePath,
  getSalesOrderKiyanSaleCreatePath,
  getSalesOrderReturnCreatePath,
} from "@/components/sales/orders/sales-orders.constants";
import { OrdersWorkspaceShell } from "@/components/sales/orders/workspaces/orders-workspace-shell";
import { getGatewayLabel, getStatusLabel } from "@/lib/orders/order-labels";
import { useSalesOrdersStore } from "@/store/sales-orders.store";
import type { SalesOrder } from "@/types/sales-order";

type KiyanTaskType =
  | "primary_sale"
  | "return_document"
  | "exchange_document"
  | "snapp_sync"
  | "financial_review"
  | "follow_up";

type KiyanTaskSeverity = "rose" | "amber" | "sky" | "violet" | "emerald";

type TaskFilter = KiyanTaskType | "all";

type GatewayFilter =
  | "all"
  | "saman"
  | "mellat"
  | "snapp_pay"
  | "medisa"
  | "wallet"
  | "unknown";

interface KiyanTask {
  id: string;
  type: KiyanTaskType;
  title: string;
  description: string;
  severity: KiyanTaskSeverity;
  actionLabel: string;
  actionHref: string;
}

interface KiyanOperationOrder {
  order: SalesOrder;
  tasks: KiyanTask[];
}

export default function KiyanOperationsCenterPage() {
  const { orders } = useSalesOrdersStore();

  const [query, setQuery] = useState("");
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");
  const [gatewayFilter, setGatewayFilter] = useState<GatewayFilter>("all");

  const operationOrders = useMemo<KiyanOperationOrder[]>(() => {
    return orders
      .map((order) => ({
        order,
        tasks: getKiyanTasks(order),
      }))
      .filter((item) => item.tasks.length > 0);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return operationOrders
      .filter((item) => {
        if (taskFilter !== "all") {
          if (!item.tasks.some((task) => task.type === taskFilter)) {
            return false;
          }
        }

        if (gatewayFilter !== "all") {
          if (item.order.payment.gateway !== gatewayFilter) {
            return false;
          }
        }

        if (!normalizedQuery) return true;

        return buildKiyanSearchText(item.order, item.tasks).includes(
          normalizedQuery
        );
      })
      .sort((a, b) => {
        const aScore = getOperationPriorityScore(a.tasks);
        const bScore = getOperationPriorityScore(b.tasks);

        if (aScore !== bScore) return bScore - aScore;

        return (
          new Date(b.order.createdAt).getTime() -
          new Date(a.order.createdAt).getTime()
        );
      });
  }, [gatewayFilter, operationOrders, query, taskFilter]);

  const stats = useMemo(() => {
    const allTasks = operationOrders.flatMap((item) => item.tasks);

    return {
      totalOrders: operationOrders.length,
      primaryMissing: allTasks.filter((task) => task.type === "primary_sale")
        .length,
      documentMissing: allTasks.filter(
        (task) =>
          task.type === "return_document" ||
          task.type === "exchange_document"
      ).length,
      snappSync: allTasks.filter((task) => task.type === "snapp_sync").length,
      financialReview: allTasks.filter(
        (task) => task.type === "financial_review"
      ).length,
      followUp: allTasks.filter((task) => task.type === "follow_up").length,
    };
  }, [operationOrders]);

  return (
    <OrdersWorkspaceShell
      eyebrow="Kiyan Operations Center"
      title="مرکز عملیات کیان"
      description="نمای عملیاتی برای پیگیری سفارش‌های بدون فاکتور کیان، مرجوعی‌های بدون سند، تعویض‌های ناقص، مغایرت مالی و sync اسنپ."
      icon={BadgeDollarSign}
      tone="sky"
      actionLabel="همه سفارشات"
      actionHref="/dashboard/orders"
      cards={[
        {
          label: "موارد عملیاتی",
          value: stats.totalOrders.toLocaleString("fa-IR"),
          description: "سفارش‌هایی که نیازمند اقدام هستند",
        },
        {
          label: "فروش ثبت‌نشده",
          value: stats.primaryMissing.toLocaleString("fa-IR"),
          description: "پرداخت موفق ولی بدون فاکتور کیان",
        },
        {
          label: "اسناد ناقص",
          value: stats.documentMissing.toLocaleString("fa-IR"),
          description: "مرجوعی یا تعویض بدون سند کامل",
        },
        {
          label: "sync اسنپ",
          value: stats.snappSync.toLocaleString("fa-IR"),
          description: "نیازمند پیگیری سمت SnappPay",
        },
      ]}
    >
      <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-lg font-black text-foreground">
              صف کارهای کیان
            </h2>

            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              این صفحه خودش عملیات انجام نمی‌دهد؛ فقط سفارش‌هایی را که برای
              کیان، اسنپ یا مغایرت مالی نیازمند اقدام هستند، یک‌جا جمع می‌کند.
            </p>
          </div>

          <div className="grid gap-2 md:grid-cols-[280px_210px_170px]">
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
              value={taskFilter}
              onChange={(event) =>
                setTaskFilter(event.target.value as TaskFilter)
              }
              className="h-12 rounded-[1.4rem] bg-white/60 px-4 text-sm font-black text-foreground outline-none dark:bg-white/[0.05]"
            >
              <option value="all">همه عملیات‌ها</option>
              <option value="primary_sale">فروش کیان ثبت‌نشده</option>
              <option value="return_document">مرجوعی بدون سند</option>
              <option value="exchange_document">تعویض ناقص کیان</option>
              <option value="snapp_sync">sync اسنپ</option>
              <option value="financial_review">مغایرت مالی</option>
              <option value="follow_up">پیگیری عمومی</option>
            </select>

            <select
              value={gatewayFilter}
              onChange={(event) =>
                setGatewayFilter(event.target.value as GatewayFilter)
              }
              className="h-12 rounded-[1.4rem] bg-white/60 px-4 text-sm font-black text-foreground outline-none dark:bg-white/[0.05]"
            >
              <option value="all">همه درگاه‌ها</option>
              <option value="saman">سامان</option>
              <option value="mellat">ملت</option>
              <option value="snapp_pay">اسنپ‌پی</option>
              <option value="medisa">مدیسه</option>
              <option value="wallet">اعتبار / کیف پول</option>
              <option value="unknown">نامشخص</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MiniStat
            icon={ReceiptText}
            label="فروش ثبت‌نشده"
            value={stats.primaryMissing.toLocaleString("fa-IR")}
            tone="amber"
          />

          <MiniStat
            icon={RotateCcw}
            label="مرجوعی بدون سند"
            value={countTasks(operationOrders, "return_document").toLocaleString(
              "fa-IR"
            )}
            tone="rose"
          />

          <MiniStat
            icon={Repeat2}
            label="تعویض ناقص"
            value={countTasks(
              operationOrders,
              "exchange_document"
            ).toLocaleString("fa-IR")}
            tone="violet"
          />

          <MiniStat
            icon={Smartphone}
            label="sync اسنپ"
            value={stats.snappSync.toLocaleString("fa-IR")}
            tone="sky"
          />

          <MiniStat
            icon={FileWarning}
            label="مغایرت مالی"
            value={stats.financialReview.toLocaleString("fa-IR")}
            tone="rose"
          />
        </div>
      </section>

      <section className="grid gap-3">
        {filteredOrders.length ? (
          filteredOrders.map((item) => (
            <KiyanOperationCard
              key={item.order.id}
              order={item.order}
              tasks={item.tasks}
            />
          ))
        ) : (
          <EmptyState
            hasAnyOperation={operationOrders.length > 0}
            hasQuery={Boolean(query.trim())}
          />
        )}
      </section>
    </OrdersWorkspaceShell>
  );
}

function KiyanOperationCard({
  order,
  tasks,
}: {
  order: SalesOrder;
  tasks: KiyanTask[];
}) {
  const primaryTask = tasks[0];

  return (
    <article className="group rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/70 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]">
      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr_1fr_auto] xl:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={getSalesOrderDetailPath(order.id)}
              className="text-base font-black text-foreground transition hover:text-sky-700 dark:hover:text-sky-300"
            >
              سفارش #{order.id}
            </Link>

            <PrimaryKiyanPill order={order} />

            {order.needsFollowUp ? (
              <span className="rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-black text-rose-700 dark:text-rose-300">
                پیگیری باز
              </span>
            ) : null}

            {order.payment.gateway === "snapp_pay" ? (
              <span className="rounded-full bg-sky-500/10 px-3 py-1 text-[11px] font-black text-sky-700 dark:text-sky-300">
                SnappPay
              </span>
            ) : null}
          </div>

          <p className="mt-2 text-sm font-bold text-muted-foreground">
            {order.customer.fullName} · {order.customer.mobile} ·{" "}
            {order.customer.city}
          </p>

          <p className="mt-1 text-xs font-bold text-muted-foreground">
            وضعیت سفارش: {getStatusLabel(order.status)} · درگاه:{" "}
            {getGatewayLabel(order.payment.gateway)} · مبلغ:{" "}
            {order.payableAmount.toLocaleString("fa-IR")} تومان
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <SoftChip
              label="پرداخت"
              value={isPaymentSuccess(order) ? "موفق" : "ناموفق / ناقص"}
            />

            <SoftChip
              label="تاریخ"
              value={formatDate(order.createdAt)}
            />

            <SoftChip
              label="تعداد عملیات"
              value={`${tasks.length.toLocaleString("fa-IR")} مورد`}
            />
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-white/45 p-3 dark:bg-white/[0.04]">
          <h3 className="flex items-center gap-2 text-sm font-black text-foreground">
            <ClipboardCheck className="h-4 w-4 text-sky-700 dark:text-sky-300" />
            وضعیت اسناد کیان
          </h3>

          <div className="mt-3 grid gap-2">
            <InfoRow
              label="فروش اصلی"
              value={order.kiyanInvoice.code || "ثبت نشده"}
              dir="ltr"
            />

            <InfoRow
              label="مرجوعی"
              value={
                order.returnInfo?.returnKiyanBarcode ||
                findKiyanDocumentBarcode(order, "return") ||
                "ثبت نشده"
              }
              dir="ltr"
            />

            <InfoRow
              label="برگشت تعویض"
              value={
                order.exchangeInfo?.returnKiyanBarcode ||
                findKiyanDocumentBarcode(order, "return") ||
                "ثبت نشده"
              }
              dir="ltr"
            />

            <InfoRow
              label="فروش جایگزین"
              value={order.exchangeInfo?.replacementKiyanBarcode || "ثبت نشده"}
              dir="ltr"
            />
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-white/45 p-3 dark:bg-white/[0.04]">
          <h3 className="flex items-center gap-2 text-sm font-black text-foreground">
            <PackageCheck className="h-4 w-4 text-sky-700 dark:text-sky-300" />
            عملیات‌های لازم
          </h3>

          <div className="mt-3 grid gap-2">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 xl:min-w-[160px]">
          <Link
            href={primaryTask.actionHref}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[1.3rem] bg-sky-600 px-4 text-xs font-black text-white shadow-[0_14px_32px_rgba(2,132,199,0.18)] transition hover:-translate-y-0.5"
          >
            {primaryTask.actionLabel}
          </Link>

          <Link
            href={getSalesOrderDetailPath(order.id)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[1.3rem] bg-white/65 px-4 text-xs font-black text-foreground transition hover:-translate-y-0.5 dark:bg-white/[0.06]"
          >
            جزئیات
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function TaskRow({ task }: { task: KiyanTask }) {
  const Icon = getTaskIcon(task.type);

  return (
    <div className="rounded-[1.2rem] bg-white/45 p-3 dark:bg-white/[0.04]">
      <div className="flex items-start gap-2">
        <div
          className={[
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl",
            getSeverityClass(task.severity),
          ].join(" ")}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-black text-foreground">{task.title}</p>

          <p className="mt-1 text-[11px] font-bold leading-5 text-muted-foreground">
            {task.description}
          </p>

          <Link
            href={task.actionHref}
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-black text-sky-700 transition hover:opacity-80 dark:text-sky-300"
          >
            {task.actionLabel}
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  hasAnyOperation,
  hasQuery,
}: {
  hasAnyOperation: boolean;
  hasQuery: boolean;
}) {
  return (
    <section className="rounded-[2rem] bg-white/55 p-8 text-center shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
        <CheckCircle2 className="h-7 w-7" />
      </div>

      <h2 className="mt-4 text-lg font-black text-foreground">
        {hasAnyOperation
          ? "موردی با این فیلتر پیدا نشد"
          : "فعلاً عملیات باز برای کیان وجود ندارد"}
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
        {hasQuery
          ? "عبارت جستجو یا فیلترها را تغییر بده."
          : "وقتی سفارشی فاکتور کیان نداشته باشد یا مرجوعی/تعویض ناقص باشد، اینجا نمایش داده می‌شود."}
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
  tone: "sky" | "amber" | "rose" | "emerald" | "violet";
}) {
  const toneClass = {
    sky: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    rose: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    violet: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
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

function PrimaryKiyanPill({ order }: { order: SalesOrder }) {
  if (hasPrimaryKiyan(order)) {
    return (
      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-black text-emerald-700 dark:text-emerald-300">
        فروش کیان ثبت شده
      </span>
    );
  }

  if (isPaymentSuccess(order)) {
    return (
      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-black text-amber-700 dark:text-amber-300">
        بدون فاکتور کیان
      </span>
    );
  }

  return (
    <span className="rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-black text-rose-700 dark:text-rose-300">
      پرداخت ناموفق
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

function getKiyanTasks(order: SalesOrder): KiyanTask[] {
  const tasks: KiyanTask[] = [];

  const paymentSuccess = isPaymentSuccess(order);
  const primaryKiyanExists = hasPrimaryKiyan(order);

  if (paymentSuccess && !primaryKiyanExists) {
    tasks.push({
      id: `primary-sale-${order.id}`,
      type: "primary_sale",
      title: "فروش در کیان ثبت نشده",
      description:
        "پرداخت سفارش موفق است ولی فاکتور فروش اصلی در کیان ثبت نشده یا بارکد ندارد.",
      severity: "amber",
      actionLabel: "ثبت فروش کیان",
      actionHref: getSalesOrderKiyanSaleCreatePath(order.id),
    });
  }

  if (!paymentSuccess && primaryKiyanExists) {
    tasks.push({
      id: `financial-review-${order.id}`,
      type: "financial_review",
      title: "مغایرت پرداخت و کیان",
      description:
        "سفارش پرداخت موفق ندارد، اما برای آن فاکتور کیان ثبت شده است. نیازمند بررسی مالی یا اصلاح سند است.",
      severity: "rose",
      actionLabel: "بررسی جزئیات",
      actionHref: getSalesOrderDetailPath(order.id),
    });
  }

  const returnInfo = order.returnInfo;

  if (
    returnInfo &&
    returnInfo.status !== "none" &&
    returnInfo.status !== "cancelled" &&
    !returnInfo.returnKiyanBarcode
  ) {
    tasks.push({
      id: `return-document-${order.id}`,
      type: "return_document",
      title: "مرجوعی بدون سند کیان",
      description:
        "برای این سفارش مرجوعی ثبت شده، اما بارکد فاکتور مرجوعی کیان ذخیره نشده است.",
      severity: "rose",
      actionLabel: "ادامه مرجوعی",
      actionHref: getSalesOrderReturnCreatePath(order.id),
    });
  }

  const exchangeInfo = order.exchangeInfo;

  if (
    exchangeInfo &&
    exchangeInfo.status !== "none" &&
    exchangeInfo.status !== "cancelled" &&
    (!exchangeInfo.returnKiyanBarcode ||
      !exchangeInfo.replacementKiyanBarcode)
  ) {
    const missingParts = [
      !exchangeInfo.returnKiyanBarcode ? "سند برگشت" : null,
      !exchangeInfo.replacementKiyanBarcode ? "فروش جایگزین" : null,
    ]
      .filter(Boolean)
      .join(" و ");

    tasks.push({
      id: `exchange-document-${order.id}`,
      type: "exchange_document",
      title: "تعویض ناقص در کیان",
      description: `${missingParts} برای تعویض کامل نشده یا بارکد آن ذخیره نشده است.`,
      severity: "violet",
      actionLabel: "ادامه تعویض",
      actionHref: getSalesOrderExchangeCreatePath(order.id),
    });
  }

  if (isSnappSyncRequired(order)) {
    tasks.push({
      id: `snapp-sync-${order.id}`,
      type: "snapp_sync",
      title: "نیازمند sync اسنپ",
      description:
        "سفارش با SnappPay مرتبط است و بعد از ثبت کیان، باید وضعیت کالا/مبلغ در اسنپ بررسی یا sync شود.",
      severity: "sky",
      actionLabel: "بررسی جزئیات",
      actionHref: getSalesOrderDetailPath(order.id),
    });
  }

  if (order.needsFollowUp && tasks.length === 0) {
    tasks.push({
      id: `follow-up-${order.id}`,
      type: "follow_up",
      title: "پیگیری باز",
      description:
        "این سفارش نیازمند پیگیری علامت خورده، ولی نوع عملیات دقیق آن از وضعیت کیان مشخص نیست.",
      severity: "amber",
      actionLabel: "بررسی جزئیات",
      actionHref: getSalesOrderDetailPath(order.id),
    });
  }

  return tasks;
}

function isPaymentSuccess(order: SalesOrder) {
  return order.payment.statusCode === 100 || order.status === "payment_success";
}

function hasPrimaryKiyan(order: SalesOrder) {
  return order.kiyanInvoice.status === "created" || Boolean(order.kiyanInvoice.code);
}

function isSnappSyncRequired(order: SalesOrder) {
  const returnNeedsSync =
    order.payment.gateway === "snapp_pay" &&
    order.returnInfo?.status === "kiyan_return_registered";

  const exchangeNeedsSync =
    order.payment.gateway === "snapp_pay" &&
    order.exchangeInfo?.status === "kiyan_exchange_registered";

  const externalSyncNeedsReview =
    order.externalSync?.status === "pending" ||
    order.externalSync?.status === "failed" ||
    order.externalSync?.status === "manual_review";

  return Boolean(returnNeedsSync || exchangeNeedsSync || externalSyncNeedsReview);
}

function findKiyanDocumentBarcode(
  order: SalesOrder,
  type: "return" | "exchange" | "primary"
) {
  const document = order.kiyanDocuments?.find((item) => item.type === type);

  return document?.barcode;
}

function countTasks(
  operationOrders: KiyanOperationOrder[],
  type: KiyanTaskType
) {
  return operationOrders.reduce(
    (total, item) =>
      total + item.tasks.filter((task) => task.type === type).length,
    0
  );
}

function getOperationPriorityScore(tasks: KiyanTask[]) {
  return tasks.reduce((score, task) => {
    if (task.type === "financial_review") return score + 60;
    if (task.type === "primary_sale") return score + 50;
    if (task.type === "exchange_document") return score + 40;
    if (task.type === "return_document") return score + 35;
    if (task.type === "snapp_sync") return score + 30;
    if (task.type === "follow_up") return score + 20;

    return score;
  }, 0);
}

function getTaskIcon(type: KiyanTaskType): LucideIcon {
  if (type === "primary_sale") return ReceiptText;
  if (type === "return_document") return RotateCcw;
  if (type === "exchange_document") return Repeat2;
  if (type === "snapp_sync") return Smartphone;
  if (type === "financial_review") return FileWarning;

  return AlertTriangle;
}

function getSeverityClass(severity: KiyanTaskSeverity) {
  if (severity === "rose") {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
  }

  if (severity === "amber") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  if (severity === "violet") {
    return "bg-violet-500/10 text-violet-700 dark:text-violet-300";
  }

  if (severity === "emerald") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  return "bg-sky-500/10 text-sky-700 dark:text-sky-300";
}

function buildKiyanSearchText(order: SalesOrder, tasks: KiyanTask[]) {
  return [
    order.id,
    order.customer.fullName,
    order.customer.mobile,
    order.customer.city,
    order.status,
    order.payment.gateway,
    order.kiyanInvoice.code,
    order.returnInfo?.returnKiyanBarcode,
    order.returnInfo?.reason,
    order.exchangeInfo?.returnKiyanBarcode,
    order.exchangeInfo?.replacementKiyanBarcode,
    order.exchangeInfo?.replacementOrderNumber,
    order.externalSync?.status,
    ...tasks.flatMap((task) => [task.title, task.description, task.type]),
    ...order.products.flatMap((product) => [
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