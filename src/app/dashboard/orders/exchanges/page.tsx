"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
    AlertTriangle,
    ArrowLeft,
    BadgeDollarSign,
    CheckCircle2,
    ClipboardCheck,
    PackageCheck,
    Repeat2,
    Search,
    Smartphone,
} from "lucide-react";

import {
    getSalesOrderDetailPath,
    getSalesOrderExchangeCreatePath,
} from "@/components/sales/orders/sales-orders.constants";
import { OrdersWorkspaceShell } from "@/components/sales/orders/workspaces/orders-workspace-shell";
import { getGatewayLabel, getStatusLabel } from "@/lib/orders/order-labels";
import { useSalesOrdersStore } from "@/store/sales-orders.store";
import type {
    SalesOrder,
    SalesOrderExchangeDirection,
} from "@/types/sales-order";

type ExchangeInfo = NonNullable<SalesOrder["exchangeInfo"]>;

type ExchangeStatusFilter =
    | "all"
    | "needs_follow_up"
    | "kiyan_registered"
    | "completed"
    | "snapp_sync"
    | "missing_kiyan";

type ExchangeAmountFilter = "all" | "up" | "down" | "equal";

export default function ExchangesWorkspacePage() {
    const { orders } = useSalesOrdersStore();

    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] =
        useState<ExchangeStatusFilter>("all");
    const [amountFilter, setAmountFilter] = useState<ExchangeAmountFilter>("all");

    const exchangeOrders = useMemo(
        () => orders.filter((order) => Boolean(order.exchangeInfo)),
        [orders]
    );

    const filteredOrders = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return exchangeOrders
            .filter((order) => {
                const exchangeInfo = order.exchangeInfo;

                if (!exchangeInfo) return false;

                if (amountFilter !== "all" && exchangeInfo.amountDirection !== amountFilter) {
                    return false;
                }

                if (statusFilter === "needs_follow_up") {
                    if (!isExchangeNeedsFollowUp(order)) return false;
                }

                if (statusFilter === "kiyan_registered") {
                    if (!exchangeInfo.replacementKiyanBarcode) return false;
                }

                if (statusFilter === "completed") {
                    if (exchangeInfo.status !== "completed") return false;
                }

                if (statusFilter === "snapp_sync") {
                    if (!isSnappExchangeNeedsSync(order)) return false;
                }

                if (statusFilter === "missing_kiyan") {
                    if (exchangeInfo.replacementKiyanBarcode) return false;
                }

                if (!normalizedQuery) return true;

                return buildExchangeSearchText(order).includes(normalizedQuery);
            })
            .sort((a, b) => {
                const aTime = new Date(a.exchangeInfo?.createdAt ?? a.createdAt).getTime();
                const bTime = new Date(b.exchangeInfo?.createdAt ?? b.createdAt).getTime();

                return bTime - aTime;
            });
    }, [amountFilter, exchangeOrders, query, statusFilter]);

    const stats = useMemo(() => {
        const total = exchangeOrders.length;

        const completed = exchangeOrders.filter(
            (order) => order.exchangeInfo?.status === "completed"
        ).length;

        const kiyanRegistered = exchangeOrders.filter(
            (order) => Boolean(order.exchangeInfo?.replacementKiyanBarcode)
        ).length;

        const needsFollowUp = exchangeOrders.filter(isExchangeNeedsFollowUp).length;

        const snappSync = exchangeOrders.filter(isSnappExchangeNeedsSync).length;

        const amountUp = exchangeOrders.filter(
            (order) => order.exchangeInfo?.amountDirection === "up"
        ).length;

        return {
            total,
            completed,
            kiyanRegistered,
            needsFollowUp,
            snappSync,
            amountUp,
        };
    }, [exchangeOrders]);

    return (
        <OrdersWorkspaceShell
            eyebrow="Exchanges Workspace"
            title="تعویض‌ها"
            description="نمای عملیاتی تعویض سفارش‌ها؛ شامل وضعیت ثبت کیان، کالای برگشتی، کالای جایگزین، اختلاف مبلغ و پیگیری sync اسنپ."
            icon={Repeat2}
            tone="violet"
            actionLabel="همه سفارشات"
            actionHref="/dashboard/orders"
            cards={[
                {
                    label: "کل تعویض‌ها",
                    value: stats.total.toLocaleString("fa-IR"),
                    description: "تعویض‌های ثبت‌شده در سفارش‌ها",
                },
                {
                    label: "ثبت‌شده در کیان",
                    value: stats.kiyanRegistered.toLocaleString("fa-IR"),
                    description: "دارای بارکد فروش جایگزین",
                },
                {
                    label: "تکمیل‌شده",
                    value: stats.completed.toLocaleString("fa-IR"),
                    description: "تعویض‌های بدون پیگیری باز",
                },
                {
                    label: "نیازمند پیگیری",
                    value: stats.needsFollowUp.toLocaleString("fa-IR"),
                    description: "ناقص، اسنپی یا بدون سند کیان",
                },
            ]}
        >
            <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <h2 className="text-lg font-black text-foreground">
                            مدیریت و پیگیری تعویض‌ها
                        </h2>

                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                            این صفحه دیتای ساخته‌شده در workflow تعویض را نمایش می‌دهد؛ برای
                            انجام عملیات اصلی، وارد جزئیات سفارش یا صفحه ثبت تعویض شوید.
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
                                setStatusFilter(event.target.value as ExchangeStatusFilter)
                            }
                            className="h-12 rounded-[1.4rem] bg-white/60 px-4 text-sm font-black text-foreground outline-none dark:bg-white/[0.05]"
                        >
                            <option value="all">همه وضعیت‌ها</option>
                            <option value="needs_follow_up">نیازمند پیگیری</option>
                            <option value="kiyan_registered">ثبت‌شده در کیان</option>
                            <option value="completed">تکمیل‌شده</option>
                            <option value="snapp_sync">نیازمند sync اسنپ</option>
                            <option value="missing_kiyan">بدون بارکد کیان</option>
                        </select>

                        <select
                            value={amountFilter}
                            onChange={(event) =>
                                setAmountFilter(event.target.value as ExchangeAmountFilter)
                            }
                            className="h-12 rounded-[1.4rem] bg-white/60 px-4 text-sm font-black text-foreground outline-none dark:bg-white/[0.05]"
                        >
                            <option value="all">همه اختلاف‌ها</option>
                            <option value="up">پرداخت بیشتر</option>
                            <option value="down">برگشت مبلغ</option>
                            <option value="equal">برابر</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MiniStat
                        icon={Smartphone}
                        label="اسنپ نیازمند sync"
                        value={stats.snappSync.toLocaleString("fa-IR")}
                        tone="sky"
                    />

                    <MiniStat
                        icon={BadgeDollarSign}
                        label="پرداخت اضافه"
                        value={stats.amountUp.toLocaleString("fa-IR")}
                        tone="amber"
                    />

                    <MiniStat
                        icon={AlertTriangle}
                        label="نیازمند پیگیری"
                        value={stats.needsFollowUp.toLocaleString("fa-IR")}
                        tone="rose"
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
                        <ExchangeOrderCard key={order.id} order={order} />
                    ))
                ) : (
                    <EmptyState
                        hasAnyExchange={exchangeOrders.length > 0}
                        hasQuery={Boolean(query.trim())}
                    />
                )}
            </section>
        </OrdersWorkspaceShell>
    );
}

function ExchangeOrderCard({ order }: { order: SalesOrder }) {
    const exchangeInfo = order.exchangeInfo as ExchangeInfo;

    const returnedQty =
        exchangeInfo.returnedItems?.reduce(
            (total, item) => total + Number(item.quantity || 0),
            0
        ) ?? exchangeInfo.returnedProductIds.length;

    const replacementQty = exchangeInfo.replacementProducts.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
    );

    const isSnapp = order.payment.gateway === "snapp_pay";
    const snappNeedsSync = isSnappExchangeNeedsSync(order);
    const needsFollowUp = isExchangeNeedsFollowUp(order);
    const returnDocumentBarcode =
        exchangeInfo.returnKiyanBarcode || findReturnDocumentBarcode(order);

    return (
        <article className="group rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/70 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]">
            <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr_auto] xl:items-start">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href={getSalesOrderDetailPath(order.id)}
                            className="text-base font-black text-foreground transition hover:text-violet-700 dark:hover:text-violet-300"
                        >
                            سفارش #{order.id}
                        </Link>

                        <StatusPill status={exchangeInfo.status} />

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
                        <SoftChip label="کالا برگشتی" value={`${returnedQty} عدد`} />
                        <SoftChip label="جایگزین" value={`${replacementQty} عدد`} />
                        <SoftChip
                            label="اختلاف"
                            value={`${exchangeInfo.amountDifference.toLocaleString(
                                "fa-IR"
                            )} تومان`}
                        />
                        <SoftChip
                            label="جهت"
                            value={getAmountDirectionLabel(exchangeInfo.amountDirection)}
                        />
                    </div>
                </div>

                <div className="rounded-[1.5rem] bg-white/45 p-3 dark:bg-white/[0.04]">
                    <h3 className="flex items-center gap-2 text-sm font-black text-foreground">
                        <ClipboardCheck className="h-4 w-4 text-violet-700 dark:text-violet-300" />
                        اسناد کیان
                    </h3>

                    <div className="mt-3 grid gap-2">
                        <InfoRow
                            label="فروش اصلی"
                            value={order.kiyanInvoice.code || "ثبت نشده"}
                            dir="ltr"
                        />

                        <InfoRow
                            label="سند برگشت"
                            value={returnDocumentBarcode || "ثبت نشده / ذخیره نشده"}
                            dir="ltr"
                        />

                        <InfoRow
                            label="فروش جایگزین"
                            value={exchangeInfo.replacementKiyanBarcode || "ثبت نشده"}
                            dir="ltr"
                        />

                        <InfoRow
                            label="سفارش جایگزین"
                            value={
                                exchangeInfo.replacementOrderNumber ||
                                (exchangeInfo.replacementOrderId
                                    ? String(exchangeInfo.replacementOrderId)
                                    : "ثبت نشده")
                            }
                            dir="ltr"
                        />
                    </div>
                </div>

                <div className="rounded-[1.5rem] bg-white/45 p-3 dark:bg-white/[0.04]">
                    <h3 className="flex items-center gap-2 text-sm font-black text-foreground">
                        <PackageCheck className="h-4 w-4 text-violet-700 dark:text-violet-300" />
                        کالاهای جایگزین
                    </h3>

                    <div className="mt-3 grid gap-2">
                        {exchangeInfo.replacementProducts.length ? (
                            exchangeInfo.replacementProducts.slice(0, 3).map((product) => (
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
                                کالای جایگزین ثبت نشده است.
                            </p>
                        )}

                        {exchangeInfo.replacementProducts.length > 3 ? (
                            <p className="text-xs font-black text-muted-foreground">
                                +{exchangeInfo.replacementProducts.length - 3} مورد دیگر
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
                        href={getSalesOrderExchangeCreatePath(order.id)}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-[1.3rem] bg-violet-600 px-4 text-xs font-black text-white shadow-[0_14px_32px_rgba(124,58,237,0.18)] transition hover:-translate-y-0.5"
                    >
                        ادامه / اصلاح تعویض
                    </Link>
                </div>
            </div>
        </article>
    );
}

function EmptyState({
    hasAnyExchange,
    hasQuery,
}: {
    hasAnyExchange: boolean;
    hasQuery: boolean;
}) {
    return (
        <section className="rounded-[2rem] bg-white/55 p-8 text-center shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
                <Repeat2 className="h-7 w-7" />
            </div>

            <h2 className="mt-4 text-lg font-black text-foreground">
                {hasAnyExchange
                    ? "تعویضی با این فیلتر پیدا نشد"
                    : "هنوز تعویضی ثبت نشده است"}
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
                {hasQuery
                    ? "عبارت جستجو یا فیلترها را تغییر بده."
                    : "وقتی از صفحه جزئیات سفارش، workflow تعویض ثبت شود، اینجا نمایش داده می‌شود."}
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
    icon: typeof Repeat2;
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
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toneClass}`}>
                <Icon className="h-5 w-5" />
            </div>

            <div>
                <p className="text-xs font-black text-muted-foreground">{label}</p>
                <p className="mt-1 text-lg font-black text-foreground">{value}</p>
            </div>
        </div>
    );
}

function StatusPill({ status }: { status: ExchangeInfo["status"] }) {
    const config = getExchangeStatusConfig(status);

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

function getExchangeStatusConfig(status: ExchangeInfo["status"]) {
    if (status === "completed") {
        return {
            label: "تکمیل‌شده",
            className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        };
    }

    if (status === "kiyan_exchange_registered") {
        return {
            label: "ثبت‌شده در کیان",
            className: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
        };
    }

    if (status === "replacement_order_created") {
        return {
            label: "سفارش جایگزین ساخته شده",
            className: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
        };
    }

    if (status === "processing") {
        return {
            label: "در حال پردازش",
            className: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
        };
    }

    if (status === "needs_review") {
        return {
            label: "نیازمند بررسی",
            className: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
        };
    }

    if (status === "cancelled") {
        return {
            label: "لغوشده",
            className: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
        };
    }

    return {
        label: "درخواست تعویض",
        className: "bg-white/65 text-foreground dark:bg-white/[0.06]",
    };
}

function getAmountDirectionLabel(direction: SalesOrderExchangeDirection) {
    if (direction === "up") return "پرداخت بیشتر";
    if (direction === "down") return "برگشت مبلغ";
    return "برابر";
}

function isExchangeNeedsFollowUp(order: SalesOrder) {
    const exchangeInfo = order.exchangeInfo;

    if (!exchangeInfo) return false;

    if (order.needsFollowUp) return true;

    if (exchangeInfo.status === "needs_review") return true;

    if (!exchangeInfo.replacementKiyanBarcode) return true;

    if (isSnappExchangeNeedsSync(order)) return true;

    return false;
}

function isSnappExchangeNeedsSync(order: SalesOrder) {
    const exchangeInfo = order.exchangeInfo;

    if (!exchangeInfo) return false;

    return (
        order.payment.gateway === "snapp_pay" &&
        exchangeInfo.status === "kiyan_exchange_registered"
    );
}

function findReturnDocumentBarcode(order: SalesOrder) {
    const returnDocument = order.kiyanDocuments?.find(
        (document) => document.type === "return"
    );

    return returnDocument?.barcode;
}

function buildExchangeSearchText(order: SalesOrder) {
    const exchangeInfo = order.exchangeInfo;

    return [
        order.id,
        order.customer.fullName,
        order.customer.mobile,
        order.customer.city,
        order.status,
        order.payment.gateway,
        order.kiyanInvoice.code,
        exchangeInfo?.replacementKiyanBarcode,
        exchangeInfo?.replacementOrderNumber,
        exchangeInfo?.replacementOrderId,
        exchangeInfo?.status,
        ...(exchangeInfo?.replacementProducts ?? []).flatMap((product) => [
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