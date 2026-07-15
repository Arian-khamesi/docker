"use client";

import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Clipboard,
  CreditCard,
  FileWarning,
  Hash,
  MapPin,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  Truck,
  UserRound,
  XCircle,
} from "lucide-react";

import type { SalesOrder } from "@/types/sales-order";
import {
  SALES_ORDERS_BASE_PATH,
  salesOrdersHeroClass,
  salesOrdersPageClass,
  salesOrdersPanelClass,
  salesOrdersPrimaryButtonClass,
  salesOrdersSecondaryButtonClass,
} from "@/components/sales/orders/sales-orders.constants";
import {
  DetailStatCard,
  GatewayBadge,
  InfoTile,
  ProductRow,
  SectionHeader,
  SoftInfoCard,
  StatusBadge,
} from "@/components/sales/orders/detail/order-detail-shared";
import {
  getGatewayLabel,
  getKiyanStatusLabel,
  getOrderTypeLabel,
} from "@/lib/orders/order-labels";

export function OrderNotFound({ orderId }: { orderId: string }) {
  return (
    <div className={salesOrdersPageClass}>
      <section className={salesOrdersPanelClass}>
        <div className="mx-auto max-w-xl py-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-700 dark:text-rose-300">
            <XCircle className="h-7 w-7" />
          </div>

          <h1 className="mt-5 text-xl font-black text-foreground">
            سفارش پیدا نشد
          </h1>

          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            سفارش با شناسه {orderId} در داده‌های local پیدا نشد.
          </p>

          <Link
            href={SALES_ORDERS_BASE_PATH}
            className={`${salesOrdersPrimaryButtonClass} mt-6`}
          >
            بازگشت به همه سفارشات
          </Link>
        </div>
      </section>
    </div>
  );
}

export function OrderDetailHero({ order }: { order: SalesOrder }) {
  return (
    <section className={salesOrdersHeroClass}>
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-16 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
            <ReceiptText className="h-4 w-4" />
            Order Detail
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-foreground">
              جزئیات سفارش #{order.id}
            </h1>

            <StatusBadge status={order.status} />
            <GatewayBadge gateway={order.payment.gateway} />
          </div>

          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            بررسی کامل سفارش، اطلاعات مشتری، محصولات، پرداخت، ارسال و وضعیت
            فاکتور کیان. این صفحه فعلاً از داده local استفاده می‌کند.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={SALES_ORDERS_BASE_PATH}
            className={salesOrdersSecondaryButtonClass}
          >
            <ArrowRight className="h-4 w-4" />
            بازگشت به همه سفارشات
          </Link>

          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(String(order.id))}
            className={salesOrdersPrimaryButtonClass}
          >
            <Clipboard className="h-4 w-4" />
            کپی شماره سفارش
          </button>
        </div>
      </div>
    </section>
  );
}

export function MissingKiyanAlert({ order }: { order: SalesOrder }) {
  const isPaymentSuccess = order.status === "payment_success";
  const hasMissingKiyan =
    isPaymentSuccess && order.kiyanInvoice.status === "missing";

  if (!hasMissingKiyan) return null;

  return (
    <section className="rounded-[1.75rem] bg-rose-500/[0.07] p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-rose-400/[0.09]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-700 dark:text-rose-300">
            <FileWarning className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-sm font-black text-foreground">
              سفارش پرداخت موفق دارد اما فاکتور کیان ثبت نشده است
            </h2>

            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              این سفارش باید از نظر ثبت فاکتور کیان بررسی شود، چون برای
              سفارش‌های موفق اهمیت عملیاتی دارد.
            </p>
          </div>
        </div>

        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black text-rose-700 dark:bg-white/[0.06] dark:text-rose-300">
          نیازمند پیگیری
        </span>
      </div>
    </section>
  );
}

export function OrderDetailStats({ order }: { order: SalesOrder }) {
  const isPaymentSuccess = order.status === "payment_success";

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DetailStatCard
        icon={<Hash className="h-5 w-5" />}
        label="شماره سفارش"
        value={`#${order.id}`}
        hint={order.externalOrderId ?? "بدون کد خارجی"}
      />

      <DetailStatCard
        icon={<Banknote className="h-5 w-5" />}
        label="مبلغ قابل پرداخت"
        value={`${order.payableAmount.toLocaleString("fa-IR")} تومان`}
        hint={`پرداخت‌شده: ${order.paidAmount.toLocaleString("fa-IR")}`}
        tone={isPaymentSuccess ? "success" : "default"}
      />

      <DetailStatCard
        icon={<CreditCard className="h-5 w-5" />}
        label="درگاه و وضعیت"
        value={getGatewayLabel(order.payment.gateway)}
        hint={`status = ${order.payment.statusCode}`}
        tone={isPaymentSuccess ? "success" : "danger"}
      />

      <DetailStatCard
        icon={<ShieldCheck className="h-5 w-5" />}
        label="فاکتور کیان"
        value={getKiyanStatusLabel(order.kiyanInvoice.status)}
        hint={order.kiyanInvoice.code ?? "ثبت نشده"}
        tone={order.kiyanInvoice.status === "missing" ? "danger" : "success"}
      />
    </section>
  );
}

export function OrderSnapshotSection({ order }: { order: SalesOrder }) {
  return (
    <section className={salesOrdersPanelClass}>
      <SectionHeader
        icon={<ReceiptText className="h-4 w-4" />}
        eyebrow="Order Snapshot"
        title="خلاصه سفارش"
        description="اطلاعات اصلی سفارش برای نگاه سریع اپراتور."
      />

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <InfoTile label="تاریخ ثبت" value={order.displayDate} />
        <InfoTile label="تاریخ میلادی" value={order.gregorianDate} />
        <InfoTile label="نوع سفارش" value={getOrderTypeLabel(order.type)} />
        <InfoTile
          label="کد مدیسه"
          value={order.medisaCode ?? "ندارد"}
          muted={!order.medisaCode}
        />
        <InfoTile
          label="کد خارجی سفارش"
          value={order.externalOrderId ?? "ندارد"}
          muted={!order.externalOrderId}
        />
        <InfoTile
          label="یادداشت"
          value={order.notes ?? "یادداشتی ثبت نشده"}
          muted={!order.notes}
        />
      </div>
    </section>
  );
}

export function CustomerSection({ order }: { order: SalesOrder }) {
  return (
    <section className={salesOrdersPanelClass}>
      <SectionHeader
        icon={<UserRound className="h-4 w-4" />}
        eyebrow="Customer"
        title="اطلاعات مشتری"
        description="اطلاعات تماس و موقعیت مشتری برای پیگیری سفارش."
      />

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <SoftInfoCard
          label="نام مشتری"
          value={order.customer.fullName}
          icon={<UserRound className="h-4 w-4" />}
        />

        <SoftInfoCard
          label="موبایل"
          value={order.customer.mobile}
          icon={<Clipboard className="h-4 w-4" />}
          copyValue={order.customer.mobile}
        />

        <SoftInfoCard
          label="شهر / استان"
          value={`${order.customer.city}${
            order.customer.province ? `، ${order.customer.province}` : ""
          }`}
          icon={<MapPin className="h-4 w-4" />}
        />
      </div>
    </section>
  );
}

export function ProductsSection({ order }: { order: SalesOrder }) {
  return (
    <section className={salesOrdersPanelClass}>
      <SectionHeader
        icon={<PackageCheck className="h-4 w-4" />}
        eyebrow="Products"
        title="محصولات سفارش"
        description="کالاهای داخل سفارش همراه با کد، بارکد، رنگ، سایز و تعداد."
      />

      <div className="mt-5 grid gap-3">
        {order.products.map((product) => (
          <ProductRow key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export function PaymentShippingGrid({ order }: { order: SalesOrder }) {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <PaymentPanel order={order} />
      <ShippingPanel order={order} />
    </section>
  );
}

export function PaymentPanel({ order }: { order: SalesOrder }) {
  const isSuccess = order.payment.statusCode === 100;

  return (
    <section className={salesOrdersPanelClass}>
      <SectionHeader
        icon={<CreditCard className="h-4 w-4" />}
        eyebrow="Payment"
        title="پرداخت و تراکنش"
        description="درگاه، وضعیت پرداخت، مبلغ و کد پیگیری تراکنش."
      />

      <div className="mt-5 grid gap-3">
        <InfoTile
          label="درگاه پرداخت"
          value={getGatewayLabel(order.payment.gateway)}
        />
        <InfoTile label="Status Code" value={String(order.payment.statusCode)} />
        <InfoTile
          label="مبلغ پرداخت‌شده"
          value={`${order.payment.paidAmount.toLocaleString("fa-IR")} تومان`}
        />
        <InfoTile
          label="کد پیگیری پرداخت"
          value={order.payment.trackingCode ?? "ثبت نشده"}
          muted={!order.payment.trackingCode}
        />

        <div
          className={[
            "rounded-[1.35rem] px-4 py-3 text-sm font-black",
            isSuccess
              ? "bg-emerald-500/[0.08] text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/[0.08] text-rose-700 dark:text-rose-300",
          ].join(" ")}
        >
          {isSuccess ? "پرداخت این سفارش موفق است." : "پرداخت این سفارش کامل نیست."}
        </div>
      </div>
    </section>
  );
}

export function ShippingPanel({ order }: { order: SalesOrder }) {
  return (
    <section className={salesOrdersPanelClass}>
      <SectionHeader
        icon={<Truck className="h-4 w-4" />}
        eyebrow="Shipping"
        title="ارسال و تحویل"
        description="روش ارسال و کد رهگیری سفارش."
      />

      <div className="mt-5 grid gap-3">
        <InfoTile label="روش ارسال" value={order.shipping.method} />
        <InfoTile
          label="کد رهگیری"
          value={order.shipping.trackingCode ?? "ثبت نشده"}
          muted={!order.shipping.trackingCode}
        />
        <InfoTile label="شهر مقصد" value={order.customer.city} />
        <InfoTile
          label="استان"
          value={order.customer.province ?? "ثبت نشده"}
          muted={!order.customer.province}
        />
      </div>
    </section>
  );
}
