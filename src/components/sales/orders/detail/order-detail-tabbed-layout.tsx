"use client";

import Link from "next/link";
import { useMemo, useState, type ElementType, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeDollarSign,
  CheckCircle2,
  ClipboardList,
  Database,
  FileText,
  History,
  LayoutGrid,
  RefreshCw,
  Repeat2,
  RotateCcw,
  Save,
  Smartphone,
  Truck,
  Wand2,
} from "lucide-react";

import {
  getSalesOrderExchangeCreatePath,
  getSalesOrderKiyanSaleCreatePath,
  getSalesOrderReturnCreatePath,
  getSalesOrderSnappUpdatePath,
} from "@/components/sales/orders/sales-orders.constants";
import {
  CustomerSection,
  OrderDetailStats,
  OrderSnapshotSection,
  PaymentShippingGrid,
  ProductsSection,
} from "@/components/sales/orders/detail/order-detail-core-sections";
import {
  getOrderOperationalSummary,
  type OrderOperationalSignal,
} from "@/lib/orders/order-next-action";
import { useSalesOrdersStore } from "@/store/sales-orders.store";
import type {
  SalesOrder,
  SalesOrderExternalSyncStatus,
  SalesOrderKiyanDocument,
} from "@/types/sales-order";

type DetailTabKey = "summary" | "data" | "operations" | "followup";

const detailTabs: {
  id: DetailTabKey;
  title: string;
  description: string;
  icon: ElementType;
}[] = [
  {
    id: "summary",
    title: "خلاصه",
    description: "وضعیت سریع و اقدام اصلی",
    icon: LayoutGrid,
  },
  {
    id: "data",
    title: "دیتا",
    description: "مشتری، محصولات، پرداخت و ارسال",
    icon: Database,
  },
  {
    id: "operations",
    title: "عملیات",
    description: "ابزارها و workflowهای اجرایی",
    icon: Wand2,
  },
  {
    id: "followup",
    title: "پیگیری",
    description: "وضعیت‌ها، سندها و سوابق",
    icon: History,
  },
];

export function OrderDetailTabbedLayout({ order }: { order: SalesOrder }) {
  const [activeTab, setActiveTab] = useState<DetailTabKey>("summary");

  return (
    <div className="space-y-4">
      <section className="rounded-[2.2rem] bg-white/55 p-3 shadow-[0_18px_48px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
        <div className="grid gap-2 md:grid-cols-4">
          {detailTabs.map((tab) => (
            <DetailTabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>
      </section>

      {activeTab === "summary" ? <SummaryTab order={order} /> : null}
      {activeTab === "data" ? <DataTab order={order} /> : null}
      {activeTab === "operations" ? <OperationsTab order={order} /> : null}
      {activeTab === "followup" ? <FollowupTab order={order} /> : null}
    </div>
  );
}

function SummaryTab({ order }: { order: SalesOrder }) {
  return (
    <DetailTabPanel
      eyebrow="Summary"
      title="خلاصه تصمیم‌گیری"
      description="این بخش برای این است که اپراتور سریع بفهمد وضعیت سفارش چیست، چرا مهم است و اقدام اصلی بعدی کدام است."
      icon={LayoutGrid}
      tone="sky"
    >
      <div className="grid gap-4">
        <OrderDetailStats order={order} />
        <DecisionSummaryPanel order={order} />
      </div>
    </DetailTabPanel>
  );
}

function DataTab({ order }: { order: SalesOrder }) {
  return (
    <DetailTabPanel
      eyebrow="Data"
      title="دیتای سفارش"
      description="اینجا فقط اطلاعات خام و قابل بررسی سفارش قرار دارد؛ مشتری، کالاها، پرداخت و ارسال."
      icon={Database}
      tone="slate"
    >
      <div className="grid gap-4">
        <OrderSnapshotSection order={order} />

        <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <CustomerSection order={order} />
          <ProductsSection order={order} />
        </div>

        <PaymentShippingGrid order={order} />
      </div>
    </DetailTabPanel>
  );
}

function OperationsTab({ order }: { order: SalesOrder }) {
  return (
    <DetailTabPanel
      eyebrow="Actions"
      title="عملیات قابل انجام"
      description="اینجا محل انجام کار است؛ عملیات‌های اصلی به workflow جدا وصل شده‌اند و ابزارهای کوتاه داخل همین صفحه انجام می‌شوند."
      icon={Wand2}
      tone="violet"
    >
      <div className="grid gap-4">
        <WorkflowLauncherPanel order={order} />
        <QuickOperationsPanel order={order} />
      </div>
    </DetailTabPanel>
  );
}

function FollowupTab({ order }: { order: SalesOrder }) {
  return (
    <DetailTabPanel
      eyebrow="Follow-up"
      title="پیگیری، وضعیت‌ها و سوابق"
      description="اینجا وضعیت کیان، مرجوعی، تعویض، اسنپ، sync خارجی، یادداشت‌ها و لاگ‌ها بررسی می‌شوند."
      icon={ClipboardList}
      tone="amber"
    >
      <div className="grid gap-4">
        <FollowupSignalsPanel order={order} />
        <KiyanDocumentsPanel order={order} />

        <div className="grid gap-4 xl:grid-cols-2">
          <ReturnStatusPanel order={order} />
          <ExchangeStatusPanel order={order} />
        </div>

        <ExternalSyncPanel order={order} />
        <NotesAndLogsPanel order={order} />
      </div>
    </DetailTabPanel>
  );
}

function DecisionSummaryPanel({ order }: { order: SalesOrder }) {
  const summary = getOrderOperationalSummary(order);

  return (
    <section className="rounded-[2rem] bg-white/45 p-4 dark:bg-white/[0.04]">
      <div className="grid gap-3 xl:grid-cols-[1fr_0.85fr]">
        <div className="rounded-[1.6rem] bg-sky-500/10 p-4 text-sky-700 dark:text-sky-300">
          <p className="text-xs font-black opacity-75">وضعیت فعلی</p>

          <h3 className="mt-2 text-lg font-black">
            {summary.currentStatus}
          </h3>

          <p className="mt-2 text-sm font-bold leading-7">{summary.reason}</p>
        </div>

        <div className="rounded-[1.6rem] bg-violet-500/10 p-4 text-violet-700 dark:text-violet-300">
          <p className="text-xs font-black opacity-75">اقدام پیشنهادی</p>

          <h3 className="mt-2 text-lg font-black">
            {summary.recommendedAction}
          </h3>

          <p className="mt-2 text-sm font-bold leading-7">
            {summary.afterAction}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {summary.dataSignals.slice(0, 4).map((signal) => (
          <SignalMiniCard
            key={signal.id}
            label={signal.label}
            value={signal.value}
            status={signal.status}
          />
        ))}
      </div>
    </section>
  );
}

function WorkflowLauncherPanel({ order }: { order: SalesOrder }) {
  const summary = getOrderOperationalSummary(order);

  const actions = [
    ...(summary.primaryAction ? [summary.primaryAction] : []),
    ...summary.secondaryActions.filter(
      (action) => action.href !== summary.primaryAction?.href
    ),
  ];

  const workflowItems = actions.length
    ? actions
    : [
        {
          label: "ثبت فروش کیان",
          href: getSalesOrderKiyanSaleCreatePath(order.id),
          tone: "sky" as const,
        },
        {
          label: "ثبت مرجوعی",
          href: getSalesOrderReturnCreatePath(order.id),
          tone: "rose" as const,
        },
        {
          label: "ثبت تعویض",
          href: getSalesOrderExchangeCreatePath(order.id),
          tone: "violet" as const,
        },
        {
          label: "آپدیت اسنپ",
          href: getSalesOrderSnappUpdatePath(order.id),
          tone: "sky" as const,
        },
      ];

  return (
    <section className="rounded-[2rem] bg-white/45 p-4 dark:bg-white/[0.04]">
      <SectionTitle
        icon={Wand2}
        title="ورود به workflowهای عملیاتی"
        description="عملیات‌های سنگین و مرحله‌ای داخل صفحه جدا انجام می‌شوند تا جزئیات سفارش شلوغ نشود."
        tone="violet"
      />

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {workflowItems.map((action) => (
          <Link
            key={`${action.label}-${action.href}`}
            href={action.href}
            className={[
              "group rounded-[1.6rem] p-4 text-white shadow-[0_14px_30px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5",
              getActionButtonClass(action.tone),
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black">{action.label}</p>

                <p className="mt-2 text-xs font-bold leading-6 text-white/75">
                  ورود به صفحه اختصاصی عملیات
                </p>
              </div>

              <ArrowLeft className="h-5 w-5 transition group-hover:-translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function QuickOperationsPanel({ order }: { order: SalesOrder }) {
  const {
    addOperatorNote,
    markOrderNeedsFollowUp,
    updateShippingTrackingCode,
    updatePrimaryKiyanInvoice,
    updateExternalSyncStatus,
  } = useSalesOrdersStore();

  const [note, setNote] = useState("");
  const [trackingCode, setTrackingCode] = useState(
    order.shipping.trackingCode ?? ""
  );
  const [kiyanCode, setKiyanCode] = useState(order.kiyanInvoice.code ?? "");
  const [syncReason, setSyncReason] = useState("");

  function saveNote() {
    const message = note.trim();

    if (!message) return;

    addOperatorNote(order.id, message);
    setNote("");
  }

  function saveTrackingCode() {
    updateShippingTrackingCode(order.id, trackingCode.trim());
  }

  function saveKiyanCode() {
    updatePrimaryKiyanInvoice(order.id, kiyanCode.trim());
  }

  function setSyncStatus(status: SalesOrderExternalSyncStatus) {
    updateExternalSyncStatus(order.id, status, syncReason.trim() || undefined);
  }

  return (
    <section className="rounded-[2rem] bg-white/45 p-4 dark:bg-white/[0.04]">
      <SectionTitle
        icon={Save}
        title="ابزارهای سریع اپراتور"
        description="این ابزارها عملیات کوتاه هستند و نیاز به workflow جدا ندارند."
        tone="emerald"
      />

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-[1.6rem] bg-white/45 p-4 dark:bg-white/[0.04]">
          <p className="text-sm font-black text-foreground">یادداشت داخلی</p>

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="یادداشت اپراتور برای پیگیری سفارش..."
            className="mt-3 min-h-28 w-full resize-none rounded-[1.3rem] bg-white/65 p-4 text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground/65 dark:bg-white/[0.05]"
          />

          <button
            type="button"
            onClick={saveNote}
            className="mt-3 h-11 rounded-[1.3rem] bg-slate-800 px-5 text-xs font-black text-white transition hover:-translate-y-0.5"
          >
            ثبت یادداشت
          </button>
        </div>

        <div className="rounded-[1.6rem] bg-white/45 p-4 dark:bg-white/[0.04]">
          <p className="text-sm font-black text-foreground">
            پیگیری و وضعیت سفارش
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                markOrderNeedsFollowUp(
                  order.id,
                  true,
                  "نیازمند پیگیری توسط اپراتور"
                )
              }
              className="h-11 rounded-[1.3rem] bg-amber-600 px-4 text-xs font-black text-white"
            >
              علامت‌گذاری پیگیری
            </button>

            <button
              type="button"
              onClick={() =>
                markOrderNeedsFollowUp(
                  order.id,
                  false,
                  "پیگیری سفارش بسته شد"
                )
              }
              className="h-11 rounded-[1.3rem] bg-emerald-600 px-4 text-xs font-black text-white"
            >
              بستن پیگیری
            </button>
          </div>

          <p className="mt-3 text-xs font-bold leading-6 text-muted-foreground">
            وقتی سفارش مبهم است یا نیاز به بررسی دارد، آن را برای پیگیری علامت
            بزن.
          </p>
        </div>

        <div className="rounded-[1.6rem] bg-white/45 p-4 dark:bg-white/[0.04]">
          <p className="text-sm font-black text-foreground">کد رهگیری ارسال</p>

          <TextInput
            value={trackingCode}
            onChange={setTrackingCode}
            placeholder="کد رهگیری مرسوله"
            dir="ltr"
          />

          <button
            type="button"
            onClick={saveTrackingCode}
            className="mt-3 h-11 rounded-[1.3rem] bg-sky-600 px-5 text-xs font-black text-white"
          >
            ذخیره کد رهگیری
          </button>
        </div>

        <div className="rounded-[1.6rem] bg-white/45 p-4 dark:bg-white/[0.04]">
          <p className="text-sm font-black text-foreground">
            اصلاح سریع فاکتور کیان
          </p>

          <TextInput
            value={kiyanCode}
            onChange={setKiyanCode}
            placeholder="بارکد فاکتور کیان"
            dir="ltr"
          />

          <button
            type="button"
            onClick={saveKiyanCode}
            className="mt-3 h-11 rounded-[1.3rem] bg-violet-600 px-5 text-xs font-black text-white"
          >
            ذخیره فاکتور کیان
          </button>
        </div>

        <div className="rounded-[1.6rem] bg-white/45 p-4 dark:bg-white/[0.04] xl:col-span-2">
          <p className="text-sm font-black text-foreground">
            وضعیت sync خارجی
          </p>

          <TextInput
            value={syncReason}
            onChange={setSyncReason}
            placeholder="دلیل یا توضیح تغییر وضعیت sync..."
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSyncStatus("pending")}
              className="h-11 rounded-[1.3rem] bg-amber-600 px-4 text-xs font-black text-white"
            >
              pending
            </button>

            <button
              type="button"
              onClick={() => setSyncStatus("synced")}
              className="h-11 rounded-[1.3rem] bg-emerald-600 px-4 text-xs font-black text-white"
            >
              synced
            </button>

            <button
              type="button"
              onClick={() => setSyncStatus("failed")}
              className="h-11 rounded-[1.3rem] bg-rose-600 px-4 text-xs font-black text-white"
            >
              failed
            </button>

            <button
              type="button"
              onClick={() => setSyncStatus("manual_review")}
              className="h-11 rounded-[1.3rem] bg-violet-600 px-4 text-xs font-black text-white"
            >
              manual review
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FollowupSignalsPanel({ order }: { order: SalesOrder }) {
  const summary = getOrderOperationalSummary(order);
  const signals = [...summary.followupSignals, ...summary.operationSignals];

  return (
    <section className="rounded-[2rem] bg-white/45 p-4 dark:bg-white/[0.04]">
      <SectionTitle
        icon={AlertTriangle}
        title="وضعیت‌ها و موارد قابل پیگیری"
        description="این کارت‌ها سریع نشان می‌دهند کدام بخش سفارش نیازمند بررسی است."
        tone="amber"
      />

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {signals.map((signal) => (
          <SignalMiniCard
            key={signal.id}
            label={signal.label}
            value={signal.value}
            status={signal.status}
            description={signal.description}
          />
        ))}
      </div>
    </section>
  );
}

function KiyanDocumentsPanel({ order }: { order: SalesOrder }) {
  const documents = order.kiyanDocuments ?? [];

  return (
    <section className="rounded-[2rem] bg-white/45 p-4 dark:bg-white/[0.04]">
      <SectionTitle
        icon={BadgeDollarSign}
        title="اسناد و وضعیت کیان"
        description="فاکتور اصلی، اسناد مرجوعی و اسناد تعویض مربوط به کیان اینجا بررسی می‌شوند."
        tone="sky"
      />

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <InfoCard
          label="فاکتور اصلی"
          value={order.kiyanInvoice.code ?? "ثبت نشده"}
          muted={!order.kiyanInvoice.code}
        />

        <InfoCard label="وضعیت" value={order.kiyanInvoice.status} />

        <InfoCard
          label="Accounting"
          value={order.accountingStatus ?? "not_registered"}
        />
      </div>

      <div className="mt-4 grid gap-2">
        {documents.length ? (
          documents.map((doc) => <KiyanDocumentCard key={doc.id} doc={doc} />)
        ) : (
          <EmptyState text="سند کیان برای این سفارش ثبت نشده است." />
        )}
      </div>
    </section>
  );
}

function KiyanDocumentCard({ doc }: { doc: SalesOrderKiyanDocument }) {
  return (
    <div className="rounded-[1.4rem] bg-white/55 p-3 dark:bg-white/[0.04]">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black text-muted-foreground">
            {doc.type}
          </p>

          <p className="mt-1 text-sm font-black text-foreground" dir="ltr">
            {doc.barcode ?? "بدون barcode"}
          </p>
        </div>

        <span className="rounded-full bg-slate-500/10 px-3 py-1 text-xs font-black text-slate-700 dark:text-slate-300">
          {doc.status}
        </span>
      </div>

      {doc.description ? (
        <p className="mt-2 text-xs font-bold leading-6 text-muted-foreground">
          {doc.description}
        </p>
      ) : null}
    </div>
  );
}

function ReturnStatusPanel({ order }: { order: SalesOrder }) {
  const info = order.returnInfo;

  return (
    <section className="rounded-[2rem] bg-white/45 p-4 dark:bg-white/[0.04]">
      <SectionTitle
        icon={RotateCcw}
        title="وضعیت مرجوعی"
        description="اگر سفارش مرجوعی داشته باشد، وضعیت و سند برگشت اینجا مشخص است."
        tone="rose"
      />

      {!info || info.status === "none" ? (
        <EmptyState text="برای این سفارش مرجوعی ثبت نشده است." />
      ) : (
        <div className="mt-4 grid gap-2">
          <InfoCard label="وضعیت" value={info.status} />
          <InfoCard
            label="بارکد مرجوعی کیان"
            value={info.returnKiyanBarcode ?? "ثبت نشده"}
            muted={!info.returnKiyanBarcode}
          />
          <InfoCard
            label="مبلغ مرجوعی"
            value={
              info.returnedAmount
                ? `${info.returnedAmount.toLocaleString("fa-IR")} تومان`
                : "ثبت نشده"
            }
            muted={!info.returnedAmount}
          />
          <InfoCard label="دلیل" value={info.reason ?? "ثبت نشده"} />
        </div>
      )}
    </section>
  );
}

function ExchangeStatusPanel({ order }: { order: SalesOrder }) {
  const info = order.exchangeInfo;

  return (
    <section className="rounded-[2rem] bg-white/45 p-4 dark:bg-white/[0.04]">
      <SectionTitle
        icon={Repeat2}
        title="وضعیت تعویض"
        description="تعویض باید هم سند برگشت و هم فروش جایگزین داشته باشد."
        tone="violet"
      />

      {!info || info.status === "none" ? (
        <EmptyState text="برای این سفارش تعویض ثبت نشده است." />
      ) : (
        <div className="mt-4 grid gap-2">
          <InfoCard label="وضعیت" value={info.status} />
          <InfoCard
            label="بارکد برگشت تعویض"
            value={info.returnKiyanBarcode ?? "ثبت نشده"}
            muted={!info.returnKiyanBarcode}
          />
          <InfoCard
            label="بارکد فروش جایگزین"
            value={info.replacementKiyanBarcode ?? "ثبت نشده"}
            muted={!info.replacementKiyanBarcode}
          />
          <InfoCard
            label="اختلاف مبلغ"
            value={`${info.amountDifference.toLocaleString("fa-IR")} تومان / ${info.amountDirection}`}
          />
        </div>
      )}
    </section>
  );
}

function ExternalSyncPanel({ order }: { order: SalesOrder }) {
  const sync = order.externalSync;

  return (
    <section className="rounded-[2rem] bg-white/45 p-4 dark:bg-white/[0.04]">
      <SectionTitle
        icon={Smartphone}
        title="Sync خارجی / SnappPay"
        description="وضعیت اتصال سفارش با سرویس‌های خارجی مثل SnappPay."
        tone="sky"
      />

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Provider" value={sync?.provider ?? "none"} />
        <InfoCard label="Status" value={sync?.status ?? "not_required"} />
        <InfoCard
          label="آخرین sync"
          value={sync?.lastSyncedAt ?? "ثبت نشده"}
          muted={!sync?.lastSyncedAt}
        />
        <InfoCard
          label="نیازمند sync کالا"
          value={sync?.shouldSyncProducts ? "بله" : "خیر"}
        />
      </div>

      {sync?.failedReason ? (
        <div className="mt-3 rounded-[1.4rem] bg-rose-500/10 p-3 text-sm font-bold leading-7 text-rose-700 dark:text-rose-300">
          {sync.failedReason}
        </div>
      ) : null}
    </section>
  );
}

function NotesAndLogsPanel({ order }: { order: SalesOrder }) {
  const notes = order.operatorNotes ?? [];
  const logs = order.actionLogs ?? [];

  return (
    <section className="rounded-[2rem] bg-white/45 p-4 dark:bg-white/[0.04]">
      <SectionTitle
        icon={FileText}
        title="یادداشت‌ها و سوابق عملیات"
        description="برای فهمیدن اینکه چه کسی چه کاری انجام داده و چه پیگیری‌هایی ثبت شده است."
        tone="slate"
      />

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-[1.6rem] bg-white/45 p-4 dark:bg-white/[0.04]">
          <p className="text-sm font-black text-foreground">یادداشت‌ها</p>

          <div className="mt-3 grid gap-2">
            {notes.length ? (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-[1.3rem] bg-white/55 p-3 dark:bg-white/[0.04]"
                >
                  <p className="text-sm font-bold leading-7 text-foreground">
                    {note.message}
                  </p>

                  <p className="mt-2 text-xs font-bold text-muted-foreground">
                    {note.createdBy ?? "اپراتور"} · {note.createdAt}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState text="یادداشتی برای این سفارش ثبت نشده است." />
            )}
          </div>
        </div>

        <div className="rounded-[1.6rem] bg-white/45 p-4 dark:bg-white/[0.04]">
          <p className="text-sm font-black text-foreground">لاگ عملیات</p>

          <div className="mt-3 grid gap-2">
            {logs.length ? (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-[1.3rem] bg-white/55 p-3 dark:bg-white/[0.04]"
                >
                  <p className="text-sm font-black text-foreground">
                    {log.title}
                  </p>

                  {log.description ? (
                    <p className="mt-1 text-xs font-bold leading-6 text-muted-foreground">
                      {log.description}
                    </p>
                  ) : null}

                  <p className="mt-2 text-xs font-bold text-muted-foreground">
                    {log.createdBy ?? "سیستم"} · {log.createdAt}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState text="لاگی برای این سفارش ثبت نشده است." />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailTabButton({
  tab,
  isActive,
  onClick,
}: {
  tab: {
    id: DetailTabKey;
    title: string;
    description: string;
    icon: ElementType;
  };
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = tab.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group rounded-[1.5rem] p-4 text-right transition hover:-translate-y-0.5",
        isActive
          ? "bg-primary text-primary-foreground shadow-[0_14px_32px_hsl(var(--primary)/0.18)]"
          : "bg-white/45 text-foreground hover:bg-white/65 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
            isActive
              ? "bg-white/20 text-white"
              : "bg-primary/10 text-primary",
          ].join(" ")}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-black">{tab.title}</p>

          <p
            className={[
              "mt-1 text-xs font-bold leading-5",
              isActive
                ? "text-primary-foreground/75"
                : "text-muted-foreground",
            ].join(" ")}
          >
            {tab.description}
          </p>
        </div>
      </div>
    </button>
  );
}

function DetailTabPanel({
  eyebrow,
  title,
  description,
  icon: Icon,
  tone,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ElementType;
  tone: "sky" | "slate" | "violet" | "amber";
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2.2rem] bg-white/55 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
      <div className="mb-5 flex items-start gap-3">
        <div
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
            getToneClass(tone),
          ].join(" ")}
        >
          <Icon className="h-6 w-6" />
        </div>

        <div>
          <p className="text-xs font-black text-muted-foreground">{eyebrow}</p>

          <h2 className="mt-1 text-xl font-black text-foreground">{title}</h2>

          <p className="mt-2 max-w-4xl text-sm font-bold leading-7 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
  tone,
}: {
  icon: ElementType;
  title: string;
  description: string;
  tone: "sky" | "slate" | "violet" | "amber" | "rose" | "emerald";
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={[
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
          getToneClass(tone),
        ].join(" ")}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <h3 className="text-base font-black text-foreground">{title}</h3>

        <p className="mt-1 text-xs font-bold leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  dir = "rtl",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  dir?: "rtl" | "ltr";
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      dir={dir}
      className="mt-3 h-11 w-full rounded-[1.3rem] bg-white/65 px-4 text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground/65 dark:bg-white/[0.05]"
    />
  );
}

function InfoCard({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-[1.4rem] bg-white/55 p-3 dark:bg-white/[0.04]">
      <p className="text-[11px] font-black text-muted-foreground">{label}</p>

      <p
        className={[
          "mt-1 text-sm font-black",
          muted ? "text-muted-foreground" : "text-foreground",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function SignalMiniCard({
  label,
  value,
  status,
  description,
}: {
  label: string;
  value: string;
  status: OrderOperationalSignal["status"];
  description?: string;
}) {
  return (
    <div className={["rounded-[1.4rem] p-3", getSignalClass(status)].join(" ")}>
      <p className="text-[11px] font-black opacity-70">{label}</p>

      <p className="mt-1 text-sm font-black">{value}</p>

      {description ? (
        <p className="mt-2 text-[11px] font-bold leading-5 opacity-75">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[1.4rem] bg-slate-500/10 p-4 text-sm font-bold text-slate-700 dark:text-slate-300">
      {text}
    </div>
  );
}

function getActionButtonClass(tone: string) {
  if (tone === "sky") return "bg-sky-600";
  if (tone === "violet") return "bg-violet-600";
  if (tone === "rose") return "bg-rose-600";
  if (tone === "amber") return "bg-amber-600";
  if (tone === "emerald") return "bg-emerald-600";

  return "bg-slate-700";
}

function getSignalClass(status: OrderOperationalSignal["status"]) {
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

function getToneClass(
  tone: "sky" | "slate" | "violet" | "amber" | "rose" | "emerald"
) {
  if (tone === "sky") {
    return "bg-sky-500/10 text-sky-700 dark:text-sky-300";
  }

  if (tone === "violet") {
    return "bg-violet-500/10 text-violet-700 dark:text-violet-300";
  }

  if (tone === "amber") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  if (tone === "rose") {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
  }

  if (tone === "emerald") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  return "bg-slate-500/10 text-slate-700 dark:text-slate-300";
}