"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Eraser,
  FileWarning,
  Filter,
  PackageCheck,
  ReceiptText,
  Search,
  SlidersHorizontal,
  WalletCards,
  CreditCard,
  Hash,
  MapPin,
  Phone,
  ShoppingBag,
  Truck,
  UserRound,
} from "lucide-react";

import type {
  SalesOrder,
  SalesOrderKiyanInvoiceStatus,
  SalesOrderPaymentGateway,
  SalesOrderStatus,
  SalesOrderType,
} from "@/types/sales-order";
import { useSalesOrdersStore } from "@/store/sales-orders.store";
import {
  getSalesOrderDetailPath,
  salesOrdersHeroClass,
  salesOrdersInputClass,
  salesOrdersPageClass,
  salesOrdersPanelClass,
  salesOrdersPrimaryButtonClass,
  salesOrdersSecondaryButtonClass,
} from "@/components/sales/orders/sales-orders.constants";

type SelectAll<T extends string> = T | "all";

interface OrderFilters {
  search: string;
  paymentGateway: SelectAll<SalesOrderPaymentGateway>;
  orderStatus: SelectAll<SalesOrderStatus>;
  kiyanInvoice: SelectAll<SalesOrderKiyanInvoiceStatus>;
  orderType: SelectAll<SalesOrderType>;
  dateFrom: string;
  dateTo: string;
  city: string;
  minAmount: string;
  maxAmount: string;
  perPage: number;
}

const defaultFilters: OrderFilters = {
  search: "",
  paymentGateway: "all",
  orderStatus: "all",
  kiyanInvoice: "all",
  orderType: "all",
  dateFrom: "",
  dateTo: "",
  city: "",
  minAmount: "",
  maxAmount: "",
  perPage: 20,
};

export default function SalesOrdersPage() {
  const { orders, todaySummary } = useSalesOrdersStore();

  const [filters, setFilters] = useState<OrderFilters>(defaultFilters);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => orderMatchesFilters(order, filters));
  }, [orders, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / filters.perPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * filters.perPage;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + filters.perPage
  );

  const updateFilter = <TKey extends keyof OrderFilters>(
    key: TKey,
    value: OrderFilters[TKey]
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const applyTodayFilter = () => {
    const today = new Date().toISOString().slice(0, 10);

    setFilters((current) => ({
      ...current,
      dateFrom: today,
      dateTo: today,
    }));
    setCurrentPage(1);
  };

  return (
    <div className={salesOrdersPageClass}>
      <section className={salesOrdersHeroClass}>
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-16 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-black text-primary">
            <ReceiptText className="h-4 w-4" />
            Orders & Sales
          </div>

          <h1 className="text-2xl font-black text-foreground">
            همه سفارشات سایت
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            مشاهده، جستجو و فیلتر سفارش‌های سایت. این نسخه فعلاً local است و
            بعداً به API سفارشات وصل می‌شود.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          icon={<CalendarDays className="h-5 w-5" />}
          title="تعداد سفارش‌های امروز"
          value={todaySummary.ordersToday.toLocaleString("fa-IR")}
          description="براساس تاریخ میلادی ثبت‌شده"
        />

        <SummaryCard
          icon={<CircleDollarSign className="h-5 w-5" />}
          title="فروش امروز"
          value={todaySummary.salesToday.toLocaleString("fa-IR")}
          description="تومان"
        />

        <SummaryCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="پرداخت موفق امروز"
          value={todaySummary.successfulPaymentsToday.toLocaleString("fa-IR")}
          description="status = 100"
        />

        <SummaryCard
          icon={<AlertTriangle className="h-5 w-5" />}
          title="در انتظار / ناموفق امروز"
          value={todaySummary.pendingOrFailedToday.toLocaleString("fa-IR")}
          description="نیازمند پیگیری"
          tone="warning"
        />

        <SummaryCard
          icon={<FileWarning className="h-5 w-5" />}
          title="بدون فاکتور کیان امروز"
          value={todaySummary.missingKiyanInvoiceToday.toLocaleString("fa-IR")}
          description="برای سفارش‌های موفق مهم است"
          tone="danger"
        />
      </section>

      <section className={salesOrdersPanelClass}>
        <button
          type="button"
          onClick={() => setIsFiltersOpen((current) => !current)}
          className="flex w-full items-center justify-between gap-4 text-right"
        >
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <h2 className="text-xl font-black text-foreground">
                فیلتر و جستجوی سفارش‌ها
              </h2>
            </div>

            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              برای جستجو و فیلتر سفارش‌ها باز کنید.
            </p>
          </div>

          <span className="rounded-2xl border border-border bg-background/45 px-4 py-2 text-xs font-black text-foreground">
            {isFiltersOpen ? "بستن" : "باز کردن"}
          </span>
        </button>

        {isFiltersOpen ? (
          <div className="mt-6">
            <div className="grid gap-4 xl:grid-cols-4">
              <label className="grid gap-2 xl:col-span-2">
                <span className="text-xs font-black text-foreground">
                  جستجوی سریع
                </span>

                <div className="relative">
                  <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    value={filters.search}
                    onChange={(event) => updateFilter("search", event.target.value)}
                    className={`${salesOrdersInputClass} pr-11`}
                    placeholder="شماره سفارش، نام، موبایل، کد مدیسه، بارکد، شهر..."
                  />
                </div>
              </label>

              <FilterSelect
                label="درگاه پرداخت"
                value={filters.paymentGateway}
                onChange={(value) =>
                  updateFilter(
                    "paymentGateway",
                    value as SelectAll<SalesOrderPaymentGateway>
                  )
                }
                options={[
                  ["all", "همه"],
                  ["saman", "سامان"],
                  ["mellat", "ملت"],
                  ["snapp_pay", "اسنپ‌پی"],
                  ["medisa", "مدیسه"],
                  ["wallet", "کیف پول"],
                  ["unknown", "نامشخص"],
                ]}
              />

              <FilterSelect
                label="وضعیت سفارش"
                value={filters.orderStatus}
                onChange={(value) =>
                  updateFilter("orderStatus", value as SelectAll<SalesOrderStatus>)
                }
                options={[
                  ["all", "همه"],
                  ["payment_success", "پرداخت موفق"],
                  ["payment_failed", "پرداخت ناموفق"],
                  ["payment_pending", "در انتظار پرداخت"],
                  ["processing", "در حال پردازش"],
                  ["sent", "ارسال‌شده"],
                  ["cancelled", "لغوشده"],
                  ["returned", "مرجوعی"],
                ]}
              />

              <FilterSelect
                label="فاکتور کیان"
                value={filters.kiyanInvoice}
                onChange={(value) =>
                  updateFilter(
                    "kiyanInvoice",
                    value as SelectAll<SalesOrderKiyanInvoiceStatus>
                  )
                }
                options={[
                  ["all", "همه"],
                  ["created", "دارای فاکتور"],
                  ["missing", "بدون فاکتور کیان"],
                  ["not_required", "نیاز ندارد"],
                ]}
              />

              <FilterSelect
                label="نوع سفارش"
                value={filters.orderType}
                onChange={(value) =>
                  updateFilter("orderType", value as SelectAll<SalesOrderType>)
                }
                options={[
                  ["all", "همه"],
                  ["site", "سایت"],
                  ["medisa", "مدیسه"],
                  ["snapp_pay", "اسنپ‌پی"],
                  ["manual", "دستی"],
                ]}
              />

              <DateInput
                label="از تاریخ میلادی"
                value={filters.dateFrom}
                onChange={(value) => updateFilter("dateFrom", value)}
              />

              <DateInput
                label="تا تاریخ میلادی"
                value={filters.dateTo}
                onChange={(value) => updateFilter("dateTo", value)}
              />

              <label className="grid gap-2">
                <span className="text-xs font-black text-foreground">شهر</span>
                <input
                  value={filters.city}
                  onChange={(event) => updateFilter("city", event.target.value)}
                  className={salesOrdersInputClass}
                  placeholder="مثلاً تهران"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-black text-foreground">
                  حداقل مبلغ
                </span>
                <input
                  value={filters.minAmount}
                  onChange={(event) => updateFilter("minAmount", event.target.value)}
                  className={salesOrdersInputClass}
                  placeholder="تومان"
                  inputMode="numeric"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-black text-foreground">
                  حداکثر مبلغ
                </span>
                <input
                  value={filters.maxAmount}
                  onChange={(event) => updateFilter("maxAmount", event.target.value)}
                  className={salesOrdersInputClass}
                  placeholder="تومان"
                  inputMode="numeric"
                />
              </label>

              <FilterSelect
                label="تعداد در صفحه"
                value={String(filters.perPage)}
                onChange={(value) => updateFilter("perPage", Number(value))}
                options={[
                  ["10", "۱۰ ردیف"],
                  ["20", "۲۰ ردیف"],
                ]}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <QuickFilterButton onClick={applyTodayFilter}>امروز</QuickFilterButton>
              <QuickFilterButton
                onClick={() => updateFilter("orderStatus", "payment_success")}
              >
                پرداخت موفق
              </QuickFilterButton>
              <QuickFilterButton
                onClick={() => updateFilter("kiyanInvoice", "missing")}
              >
                بدون کیان
              </QuickFilterButton>
              <QuickFilterButton onClick={() => updateFilter("orderType", "medisa")}>
                مدیسه
              </QuickFilterButton>
              <QuickFilterButton
                onClick={() => updateFilter("paymentGateway", "snapp_pay")}
              >
                اسنپ‌پی
              </QuickFilterButton>

              <button
                type="button"
                onClick={resetFilters}
                className={salesOrdersSecondaryButtonClass}
              >
                <Eraser className="h-4 w-4" />
                حذف فیلترها
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className={salesOrdersPrimaryButtonClass}
              >
                <Filter className="h-4 w-4" />
                اعمال فیلتر
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className={salesOrdersPanelClass}>
        <div className="mb-5 flex flex-col gap-3 rounded-[1.5rem] border border-border bg-background/30 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black text-primary">لیست سفارش‌ها</p>

            <h2 className="mt-1 text-xl font-black text-foreground">
              {filteredOrders.length.toLocaleString("fa-IR")} سفارش
            </h2>

            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              در هر صفحه حداکثر ۲۰ سفارش نمایش داده می‌شود.
            </p>
          </div>

          <Pagination
            page={safeCurrentPage}
            totalPages={totalPages}
            onPrev={() => setCurrentPage((page) => Math.max(1, page - 1))}
            onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          />
        </div>

        <div className="grid gap-3">
          {paginatedOrders.length ? (
            paginatedOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-border bg-background/35 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <Search className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-base font-black text-foreground">
                سفارشی پیدا نشد
              </h3>

              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                فیلترها را تغییر بده یا عبارت جستجو را پاک کن.
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-center">
          <Pagination
            page={safeCurrentPage}
            totalPages={totalPages}
            onPrev={() => setCurrentPage((page) => Math.max(1, page - 1))}
            onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          />
        </div>
      </section>
    </div>
  );
}

function OrderRow({ order }: { order: SalesOrder }) {
  const firstProduct = order.products[0];

  const productCount = order.products.reduce(
    (sum, product) => sum + product.quantity,
    0
  );

  const isSuccess = order.status === "payment_success";
  const isFailed =
    order.status === "payment_failed" || order.status === "cancelled";

  const tone = isSuccess
    ? {
      glow: "bg-emerald-500/10 dark:bg-emerald-400/10",
      soft: "bg-emerald-500/[0.06] dark:bg-emerald-400/[0.08]",
      accent: "text-emerald-700 dark:text-emerald-300",
    }
    : isFailed
      ? {
        glow: "bg-rose-500/10 dark:bg-rose-400/10",
        soft: "bg-rose-500/[0.06] dark:bg-rose-400/[0.08]",
        accent: "text-rose-700 dark:text-rose-300",
      }
      : {
        glow: "bg-primary/10",
        soft: "bg-primary/[0.04] dark:bg-primary/[0.08]",
        accent: "text-primary",
      };

  return (
    <article
      className="
        group relative overflow-hidden rounded-[1.9rem] p-4
        bg-white/55 dark:bg-white/[0.04]
        backdrop-blur-xl
        shadow-[0_14px_38px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.65)]
        dark:shadow-[0_18px_48px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.05)]
        transition duration-300
        hover:-translate-y-0.5
        hover:bg-white/65 dark:hover:bg-white/[0.055]
      "
    >
      <div className={`pointer-events-none absolute -left-16 -top-16 h-36 w-36 rounded-full blur-3xl opacity-70 ${tone.glow}`} />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-l from-transparent via-white/60 to-transparent dark:via-white/10" />

      <div className="relative grid gap-3 xl:grid-cols-[170px_minmax(280px,1fr)_145px_120px_160px_180px] xl:items-center">
        {/* identity */}
        <div className="min-w-0 rounded-[1.35rem] bg-white/45 dark:bg-white/[0.03] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] xl:bg-transparent xl:px-0 xl:py-0 xl:shadow-none">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-xs font-black text-foreground shadow-sm dark:bg-white/[0.06]">
              <Hash className="h-3.5 w-3.5 text-primary" />
              {order.id}
            </span>

            <StatusBadge status={order.status} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <GatewayBadge gateway={order.payment.gateway} />

            <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[11px] font-black text-muted-foreground dark:bg-white/[0.05]">
              {getOrderTypeLabel(order.type)}
            </span>
          </div>

          <p className="mt-2 text-[11px] font-bold leading-5 text-muted-foreground">
            {order.displayDate}
          </p>
        </div>

        {/* product */}
        <div className="flex min-w-0 items-center gap-3 rounded-[1.5rem] bg-white/45 dark:bg-white/[0.035] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white/75 shadow-sm dark:bg-white/[0.06]">
            {firstProduct?.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={firstProduct.thumbnailUrl}
                alt={firstProduct.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-primary">
                <PackageCheck className="h-5 w-5" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-black text-foreground">
              {firstProduct?.title ?? "بدون محصول"}
            </p>

            <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-muted-foreground">
              کد {firstProduct?.productCode ?? "-"} · {firstProduct?.color ?? "-"} ·{" "}
              {firstProduct?.size ?? "-"} · بارکد {firstProduct?.barcode ?? "-"}
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-black text-muted-foreground dark:bg-white/[0.05]">
                تعداد {productCount.toLocaleString("fa-IR")}
              </span>

              {order.products.length > 1 ? (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black text-primary">
                  {order.products.length.toLocaleString("fa-IR")} مدل کالا
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* amount */}
        <div className={`rounded-[1.35rem] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${tone.soft}`}>
          <strong className="block text-sm font-black text-foreground">
            {order.paidAmount.toLocaleString("fa-IR")}
            <span className="mr-1 text-[10px] text-muted-foreground">تومان</span>
          </strong>

          <small className="mt-1 block text-[11px] font-bold text-muted-foreground">
            مبلغ پرداخت‌شده
          </small>
        </div>

        {/* shipping */}
        <div className="flex flex-wrap gap-1.5 xl:block">
          <span className="inline-flex rounded-full bg-white/65 px-3 py-1 text-xs font-black text-muted-foreground shadow-sm dark:bg-white/[0.06]">
            {order.shipping.method}
          </span>

          <span
            className={[
              "inline-flex rounded-full px-3 py-1 text-[11px] font-black xl:mt-1.5",
              order.shipping.trackingCode
                ? "bg-sky-500/10 text-sky-700 dark:text-sky-300"
                : "bg-black/[0.04] text-muted-foreground dark:bg-white/[0.05]",
            ].join(" ")}
          >
            {order.shipping.trackingCode ? "کد رهگیری دارد" : "بدون رهگیری"}
          </span>
        </div>

        {/* customer */}
        <div className="min-w-0 rounded-[1.35rem] bg-white/45 dark:bg-white/[0.03] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <p className="truncate text-sm font-black text-foreground">
            {order.customer.fullName}
          </p>

          <p className="mt-1 text-xs font-bold text-muted-foreground">
            {order.customer.mobile}
          </p>

          <p className="mt-1 text-xs font-bold text-muted-foreground">
            {order.customer.city || "شهر ثبت نشده"}
          </p>
        </div>

        {/* kiyan + action */}
        <KiyanActionPanel order={order} />
      </div>
    </article>
  );
}

function SummaryCard({
  icon,
  title,
  value,
  description,
  tone = "default",
}: {
  icon: ReactNode;
  title: string;
  value: string;
  description: string;
  tone?: "default" | "warning" | "danger";
}) {
  return (
    <div className="group relative overflow-hidden rounded-[1.85rem] border border-border bg-card/45 p-4 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-card/60">
      <div className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition group-hover:bg-primary/15" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 rounded-full bg-background/40 blur-2xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black text-muted-foreground">{title}</p>

          <p className="mt-3 text-2xl font-black tracking-tight text-foreground">
            {value}
          </p>

          <p className="mt-2 inline-flex rounded-full border border-border bg-background/40 px-3 py-1 text-[11px] font-black text-muted-foreground">
            {description}
          </p>
        </div>

        <div
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm transition group-hover:scale-105",
            tone === "danger"
              ? "border-destructive/15 bg-destructive/10 text-destructive"
              : tone === "warning"
                ? "border-primary/15 bg-primary/10 text-primary"
                : "border-primary/15 bg-primary/10 text-primary",
          ].join(" ")}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black text-foreground">{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={salesOrdersInputClass}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black text-foreground">{label}</span>

      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={salesOrdersInputClass}
      />
    </label>
  );
}

function QuickFilterButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-border bg-background/45 px-4 py-3 text-sm font-black text-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
    >
      {children}
    </button>
  );
}

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onPrev}
        disabled={page <= 1}
        className={salesOrdersSecondaryButtonClass}
      >
        <ChevronRight className="h-4 w-4" />
        قبلی
      </button>

      <span className="rounded-2xl border border-border bg-background/45 px-4 py-3 text-xs font-black text-foreground">
        صفحه {page.toLocaleString("fa-IR")} از {totalPages.toLocaleString("fa-IR")}
      </span>

      <button
        type="button"
        onClick={onNext}
        disabled={page >= totalPages}
        className={salesOrdersSecondaryButtonClass}
      >
        بعدی
        <ChevronLeft className="h-4 w-4" />
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: SalesOrderStatus }) {
  const label = getStatusLabel(status);

  const styles =
    status === "payment_success"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : status === "payment_failed" || status === "cancelled"
        ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
        : status === "payment_pending"
          ? "bg-amber-500/10 text-amber-700 dark:text-amber-700"
          : "bg-black/[0.05] text-muted-foreground dark:bg-white/[0.06]";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black ${styles}`}
    >
      {status === "payment_success" ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : status === "payment_failed" || status === "cancelled" ? (
        <AlertTriangle className="h-3.5 w-3.5" />
      ) : null}

      {label}
    </span>
  );
}

function KiyanBadge({ status }: { status: SalesOrderKiyanInvoiceStatus }) {
  if (status === "created") {
    return (
      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-700 ring-1 ring-emerald/15">
        ثبت شده
      </span>
    );
  }

  if (status === "not_required") {
    return (
      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground ring-1 ring-border/50">
        نیاز ندارد
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] text-rose-700 dark:text-rose-700 text-destructive ring-1 ring-destructive/15">
      ثبت نشده
    </span>
  );
}

function orderMatchesFilters(order: SalesOrder, filters: OrderFilters) {
  const search = filters.search.trim().toLowerCase();
  const city = filters.city.trim().toLowerCase();
  const minAmount = normalizeNumber(filters.minAmount);
  const maxAmount = normalizeNumber(filters.maxAmount);

  const searchable = [
    order.id,
    order.externalOrderId,
    order.medisaCode,
    order.customer.fullName,
    order.customer.mobile,
    order.customer.city,
    order.shipping.method,
    order.products.map((product) => product.title).join(" "),
    order.products.map((product) => product.productCode).join(" "),
    order.products.map((product) => product.barcode).join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (search && !searchable.includes(search)) return false;

  if (
    filters.paymentGateway !== "all" &&
    order.payment.gateway !== filters.paymentGateway
  ) {
    return false;
  }

  if (filters.orderStatus !== "all" && order.status !== filters.orderStatus) {
    return false;
  }

  if (
    filters.kiyanInvoice !== "all" &&
    order.kiyanInvoice.status !== filters.kiyanInvoice
  ) {
    return false;
  }

  if (filters.orderType !== "all" && order.type !== filters.orderType) {
    return false;
  }

  if (filters.dateFrom && order.gregorianDate < filters.dateFrom) {
    return false;
  }

  if (filters.dateTo && order.gregorianDate > filters.dateTo) {
    return false;
  }

  if (city && !order.customer.city.toLowerCase().includes(city)) {
    return false;
  }

  if (minAmount !== null && order.payableAmount < minAmount) {
    return false;
  }

  if (maxAmount !== null && order.payableAmount > maxAmount) {
    return false;
  }

  return true;
}

function normalizeNumber(value: string) {
  const normalized = Number(value.replace(/[^\d]/g, ""));

  return Number.isFinite(normalized) && normalized > 0 ? normalized : null;
}

function getGatewayLabel(gateway: SalesOrderPaymentGateway) {
  switch (gateway) {
    case "saman":
      return "سامان";
    case "mellat":
      return "ملت";
    case "snapp_pay":
      return "اسنپ‌پی";
    case "medisa":
      return "مدیسه";
    case "wallet":
      return "کیف پول";
    case "unknown":
      return "نامشخص";
    default:
      return gateway;
  }
}

function getStatusLabel(status: SalesOrderStatus) {
  switch (status) {
    case "payment_success":
      return "پرداخت موفق";
    case "payment_failed":
      return "پرداخت ناموفق";
    case "payment_pending":
      return "در انتظار پرداخت";
    case "processing":
      return "در حال پردازش";
    case "sent":
      return "ارسال‌شده";
    case "cancelled":
      return "لغوشده";
    case "returned":
      return "مرجوعی";
    default:
      return status;
  }
}

function getOrderTypeLabel(type: SalesOrderType) {
  switch (type) {
    case "site":
      return "سایت";
    case "medisa":
      return "مدیسه";
    case "snapp_pay":
      return "اسنپ‌پی";
    case "manual":
      return "دستی";
    default:
      return type;
  }
}

function GatewayBadge({ gateway }: { gateway: SalesOrderPaymentGateway }) {
  const label = getGatewayLabel(gateway);

  const styles =
    gateway === "snapp_pay"
      ? "bg-sky-500/10 text-sky-700 dark:text-sky-300"
      : gateway === "saman"
        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
        : gateway === "mellat"
          ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
          : gateway === "medisa"
            ? "bg-violet-500/10 text-violet-700 dark:text-violet-300"
            : gateway === "wallet"
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
              : "bg-black/[0.05] text-muted-foreground dark:bg-white/[0.06]";

  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${styles}`}>
      {label}
    </span>
  );
}

function KiyanActionPanel({ order }: { order: SalesOrder }) {
  const hasKiyanInvoice = order.kiyanInvoice.status === "created";
  const missingKiyanInvoice = order.kiyanInvoice.status === "missing";

  const panelTone = hasKiyanInvoice
    ? {
      wrap: "bg-emerald-500/[0.07] dark:bg-emerald-400/[0.10]",
      code: "bg-white/70 text-emerald-700 dark:bg-white/[0.06] dark:text-emerald-700",
    }
    : missingKiyanInvoice
      ? {
        wrap: "bg-rose-500/[0.08] dark:bg-rose-400/[0.10]",
        code: "bg-white/70 text-rose-700 dark:bg-white/[0.06] dark:text-rose-700",
      }
      : {
        wrap: "bg-white/45 dark:bg-white/[0.04]",
        code: "bg-white/70 text-muted-foreground dark:bg-white/[0.06] dark:text-muted-foreground",
      };

  return (
    <div
      className={[
        "rounded-[1.45rem] p-3 backdrop-blur-xl",
        "shadow-[0_8px_24px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)]",
        "dark:shadow-[0_10px_26px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]",
        panelTone.wrap,
      ].join(" ")}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-black text-muted-foreground">
          فاکتور کیان
        </span>

        <KiyanBadge status={order.kiyanInvoice.status} />
      </div>

      <div
        className={[
          "mb-2 rounded-[1rem] px-3 py-2 text-left text-xs font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
          panelTone.code,
        ].join(" ")}
        dir="ltr"
      >
        {order.kiyanInvoice.code ?? "NOT REGISTERED"}
      </div>

      <Link
        href={getSalesOrderDetailPath(order.id)}
        className="
          inline-flex h-10 w-full items-center justify-center gap-2 rounded-[1rem]
          bg-slate-950 text-xs font-black text-white
          transition hover:opacity-92
          dark:bg-white dark:text-slate-950
        "
      >
        جزئیات
        <ChevronLeft className="h-4 w-4" />
      </Link>
    </div>
  );
}

