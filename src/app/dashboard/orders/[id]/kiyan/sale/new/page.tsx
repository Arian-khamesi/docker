"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeDollarSign,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  FileJson,
  PackageCheck,
  Plus,
  ReceiptText,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";

import { getSalesOrderDetailPath } from "@/components/sales/orders/sales-orders.constants";
import { getGatewayLabel, getStatusLabel } from "@/lib/orders/order-labels";
import { useSalesOrdersStore } from "@/store/sales-orders.store";
import type { SalesOrder, SalesOrderProduct } from "@/types/sales-order";

type RequestState = "idle" | "sending" | "success" | "failed";
type DiscountType = "percent" | "amount";

interface KiyanSalePayload {
  uniqueInfo: string;
  customerId: string;
  saleTransactionItemInformation: {
    itemId: number;
    quantity: number;
    price: number;
    priceWithDiscount: number;
    tax: number;
    charge: number;
    workerId: number;
    isCancel: boolean;
  }[];
  paymentInformation: {
    tenderId: string;
    paymentAmount: number;
    discountedAmount: number;
    rrn: string;
    stan: string;
    cardNumber: string;
    hashedCardNumber: string;
    customerIdentifier: string;
    terminalCode: string;
    serialNumber: string;
    giftCardPassword: string;
  }[];
}

interface KiyanSaleItemDraft {
  productId: string;
  itemId: string;
  quantity: string;
  price: string;
  priceWithDiscount: string;
}

interface KiyanPaymentDraft {
  id: string;
  tenderId: string;
  amount: string;
  serialNumber: string;
  confirmed: boolean;
  locked?: boolean;
  label?: string;
}

interface MockKiyanSaleResponse {
  success: boolean;
  saleReceiptBarcode: string;
  message: string;
  createdAt: string;
  rawResponse: {
    saleReceiptBarcode: string;
  };
}

const KIYAN_DISCOUNT_PERCENT = "125";
const KIYAN_DISCOUNT_AMOUNT = "126";

const KIYAN_GATEWAYS = [
  { id: "1", title: "نقد" },
  { id: "621", title: "سامان" },
  { id: "1247", title: "مدیسه" },
  { id: "1015", title: "اسنپ" },
  { id: "399", title: "اعتبار" },
];

export default function KiyanSaleCreateForOrderPage() {
  const params = useParams<{ id: string }>();

  const { orders, updatePrimaryKiyanInvoice, markOrderNeedsFollowUp } =
    useSalesOrdersStore();

  const order = useMemo(
    () => orders.find((item) => String(item.id) === String(params.id)),
    [orders, params.id]
  );

  const [hydratedOrderId, setHydratedOrderId] = useState<string | null>(null);
  const [kiyanCustomerId, setKiyanCustomerId] = useState("");
  const [itemDrafts, setItemDrafts] = useState<KiyanSaleItemDraft[]>([]);
  const [paymentDrafts, setPaymentDrafts] = useState<KiyanPaymentDraft[]>([]);
  const [newTenderId, setNewTenderId] = useState("621");
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [discountBarcode, setDiscountBarcode] = useState("");
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [mockResponse, setMockResponse] = useState<MockKiyanSaleResponse | null>(
    null
  );
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!order || hydratedOrderId === String(order.id)) return;

    setKiyanCustomerId(buildMockKiyanCustomerId(order));
    setItemDrafts(buildInitialSaleItemDrafts(order));
    setPaymentDrafts([
      {
        id: createDraftId(),
        tenderId: resolveKiyanTenderId(order),
        amount: String(order.payableAmount || order.paidAmount || 0),
        serialNumber: "",
        confirmed: true,
        label: getGatewayLabel(order.payment.gateway),
      },
    ]);

    setHydratedOrderId(String(order.id));
  }, [hydratedOrderId, order]);

  const confirmedPayments = useMemo(
    () => paymentDrafts.filter((payment) => payment.confirmed),
    [paymentDrafts]
  );

  const confirmedPaymentTotal = useMemo(
    () =>
      confirmedPayments.reduce(
        (total, payment) => total + parseMoney(payment.amount),
        0
      ),
    [confirmedPayments]
  );

  const targetAmount = order?.payableAmount ?? 0;
  const paymentDiff = targetAmount - confirmedPaymentTotal;

  const discountAmount = useMemo(() => {
    if (!order) return 0;

    const value = parseMoney(discountValue);

    if (value <= 0) return 0;

    if (discountType === "percent") {
      return Math.round((targetAmount * value) / 100);
    }

    return value;
  }, [discountType, discountValue, order, targetAmount]);

  const payload = useMemo(() => {
    if (!order) return null;

    return buildRealKiyanSalePayload(order, {
      kiyanCustomerId,
      itemDrafts,
      paymentDrafts: confirmedPayments,
    });
  }, [confirmedPayments, itemDrafts, kiyanCustomerId, order]);

  const validationError = useMemo(() => {
    if (!order) return "سفارش معتبر نیست.";

    return validateKiyanSalePayload({
      order,
      kiyanCustomerId,
      itemDrafts,
      paymentDrafts,
      targetAmount,
      confirmedPaymentTotal,
    });
  }, [
    confirmedPaymentTotal,
    itemDrafts,
    kiyanCustomerId,
    order,
    paymentDrafts,
    targetAmount,
  ]);

  const canSend =
    Boolean(order) &&
    Boolean(payload) &&
    !validationError &&
    requestState !== "sending";

  function updateItemDraft(
    productId: string,
    field: keyof Omit<KiyanSaleItemDraft, "productId">,
    value: string
  ) {
    setItemDrafts((current) =>
      current.map((item) =>
        item.productId === productId
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function addPaymentRow() {
    const amount = parseMoney(newPaymentAmount);

    if (!newTenderId || amount <= 0) {
      setSubmitError("درگاه و مبلغ پرداخت را درست وارد کن.");
      return;
    }

    setPaymentDrafts((current) => [
      ...current,
      {
        id: createDraftId(),
        tenderId: newTenderId,
        amount: String(amount),
        serialNumber: "",
        confirmed: false,
      },
    ]);

    setNewPaymentAmount("");
    setSubmitError("");
  }

  function updatePaymentRow(
    id: string,
    field: keyof Pick<KiyanPaymentDraft, "tenderId" | "amount" | "serialNumber">,
    value: string
  ) {
    setPaymentDrafts((current) =>
      current.map((payment) =>
        payment.id === id
          ? {
              ...payment,
              [field]: value,
            }
          : payment
      )
    );
  }

  function confirmPaymentRow(id: string) {
    setPaymentDrafts((current) =>
      current.map((payment) =>
        payment.id === id
          ? {
              ...payment,
              confirmed: true,
            }
          : payment
      )
    );
  }

  function editPaymentRow(id: string) {
    setPaymentDrafts((current) =>
      current.map((payment) =>
        payment.id === id && !payment.locked
          ? {
              ...payment,
              confirmed: false,
            }
          : payment
      )
    );
  }

  function removePaymentRow(id: string) {
    setPaymentDrafts((current) =>
      current.filter((payment) => payment.id !== id)
    );
  }

  function applyDiscount() {
    if (!order) return;

    const value = parseMoney(discountValue);

    if (!discountBarcode.trim()) {
      setSubmitError("برای تخفیف، بارکد یا سریال تخفیف را وارد کن.");
      return;
    }

    if (value <= 0) {
      setSubmitError("مقدار تخفیف معتبر نیست.");
      return;
    }

    if (discountAmount <= 0 || discountAmount >= targetAmount) {
      setSubmitError("مبلغ تخفیف نمی‌تواند برابر یا بیشتر از مبلغ سفارش باشد.");
      return;
    }

    const tenderId =
      discountType === "percent"
        ? KIYAN_DISCOUNT_PERCENT
        : KIYAN_DISCOUNT_AMOUNT;

    const label =
      discountType === "percent" ? "تخفیف درصدی" : "بن ریالی / تخفیف مبلغی";

    setPaymentDrafts((current) => {
      const withoutPreviousDiscount = current.filter(
        (payment) =>
          payment.tenderId !== KIYAN_DISCOUNT_PERCENT &&
          payment.tenderId !== KIYAN_DISCOUNT_AMOUNT
      );

      return [
        ...withoutPreviousDiscount,
        {
          id: createDraftId(),
          tenderId,
          amount: String(discountAmount),
          serialNumber: discountBarcode.trim(),
          confirmed: true,
          locked: true,
          label,
        },
      ];
    });

    setSubmitError("");
  }

  async function handleMockSend() {
    if (!order || !payload) return;

    setSubmitError(validationError);

    if (validationError) return;

    setRequestState("sending");
    setMockResponse(null);

    await new Promise((resolve) => setTimeout(resolve, 850));

    const saleReceiptBarcode = `KY-SALE-${order.id}-${Date.now()
      .toString()
      .slice(-6)}`;

    const response: MockKiyanSaleResponse = {
      success: true,
      saleReceiptBarcode,
      message: "فاکتور فروش با موفقیت در کیان ثبت شد.",
      createdAt: new Date().toISOString(),
      rawResponse: {
        saleReceiptBarcode,
      },
    };

    updatePrimaryKiyanInvoice(order.id, saleReceiptBarcode);

    markOrderNeedsFollowUp(
      order.id,
      false,
      "فاکتور فروش کیان با payload واقعی‌تر ثبت شد."
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
                  Real Kiyan Sale Payload
                </p>

                <h1 className="mt-1 text-2xl font-black text-foreground">
                  ثبت فروش سفارش #{order.id} در کیان
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                  در این نسخه payload ثبت فروش مطابق ساختار واقعی‌تر کیان ساخته
                  می‌شود: اطلاعات مشتری کیان، آیتم‌های فروش و اطلاعات پرداخت.
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
                title="شناسه مشتری کیان"
              />

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr]">
                <KiyanInput
                  label="customerId کیان"
                  value={kiyanCustomerId}
                  onChange={setKiyanCustomerId}
                  placeholder="شناسه مشتری در کیان"
                  dir="ltr"
                />

                <ReadOnlyBox
                  label="uniqueInfo"
                  value={`${order.id}-${kiyanCustomerId || "customerId"}`}
                />
              </div>

              <p className="mt-3 rounded-[1.3rem] bg-sky-500/10 px-4 py-3 text-xs font-bold leading-6 text-sky-700 dark:text-sky-300">
                در اتصال واقعی، customerId باید از سرویس آماده‌سازی سفارش یا
                دیتای مشتری کیان گرفته شود. فعلاً مقدار mock قابل ویرایش است.
              </p>
            </section>

            <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
              <SectionTitle
                icon={PackageCheck}
                eyebrow="Sale Items"
                title="saleTransactionItemInformation"
              />

              <div className="mt-4 grid gap-3">
                {itemDrafts.map((draft) => {
                  const product = order.products.find(
                    (item) => item.id === draft.productId
                  );

                  if (!product) return null;

                  return (
                    <article
                      key={draft.productId}
                      className="rounded-[1.6rem] bg-white/45 p-3 dark:bg-white/[0.04]"
                    >
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-start">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
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

                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-foreground">
                              {product.title}
                            </p>

                            <p className="mt-1 text-xs font-bold text-muted-foreground">
                              کد {product.productCode} · {product.color ?? "-"}{" "}
                              · {product.size ?? "-"} · تعداد سفارش{" "}
                              {product.quantity.toLocaleString("fa-IR")}
                            </p>

                            <p
                              dir="ltr"
                              className="mt-1 text-left text-[11px] font-bold text-muted-foreground"
                            >
                              {product.barcode}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-2 md:grid-cols-4 xl:w-[620px]">
                          <KiyanInput
                            label="itemId کیان"
                            value={draft.itemId}
                            onChange={(value) =>
                              updateItemDraft(
                                draft.productId,
                                "itemId",
                                value
                              )
                            }
                            placeholder="itemId"
                            dir="ltr"
                            inputMode="numeric"
                          />

                          <KiyanInput
                            label="quantity"
                            value={draft.quantity}
                            onChange={(value) =>
                              updateItemDraft(
                                draft.productId,
                                "quantity",
                                value
                              )
                            }
                            placeholder="1"
                            dir="ltr"
                            inputMode="numeric"
                          />

                          <KiyanInput
                            label="price"
                            value={draft.price}
                            onChange={(value) =>
                              updateItemDraft(draft.productId, "price", value)
                            }
                            placeholder="price"
                            dir="ltr"
                            inputMode="numeric"
                          />

                          <KiyanInput
                            label="priceWithDiscount"
                            value={draft.priceWithDiscount}
                            onChange={(value) =>
                              updateItemDraft(
                                draft.productId,
                                "priceWithDiscount",
                                value
                              )
                            }
                            placeholder="priceWithDiscount"
                            dir="ltr"
                            inputMode="numeric"
                          />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
              <SectionTitle
                icon={CreditCard}
                eyebrow="Payment Information"
                title="درگاه‌ها و پرداخت‌های کیان"
              />

              <div className="mt-4 grid gap-3 rounded-[1.6rem] bg-white/45 p-3 dark:bg-white/[0.04] md:grid-cols-[1fr_1fr_auto]">
                <div>
                  <label className="text-xs font-black text-muted-foreground">
                    درگاه
                  </label>

                  <select
                    value={newTenderId}
                    onChange={(event) => setNewTenderId(event.target.value)}
                    className="mt-2 h-12 w-full rounded-[1.4rem] bg-white/55 px-4 text-sm font-black text-foreground outline-none dark:bg-white/[0.05]"
                  >
                    {KIYAN_GATEWAYS.map((gateway) => (
                      <option key={gateway.id} value={gateway.id}>
                        {gateway.title}
                      </option>
                    ))}
                  </select>
                </div>

                <KiyanInput
                  label="مبلغ پرداخت - تومان"
                  value={newPaymentAmount}
                  onChange={setNewPaymentAmount}
                  placeholder="مثلاً 1500000"
                  dir="ltr"
                  inputMode="numeric"
                />

                <button
                  type="button"
                  onClick={addPaymentRow}
                  className="mt-auto flex h-12 items-center justify-center gap-2 rounded-[1.4rem] bg-sky-600 px-4 text-sm font-black text-white shadow-[0_14px_32px_rgba(2,132,199,0.18)] transition hover:-translate-y-0.5"
                >
                  <Plus className="h-4 w-4" />
                  افزودن
                </button>
              </div>

              <div className="mt-3 grid gap-3">
                {paymentDrafts.map((payment) => (
                  <PaymentRow
                    key={payment.id}
                    payment={payment}
                    onChange={updatePaymentRow}
                    onConfirm={confirmPaymentRow}
                    onEdit={editPaymentRow}
                    onRemove={removePaymentRow}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
              <SectionTitle
                icon={ReceiptText}
                eyebrow="Discount Tender"
                title="اعمال تخفیف کیان"
              />

              <div className="mt-4 grid gap-3 md:grid-cols-[160px_1fr_1fr_auto]">
                <div>
                  <label className="text-xs font-black text-muted-foreground">
                    نوع تخفیف
                  </label>

                  <select
                    value={discountType}
                    onChange={(event) =>
                      setDiscountType(event.target.value as DiscountType)
                    }
                    className="mt-2 h-12 w-full rounded-[1.4rem] bg-white/55 px-4 text-sm font-black text-foreground outline-none dark:bg-white/[0.05]"
                  >
                    <option value="percent">درصدی</option>
                    <option value="amount">ریالی / مبلغی</option>
                  </select>
                </div>

                <KiyanInput
                  label="مقدار تخفیف"
                  value={discountValue}
                  onChange={setDiscountValue}
                  placeholder={
                    discountType === "percent" ? "مثلاً 10" : "مثلاً 200000"
                  }
                  dir="ltr"
                  inputMode="numeric"
                />

                <KiyanInput
                  label="بارکد / سریال تخفیف"
                  value={discountBarcode}
                  onChange={setDiscountBarcode}
                  placeholder="serialNumber"
                  dir="ltr"
                />

                <button
                  type="button"
                  onClick={applyDiscount}
                  className="mt-auto flex h-12 items-center justify-center gap-2 rounded-[1.4rem] bg-violet-600 px-4 text-sm font-black text-white shadow-[0_14px_32px_rgba(124,58,237,0.18)] transition hover:-translate-y-0.5"
                >
                  اعمال
                </button>
              </div>

              <p className="mt-3 rounded-[1.3rem] bg-violet-500/10 px-4 py-3 text-xs font-bold leading-6 text-violet-700 dark:text-violet-300">
                مبلغ تخفیف محاسبه‌شده:{" "}
                <span className="font-black">
                  {discountAmount.toLocaleString("fa-IR")} تومان
                </span>
                . این مقدار به عنوان paymentInformation با tenderId مخصوص تخفیف
                وارد payload می‌شود.
              </p>
            </section>

            <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
              <SectionTitle
                icon={FileJson}
                eyebrow="Payload Preview"
                title="پیش‌نمایش payload واقعی‌تر ثبت فروش کیان"
              />

              <pre
                dir="ltr"
                className="mt-4 max-h-[520px] overflow-auto rounded-[1.5rem] bg-slate-950/95 p-4 text-left text-xs leading-6 text-slate-100"
              >
                {payload
                  ? JSON.stringify(payload, null, 2)
                  : JSON.stringify(
                      {
                        message:
                          "برای ساخت payload، customerId، آیتم‌ها و پرداخت‌ها باید کامل باشند.",
                      },
                      null,
                      2
                    )}
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
                  label="درگاه اصلی"
                  value={getGatewayLabel(order.payment.gateway)}
                />
                <InfoRow
                  label="مبلغ سفارش"
                  value={`${order.payableAmount.toLocaleString(
                    "fa-IR"
                  )} تومان`}
                />
                <InfoRow
                  label="کیان"
                  value={
                    order.kiyanInvoice.status === "created"
                      ? order.kiyanInvoice.code || "ثبت شده"
                      : "ثبت نشده"
                  }
                />
              </div>
            </section>

            <section className="rounded-[2rem] bg-sky-500/[0.07] p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-sky-400/[0.08]">
              <h2 className="text-base font-black text-foreground">
                کنترل مبلغ پرداخت
              </h2>

              <div className="mt-4 grid gap-2">
                <InfoRow
                  label="مبلغ هدف"
                  value={`${targetAmount.toLocaleString("fa-IR")} تومان`}
                />

                <InfoRow
                  label="جمع پرداخت‌های تاییدشده"
                  value={`${confirmedPaymentTotal.toLocaleString(
                    "fa-IR"
                  )} تومان`}
                />

                <InfoRow
                  label="اختلاف"
                  value={`${paymentDiff.toLocaleString("fa-IR")} تومان`}
                />
              </div>

              {paymentDiff === 0 ? (
                <p className="mt-3 rounded-[1.3rem] bg-emerald-500/10 px-4 py-3 text-xs font-black text-emerald-700 dark:text-emerald-300">
                  جمع پرداخت‌ها با مبلغ سفارش برابر است.
                </p>
              ) : (
                <p className="mt-3 rounded-[1.3rem] bg-rose-500/10 px-4 py-3 text-xs font-black text-rose-700 dark:text-rose-300">
                  جمع پرداخت‌ها باید دقیقاً با مبلغ سفارش برابر شود.
                </p>
              )}
            </section>

            <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
              <h2 className="text-base font-black text-foreground">
                آمادگی ارسال
              </h2>

              <div className="mt-4 grid gap-2">
                <ReadyLine
                  active={Number(kiyanCustomerId) > 0}
                  label="customerId کیان"
                />
                <ReadyLine
                  active={itemDrafts.length > 0}
                  label="آیتم‌های سفارش"
                />
                <ReadyLine
                  active={itemDrafts.every((item) => Number(item.itemId) > 0)}
                  label="itemIdهای کیان"
                />
                <ReadyLine
                  active={confirmedPayments.length > 0}
                  label="پرداخت تاییدشده"
                />
                <ReadyLine active={paymentDiff === 0} label="تراز پرداخت" />
                <ReadyLine active={!validationError} label="payload معتبر" />
              </div>
            </section>

            {submitError || validationError ? (
              <p className="rounded-[1.5rem] bg-rose-500/10 px-4 py-3 text-xs font-black leading-6 text-rose-700 dark:text-rose-300">
                {submitError || validationError}
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
                  <Save className="h-4 w-4 animate-pulse" />
                  در حال ارسال mock...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  ارسال mock ثبت فروش کیان
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
                        label="بارکد فاکتور فروش"
                        value={mockResponse.saleReceiptBarcode}
                      />
                    </div>

                    <pre
                      dir="ltr"
                      className="mt-3 max-h-40 overflow-auto rounded-[1.2rem] bg-slate-950/95 p-3 text-left text-xs leading-6 text-slate-100"
                    >
                      {JSON.stringify(mockResponse.rawResponse, null, 2)}
                    </pre>

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

function PaymentRow({
  payment,
  onChange,
  onConfirm,
  onEdit,
  onRemove,
}: {
  payment: KiyanPaymentDraft;
  onChange: (
    id: string,
    field: keyof Pick<KiyanPaymentDraft, "tenderId" | "amount" | "serialNumber">,
    value: string
  ) => void;
  onConfirm: (id: string) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const readonly = payment.confirmed || payment.locked;
  const tenderTitle = getTenderTitle(payment.tenderId);

  return (
    <article className="rounded-[1.6rem] bg-white/45 p-3 dark:bg-white/[0.04]">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
        <div>
          <label className="text-xs font-black text-muted-foreground">
            tenderId
          </label>

          <select
            value={payment.tenderId}
            disabled={readonly}
            onChange={(event) =>
              onChange(payment.id, "tenderId", event.target.value)
            }
            className="mt-2 h-12 w-full rounded-[1.4rem] bg-white/55 px-4 text-sm font-black text-foreground outline-none disabled:opacity-70 dark:bg-white/[0.05]"
          >
            {[...KIYAN_GATEWAYS, { id: "125", title: "تخفیف درصدی" }, { id: "126", title: "بن ریالی" }].map(
              (gateway) => (
                <option key={gateway.id} value={gateway.id}>
                  {gateway.title}
                </option>
              )
            )}
          </select>
        </div>

        <KiyanInput
          label="مبلغ - تومان"
          value={payment.amount}
          onChange={(value) => onChange(payment.id, "amount", value)}
          placeholder="amount"
          dir="ltr"
          inputMode="numeric"
          disabled={readonly}
        />

        <KiyanInput
          label="serialNumber"
          value={payment.serialNumber}
          onChange={(value) => onChange(payment.id, "serialNumber", value)}
          placeholder="برای تخفیف / بن"
          dir="ltr"
          disabled={readonly}
        />

        <div className="flex gap-2">
          {payment.confirmed ? (
            <button
              type="button"
              disabled={payment.locked}
              onClick={() => onEdit(payment.id)}
              className="flex h-11 items-center justify-center rounded-2xl bg-white/65 px-3 text-xs font-black text-foreground transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/[0.06]"
            >
              ویرایش
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onConfirm(payment.id)}
              className="flex h-11 items-center justify-center rounded-2xl bg-emerald-600 px-3 text-xs font-black text-white transition hover:-translate-y-0.5"
            >
              تایید
            </button>
          )}

          <button
            type="button"
            onClick={() => onRemove(payment.id)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-700 transition hover:-translate-y-0.5 dark:text-rose-300"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-black/[0.06] px-3 py-1 text-xs font-black text-foreground dark:bg-white/[0.08]">
          {payment.label || tenderTitle}
        </span>

        <span
          className={[
            "rounded-full px-3 py-1 text-xs font-black",
            payment.confirmed
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "bg-amber-500/10 text-amber-700 dark:text-amber-300",
          ].join(" ")}
        >
          {payment.confirmed ? "تایید شده" : "در حال ویرایش"}
        </span>

        <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-black text-sky-700 dark:text-sky-300">
          paymentAmount در payload:{" "}
          {(parseMoney(payment.amount) * 10).toLocaleString("fa-IR")} ریال
        </span>
      </div>
    </article>
  );
}

function buildRealKiyanSalePayload(
  order: SalesOrder,
  fields: {
    kiyanCustomerId: string;
    itemDrafts: KiyanSaleItemDraft[];
    paymentDrafts: KiyanPaymentDraft[];
  }
): KiyanSalePayload {
  return {
    uniqueInfo: `${order.id}-${fields.kiyanCustomerId.trim()}`,
    customerId: fields.kiyanCustomerId.trim(),
    saleTransactionItemInformation: fields.itemDrafts.map((item) => ({
      itemId: Number(item.itemId),
      quantity: Number(item.quantity),
      price: parseMoney(item.price),
      priceWithDiscount: parseMoney(item.priceWithDiscount),
      tax: 0,
      charge: 0,
      workerId: 0,
      isCancel: false,
    })),
    paymentInformation: fields.paymentDrafts.map((payment) => ({
      tenderId: payment.tenderId,
      paymentAmount: parseMoney(payment.amount) * 10,
      discountedAmount: 0,
      rrn: "",
      stan: "",
      cardNumber: "",
      hashedCardNumber: "",
      customerIdentifier: "",
      terminalCode: "",
      serialNumber: payment.serialNumber.trim(),
      giftCardPassword: "",
    })),
  };
}

function validateKiyanSalePayload({
  order,
  kiyanCustomerId,
  itemDrafts,
  paymentDrafts,
  targetAmount,
  confirmedPaymentTotal,
}: {
  order: SalesOrder;
  kiyanCustomerId: string;
  itemDrafts: KiyanSaleItemDraft[];
  paymentDrafts: KiyanPaymentDraft[];
  targetAmount: number;
  confirmedPaymentTotal: number;
}) {
  if (!order.id) return "شماره سفارش معتبر نیست.";

  if (!kiyanCustomerId.trim() || Number(kiyanCustomerId) <= 0) {
    return "customerId کیان معتبر نیست.";
  }

  if (!itemDrafts.length) {
    return "سبد خرید برای ثبت کیان خالی است.";
  }

  for (const item of itemDrafts) {
    if (Number(item.itemId) <= 0) {
      return "itemId یکی از محصولات معتبر نیست.";
    }

    if (Number(item.quantity) <= 0) {
      return "quantity یکی از محصولات معتبر نیست.";
    }

    if (parseMoney(item.price) <= 0) {
      return "price یکی از محصولات معتبر نیست.";
    }

    if (parseMoney(item.priceWithDiscount) < 0) {
      return "priceWithDiscount یکی از محصولات معتبر نیست.";
    }
  }

  const confirmedRows = paymentDrafts.filter((payment) => payment.confirmed);

  if (!confirmedRows.length) {
    return "هیچ درگاه پرداختی تایید نشده است.";
  }

  for (const payment of confirmedRows) {
    if (!payment.tenderId) {
      return "tenderId یکی از پرداخت‌ها معتبر نیست.";
    }

    if (parseMoney(payment.amount) <= 0) {
      return "مبلغ یکی از پرداخت‌ها معتبر نیست.";
    }

    if (
      (payment.tenderId === KIYAN_DISCOUNT_PERCENT ||
        payment.tenderId === KIYAN_DISCOUNT_AMOUNT) &&
      !payment.serialNumber.trim()
    ) {
      return "برای تخفیف یا بن، serialNumber الزامی است.";
    }
  }

  if (targetAmount - confirmedPaymentTotal !== 0) {
    return "جمع پرداخت‌های تاییدشده باید دقیقاً با مبلغ سفارش برابر باشد.";
  }

  return "";
}

function buildInitialSaleItemDrafts(order: SalesOrder): KiyanSaleItemDraft[] {
  const totalQuantity = order.products.reduce(
    (total, product) => total + product.quantity,
    0
  );

  const safeTotalQuantity = Math.max(1, totalQuantity);
  const fallbackUnitPrice = Math.round(order.payableAmount / safeTotalQuantity);

  return order.products.map((product) => {
    const unitPrice = resolveProductUnitPrice(product, fallbackUnitPrice);
    const priceWithDiscount = resolveProductDiscountedPrice(product, unitPrice);

    return {
      productId: product.id,
      itemId: String(resolveKiyanItemId(product)),
      quantity: String(product.quantity),
      price: String(unitPrice),
      priceWithDiscount: String(priceWithDiscount),
    };
  });
}

function resolveProductUnitPrice(
  product: SalesOrderProduct,
  fallbackUnitPrice: number
) {
  const extendedProduct = product as SalesOrderProduct & {
    price?: number;
    unitPrice?: number;
    finalPrice?: number;
    bamaliat?: number;
  };

  return (
    Number(extendedProduct.finalPrice) ||
    Number(extendedProduct.unitPrice) ||
    Number(extendedProduct.price) ||
    Number(extendedProduct.bamaliat) ||
    fallbackUnitPrice
  );
}

function resolveProductDiscountedPrice(
  product: SalesOrderProduct,
  unitPrice: number
) {
  const extendedProduct = product as SalesOrderProduct & {
    priceWithDiscount?: number;
    discountTotal?: number;
  };

  if (Number(extendedProduct.priceWithDiscount) >= 0) {
    return Number(extendedProduct.priceWithDiscount);
  }

  const discountTotal = Number(extendedProduct.discountTotal || 0);

  if (discountTotal > 0 && product.quantity > 0) {
    return Math.max(0, unitPrice - Math.round(discountTotal / product.quantity));
  }

  return unitPrice;
}

function resolveKiyanItemId(product: SalesOrderProduct) {
  const extendedProduct = product as SalesOrderProduct & {
    itmID?: number | string;
    kiyanItemId?: number | string;
  };

  if (extendedProduct.itmID) return extendedProduct.itmID;
  if (extendedProduct.kiyanItemId) return extendedProduct.kiyanItemId;

  const barcodeDigits = String(product.barcode || "").replace(/\D/g, "");

  if (barcodeDigits) return barcodeDigits;

  return String(product.id).replace(/\D/g, "") || "0";
}

function resolveKiyanTenderId(order: SalesOrder) {
  if (order.payment.gateway === "saman") return "621";
  if (order.payment.gateway === "snapp_pay") return "1015";
  if (order.payment.gateway === "medisa") return "1247";
  if (order.payment.gateway === "wallet") return "399";

  return "1";
}

function buildMockKiyanCustomerId(order: SalesOrder) {
  const mobileDigits = order.customer.mobile.replace(/\D/g, "");
  const suffix = mobileDigits.slice(-5) || String(order.id);

  return `10${suffix}`;
}

function getTenderTitle(tenderId: string) {
  if (tenderId === KIYAN_DISCOUNT_PERCENT) return "تخفیف درصدی";
  if (tenderId === KIYAN_DISCOUNT_AMOUNT) return "بن ریالی";

  return (
    KIYAN_GATEWAYS.find((gateway) => gateway.id === tenderId)?.title ??
    `Tender ${tenderId}`
  );
}

function parseMoney(value: string | number) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const englishValue = value
    .toString()
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[,،٫\s]/g, "");

  const parsed = Number(englishValue);

  return Number.isFinite(parsed) ? parsed : 0;
}

function createDraftId() {
  return `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function SectionTitle({
  icon: Icon,
  eyebrow,
  title,
}: {
  icon: LucideIcon;
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
  inputMode = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  dir?: "rtl" | "ltr";
  type?: "text" | "date";
  inputMode?: "text" | "numeric";
  disabled?: boolean;
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
        inputMode={inputMode}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={[
          "mt-2 h-12 w-full rounded-[1.4rem] bg-white/55 px-4 text-sm font-black text-foreground outline-none placeholder:text-muted-foreground/70 focus:bg-white/70 disabled:opacity-70 dark:bg-white/[0.05] dark:focus:bg-white/[0.07]",
          dir === "ltr" ? "text-left" : "text-right",
        ].join(" ")}
      />
    </div>
  );
}

function ReadOnlyBox({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-black text-muted-foreground">{label}</p>

      <div
        dir="ltr"
        className="mt-2 flex h-12 items-center rounded-[1.4rem] bg-white/45 px-4 text-left text-sm font-black text-foreground dark:bg-white/[0.04]"
      >
        {value}
      </div>
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