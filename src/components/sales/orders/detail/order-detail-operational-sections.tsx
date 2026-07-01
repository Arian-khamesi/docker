"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    Barcode,
    CheckCircle2,
    Clipboard,
    CreditCard,
    FilePlus2,
    Link2,
    Minus,
    PackageCheck,
    RefreshCw,
    Repeat2,
    RotateCcw,
    Save,
    ShieldCheck,
    StickyNote,
    Truck,
    Workflow,
    ArrowLeft,
    ClipboardList,
    BadgeDollarSign,
} from "lucide-react";

import type {
    SalesOrder,
    SalesOrderExternalSyncStatus,
} from "@/types/sales-order";
import { useSalesOrdersStore } from "@/store/sales-orders.store";
import {
    salesOrdersInputClass,
    salesOrdersPrimaryButtonClass,
    salesOrdersSecondaryButtonClass,
    getSalesOrderExchangeCreatePath,
    getSalesOrderReturnCreatePath,
    getSalesOrderKiyanSaleCreatePath,
} from "@/components/sales/orders/sales-orders.constants";
import {
    ChecklistItem,
    KiyanBadge,
    MiniOperationalBox,
    OperationalStatusTile,
    SectionHeader,
} from "@/components/sales/orders/detail/order-detail-shared";
import {
    getExchangeStatusLabel,
    getExternalProviderLabel,
    getExternalSyncStatusLabel,
    getKiyanStatusLabel,
    getReturnStatusLabel,
} from "@/lib/orders/order-labels";
import {
    getAccountingOperationalMeta,
    getExchangeAmountText,
    getExchangeOperationalMeta,
    getExchangeReturnedProducts,
    getExternalSyncOperationalMeta,
    getPaymentOperationalMeta,
    getReturnOperationalMeta,
    getReturnedProducts,
} from "@/lib/orders/order-operational-meta";

export function OperationalOverview({ order }: { order: SalesOrder }) {
    const paymentMeta = getPaymentOperationalMeta(order);
    const accountingMeta = getAccountingOperationalMeta(order);
    const returnMeta = getReturnOperationalMeta(order);
    const exchangeMeta = getExchangeOperationalMeta(order);
    const externalSyncMeta = getExternalSyncOperationalMeta(order);

    const hasReturn = Boolean(
        order.returnInfo && order.returnInfo.status !== "none"
    );

    const hasExchange = Boolean(
        order.exchangeInfo && order.exchangeInfo.status !== "none"
    );

    const hasExternalSyncIssue =
        order.externalSync?.status === "pending" ||
        order.externalSync?.status === "failed" ||
        order.externalSync?.status === "manual_review";

    return (
        <section className="relative overflow-hidden rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04] dark:shadow-[0_18px_48px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-5">
            <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 right-16 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-l from-transparent via-white/70 to-transparent dark:via-white/10" />

            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Workflow className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-xs font-black text-primary">
                            Operational Snapshot
                        </p>

                        <h2 className="mt-1 text-xl font-black text-foreground">
                            وضعیت عملیاتی سفارش
                        </h2>

                        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                            خلاصه وضعیت پرداخت، کیان، مرجوعی، تعویض و سینک خارجی برای اینکه
                            اپراتور سریع بفهمد این سفارش کجای کار است.
                        </p>
                    </div>
                </div>

                {order.needsFollowUp || hasExternalSyncIssue ? (
                    <div className="flex flex-wrap gap-2">
                        {order.needsFollowUp ? (
                            <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-black text-rose-700 dark:text-rose-300">
                                نیازمند پیگیری
                            </span>
                        ) : null}

                        {hasExternalSyncIssue ? (
                            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-700 dark:text-amber-300">
                                سینک خارجی نیازمند بررسی
                            </span>
                        ) : null}
                    </div>
                ) : null}
            </div>

            <div className="relative mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <OperationalStatusTile
                    icon={<CreditCard className="h-4 w-4" />}
                    title="پرداخت"
                    value={paymentMeta.value}
                    description={paymentMeta.description}
                    tone={paymentMeta.tone}
                />

                <OperationalStatusTile
                    icon={<ShieldCheck className="h-4 w-4" />}
                    title="کیان"
                    value={accountingMeta.value}
                    description={accountingMeta.description}
                    tone={accountingMeta.tone}
                />

                <OperationalStatusTile
                    icon={<RotateCcw className="h-4 w-4" />}
                    title="مرجوعی"
                    value={returnMeta.value}
                    description={returnMeta.description}
                    tone={returnMeta.tone}
                />

                <OperationalStatusTile
                    icon={<Repeat2 className="h-4 w-4" />}
                    title="تعویض"
                    value={exchangeMeta.value}
                    description={exchangeMeta.description}
                    tone={exchangeMeta.tone}
                />

                <OperationalStatusTile
                    icon={<RefreshCw className="h-4 w-4" />}
                    title="سینک خارجی"
                    value={externalSyncMeta.value}
                    description={externalSyncMeta.description}
                    tone={externalSyncMeta.tone}
                />
            </div>

            {hasExchange || hasReturn ? (
                <div className="relative mt-4 grid gap-3 lg:grid-cols-2">
                    {hasExchange && order.exchangeInfo ? (
                        <div className="rounded-[1.5rem] bg-violet-500/[0.07] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] dark:bg-violet-400/[0.08] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[11px] font-black text-violet-700 dark:text-violet-300">
                                        رابطه تعویض
                                    </p>

                                    <h3 className="mt-1 text-sm font-black text-foreground">
                                        سفارش اصلی → سفارش جایگزین
                                    </h3>
                                </div>

                                <span className="rounded-full bg-white/65 px-2.5 py-1 text-[10px] font-black text-violet-700 dark:bg-white/[0.06] dark:text-violet-300">
                                    {getExchangeAmountText(order)}
                                </span>
                            </div>

                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                <MiniOperationalBox
                                    label="سفارش اصلی"
                                    value={`#${order.exchangeInfo.originalOrderId}`}
                                />

                                <MiniOperationalBox
                                    label="سفارش جایگزین"
                                    value={
                                        order.exchangeInfo.replacementOrderId
                                            ? `#${order.exchangeInfo.replacementOrderId}`
                                            : order.exchangeInfo.replacementOrderNumber ?? "ثبت نشده"
                                    }
                                    muted={
                                        !order.exchangeInfo.replacementOrderId &&
                                        !order.exchangeInfo.replacementOrderNumber
                                    }
                                />
                            </div>
                        </div>
                    ) : null}

                    {hasReturn && order.returnInfo ? (
                        <div className="rounded-[1.5rem] bg-rose-500/[0.065] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] dark:bg-rose-400/[0.08] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[11px] font-black text-rose-700 dark:text-rose-300">
                                        مرجوعی سفارش
                                    </p>

                                    <h3 className="mt-1 text-sm font-black text-foreground">
                                        اطلاعات مرجوعی ثبت شده
                                    </h3>
                                </div>

                                <span className="rounded-full bg-white/65 px-2.5 py-1 text-[10px] font-black text-rose-700 dark:bg-white/[0.06] dark:text-rose-300">
                                    {order.returnInfo.returnedProductIds.length.toLocaleString(
                                        "fa-IR"
                                    )}{" "}
                                    کالا
                                </span>
                            </div>

                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                <MiniOperationalBox
                                    label="بارکد کیان مرجوعی"
                                    value={order.returnInfo.returnKiyanBarcode ?? "ثبت نشده"}
                                    muted={!order.returnInfo.returnKiyanBarcode}
                                />

                                <MiniOperationalBox
                                    label="دلیل مرجوعی"
                                    value={order.returnInfo.reason ?? "ثبت نشده"}
                                    muted={!order.returnInfo.reason}
                                />
                            </div>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </section>
    );
}

export function OrderLifecycleDetails({ order }: { order: SalesOrder }) {
    const hasReturn = Boolean(
        order.returnInfo && order.returnInfo.status !== "none"
    );

    const hasExchange = Boolean(
        order.exchangeInfo && order.exchangeInfo.status !== "none"
    );

    const hasExternalSync =
        Boolean(order.externalSync) &&
        order.externalSync?.status !== "not_required";

    if (!hasReturn && !hasExchange && !hasExternalSync) {
        return null;
    }

    return (
        <section className="grid gap-6">
            <SectionHeader
                icon={<Workflow className="h-4 w-4" />}
                eyebrow="Order Lifecycle"
                title="مرجوعی، تعویض و سینک خارجی"
                description="وضعیت‌های عملیاتی بعد از ثبت سفارش؛ مثل مرجوعی، فاکتور تعویضی و بروزرسانی اسنپ‌پی."
            />

            <div className="grid gap-4 xl:grid-cols-3">
                {hasReturn && order.returnInfo ? (
                    <ReturnDetailPanel order={order} />
                ) : null}

                {hasExchange && order.exchangeInfo ? (
                    <ExchangeDetailPanel order={order} />
                ) : null}

                {hasExternalSync && order.externalSync ? (
                    <ExternalSyncDetailPanel order={order} />
                ) : null}
            </div>
        </section>
    );
}

export function OrderSidebar({ order }: { order: SalesOrder }) {
    return (
        <aside className="min-w-0 space-y-6 xl:sticky xl:top-6 xl:self-start">
            <KiyanDetailPanel order={order} />
            <OperatorChecklist order={order} />
            <OrderActionsPanel order={order} />
            <OrderActivityPanel order={order} />
            <OrderWorkflowLinks order={order} />
        </aside>
    );
}

function KiyanDetailPanel({ order }: { order: SalesOrder }) {
    const hasKiyanInvoice = order.kiyanInvoice.status === "created";
    const missingKiyanInvoice = order.kiyanInvoice.status === "missing";

    const tone = hasKiyanInvoice
        ? "bg-emerald-500/[0.07] dark:bg-emerald-400/[0.09]"
        : missingKiyanInvoice
            ? "bg-rose-500/[0.07] dark:bg-rose-400/[0.09]"
            : "bg-white/45 dark:bg-white/[0.04]";

    return (
        <section
            className={[
                "rounded-[2rem] p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl",
                tone,
            ].join(" ")}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-black text-muted-foreground">
                        فاکتور کیان
                    </p>

                    <h2 className="mt-1 text-lg font-black text-foreground">
                        {getKiyanStatusLabel(order.kiyanInvoice.status)}
                    </h2>
                </div>

                <KiyanBadge status={order.kiyanInvoice.status} />
            </div>

            <div
                className="mt-5 rounded-[1.3rem] bg-white/70 px-4 py-3 text-left text-sm font-black text-foreground dark:bg-white/[0.06]"
                dir="ltr"
            >
                {order.kiyanInvoice.code ?? "NOT REGISTERED"}
            </div>

            <p className="mt-3 text-xs leading-6 text-muted-foreground">
                {hasKiyanInvoice
                    ? "کد فاکتور کیان برای این سفارش ثبت شده است."
                    : missingKiyanInvoice
                        ? "برای این سفارش هنوز فاکتور کیان ثبت نشده است."
                        : "این سفارش فعلاً نیازی به فاکتور کیان ندارد."}
            </p>
        </section>
    );
}

function OperatorChecklist({ order }: { order: SalesOrder }) {
    const externalSyncIsHealthy =
        !order.externalSync ||
        order.externalSync.status === "not_required" ||
        order.externalSync.status === "synced";

    return (
        <section className="glass-context-panel rounded-[2rem] p-4 sm:p-5">
            <p className="text-xs font-black text-primary">چک‌لیست اپراتور</p>

            <h2 className="mt-1 text-lg font-black text-foreground">
                وضعیت عملیاتی
            </h2>

            <div className="mt-5 grid gap-3">
                <ChecklistItem
                    label="پرداخت موفق"
                    checked={order.payment.statusCode === 100}
                    warningLabel="پرداخت کامل نیست"
                />

                <ChecklistItem
                    label="محصول دارد"
                    checked={order.products.length > 0}
                    warningLabel="بدون محصول"
                />

                <ChecklistItem
                    label="کد رهگیری ارسال"
                    checked={Boolean(order.shipping.trackingCode)}
                    warningLabel="کد رهگیری ندارد"
                />

                <ChecklistItem
                    label="فاکتور کیان"
                    checked={order.kiyanInvoice.status === "created"}
                    warningLabel="ثبت نشده"
                />

                <ChecklistItem
                    label="سینک خارجی"
                    checked={externalSyncIsHealthy}
                    warningLabel="نیازمند بررسی"
                />

                <ChecklistItem
                    label="پیگیری"
                    checked={!order.needsFollowUp}
                    warningLabel="نیازمند پیگیری"
                />
            </div>
        </section>
    );
}

function OrderActionsPanel({ order }: { order: SalesOrder }) {
    const [kiyanBarcode, setKiyanBarcode] = useState(order.kiyanInvoice.code ?? "");
    const [shippingTrackingCode, setShippingTrackingCode] = useState(
        order.shipping.trackingCode ?? ""
    );
    const [operatorNote, setOperatorNote] = useState("");
    const [feedback, setFeedback] = useState<string | null>(null);

    const {
        addOperatorNote,
        markOrderNeedsFollowUp,
        updateExternalSyncStatus,
        updatePrimaryKiyanInvoice,
        updateShippingTrackingCode,
    } = useSalesOrdersStore();

    const canShowExternalSyncAction =
        order.payment.gateway === "snapp_pay" ||
        Boolean(order.externalSync && order.externalSync.provider !== "none");

    function showFeedback(message: string) {
        setFeedback(message);
        window.setTimeout(() => setFeedback(null), 1800);
    }

    function handleKiyanSubmit() {
        updatePrimaryKiyanInvoice(order.id, kiyanBarcode);
        showFeedback("کد کیان به صورت local ثبت شد.");
    }

    function handleShippingSubmit() {
        updateShippingTrackingCode(order.id, shippingTrackingCode);
        showFeedback("کد رهگیری ارسال به صورت local بروزرسانی شد.");
    }

    function handleNoteSubmit() {
        addOperatorNote(order.id, operatorNote);
        setOperatorNote("");
        showFeedback("یادداشت اپراتور ثبت شد.");
    }

    function handleFollowUpToggle(needsFollowUp: boolean) {
        markOrderNeedsFollowUp(
            order.id,
            needsFollowUp,
            needsFollowUp ? "علامت‌گذاری دستی توسط اپراتور" : "رفع پیگیری دستی توسط اپراتور"
        );
        showFeedback(needsFollowUp ? "سفارش نیازمند پیگیری شد." : "پیگیری سفارش رفع شد.");
    }

    function handleSyncStatusChange(status: SalesOrderExternalSyncStatus) {
        updateExternalSyncStatus(
            order.id,
            status,
            status === "failed" ? "خطای ثبت‌شده به صورت local" : undefined
        );
        showFeedback("وضعیت سینک خارجی بروزرسانی شد.");
    }

    return (
        <section className="glass-context-panel rounded-[2rem] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-black text-primary">اکشن‌ها</p>

                    <h2 className="mt-1 text-lg font-black text-foreground">
                        عملیات اپراتور
                    </h2>
                </div>

                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black text-primary">
                    Local
                </span>
            </div>

            <p className="mt-2 text-xs leading-6 text-muted-foreground">
                این اکشن‌ها فعلاً روی store محلی اعمال می‌شوند و برای اتصال API آماده‌اند.
            </p>

            {feedback ? (
                <div className="mt-4 rounded-[1.2rem] bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-700 dark:text-emerald-300">
                    {feedback}
                </div>
            ) : null}

            <div className="mt-5 grid gap-3">
                <ActionBlock
                    icon={<FilePlus2 className="h-4 w-4" />}
                    title="فاکتور اصلی کیان"
                    description="ثبت یا بروزرسانی بارکد فاکتور اصلی کیان برای این سفارش."
                >
                    <input
                        dir="ltr"
                        value={kiyanBarcode}
                        onChange={(event) => setKiyanBarcode(event.target.value)}
                        placeholder="مثلاً KY-26922"
                        className={salesOrdersInputClass}
                    />

                    <button
                        type="button"
                        onClick={handleKiyanSubmit}
                        disabled={!kiyanBarcode.trim()}
                        className={salesOrdersPrimaryButtonClass}
                    >
                        <Save className="h-4 w-4" />
                        ثبت کد کیان
                    </button>
                </ActionBlock>

                <ActionBlock
                    icon={<Truck className="h-4 w-4" />}
                    title="کد رهگیری ارسال"
                    description="ثبت یا اصلاح کد رهگیری ارسال بدون تغییر ساختار سفارش."
                >
                    <input
                        dir="ltr"
                        value={shippingTrackingCode}
                        onChange={(event) => setShippingTrackingCode(event.target.value)}
                        placeholder="مثلاً SHIP-26922"
                        className={salesOrdersInputClass}
                    />

                    <button
                        type="button"
                        onClick={handleShippingSubmit}
                        disabled={!shippingTrackingCode.trim()}
                        className={salesOrdersSecondaryButtonClass}
                    >
                        <Save className="h-4 w-4" />
                        بروزرسانی رهگیری
                    </button>
                </ActionBlock>

                <ActionBlock
                    icon={<StickyNote className="h-4 w-4" />}
                    title="یادداشت داخلی"
                    description="یادداشت فقط برای تیم داخلی و اپراتورهای بعدی نمایش داده می‌شود."
                >
                    <textarea
                        value={operatorNote}
                        onChange={(event) => setOperatorNote(event.target.value)}
                        placeholder="مثلاً مشتری تماس گرفت و درخواست بررسی وضعیت ارسال داشت..."
                        className={[salesOrdersInputClass, "min-h-[96px] resize-none leading-7"].join(" ")}
                    />

                    <button
                        type="button"
                        onClick={handleNoteSubmit}
                        disabled={!operatorNote.trim()}
                        className={salesOrdersSecondaryButtonClass}
                    >
                        <Save className="h-4 w-4" />
                        ثبت یادداشت
                    </button>
                </ActionBlock>

                <ActionBlock
                    icon={<AlertTriangle className="h-4 w-4" />}
                    title="پیگیری سفارش"
                    description="اگر سفارش نیاز به بررسی حسابداری، ارسال یا تماس با مشتری دارد، آن را مشخص کن."
                >
                    <div className="grid gap-2 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => handleFollowUpToggle(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-500/15 dark:text-rose-300"
                        >
                            <AlertTriangle className="h-4 w-4" />
                            نیازمند پیگیری
                        </button>

                        <button
                            type="button"
                            onClick={() => handleFollowUpToggle(false)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-500/15 dark:text-emerald-300"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            رفع پیگیری
                        </button>
                    </div>
                </ActionBlock>

                {canShowExternalSyncAction ? (
                    <ActionBlock
                        icon={<RefreshCw className="h-4 w-4" />}
                        title="سینک خارجی"
                        description="برای سفارش‌های اسنپ‌پی یا سرویس‌های مشابه، وضعیت هماهنگی را local مشخص کن."
                    >
                        <div className="grid gap-2">
                            <SyncActionButton
                                label="در انتظار بروزرسانی"
                                status="pending"
                                active={order.externalSync?.status === "pending"}
                                onClick={handleSyncStatusChange}
                            />

                            <SyncActionButton
                                label="سینک شده"
                                status="synced"
                                active={order.externalSync?.status === "synced"}
                                onClick={handleSyncStatusChange}
                            />

                            <SyncActionButton
                                label="خطا در سینک"
                                status="failed"
                                active={order.externalSync?.status === "failed"}
                                onClick={handleSyncStatusChange}
                            />

                            <SyncActionButton
                                label="بررسی دستی"
                                status="manual_review"
                                active={order.externalSync?.status === "manual_review"}
                                onClick={handleSyncStatusChange}
                            />
                        </div>
                    </ActionBlock>
                ) : null}

                <div className="grid gap-2">
                    <button
                        type="button"
                        onClick={() => void navigator.clipboard.writeText(String(order.id))}
                        className={salesOrdersSecondaryButtonClass}
                    >
                        <Clipboard className="h-4 w-4" />
                        کپی شماره سفارش
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            void navigator.clipboard.writeText(
                                order.kiyanInvoice.code ?? "ثبت نشده"
                            )
                        }
                        className={salesOrdersSecondaryButtonClass}
                    >
                        <Barcode className="h-4 w-4" />
                        کپی کد کیان
                    </button>
                </div>
            </div>
        </section>
    );
}

function OrderActivityPanel({ order }: { order: SalesOrder }) {
    const notes = order.operatorNotes ?? [];
    const logs = order.actionLogs ?? [];

    return (
        <section className="glass-context-panel rounded-[2rem] p-4 sm:p-5">
            <p className="text-xs font-black text-primary">Activity</p>

            <h2 className="mt-1 text-lg font-black text-foreground">
                یادداشت و تاریخچه
            </h2>

            <div className="mt-5 grid gap-4">
                <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-xs font-black text-foreground">
                            یادداشت‌های داخلی
                        </p>

                        <span className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-black text-muted-foreground dark:bg-white/[0.06]">
                            {notes.length.toLocaleString("fa-IR")}
                        </span>
                    </div>

                    {notes.length ? (
                        <div className="grid gap-2">
                            {notes.slice(0, 3).map((note) => (
                                <div
                                    key={note.id}
                                    className="rounded-[1.2rem] bg-white/50 px-3 py-2.5 dark:bg-white/[0.04]"
                                >
                                    <p className="text-xs leading-6 text-foreground">
                                        {note.message}
                                    </p>

                                    <p className="mt-1 text-[10px] font-bold text-muted-foreground">
                                        {note.createdBy ?? "اپراتور"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="rounded-[1.2rem] bg-white/45 px-3 py-3 text-xs font-bold text-muted-foreground dark:bg-white/[0.04]">
                            هنوز یادداشتی برای این سفارش ثبت نشده است.
                        </p>
                    )}
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-xs font-black text-foreground">
                            آخرین عملیات
                        </p>

                        <span className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-black text-muted-foreground dark:bg-white/[0.06]">
                            {logs.length.toLocaleString("fa-IR")}
                        </span>
                    </div>

                    {logs.length ? (
                        <div className="grid gap-2">
                            {logs.slice(0, 5).map((log) => (
                                <div
                                    key={log.id}
                                    className="rounded-[1.2rem] bg-white/50 px-3 py-2.5 dark:bg-white/[0.04]"
                                >
                                    <p className="text-xs font-black text-foreground">
                                        {log.title}
                                    </p>

                                    {log.description ? (
                                        <p className="mt-1 truncate text-[10px] font-bold text-muted-foreground">
                                            {log.description}
                                        </p>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="rounded-[1.2rem] bg-white/45 px-3 py-3 text-xs font-bold text-muted-foreground dark:bg-white/[0.04]">
                            هنوز عملیاتی روی این سفارش ثبت نشده است.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}

function ReturnDetailPanel({ order }: { order: SalesOrder }) {
    const returnInfo = order.returnInfo;
    const returnedProducts = getReturnedProducts(order);

    if (!returnInfo || returnInfo.status === "none") return null;

    return (
        <article className="relative overflow-hidden rounded-[2rem] bg-rose-500/[0.065] p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-rose-400/[0.08] dark:shadow-[0_18px_48px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-rose-500/10 blur-3xl" />

            <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-700 dark:text-rose-300">
                        <RotateCcw className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-xs font-black text-rose-700 dark:text-rose-300">
                            Return
                        </p>

                        <h3 className="mt-1 text-lg font-black text-foreground">
                            مرجوعی سفارش
                        </h3>

                        <p className="mt-2 text-xs leading-6 text-muted-foreground">
                            {getReturnStatusLabel(returnInfo.status)}
                        </p>
                    </div>
                </div>

                <span className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-black text-rose-700 dark:bg-white/[0.06] dark:text-rose-300">
                    {returnedProducts.length.toLocaleString("fa-IR")} کالا
                </span>
            </div>

            <div className="relative mt-4 grid gap-2">
                <LifecycleInfoBox
                    label="بارکد کیان مرجوعی"
                    value={returnInfo.returnKiyanBarcode ?? "ثبت نشده"}
                    muted={!returnInfo.returnKiyanBarcode}
                    dir="ltr"
                />

                <LifecycleInfoBox
                    label="دلیل مرجوعی"
                    value={returnInfo.reason ?? "ثبت نشده"}
                    muted={!returnInfo.reason}
                />

                <LifecycleInfoBox
                    label="مبلغ مرجوعی"
                    value={
                        typeof returnInfo.returnedAmount === "number"
                            ? `${returnInfo.returnedAmount.toLocaleString("fa-IR")} تومان`
                            : "ثبت نشده"
                    }
                    muted={typeof returnInfo.returnedAmount !== "number"}
                />
            </div>

            <LifecycleProductList
                title="محصولات مرجوع‌شده"
                products={returnedProducts}
                emptyText="محصولی برای مرجوعی مشخص نشده"
            />
        </article>
    );
}

function ExchangeDetailPanel({ order }: { order: SalesOrder }) {
    const exchangeInfo = order.exchangeInfo;
    const returnedProducts = getExchangeReturnedProducts(order);
    const replacementProducts = exchangeInfo?.replacementProducts ?? [];

    if (!exchangeInfo || exchangeInfo.status === "none") return null;

    return (
        <article className="relative overflow-hidden rounded-[2rem] bg-violet-500/[0.07] p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-violet-400/[0.08] dark:shadow-[0_18px_48px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
                        <Repeat2 className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-xs font-black text-violet-700 dark:text-violet-300">
                            Exchange
                        </p>

                        <h3 className="mt-1 text-lg font-black text-foreground">
                            تعویض سفارش
                        </h3>

                        <p className="mt-2 text-xs leading-6 text-muted-foreground">
                            {getExchangeStatusLabel(exchangeInfo.status)}
                        </p>
                    </div>
                </div>

                <ExchangeAmountBadge order={order} />
            </div>

            <div className="relative mt-4 rounded-[1.5rem] bg-white/45 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] dark:bg-white/[0.04]">
                <div className="mb-3 flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-violet-700 dark:text-violet-300" />

                    <span className="text-xs font-black text-foreground">
                        رابطه سفارش اصلی و جایگزین
                    </span>
                </div>

                <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                    <LifecycleInfoBox
                        label="سفارش اصلی"
                        value={`#${exchangeInfo.originalOrderId}`}
                    />

                    <div className="hidden h-9 w-9 items-center justify-center rounded-2xl bg-white/60 text-violet-700 dark:bg-white/[0.06] dark:text-violet-300 sm:flex">
                        <ArrowRightVisual />
                    </div>

                    <LifecycleInfoBox
                        label="سفارش جایگزین"
                        value={
                            exchangeInfo.replacementOrderId
                                ? `#${exchangeInfo.replacementOrderId}`
                                : exchangeInfo.replacementOrderNumber ?? "ثبت نشده"
                        }
                        muted={
                            !exchangeInfo.replacementOrderId &&
                            !exchangeInfo.replacementOrderNumber
                        }
                    />
                </div>
            </div>

            <div className="relative mt-3 grid gap-2">
                <LifecycleInfoBox
                    label="بارکد برگشت تعویض"
                    value={exchangeInfo.returnKiyanBarcode ?? "ثبت نشده"}
                    muted={!exchangeInfo.returnKiyanBarcode}
                    dir="ltr"
                />

                <LifecycleInfoBox
                    label="بارکد فروش جایگزین"
                    value={exchangeInfo.replacementKiyanBarcode ?? "ثبت نشده"}
                    muted={!exchangeInfo.replacementKiyanBarcode}
                    dir="ltr"
                />

                <LifecycleInfoBox
                    label="اختلاف مبلغ"
                    value={getExchangeAmountText(order)}
                    muted={exchangeInfo.amountDirection === "equal"}
                />
            </div>

            <div className="relative mt-4 grid gap-3">
                <LifecycleProductList
                    title="محصولات برگشتی"
                    products={returnedProducts}
                    emptyText="محصول برگشتی مشخص نشده"
                />

                <LifecycleProductList
                    title="محصولات جایگزین"
                    products={replacementProducts}
                    emptyText="محصول جایگزین مشخص نشده"
                />
            </div>
        </article>
    );
}

function ExternalSyncDetailPanel({ order }: { order: SalesOrder }) {
    const sync = order.externalSync;

    if (!sync || sync.status === "not_required") return null;

    const isDanger = sync.status === "failed";
    const isWarning = sync.status === "pending" || sync.status === "manual_review";

    const panelTone = isDanger
        ? "bg-rose-500/[0.07] dark:bg-rose-400/[0.08]"
        : isWarning
            ? "bg-amber-500/[0.08] dark:bg-amber-400/[0.08]"
            : "bg-sky-500/[0.07] dark:bg-sky-400/[0.08]";

    const iconTone = isDanger
        ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
        : isWarning
            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
            : "bg-sky-500/10 text-sky-700 dark:text-sky-300";

    return (
        <article
            className={[
                "relative overflow-hidden rounded-[2rem] p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:shadow-[0_18px_48px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.04)]",
                panelTone,
            ].join(" ")}
        >
            <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />

            <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div
                        className={[
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                            iconTone,
                        ].join(" ")}
                    >
                        <RefreshCw className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-xs font-black text-muted-foreground">
                            External Sync
                        </p>

                        <h3 className="mt-1 text-lg font-black text-foreground">
                            سینک خارجی
                        </h3>

                        <p className="mt-2 text-xs leading-6 text-muted-foreground">
                            {getExternalProviderLabel(sync.provider)}
                        </p>
                    </div>
                </div>

                <span
                    className={[
                        "rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-black dark:bg-white/[0.06]",
                        isDanger
                            ? "text-rose-700 dark:text-rose-300"
                            : isWarning
                                ? "text-amber-700 dark:text-amber-300"
                                : "text-sky-700 dark:text-sky-300",
                    ].join(" ")}
                >
                    {getExternalSyncStatusLabel(sync.status)}
                </span>
            </div>

            <div className="relative mt-4 grid gap-2">
                <LifecycleInfoBox
                    label="وضعیت"
                    value={getExternalSyncStatusLabel(sync.status)}
                />

                <LifecycleInfoBox
                    label="آخرین بروزرسانی"
                    value={sync.lastSyncedAt ? "ثبت شده" : "ثبت نشده"}
                    muted={!sync.lastSyncedAt}
                />

                <LifecycleInfoBox
                    label="علت خطا"
                    value={sync.failedReason ?? "خطایی ثبت نشده"}
                    muted={!sync.failedReason}
                />
            </div>

            <div className="relative mt-4 grid gap-2 sm:grid-cols-2">
                <SyncFlagBox
                    label="بروزرسانی مبلغ"
                    enabled={Boolean(sync.shouldSyncAmount)}
                />

                <SyncFlagBox
                    label="بروزرسانی محصولات"
                    enabled={Boolean(sync.shouldSyncProducts)}
                />
            </div>
        </article>
    );
}

function ActionBlock({
    icon,
    title,
    description,
    children,
}: {
    icon: ReactNode;
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <div className="rounded-[1.55rem] bg-white/45 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] dark:bg-white/[0.04]">
            <div className="mb-3 flex items-start gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {icon}
                </div>

                <div className="min-w-0">
                    <p className="text-xs font-black text-foreground">{title}</p>

                    <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>

            <div className="grid gap-2">{children}</div>
        </div>
    );
}

function SyncActionButton({
    label,
    status,
    active,
    onClick,
}: {
    label: string;
    status: SalesOrderExternalSyncStatus;
    active: boolean;
    onClick: (status: SalesOrderExternalSyncStatus) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onClick(status)}
            className={[
                "inline-flex items-center justify-between gap-2 rounded-2xl px-3 py-2.5 text-xs font-black transition",
                active
                    ? "bg-primary/10 text-primary"
                    : "bg-white/50 text-muted-foreground hover:bg-white/70 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]",
            ].join(" ")}
        >
            <span>{label}</span>

            {active ? <CheckCircle2 className="h-4 w-4" /> : null}
        </button>
    );
}

function LifecycleInfoBox({
    label,
    value,
    muted = false,
    dir = "rtl",
}: {
    label: string;
    value: string;
    muted?: boolean;
    dir?: "rtl" | "ltr";
}) {
    return (
        <div className="rounded-[1.2rem] bg-white/55 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] dark:bg-white/[0.05]">
            <p className="text-[10px] font-black text-muted-foreground">{label}</p>

            <p
                dir={dir}
                className={[
                    "mt-1 truncate text-xs font-black",
                    muted ? "text-muted-foreground" : "text-foreground",
                ].join(" ")}
            >
                {value}
            </p>
        </div>
    );
}

function LifecycleProductList({
    title,
    products,
    emptyText,
}: {
    title: string;
    products: SalesOrder["products"];
    emptyText: string;
}) {
    return (
        <div className="rounded-[1.45rem] bg-white/40 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] dark:bg-white/[0.035]">
            <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-black text-foreground">{title}</span>

                <span className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-black text-muted-foreground dark:bg-white/[0.06]">
                    {products.length.toLocaleString("fa-IR")} کالا
                </span>
            </div>

            {products.length ? (
                <div className="grid gap-2">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="flex items-center gap-2 rounded-[1.1rem] bg-white/45 p-2 dark:bg-white/[0.04]"
                        >
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white/70 dark:bg-white/[0.06]">
                                {product.thumbnailUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={product.thumbnailUrl}
                                        alt={product.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-primary">
                                        <PackageCheck className="h-4 w-4" />
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-xs font-black text-foreground">
                                    {product.title}
                                </p>

                                <p className="mt-0.5 truncate text-[10px] font-bold text-muted-foreground">
                                    {product.productCode} · {product.color ?? "-"} ·{" "}
                                    {product.size ?? "-"} · تعداد{" "}
                                    {product.quantity.toLocaleString("fa-IR")}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="rounded-[1.1rem] bg-white/45 px-3 py-3 text-xs font-bold text-muted-foreground dark:bg-white/[0.04]">
                    {emptyText}
                </p>
            )}
        </div>
    );
}

function SyncFlagBox({
    label,
    enabled,
}: {
    label: string;
    enabled: boolean;
}) {
    return (
        <div
            className={[
                "rounded-[1.2rem] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
                enabled
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                    : "bg-white/45 text-muted-foreground dark:bg-white/[0.04]",
            ].join(" ")}
        >
            <p className="text-[10px] font-black">{label}</p>

            <p className="mt-1 text-xs font-black">
                {enabled ? "نیازمند بروزرسانی" : "نیاز ندارد"}
            </p>
        </div>
    );
}

function ExchangeAmountBadge({ order }: { order: SalesOrder }) {
    const exchange = order.exchangeInfo;

    if (!exchange || exchange.status === "none") {
        return null;
    }

    if (exchange.amountDirection === "equal") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-black text-muted-foreground dark:bg-white/[0.06]">
                <Minus className="h-3 w-3" />
                برابر
            </span>
        );
    }

    if (exchange.amountDirection === "up") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                <ArrowUp className="h-3 w-3" />
                رو به بالا
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-[10px] font-black text-rose-700 dark:text-rose-300">
            <ArrowDown className="h-3 w-3" />
            رو به پایین
        </span>
    );
}

function ArrowRightVisual() {
    return <span className="text-sm font-black">←</span>;
}

export function OrderWorkflowLinks({ order }: { order: SalesOrder }) {
    return (
        <section className="relative overflow-hidden rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04] dark:shadow-[0_18px_48px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="pointer-events-none absolute -left-20 -top-20 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ClipboardList className="h-5 w-5" />
                </div>

                <div>
                    <p className="text-xs font-black text-primary">Workflows</p>

                    <h3 className="mt-1 text-base font-black text-foreground">
                        عملیات‌های چندمرحله‌ای
                    </h3>

                    <p className="mt-2 text-xs leading-6 text-muted-foreground">
                        برای مرجوعی و تعویض، وارد صفحه اختصاصی می‌شوی تا اطلاعات همین سفارش
                        به عنوان مبدا عملیات استفاده شود.
                    </p>
                </div>
            </div>

            <div className="relative mt-4 grid gap-2">

                <Link
                    href={getSalesOrderKiyanSaleCreatePath(order.id)}
                    className="group flex items-center justify-between rounded-[1.35rem] bg-sky-500/[0.07] px-3 py-3 text-sm font-black text-sky-700 transition hover:-translate-y-0.5 hover:bg-sky-500/[0.10] dark:bg-sky-400/[0.08] dark:text-sky-300"
                >
                    <span>ثبت فروش این سفارش در کیان</span>

                    <BadgeDollarSign className="h-4 w-4 transition group-hover:-translate-x-0.5" />
                </Link>

                <Link
                    href={getSalesOrderReturnCreatePath(order.id)}
                    className="group flex items-center justify-between rounded-[1.35rem] bg-rose-500/[0.07] px-3 py-3 text-sm font-black text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-500/[0.10] dark:bg-rose-400/[0.08] dark:text-rose-300"
                >
                    <span>ثبت مرجوعی برای این سفارش</span>

                    <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
                </Link>

                <Link
                    href={getSalesOrderExchangeCreatePath(order.id)}
                    className="group flex items-center justify-between rounded-[1.35rem] bg-violet-500/[0.07] px-3 py-3 text-sm font-black text-violet-700 transition hover:-translate-y-0.5 hover:bg-violet-500/[0.10] dark:bg-violet-400/[0.08] dark:text-violet-300"
                >
                    <span>ثبت تعویض برای این سفارش</span>

                    <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
                </Link>
            </div>
        </section>
    );
}
