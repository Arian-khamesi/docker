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
    getSalesOrderSnappUpdatePath,
} from "@/components/sales/orders/sales-orders.constants";
import { OrdersWorkspaceShell } from "@/components/sales/orders/workspaces/orders-workspace-shell";
import { getGatewayLabel, getStatusLabel } from "@/lib/orders/order-labels";
import { useSalesOrdersStore } from "@/store/sales-orders.store";
import type { SalesOrder } from "@/types/sales-order";

type SnappFilter =
    | "all"
    | "needs_sync"
    | "synced"
    | "failed"
    | "manual_review"
    | "kiyan_missing"
    | "return_sync"
    | "exchange_sync";

type SyncSeverity = "rose" | "amber" | "sky" | "emerald" | "violet";

interface SnappTask {
    id: string;
    title: string;
    description: string;
    severity: SyncSeverity;
    actionLabel: string;
    actionHref: string;
}

interface SnappOrderView {
    order: SalesOrder;
    tasks: SnappTask[];
}

export default function SnappOrdersWorkspacePage() {
    const { orders } = useSalesOrdersStore();

    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<SnappFilter>("all");

    const snappOrders = useMemo<SnappOrderView[]>(() => {
        return orders
            .filter(isSnappRelatedOrder)
            .map((order) => ({
                order,
                tasks: getSnappTasks(order),
            }));
    }, [orders]);

    const filteredOrders = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return snappOrders
            .filter(({ order, tasks }) => {
                if (filter === "needs_sync") {
                    if (!isSnappNeedsSync(order)) return false;
                }

                if (filter === "synced") {
                    if (order.externalSync?.status !== "synced") return false;
                }

                if (filter === "failed") {
                    if (order.externalSync?.status !== "failed") return false;
                }

                if (filter === "manual_review") {
                    if (order.externalSync?.status !== "manual_review") return false;
                }

                if (filter === "kiyan_missing") {
                    if (hasPrimaryKiyan(order)) return false;
                }

                if (filter === "return_sync") {
                    if (!isSnappReturnNeedsSync(order)) return false;
                }

                if (filter === "exchange_sync") {
                    if (!isSnappExchangeNeedsSync(order)) return false;
                }

                if (!normalizedQuery) return true;

                return buildSnappSearchText(order, tasks).includes(normalizedQuery);
            })
            .sort((a, b) => {
                const aScore = getSnappPriorityScore(a.order, a.tasks);
                const bScore = getSnappPriorityScore(b.order, b.tasks);

                if (aScore !== bScore) return bScore - aScore;

                return (
                    new Date(b.order.createdAt).getTime() -
                    new Date(a.order.createdAt).getTime()
                );
            });
    }, [filter, query, snappOrders]);

    const stats = useMemo(() => {
        const total = snappOrders.length;

        const needsSync = snappOrders.filter((item) =>
            isSnappNeedsSync(item.order)
        ).length;

        const synced = snappOrders.filter(
            (item) => item.order.externalSync?.status === "synced"
        ).length;

        const failed = snappOrders.filter(
            (item) => item.order.externalSync?.status === "failed"
        ).length;

        const manualReview = snappOrders.filter(
            (item) => item.order.externalSync?.status === "manual_review"
        ).length;

        const returnSync = snappOrders.filter((item) =>
            isSnappReturnNeedsSync(item.order)
        ).length;

        const exchangeSync = snappOrders.filter((item) =>
            isSnappExchangeNeedsSync(item.order)
        ).length;

        return {
            total,
            needsSync,
            synced,
            failed,
            manualReview,
            returnSync,
            exchangeSync,
        };
    }, [snappOrders]);

    return (
        <OrdersWorkspaceShell
            eyebrow="SnappPay Workspace"
            title="سفارش‌های اسنپ"
            description="نمای عملیاتی سفارش‌های SnappPay؛ شامل وضعیت کیان، مرجوعی، تعویض، sync خارجی و موارد نیازمند بررسی."
            icon={Smartphone}
            tone="sky"
            actionLabel="مرکز عملیات کیان"
            actionHref="/dashboard/orders/kiyan/sale/new"
            cards={[
                {
                    label: "کل سفارش‌های اسنپ",
                    value: stats.total.toLocaleString("fa-IR"),
                    description: "سفارش‌های مرتبط با SnappPay",
                },
                {
                    label: "نیازمند sync",
                    value: stats.needsSync.toLocaleString("fa-IR"),
                    description: "مرجوعی، تعویض یا sync ناقص",
                },
                {
                    label: "sync موفق",
                    value: stats.synced.toLocaleString("fa-IR"),
                    description: "سفارش‌های sync شده",
                },
                {
                    label: "نیازمند بررسی",
                    value: (stats.failed + stats.manualReview).toLocaleString("fa-IR"),
                    description: "failed یا manual review",
                },
            ]}
        >
            <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <h2 className="text-lg font-black text-foreground">
                            مانیتورینگ SnappPay
                        </h2>

                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                            این صفحه سفارش‌های مرتبط با اسنپ را از زاویه عملیاتی نشان می‌دهد؛
                            مخصوصاً وقتی مرجوعی یا تعویض باعث نیاز به sync کالا یا مبلغ شود.
                        </p>
                    </div>

                    <div className="grid gap-2 md:grid-cols-[290px_230px]">
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
                            value={filter}
                            onChange={(event) => setFilter(event.target.value as SnappFilter)}
                            className="h-12 rounded-[1.4rem] bg-white/60 px-4 text-sm font-black text-foreground outline-none dark:bg-white/[0.05]"
                        >
                            <option value="all">همه سفارش‌های اسنپ</option>
                            <option value="needs_sync">نیازمند sync</option>
                            <option value="synced">sync موفق</option>
                            <option value="failed">sync ناموفق</option>
                            <option value="manual_review">بررسی دستی</option>
                            <option value="kiyan_missing">بدون فروش کیان</option>
                            <option value="return_sync">مرجوعی نیازمند sync</option>
                            <option value="exchange_sync">تعویض نیازمند sync</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <MiniStat
                        icon={AlertTriangle}
                        label="نیازمند sync"
                        value={stats.needsSync.toLocaleString("fa-IR")}
                        tone="amber"
                    />

                    <MiniStat
                        icon={RotateCcw}
                        label="مرجوعی sync"
                        value={stats.returnSync.toLocaleString("fa-IR")}
                        tone="rose"
                    />

                    <MiniStat
                        icon={Repeat2}
                        label="تعویض sync"
                        value={stats.exchangeSync.toLocaleString("fa-IR")}
                        tone="violet"
                    />

                    <MiniStat
                        icon={FileWarning}
                        label="failed / review"
                        value={(stats.failed + stats.manualReview).toLocaleString("fa-IR")}
                        tone="rose"
                    />

                    <MiniStat
                        icon={CheckCircle2}
                        label="sync موفق"
                        value={stats.synced.toLocaleString("fa-IR")}
                        tone="emerald"
                    />
                </div>
            </section>

            <section className="grid gap-3">
                {filteredOrders.length ? (
                    filteredOrders.map(({ order, tasks }) => (
                        <SnappOrderCard key={order.id} order={order} tasks={tasks} />
                    ))
                ) : (
                    <EmptyState
                        hasAnySnappOrder={snappOrders.length > 0}
                        hasQuery={Boolean(query.trim())}
                    />
                )}
            </section>
        </OrdersWorkspaceShell>
    );
}

function SnappOrderCard({
    order,
    tasks,
}: {
    order: SalesOrder;
    tasks: SnappTask[];
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

                        <span className="rounded-full bg-sky-500/10 px-3 py-1 text-[11px] font-black text-sky-700 dark:text-sky-300">
                            SnappPay
                        </span>

                        <SyncStatusPill order={order} />

                        {!hasPrimaryKiyan(order) ? (
                            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-black text-amber-700 dark:text-amber-300">
                                بدون فروش کیان
                            </span>
                        ) : null}

                        {order.needsFollowUp ? (
                            <span className="rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-black text-rose-700 dark:text-rose-300">
                                پیگیری باز
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

                        <SoftChip label="تاریخ" value={formatDate(order.createdAt)} />

                        <SoftChip
                            label="sync"
                            value={getExternalSyncStatusLabel(order)}
                        />
                    </div>

                    {order.externalSync?.failedReason ? (
                        <p className="mt-3 rounded-[1.4rem] bg-rose-500/10 px-3 py-2 text-xs font-bold leading-6 text-rose-700 dark:text-rose-300">
                            دلیل خطا: {order.externalSync.failedReason}
                        </p>
                    ) : null}
                </div>

                <div className="rounded-[1.5rem] bg-white/45 p-3 dark:bg-white/[0.04]">
                    <h3 className="flex items-center gap-2 text-sm font-black text-foreground">
                        <ClipboardCheck className="h-4 w-4 text-sky-700 dark:text-sky-300" />
                        وضعیت اسناد
                    </h3>

                    <div className="mt-3 grid gap-2">
                        <InfoRow
                            label="فروش کیان"
                            value={order.kiyanInvoice.code || "ثبت نشده"}
                            dir="ltr"
                        />

                        <InfoRow
                            label="مرجوعی"
                            value={order.returnInfo?.returnKiyanBarcode || "ندارد / ثبت نشده"}
                            dir="ltr"
                        />

                        <InfoRow
                            label="برگشت تعویض"
                            value={
                                order.exchangeInfo?.returnKiyanBarcode || "ندارد / ثبت نشده"
                            }
                            dir="ltr"
                        />

                        <InfoRow
                            label="فروش جایگزین"
                            value={
                                order.exchangeInfo?.replacementKiyanBarcode ||
                                "ندارد / ثبت نشده"
                            }
                            dir="ltr"
                        />
                    </div>
                </div>

                <div className="rounded-[1.5rem] bg-white/45 p-3 dark:bg-white/[0.04]">
                    <h3 className="flex items-center gap-2 text-sm font-black text-foreground">
                        <PackageCheck className="h-4 w-4 text-sky-700 dark:text-sky-300" />
                        وضعیت عملیاتی
                    </h3>

                    <div className="mt-3 grid gap-2">
                        {tasks.length ? (
                            tasks.map((task) => <TaskRow key={task.id} task={task} />)
                        ) : (
                            <p className="rounded-[1.1rem] bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-700 dark:text-emerald-300">
                                مورد عملیاتی باز ندارد.
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2 xl:min-w-[160px]">
                    {primaryTask ? (
                        <Link
                            href={primaryTask.actionHref}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-[1.3rem] bg-sky-600 px-4 text-xs font-black text-white shadow-[0_14px_32px_rgba(2,132,199,0.18)] transition hover:-translate-y-0.5"
                        >
                            {primaryTask.actionLabel}
                        </Link>
                    ) : null}

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

function TaskRow({ task }: { task: SnappTask }) {
    return (
        <div className="rounded-[1.15rem] bg-white/45 p-3 dark:bg-white/[0.04]">
            <div className="flex items-start gap-2">
                <div
                    className={[
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl",
                        getSeverityClass(task.severity),
                    ].join(" ")}
                >
                    <AlertTriangle className="h-4 w-4" />
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
    hasAnySnappOrder,
    hasQuery,
}: {
    hasAnySnappOrder: boolean;
    hasQuery: boolean;
}) {
    return (
        <section className="rounded-[2rem] bg-white/55 p-8 text-center shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
                <Smartphone className="h-7 w-7" />
            </div>

            <h2 className="mt-4 text-lg font-black text-foreground">
                {hasAnySnappOrder
                    ? "سفارش اسنپی با این فیلتر پیدا نشد"
                    : "فعلاً سفارش اسنپی وجود ندارد"}
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
                {hasQuery
                    ? "عبارت جستجو یا فیلترها را تغییر بده."
                    : "وقتی سفارشی با SnappPay ثبت شود یا externalSync آن SnappPay باشد، اینجا نمایش داده می‌شود."}
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

function SyncStatusPill({ order }: { order: SalesOrder }) {
    const status = order.externalSync?.status ?? "not_required";

    if (isSnappNeedsSync(order)) {
        return (
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-black text-amber-700 dark:text-amber-300">
                نیازمند sync
            </span>
        );
    }

    if (status === "synced") {
        return (
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-black text-emerald-700 dark:text-emerald-300">
                sync موفق
            </span>
        );
    }

    if (status === "failed") {
        return (
            <span className="rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-black text-rose-700 dark:text-rose-300">
                sync ناموفق
            </span>
        );
    }

    if (status === "manual_review") {
        return (
            <span className="rounded-full bg-violet-500/10 px-3 py-1 text-[11px] font-black text-violet-700 dark:text-violet-300">
                بررسی دستی
            </span>
        );
    }

    return (
        <span className="rounded-full bg-white/65 px-3 py-1 text-[11px] font-black text-foreground dark:bg-white/[0.06]">
            sync ثبت نشده
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

function isSnappRelatedOrder(order: SalesOrder) {
    return (
        order.payment.gateway === "snapp_pay" ||
        order.externalSync?.provider === "snapp_pay"
    );
}

function getSnappTasks(order: SalesOrder): SnappTask[] {
    const tasks: SnappTask[] = [];

    if (isPaymentSuccess(order) && !hasPrimaryKiyan(order)) {
        tasks.push({
            id: `snapp-primary-kiyan-${order.id}`,
            title: "فروش کیان ثبت نشده",
            description:
                "سفارش SnappPay پرداخت موفق دارد اما فاکتور فروش کیان برای آن ثبت نشده است.",
            severity: "amber",
            actionLabel: "ثبت فروش کیان",
            actionHref: getSalesOrderKiyanSaleCreatePath(order.id),
        });
    }

    if (isSnappReturnNeedsSync(order)) {
        tasks.push({
            id: `snapp-return-sync-${order.id}`,
            title: "مرجوعی نیازمند sync اسنپ",
            description:
                "مرجوعی کیان ثبت شده و باید وضعیت کالا/مبلغ در SnappPay بررسی یا sync شود.",
            severity: "rose",
            actionLabel: "آپدیت اسنپ",
            actionHref: getSalesOrderSnappUpdatePath(order.id),
        });
    }

    if (isSnappExchangeNeedsSync(order)) {
        tasks.push({
            id: `snapp-exchange-sync-${order.id}`,
            title: "تعویض نیازمند sync اسنپ",
            description:
                "تعویض در کیان ثبت شده و باید کالای جایگزین یا اختلاف مبلغ در SnappPay بررسی شود.",
            severity: "violet",
            actionLabel: "آپدیت اسنپ",
actionHref: getSalesOrderSnappUpdatePath(order.id),
        });
    }

    if (
        order.externalSync?.status === "failed" ||
        order.externalSync?.status === "manual_review"
    ) {
        tasks.push({
            id: `snapp-external-review-${order.id}`,
            title:
                order.externalSync.status === "failed"
                    ? "sync ناموفق"
                    : "بررسی دستی sync",
            description:
                order.externalSync.failedReason ||
                "وضعیت sync خارجی نیازمند بررسی اپراتور است.",
            severity: "rose",
            actionLabel: "آپدیت اسنپ",
actionHref: getSalesOrderSnappUpdatePath(order.id),
        });
    }

    if (order.needsFollowUp && tasks.length === 0) {
        tasks.push({
            id: `snapp-follow-up-${order.id}`,
            title: "پیگیری باز",
            description:
                "سفارش SnappPay به عنوان نیازمند پیگیری علامت خورده اما نوع دقیق اقدام مشخص نیست.",
            severity: "amber",
            actionLabel: "بررسی جزئیات",
            actionHref: getSalesOrderDetailPath(order.id),
        });
    }

    return tasks;
}

function isSnappNeedsSync(order: SalesOrder) {
    return (
        isSnappReturnNeedsSync(order) ||
        isSnappExchangeNeedsSync(order) ||
        order.externalSync?.status === "pending" ||
        order.externalSync?.status === "failed" ||
        order.externalSync?.status === "manual_review"
    );
}

function isSnappReturnNeedsSync(order: SalesOrder) {
    return (
        order.payment.gateway === "snapp_pay" &&
        order.returnInfo?.status === "kiyan_return_registered"
    );
}

function isSnappExchangeNeedsSync(order: SalesOrder) {
    return (
        order.payment.gateway === "snapp_pay" &&
        order.exchangeInfo?.status === "kiyan_exchange_registered"
    );
}

function isPaymentSuccess(order: SalesOrder) {
    return order.payment.statusCode === 100 || order.status === "payment_success";
}

function hasPrimaryKiyan(order: SalesOrder) {
    return (
        order.kiyanInvoice.status === "created" || Boolean(order.kiyanInvoice.code)
    );
}

function getExternalSyncStatusLabel(order: SalesOrder) {
    const status = order.externalSync?.status ?? "not_required";

    if (status === "synced") return "sync موفق";
    if (status === "pending") return "در انتظار sync";
    if (status === "failed") return "sync ناموفق";
    if (status === "manual_review") return "بررسی دستی";
    if (status === "not_required") return "ثبت نشده / لازم نیست";

    return status;
}

function getSnappPriorityScore(order: SalesOrder, tasks: SnappTask[]) {
    let score = 0;

    if (order.externalSync?.status === "failed") score += 80;
    if (order.externalSync?.status === "manual_review") score += 70;
    if (!hasPrimaryKiyan(order) && isPaymentSuccess(order)) score += 60;
    if (isSnappExchangeNeedsSync(order)) score += 50;
    if (isSnappReturnNeedsSync(order)) score += 45;
    if (order.externalSync?.status === "pending") score += 35;
    if (order.needsFollowUp) score += 20;

    return score + tasks.length * 5;
}

function getSeverityClass(severity: SyncSeverity) {
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

function buildSnappSearchText(order: SalesOrder, tasks: SnappTask[]) {
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
        order.externalSync?.failedReason,
        ...tasks.flatMap((task) => [task.title, task.description]),
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