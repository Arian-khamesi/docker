"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeDollarSign,
  CheckCircle2,
  ClipboardCheck,
  FileJson,
  PackageCheck,
  Save,
  Send,
  UserRound,
} from "lucide-react";

import { getSalesOrderDetailPath } from "@/components/sales/orders/sales-orders.constants";
import { getGatewayLabel, getStatusLabel } from "@/lib/orders/order-labels";
import { useSalesOrdersStore } from "@/store/sales-orders.store";
import type { SalesOrder } from "@/types/sales-order";

type RequestState = "idle" | "sending" | "success" | "failed";

interface KiyanSalePayload {
  operation: "create_sale_invoice";
  source: {
    orderId: number;
    externalOrderId?: string;
    orderType: string;
    createdAt: string;
  };
  customer: {
    fullName: string;
    mobile: string;
    city: string;
    province?: string;
  };
  invoice: {
    issueDate: string;
    warehouseCode: string;
    saleChannel: string;
    paymentMethod: string;
    totalAmount: number;
    payableAmount: number;
    paidAmount: number;
    description?: string;
  };
  items: {
    productId: string;
    title: string;
    productCode: string;
    barcode: string;
    color?: string;
    size?: string;
    quantity: number;
  }[];
}

interface MockKiyanResponse {
  success: boolean;
  barcode: string;
  documentNumber: string;
  message: string;
  createdAt: string;
}

export default function KiyanSaleCreateForOrderPage() {
  const params = useParams<{ id: string }>();

  const {
    orders,
    updatePrimaryKiyanInvoice,
    markOrderNeedsFollowUp,
  } = useSalesOrdersStore();

  const order = useMemo(
    () => orders.find((item) => String(item.id) === String(params.id)),
    [orders, params.id]
  );

  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerProvince, setCustomerProvince] = useState("");
  const [issueDate, setIssueDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [warehouseCode, setWarehouseCode] = useState("MAIN");
  const [saleChannel, setSaleChannel] = useState("SITE");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [description, setDescription] = useState("");
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [mockResponse, setMockResponse] = useState<MockKiyanResponse | null>(
    null
  );
  const [submitError, setSubmitError] = useState("");

  useMemo(() => {
    if (!order) return;

    setCustomerName(order.customer.fullName);
    setCustomerMobile(order.customer.mobile);
    setCustomerCity(order.customer.city);
    setCustomerProvince(order.customer.province ?? "");
    setPaymentMethod(String(order.payment.gateway));
    setDescription(
      `ثبت فاکتور فروش کیان برای سفارش ${order.id} - ${getGatewayLabel(
        order.payment.gateway
      )}`
    );
  }, [order]);

  const payload = useMemo(() => {
    if (!order) return null;

    return buildKiyanSalePayload(order, {
      customerName,
      customerMobile,
      customerCity,
      customerProvince,
      issueDate,
      warehouseCode,
      saleChannel,
      paymentMethod,
      description,
    });
  }, [
    customerCity,
    customerMobile,
    customerName,
    customerProvince,
    description,
    issueDate,
    order,
    paymentMethod,
    saleChannel,
    warehouseCode,
  ]);

  const canSend =
    Boolean(order) &&
    Boolean(payload) &&
    customerName.trim().length >= 3 &&
    customerMobile.trim().length >= 8 &&
    customerCity.trim().length >= 2 &&
    issueDate.trim().length > 0 &&
    warehouseCode.trim().length > 0 &&
    saleChannel.trim().length > 0 &&
    paymentMethod.trim().length > 0 &&
    requestState !== "sending";

  async function handleMockSend() {
    if (!order || !payload) return;

    setSubmitError("");

    if (!canSend) {
      setSubmitError("اطلاعات لازم برای ساخت payload کیان کامل نیست.");
      return;
    }

    setRequestState("sending");

    await new Promise((resolve) => setTimeout(resolve, 850));

    const barcode = `KY-SALE-${order.id}-${Date.now().toString().slice(-6)}`;

    const response: MockKiyanResponse = {
      success: true,
      barcode,
      documentNumber: `KS-${order.id}-${Math.floor(Math.random() * 900 + 100)}`,
      message: "فاکتور فروش با موفقیت در کیان ثبت شد.",
      createdAt: new Date().toISOString(),
    };

    updatePrimaryKiyanInvoice(order.id, barcode);
    markOrderNeedsFollowUp(
      order.id,
      false,
      "فاکتور فروش کیان با موفقیت ثبت شد."
    );

    setMockResponse(response);
    setRequestState("success");
  }

  if (!order) {
    return (
      <main className="glass-page min-h-screen p-4 sm:p-6 lg:p-8">
        <section className="glass-panel mx-auto max-w-2xl p-6 text-center">
          <h1 className="text-xl font-black text-foreground">
            سفارش پیدا نشد
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            برای ثبت فروش در کیان، ابتدا باید سفارش معتبر انتخاب شود.
          </p>

          <Link
            href="/dashboard/orders"
            className="mt-5 inline-flex rounded-2xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground"
          >
            بازگشت به سفارشات
          </Link>
        </section>
      </main>
    );
  }

  const isAlreadyRegistered = order.kiyanInvoice.status === "created";

  return (
    <main className="glass-page min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="relative overflow-hidden rounded-[2.2rem] bg-white/55 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl dark:bg-white/[0.04] dark:shadow-[0_18px_55px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
          <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="pointer-events-none absolute right-20 top-0 h-px w-72 bg-gradient-to-l from-transparent via-white/70 to-transparent dark:via-white/10" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
                <BadgeDollarSign className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-black text-sky-700 dark:text-sky-300">
                  Kiyan Sale Workflow
                </p>

                <h1 className="mt-1 text-2xl font-black text-foreground">
                  ثبت فروش سفارش #{order.id} در کیان
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                  اطلاعات سفارش، مشتری، محصولات و مبلغ از سفارش سایت خوانده
                  می‌شود، payload کیان ساخته می‌شود و بعد از ارسال mock، پاسخ
                  کیان در سفارش ذخیره می‌شود.
                </p>
              </div>
            </div>

            <Link
              href={getSalesOrderDetailPath(order.id)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/65 px-4 py-2 text-sm font-black text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition hover:-translate-y-0.5 dark:bg-white/[0.06]"
            >
              <ArrowRight className="h-4 w-4" />
              بازگشت به جزئیات سفارش
            </Link>
          </div>

          {isAlreadyRegistered ? (
            <div className="relative mt-5 rounded-[1.5rem] bg-emerald-500/10 px-4 py-3 text-sm font-bold leading-7 text-emerald-700 dark:text-emerald-300">
              این سفارش قبلاً در کیان ثبت شده است. کد فعلی:{" "}
              <span dir="ltr" className="font-black">
                {order.kiyanInvoice.code}
              </span>
            </div>
          ) : null}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_390px]">
          <div className="grid gap-4">
            <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
              <SectionTitle
                icon={UserRound}
                eyebrow="Customer"
                title="اطلاعات مشتری برای payload کیان"
              />

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <KiyanInput
                  label="نام مشتری"
                  value={customerName}
                  onChange={setCustomerName}
                  placeholder="نام و نام خانوادگی"
                />

                <KiyanInput
                  label="موبایل"
                  value={customerMobile}
                  onChange={setCustomerMobile}
                  placeholder="0912..."
                  dir="ltr"
                />

                <KiyanInput
                  label="شهر"
                  value={customerCity}
                  onChange={setCustomerCity}
                  placeholder="تهران"
                />

                <KiyanInput
                  label="استان"
                  value={customerProvince}
                  onChange={setCustomerProvince}
                  placeholder="تهران"
                />
              </div>
            </section>

            <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
              <SectionTitle
                icon={ClipboardCheck}
                eyebrow="Invoice Settings"
                title="تنظیمات فاکتور کیان"
              />

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <KiyanInput
                  label="تاریخ صدور"
                  value={issueDate}
                  onChange={setIssueDate}
                  placeholder="2026-06-29"
                  dir="ltr"
                  type="date"
                />

                <KiyanInput
                  label="کد انبار"
                  value={warehouseCode}
                  onChange={setWarehouseCode}
                  placeholder="MAIN"
                  dir="ltr"
                />

                <KiyanInput
                  label="کانال فروش"
                  value={saleChannel}
                  onChange={setSaleChannel}
                  placeholder="SITE"
                  dir="ltr"
                />

                <KiyanInput
                  label="روش پرداخت"
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  placeholder="snapp_pay / saman / ..."
                  dir="ltr"
                />
              </div>

              <div className="mt-3">
                <label className="text-xs font-black text-muted-foreground">
                  توضیحات فاکتور
                </label>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  placeholder="توضیحاتی که در payload کیان ارسال می‌شود."
                  className="mt-2 min-h-28 w-full resize-none rounded-[1.5rem] bg-white/55 px-4 py-3 text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground/70 focus:bg-white/70 dark:bg-white/[0.05] dark:focus:bg-white/[0.07]"
                />
              </div>
            </section>

            <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
              <SectionTitle
                icon={PackageCheck}
                eyebrow="Products"
                title="محصولات ارسالی به کیان"
              />

              <div className="mt-4 grid gap-3">
                {order.products.map((product) => (
                  <article
                    key={product.id}
                    className="flex flex-col gap-3 rounded-[1.6rem] bg-white/45 p-3 dark:bg-white/[0.04] sm:flex-row sm:items-center"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white/70 dark:bg-white/[0.06]">
                      {product.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.thumbnailUrl}
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-foreground">
                        {product.title}
                      </p>

                      <p className="mt-1 text-xs font-bold text-muted-foreground">
                        کد {product.productCode} · {product.color ?? "-"} ·{" "}
                        {product.size ?? "-"} · تعداد{" "}
                        {product.quantity.toLocaleString("fa-IR")}
                      </p>

                      <p
                        dir="ltr"
                        className="mt-1 text-left text-[11px] font-bold text-muted-foreground"
                      >
                        {product.barcode}
                      </p>
                    </div>

                    <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-black text-sky-700 dark:text-sky-300">
                      آماده ارسال
                    </span>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
              <SectionTitle
                icon={FileJson}
                eyebrow="Payload Preview"
                title="پیش‌نمایش payload کیان"
              />

              <pre
                dir="ltr"
                className="mt-4 max-h-[460px] overflow-auto rounded-[1.5rem] bg-slate-950/95 p-4 text-left text-xs leading-6 text-slate-100"
              >
                {payload ? JSON.stringify(payload, null, 2) : "{}"}
              </pre>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
              <h2 className="text-base font-black text-foreground">
                خلاصه سفارش
              </h2>

              <div className="mt-4 grid gap-2">
                <InfoRow label="مشتری" value={order.customer.fullName} />
                <InfoRow label="موبایل" value={order.customer.mobile} />
                <InfoRow label="وضعیت" value={getStatusLabel(order.status)} />
                <InfoRow
                  label="درگاه"
                  value={getGatewayLabel(order.payment.gateway)}
                />
                <InfoRow
                  label="مبلغ کل"
                  value={`${order.totalAmount.toLocaleString("fa-IR")} تومان`}
                />
                <InfoRow
                  label="مبلغ قابل پرداخت"
                  value={`${order.payableAmount.toLocaleString(
                    "fa-IR"
                  )} تومان`}
                />
                <InfoRow
                  label="مبلغ پرداخت‌شده"
                  value={`${order.paidAmount.toLocaleString("fa-IR")} تومان`}
                />
                <InfoRow
                  label="وضعیت کیان"
                  value={
                    order.kiyanInvoice.status === "created"
                      ? "ثبت شده"
                      : "ثبت نشده"
                  }
                />
              </div>
            </section>

            <section className="rounded-[2rem] bg-sky-500/[0.07] p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-sky-400/[0.08]">
              <h2 className="text-base font-black text-foreground">
                وضعیت آمادگی ارسال
              </h2>

              <div className="mt-4 grid gap-2">
                <ReadyLine active={customerName.trim().length >= 3} label="نام مشتری" />
                <ReadyLine active={customerMobile.trim().length >= 8} label="موبایل مشتری" />
                <ReadyLine active={customerCity.trim().length >= 2} label="شهر مشتری" />
                <ReadyLine active={warehouseCode.trim().length > 0} label="کد انبار" />
                <ReadyLine active={paymentMethod.trim().length > 0} label="روش پرداخت" />
                <ReadyLine active={order.products.length > 0} label="محصولات سفارش" />
              </div>
            </section>

            {submitError ? (
              <p className="rounded-[1.5rem] bg-rose-500/10 px-4 py-3 text-xs font-black text-rose-700 dark:text-rose-300">
                {submitError}
              </p>
            ) : null}

            <button
              type="button"
              disabled={!canSend}
              onClick={handleMockSend}
              className={[
                "flex w-full items-center justify-center gap-2 rounded-[1.6rem] px-4 py-3 text-sm font-black transition",
                canSend
                  ? "bg-sky-600 text-white shadow-[0_14px_32px_rgba(2,132,199,0.20)] hover:-translate-y-0.5"
                  : "cursor-not-allowed bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {requestState === "sending" ? (
                <>
                  <Send className="h-4 w-4 animate-pulse" />
                  در حال ارسال mock...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  ارسال درخواست ثبت کیان
                </>
              )}
            </button>

            {mockResponse ? (
              <section className="rounded-[2rem] bg-emerald-500/[0.08] p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-emerald-400/[0.08]">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700 dark:text-emerald-300" />

                  <div className="min-w-0">
                    <h2 className="text-base font-black text-foreground">
                      پاسخ mock کیان
                    </h2>

                    <div className="mt-3 grid gap-2">
                      <InfoRow label="نتیجه" value="موفق" />
                      <InfoRow
                        label="بارکد کیان"
                        value={mockResponse.barcode}
                      />
                      <InfoRow
                        label="شماره سند"
                        value={mockResponse.documentNumber}
                      />
                    </div>

                    <p className="mt-3 text-xs leading-6 text-muted-foreground">
                      {mockResponse.message}
                    </p>

                    <Link
                      href={getSalesOrderDetailPath(order.id)}
                      className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-black text-white transition hover:-translate-y-0.5"
                    >
                      بازگشت به جزئیات سفارش
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </section>
            ) : null}
          </aside>
        </section>
      </div>
    </main>
  );
}

function buildKiyanSalePayload(
  order: SalesOrder,
  fields: {
    customerName: string;
    customerMobile: string;
    customerCity: string;
    customerProvince: string;
    issueDate: string;
    warehouseCode: string;
    saleChannel: string;
    paymentMethod: string;
    description: string;
  }
): KiyanSalePayload {
  return {
    operation: "create_sale_invoice",
    source: {
      orderId: order.id,
      externalOrderId: order.externalOrderId,
      orderType: order.type,
      createdAt: order.createdAt,
    },
    customer: {
      fullName: fields.customerName.trim(),
      mobile: fields.customerMobile.trim(),
      city: fields.customerCity.trim(),
      province: fields.customerProvince.trim() || undefined,
    },
    invoice: {
      issueDate: fields.issueDate,
      warehouseCode: fields.warehouseCode.trim(),
      saleChannel: fields.saleChannel.trim(),
      paymentMethod: fields.paymentMethod.trim(),
      totalAmount: order.totalAmount,
      payableAmount: order.payableAmount,
      paidAmount: order.paidAmount,
      description: fields.description.trim() || undefined,
    },
    items: order.products.map((product) => ({
      productId: product.id,
      title: product.title,
      productCode: product.productCode,
      barcode: product.barcode,
      color: product.color,
      size: product.size,
      quantity: product.quantity,
    })),
  };
}

function SectionTitle({
  icon: Icon,
  eyebrow,
  title,
}: {
  icon: typeof UserRound;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="text-xs font-black text-sky-700 dark:text-sky-300">
          {eyebrow}
        </p>

        <h2 className="text-lg font-black text-foreground">{title}</h2>
      </div>
    </div>
  );
}

function KiyanInput({
  label,
  value,
  onChange,
  placeholder,
  dir = "rtl",
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  dir?: "rtl" | "ltr";
  type?: "text" | "date";
}) {
  return (
    <div>
      <label className="text-xs font-black text-muted-foreground">
        {label}
      </label>

      <input
        value={value}
        type={type}
        dir={dir}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={[
          "mt-2 h-12 w-full rounded-[1.4rem] bg-white/55 px-4 text-sm font-black text-foreground outline-none placeholder:text-muted-foreground/70 focus:bg-white/70 dark:bg-white/[0.05] dark:focus:bg-white/[0.07]",
          dir === "ltr" ? "text-left" : "text-right",
        ].join(" ")}
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.2rem] bg-white/45 px-3 py-2 dark:bg-white/[0.04]">
      <span className="text-xs font-black text-muted-foreground">{label}</span>

      <span className="truncate text-xs font-black text-foreground">
        {value}
      </span>
    </div>
  );
}

function ReadyLine({ active, label }: { active: boolean; label: string }) {
  return (
    <div
      className={[
        "flex items-center justify-between rounded-[1.2rem] px-3 py-2",
        active
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "bg-rose-500/10 text-rose-700 dark:text-rose-300",
      ].join(" ")}
    >
      <span className="text-xs font-black">{label}</span>

      <span className="text-xs font-black">
        {active ? "آماده" : "ناقص"}
      </span>
    </div>
  );
}