"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileJson,
  Minus,
  PackageCheck,
  Plus,
  ReceiptText,
  RotateCcw,
  Save,
  Send,
} from "lucide-react";

import { getSalesOrderDetailPath } from "@/components/sales/orders/sales-orders.constants";
import { getGatewayLabel, getStatusLabel } from "@/lib/orders/order-labels";
import { useSalesOrdersStore } from "@/store/sales-orders.store";
import type { SalesOrder } from "@/types/sales-order";

type SelectedReceiptQuantities = Record<string, number>;
type RequestState = "idle" | "fetching" | "sending" | "success" | "failed";

interface KiyanReturnPayload {
  operatorId: number;
  retailstoreId: number;
  workstationId: number;
  transactionSequence: number;
  businessDayDate: string;
  returnInfo: {
    itemId: number;
    quantity: number;
  }[];
}

interface KiyanReceiptHeader {
  retailStoreID: number;
  workstaionID: number;
  transactionSeqNo: number;
  transactionDate: string;
  totalPaymentAmount?: number;
  totalSaleAmount?: number;
  totalDiscountAmount?: number;
  totalGrossAmount?: number;
  totalTaxAmount?: number;
}

interface KiyanReceiptDetail {
  lineNumber: number;
  itemId: number;
  itemName: string;
  itemBarcode: string;
  saleQTY: number;
  returnQTY: number;
  saleAmount?: number;
  taxAmount?: number;
  sourceProductId?: string;
  productCode?: string;
  color?: string;
  size?: string;
}

interface KiyanReceiptResponse {
  receiptHeader: KiyanReceiptHeader;
  receiptsDetail: KiyanReceiptDetail[];
}

interface MockKiyanReturnResponse {
  success: boolean;
  returnReceiptBarcode: string;
  message: string;
  createdAt: string;
  rawResponse: {
    returnReceiptBarcode: string;
  };
}

const quickReasons = [
  "انصراف مشتری",
  "ایراد کالا",
  "مغایرت سایز",
  "مغایرت رنگ",
  "ارسال اشتباه",
];

export default function CreateOrderReturnPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const {
    orders,
    registerReturnInfo,
    registerReturnKiyanBarcode,
    markOrderNeedsFollowUp,
  } = useSalesOrdersStore();

  const order = useMemo(
    () => orders.find((item) => String(item.id) === String(params.id)),
    [orders, params.id]
  );

  const [hydratedOrderId, setHydratedOrderId] = useState<string | null>(null);
  const [sourceReceiptBarcode, setSourceReceiptBarcode] = useState("");
  const [operatorId, setOperatorId] = useState("5084");
  const [receipt, setReceipt] = useState<KiyanReceiptResponse | null>(null);
  const [quantities, setQuantities] = useState<SelectedReceiptQuantities>({});
  const [reason, setReason] = useState("");
  const [returnedAmount, setReturnedAmount] = useState("");
  const [manualReturnReceiptBarcode, setManualReturnReceiptBarcode] =
    useState("");
  const [internalDescription, setInternalDescription] = useState("");
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [mockResponse, setMockResponse] =
    useState<MockKiyanReturnResponse | null>(null);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!order || hydratedOrderId === String(order.id)) return;

    setSourceReceiptBarcode(order.kiyanInvoice.code ?? "");
    setReason(order.returnInfo?.reason ?? "");
    setReturnedAmount(
      order.returnInfo?.returnedAmount
        ? String(order.returnInfo.returnedAmount)
        : ""
    );
    setManualReturnReceiptBarcode(order.returnInfo?.returnKiyanBarcode ?? "");
    setInternalDescription(
      `مرجوعی سفارش ${order.id} - ${getGatewayLabel(order.payment.gateway)}`
    );
    setHydratedOrderId(String(order.id));
  }, [hydratedOrderId, order]);

  const selectedReceiptItems = useMemo(() => {
    if (!receipt) return [];

    return receipt.receiptsDetail
      .map((item) => {
        const uid = getReceiptItemUid(item);

        return {
          uid,
          item,
          quantity: quantities[uid] ?? 0,
        };
      })
      .filter((item) => item.quantity > 0);
  }, [quantities, receipt]);

  const selectedProductsCount = selectedReceiptItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const parsedReturnedAmount = Number(
    returnedAmount.replaceAll(",", "").trim()
  );

  const hasReturnedAmount = returnedAmount.trim().length > 0;

  const isAmountValid =
    hasReturnedAmount &&
    !Number.isNaN(parsedReturnedAmount) &&
    parsedReturnedAmount >= 0;

  const parsedOperatorId = Number(operatorId);

  const isOperatorValid =
    operatorId.trim().length > 0 &&
    Number.isFinite(parsedOperatorId) &&
    parsedOperatorId > 0;

  const payload = useMemo(() => {
    if (!receipt || !selectedReceiptItems.length || !isOperatorValid) {
      return null;
    }

    return buildRealKiyanReturnPayload(receipt, {
      operatorId: parsedOperatorId,
      selectedItems: selectedReceiptItems,
    });
  }, [isOperatorValid, parsedOperatorId, receipt, selectedReceiptItems]);

  const canFetchReceipt =
    Boolean(order) &&
    sourceReceiptBarcode.trim().length > 0 &&
    requestState !== "fetching";

  const canSaveLocal =
    Boolean(order) &&
    Boolean(receipt) &&
    selectedReceiptItems.length > 0 &&
    reason.trim().length >= 3 &&
    isAmountValid;

  const canSendKiyan =
    Boolean(payload) &&
    canSaveLocal &&
    isOperatorValid &&
    requestState !== "sending";

  function handleFetchMockReceipt() {
    if (!order) return;

    setSubmitError("");
    setMockResponse(null);

    if (!sourceReceiptBarcode.trim()) {
      setSubmitError(
        "برای دریافت فاکتور کیان، بارکد فاکتور فروش کیان را وارد کن."
      );
      return;
    }

    setRequestState("fetching");

    window.setTimeout(() => {
      const nextReceipt = buildMockKiyanReceipt(order, sourceReceiptBarcode);
      const initialQuantities = buildInitialQuantitiesFromExistingReturn(
        order,
        nextReceipt
      );

      setReceipt(nextReceipt);
      setQuantities(initialQuantities);
      setRequestState("idle");
    }, 450);
  }

  function updateQuantity(uid: string, nextQuantity: number) {
    if (!receipt) return;

    const item = receipt.receiptsDetail.find(
      (receiptItem) => getReceiptItemUid(receiptItem) === uid
    );

    if (!item) return;

    const maxQuantity = getAvailableReturnQuantity(item);
    const safeQuantity = Math.max(0, Math.min(maxQuantity, nextQuantity));

    setQuantities((current) => {
      if (safeQuantity === 0) {
        const next = { ...current };
        delete next[uid];
        return next;
      }

      return {
        ...current,
        [uid]: safeQuantity,
      };
    });
  }

  function validateDashboardForm() {
    if (!receipt) {
      return "ابتدا فاکتور فروش کیان را دریافت کن.";
    }

    if (!selectedReceiptItems.length) {
      return "حداقل یک قلم از فاکتور کیان را برای مرجوعی انتخاب کن.";
    }

    if (!reason.trim() || reason.trim().length < 3) {
      return "دلیل مرجوعی را کامل‌تر وارد کن.";
    }

    if (!isAmountValid) {
      return "مبلغ مرجوعی را درست وارد کن.";
    }

    return "";
  }

  function validateKiyanPayload() {
    const dashboardError = validateDashboardForm();

    if (dashboardError) return dashboardError;

    if (!isOperatorValid) {
      return "operatorId معتبر نیست.";
    }

    if (!payload) {
      return "payload مرجوعی کیان هنوز ساخته نشده است.";
    }

    for (const selected of selectedReceiptItems) {
      const available = getAvailableReturnQuantity(selected.item);

      if (selected.quantity <= 0) {
        return `تعداد مرجوعی برای ${selected.item.itemName} معتبر نیست.`;
      }

      if (selected.quantity > available) {
        return `تعداد مرجوعی ${selected.item.itemName} بیشتر از مقدار قابل مرجوعی است.`;
      }
    }

    return "";
  }

  function buildInternalReturnItems() {
    if (!order) return [];

    return selectedReceiptItems
      .map((selected) => {
        const productId = resolveOrderProductId(order, selected.item);

        if (!productId) return null;

        return {
          productId,
          quantity: selected.quantity,
        };
      })
      .filter(
        (item): item is { productId: string; quantity: number } =>
          Boolean(item)
      );
  }

  function handleSaveLocal() {
    if (!order) return;

    const error = validateDashboardForm();
    setSubmitError(error);

    if (error) return;

    const internalItems = buildInternalReturnItems();
    const returnedProductIds = internalItems.map((item) => item.productId);
    const manualBarcode = manualReturnReceiptBarcode.trim();

    registerReturnInfo(order.id, {
      status: manualBarcode ? "kiyan_return_registered" : "approved",
      reason: reason.trim(),
      createdAt: order.returnInfo?.createdAt ?? new Date().toISOString(),
      returnedProductIds,
      returnedItems: internalItems,
      returnedAmount: parsedReturnedAmount,
      returnKiyanBarcode: manualBarcode || undefined,
    });

    if (manualBarcode) {
      registerReturnKiyanBarcode(order.id, manualBarcode);
      markOrderNeedsFollowUp(
        order.id,
        false,
        "مرجوعی با بارکد دستی کیان ثبت شد."
      );
    } else {
      markOrderNeedsFollowUp(
        order.id,
        true,
        "مرجوعی ثبت شده ولی بارکد فاکتور مرجوعی کیان هنوز ثبت نشده است."
      );
    }

    router.push(getSalesOrderDetailPath(order.id));
  }

  async function handleMockKiyanSend() {
    if (!order || !payload) return;

    const error = validateKiyanPayload();
    setSubmitError(error);

    if (error) return;

    setRequestState("sending");
    setMockResponse(null);

    await new Promise((resolve) => setTimeout(resolve, 850));

    const returnReceiptBarcode =
      manualReturnReceiptBarcode.trim() ||
      `KY-RETURN-${order.id}-${Date.now().toString().slice(-6)}`;

    const response: MockKiyanReturnResponse = {
      success: true,
      returnReceiptBarcode,
      message: "فاکتور مرجوعی با موفقیت در کیان ثبت شد.",
      createdAt: new Date().toISOString(),
      rawResponse: {
        returnReceiptBarcode,
      },
    };

    const internalItems = buildInternalReturnItems();

    registerReturnInfo(order.id, {
      status: "kiyan_return_registered",
      reason: reason.trim(),
      createdAt: order.returnInfo?.createdAt ?? new Date().toISOString(),
      returnedProductIds: internalItems.map((item) => item.productId),
      returnedItems: internalItems,
      returnedAmount: parsedReturnedAmount,
      returnKiyanBarcode: response.returnReceiptBarcode,
    });

    registerReturnKiyanBarcode(order.id, response.returnReceiptBarcode);

    markOrderNeedsFollowUp(
      order.id,
      false,
      "فاکتور مرجوعی کیان با موفقیت ثبت شد."
    );

    setManualReturnReceiptBarcode(response.returnReceiptBarcode);
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
            برای ثبت مرجوعی، ابتدا باید سفارش معتبر انتخاب شود.
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

  return (
    <main className="glass-page min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="relative overflow-hidden rounded-[2.2rem] bg-white/55 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl dark:bg-white/[0.04] dark:shadow-[0_18px_55px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
          <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-rose-500/10 blur-3xl" />
          <div className="pointer-events-none absolute right-20 top-0 h-px w-72 bg-gradient-to-l from-transparent via-white/70 to-transparent dark:via-white/10" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-700 dark:text-rose-300">
                <RotateCcw className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-black text-rose-700 dark:text-rose-300">
                  Real Kiyan Return Payload
                </p>

                <h1 className="mt-1 text-2xl font-black text-foreground">
                  ثبت مرجوعی سفارش #{order.id}
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                  در این نسخه، payload مرجوعی دقیقاً با ساختار واقعی کیان ساخته
                  می‌شود: اطلاعات فاکتور فروش کیان، اقلام فاکتور و returnInfo.
                  دلیل و مبلغ مرجوعی برای داشبورد داخلی ذخیره می‌شوند.
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
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_390px]">
          <div className="grid gap-4">
            <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
              <SectionTitle
                icon={ReceiptText}
                eyebrow="Kiyan Receipt"
                title="دریافت فاکتور فروش کیان"
              />

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_180px]">
                <KiyanReturnInput
                  label="بارکد فاکتور فروش کیان"
                  value={sourceReceiptBarcode}
                  onChange={setSourceReceiptBarcode}
                  placeholder="مثلاً 99T024SWP2FTM5R"
                  dir="ltr"
                />

                <KiyanReturnInput
                  label="operatorId"
                  value={operatorId}
                  onChange={setOperatorId}
                  placeholder="5084"
                  inputMode="numeric"
                  dir="ltr"
                />

                <button
                  type="button"
                  disabled={!canFetchReceipt}
                  onClick={handleFetchMockReceipt}
                  className={[
                    "mt-auto flex h-12 items-center justify-center gap-2 rounded-[1.4rem] px-4 text-sm font-black transition",
                    canFetchReceipt
                      ? "bg-rose-600 text-white shadow-[0_14px_32px_rgba(225,29,72,0.18)] hover:-translate-y-0.5"
                      : "cursor-not-allowed bg-muted text-muted-foreground",
                  ].join(" ")}
                >
                  {requestState === "fetching" ? (
                    <>
                      <ReceiptText className="h-4 w-4 animate-pulse" />
                      دریافت...
                    </>
                  ) : (
                    <>
                      <ReceiptText className="h-4 w-4" />
                      دریافت mock
                    </>
                  )}
                </button>
              </div>

              <p className="mt-3 rounded-[1.3rem] bg-rose-500/10 px-4 py-3 text-xs font-bold leading-6 text-rose-700 dark:text-rose-300">
                در اتصال واقعی، همین بخش باید از API دریافت فاکتور کیان پر شود.
                فعلاً برای حفظ flow پروژه، فاکتور کیان به صورت mock از روی
                محصولات همین سفارش ساخته می‌شود.
              </p>
            </section>

            {receipt ? (
              <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
                <SectionTitle
                  icon={ClipboardCheck}
                  eyebrow="Receipt Header"
                  title="اطلاعات فاکتور کیان"
                />

                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                  <InfoBox
                    label="فروشگاه"
                    value={String(receipt.receiptHeader.retailStoreID)}
                  />
                  <InfoBox
                    label="صندوق"
                    value={String(receipt.receiptHeader.workstaionID)}
                  />
                  <InfoBox
                    label="شماره تراکنش"
                    value={String(receipt.receiptHeader.transactionSeqNo)}
                  />
                  <InfoBox
                    label="تاریخ تراکنش"
                    value={formatDate(receipt.receiptHeader.transactionDate)}
                  />
                  <InfoBox
                    label="مبلغ پرداخت"
                    value={`${Number(
                      receipt.receiptHeader.totalPaymentAmount ?? 0
                    ).toLocaleString("fa-IR")} تومان`}
                  />
                </div>
              </section>
            ) : null}

            {receipt ? (
              <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
                <SectionTitle
                  icon={PackageCheck}
                  eyebrow="Receipt Items"
                  title="انتخاب اقلام قابل مرجوعی از فاکتور کیان"
                />

                <div className="mt-4 grid gap-3">
                  {receipt.receiptsDetail.map((item) => {
                    const uid = getReceiptItemUid(item);
                    const selectedQuantity = quantities[uid] ?? 0;
                    const availableQuantity = getAvailableReturnQuantity(item);
                    const isSelected = selectedQuantity > 0;
                    const isDisabled = availableQuantity <= 0;

                    return (
                      <article
                        key={uid}
                        className={[
                          "flex flex-col gap-3 rounded-[1.6rem] p-3 transition sm:flex-row sm:items-center",
                          isSelected
                            ? "bg-rose-500/[0.075] dark:bg-rose-400/[0.08]"
                            : "bg-white/45 dark:bg-white/[0.04]",
                          isDisabled ? "opacity-60" : "",
                        ].join(" ")}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black text-foreground">
                            {item.itemName}
                          </p>

                          <p className="mt-1 text-xs font-bold text-muted-foreground">
                            line {item.lineNumber} · itemId {item.itemId} · کد{" "}
                            {item.productCode ?? "-"} · {item.color ?? "-"} ·{" "}
                            {item.size ?? "-"}
                          </p>

                          <p
                            dir="ltr"
                            className="mt-1 text-left text-[11px] font-bold text-muted-foreground"
                          >
                            {item.itemBarcode}
                          </p>

                          <div className="mt-3 grid gap-2 sm:grid-cols-4">
                            <SmallMeta
                              label="خرید"
                              value={String(item.saleQTY)}
                            />
                            <SmallMeta
                              label="مرجوع‌شده"
                              value={String(item.returnQTY)}
                            />
                            <SmallMeta
                              label="قابل مرجوعی"
                              value={String(availableQuantity)}
                            />
                            <SmallMeta
                              label="مبلغ فروش"
                              value={Number(item.saleAmount ?? 0).toLocaleString(
                                "fa-IR"
                              )}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 rounded-[1.3rem] bg-white/55 p-2 dark:bg-white/[0.05] sm:w-[180px]">
                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() =>
                              updateQuantity(uid, selectedQuantity - 1)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/70 text-foreground transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/[0.06]"
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          <div className="text-center">
                            <p className="text-[10px] font-black text-muted-foreground">
                              تعداد مرجوعی
                            </p>

                            <p className="text-sm font-black text-foreground">
                              {selectedQuantity.toLocaleString("fa-IR")}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() =>
                              updateQuantity(uid, selectedQuantity + 1)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-700 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 dark:text-rose-300"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ) : null}

            <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
              <SectionTitle
                icon={ClipboardCheck}
                eyebrow="Internal Dashboard Data"
                title="اطلاعات داخلی مرجوعی"
              />

              <div className="mt-4 grid gap-4">
                <div>
                  <label className="text-xs font-black text-muted-foreground">
                    دلیل مرجوعی
                  </label>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {quickReasons.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setReason(item)}
                        className={[
                          "rounded-full px-3 py-1.5 text-xs font-black transition",
                          reason === item
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                            : "bg-white/55 text-muted-foreground hover:bg-white/70 dark:bg-white/[0.05]",
                        ].join(" ")}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={4}
                    placeholder="مثلاً: مشتری به دلیل مغایرت سایز درخواست مرجوعی داده است."
                    className="mt-3 min-h-28 w-full resize-none rounded-[1.5rem] bg-white/55 px-4 py-3 text-sm font-bold text-foreground outline-none ring-0 placeholder:text-muted-foreground/70 focus:bg-white/70 dark:bg-white/[0.05] dark:focus:bg-white/[0.07]"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <KiyanReturnInput
                    label="مبلغ مرجوعی داخلی"
                    value={returnedAmount}
                    onChange={setReturnedAmount}
                    placeholder="مثلاً 1250000"
                    inputMode="numeric"
                    dir="ltr"
                  />

                  <KiyanReturnInput
                    label="بارکد فاکتور مرجوعی دستی"
                    value={manualReturnReceiptBarcode}
                    onChange={setManualReturnReceiptBarcode}
                    placeholder="KY-RETURN-..."
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-muted-foreground">
                    توضیحات داخلی
                  </label>

                  <textarea
                    value={internalDescription}
                    onChange={(event) =>
                      setInternalDescription(event.target.value)
                    }
                    rows={3}
                    placeholder="این توضیح داخل داشبورد خودمان نگه‌داری می‌شود و به کیان ارسال نمی‌شود."
                    className="mt-2 min-h-24 w-full resize-none rounded-[1.5rem] bg-white/55 px-4 py-3 text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground/70 focus:bg-white/70 dark:bg-white/[0.05] dark:focus:bg-white/[0.07]"
                  />
                </div>

                {hasReturnedAmount && !isAmountValid ? (
                  <p className="rounded-[1.2rem] bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-700 dark:text-rose-300">
                    مبلغ وارد شده معتبر نیست.
                  </p>
                ) : null}
              </div>
            </section>

            <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
              <SectionTitle
                icon={FileJson}
                eyebrow="Real Kiyan Payload Preview"
                title="پیش‌نمایش payload واقعی مرجوعی کیان"
              />

              <pre
                dir="ltr"
                className="mt-4 max-h-[460px] overflow-auto rounded-[1.5rem] bg-slate-950/95 p-4 text-left text-xs leading-6 text-slate-100"
              >
                {payload
                  ? JSON.stringify(payload, null, 2)
                  : JSON.stringify(
                      {
                        message:
                          "برای ساخت payload واقعی، فاکتور کیان را دریافت کن، operatorId معتبر وارد کن و حداقل یک قلم را انتخاب کن.",
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
                خلاصه سفارش سایت
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
                  label="مبلغ سفارش"
                  value={`${order.payableAmount.toLocaleString(
                    "fa-IR"
                  )} تومان`}
                />
                <InfoRow
                  label="کیان فروش"
                  value={order.kiyanInvoice.code || "ثبت نشده"}
                />
              </div>
            </section>

            <section className="rounded-[2rem] bg-rose-500/[0.065] p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-rose-400/[0.08]">
              <h2 className="text-base font-black text-foreground">
                خلاصه مرجوعی
              </h2>

              <div className="mt-4 grid gap-2">
                <InfoRow
                  label="تعداد اقلام"
                  value={`${selectedReceiptItems.length.toLocaleString(
                    "fa-IR"
                  )} ردیف`}
                />

                <InfoRow
                  label="مجموع تعداد"
                  value={`${selectedProductsCount.toLocaleString(
                    "fa-IR"
                  )} عدد`}
                />

                <InfoRow
                  label="مبلغ داخلی"
                  value={
                    isAmountValid
                      ? `${parsedReturnedAmount.toLocaleString(
                          "fa-IR"
                        )} تومان`
                      : "ثبت نشده"
                  }
                />

                <InfoRow
                  label="نوع ثبت"
                  value={
                    manualReturnReceiptBarcode.trim()
                      ? "بارکد دستی/موجود"
                      : "mock کیان"
                  }
                />
              </div>
            </section>

            <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
              <h2 className="text-base font-black text-foreground">
                آمادگی عملیات
              </h2>

              <div className="mt-4 grid gap-2">
                <ReadyLine
                  active={Boolean(receipt)}
                  label="دریافت فاکتور کیان"
                />
                <ReadyLine
                  active={isOperatorValid}
                  label="operatorId معتبر"
                />
                <ReadyLine
                  active={selectedReceiptItems.length > 0}
                  label="انتخاب آیتم کیان"
                />
                <ReadyLine
                  active={reason.trim().length >= 3}
                  label="دلیل داخلی"
                />
                <ReadyLine active={isAmountValid} label="مبلغ داخلی" />
                <ReadyLine active={Boolean(payload)} label="payload واقعی" />
              </div>
            </section>

            {submitError ? (
              <p className="rounded-[1.5rem] bg-rose-500/10 px-4 py-3 text-xs font-black text-rose-700 dark:text-rose-300">
                {submitError}
              </p>
            ) : null}

            <button
              type="button"
              disabled={!canSendKiyan}
              onClick={handleMockKiyanSend}
              className={[
                "flex w-full items-center justify-center gap-2 rounded-[1.6rem] px-4 py-3 text-sm font-black transition",
                canSendKiyan
                  ? "bg-rose-600 text-white shadow-[0_14px_32px_rgba(225,29,72,0.20)] hover:-translate-y-0.5"
                  : "cursor-not-allowed bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {requestState === "sending" ? (
                <>
                  <Send className="h-4 w-4 animate-pulse" />
                  در حال ارسال mock کیان...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  ارسال mock مرجوعی به کیان
                </>
              )}
            </button>

            <button
              type="button"
              disabled={!canSaveLocal}
              onClick={handleSaveLocal}
              className={[
                "flex w-full items-center justify-center gap-2 rounded-[1.6rem] px-4 py-3 text-sm font-black transition",
                canSaveLocal
                  ? "bg-white/65 text-foreground hover:-translate-y-0.5 dark:bg-white/[0.06]"
                  : "cursor-not-allowed bg-muted text-muted-foreground",
              ].join(" ")}
            >
              <Save className="h-4 w-4" />
              ثبت موقت داخلی بدون ارسال کیان
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
                        label="بارکد مرجوعی"
                        value={mockResponse.returnReceiptBarcode}
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

function buildRealKiyanReturnPayload(
  receipt: KiyanReceiptResponse,
  fields: {
    operatorId: number;
    selectedItems: {
      uid: string;
      item: KiyanReceiptDetail;
      quantity: number;
    }[];
  }
): KiyanReturnPayload {
  const mergedReturnInfo = new Map<number, number>();

  fields.selectedItems.forEach((selected) => {
    const itemId = Number(selected.item.itemId);
    const quantity = Number(selected.quantity);

    mergedReturnInfo.set(itemId, (mergedReturnInfo.get(itemId) ?? 0) + quantity);
  });

  return normalizeKiyanReturnPayload({
    operatorId: fields.operatorId,
    retailstoreId: receipt.receiptHeader.retailStoreID,
    workstationId: receipt.receiptHeader.workstaionID,
    transactionSequence: receipt.receiptHeader.transactionSeqNo,
    businessDayDate: receipt.receiptHeader.transactionDate,
    returnInfo: Array.from(mergedReturnInfo.entries()).map(
      ([itemId, quantity]) => ({
        itemId,
        quantity,
      })
    ),
  });
}

function normalizeKiyanReturnPayload(payload: KiyanReturnPayload) {
  return {
    operatorId: Number(payload.operatorId),
    retailstoreId: Number(payload.retailstoreId),
    workstationId: Number(payload.workstationId),
    transactionSequence: Number(payload.transactionSequence),
    businessDayDate: String(payload.businessDayDate),
    returnInfo: payload.returnInfo.map((item) => ({
      itemId: Number(item.itemId),
      quantity: Number(item.quantity),
    })),
  };
}

function buildMockKiyanReceipt(
  order: SalesOrder,
  receiptBarcode: string
): KiyanReceiptResponse {
  const totalQuantity = order.products.reduce(
    (total, product) => total + product.quantity,
    0
  );

  const safeTotalQuantity = Math.max(1, totalQuantity);
  const amountPerUnit = Math.round(order.payableAmount / safeTotalQuantity);

  return {
    receiptHeader: {
      retailStoreID: 1,
      workstaionID: 1,
      transactionSeqNo: Number(String(order.id).replace(/\D/g, "")) || order.id,
      transactionDate: order.createdAt,
      totalPaymentAmount: order.paidAmount,
      totalSaleAmount: order.totalAmount,
      totalDiscountAmount: Math.max(order.totalAmount - order.payableAmount, 0),
      totalGrossAmount: order.totalAmount,
      totalTaxAmount: 0,
    },
    receiptsDetail: order.products.map((product, index) => {
      const alreadyReturnedQuantity =
        order.returnInfo?.returnedItems?.find(
          (item) => item.productId === product.id
        )?.quantity ?? 0;

      return {
        lineNumber: index + 1,
        itemId: makeMockKiyanItemId(order.id, index),
        itemName: product.title,
        itemBarcode: product.barcode,
        saleQTY: product.quantity,
        returnQTY: alreadyReturnedQuantity,
        saleAmount: amountPerUnit * product.quantity,
        taxAmount: 0,
        sourceProductId: product.id,
        productCode: product.productCode,
        color: product.color,
        size: product.size,
      };
    }),
  };
}

function buildInitialQuantitiesFromExistingReturn(
  order: SalesOrder,
  receipt: KiyanReceiptResponse
): SelectedReceiptQuantities {
  const initialQuantities: SelectedReceiptQuantities = {};

  if (!order.returnInfo?.returnedItems?.length) return initialQuantities;

  receipt.receiptsDetail.forEach((item) => {
    const productId = resolveOrderProductId(order, item);
    const existingReturnItem = order.returnInfo?.returnedItems?.find(
      (returnItem) => returnItem.productId === productId
    );

    if (!existingReturnItem) return;

    const available = getAvailableReturnQuantity(item);
    const quantity = Math.min(existingReturnItem.quantity, available);

    if (quantity > 0) {
      initialQuantities[getReceiptItemUid(item)] = quantity;
    }
  });

  return initialQuantities;
}

function makeMockKiyanItemId(orderId: number, index: number) {
  return Number(`${orderId}${String(index + 1).padStart(2, "0")}`);
}

function getReceiptItemUid(item: KiyanReceiptDetail) {
  return `${item.lineNumber}-${item.itemId}-${item.itemBarcode}`;
}

function getAvailableReturnQuantity(item: KiyanReceiptDetail) {
  return Math.max(0, Number(item.saleQTY || 0) - Number(item.returnQTY || 0));
}

function resolveOrderProductId(order: SalesOrder, item: KiyanReceiptDetail) {
  if (item.sourceProductId) return item.sourceProductId;

  const product = order.products.find(
    (orderProduct) =>
      orderProduct.barcode === item.itemBarcode ||
      orderProduct.productCode === item.productCode
  );

  return product?.id;
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
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-700 dark:text-rose-300">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="text-xs font-black text-rose-700 dark:text-rose-300">
          {eyebrow}
        </p>

        <h2 className="text-lg font-black text-foreground">{title}</h2>
      </div>
    </div>
  );
}

function KiyanReturnInput({
  label,
  value,
  onChange,
  placeholder,
  dir = "rtl",
  type = "text",
  inputMode = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  dir?: "rtl" | "ltr";
  type?: "text" | "date";
  inputMode?: "text" | "numeric";
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

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.3rem] bg-white/45 p-3 dark:bg-white/[0.04]">
      <p className="text-[11px] font-black text-muted-foreground">{label}</p>

      <p className="mt-2 truncate text-xs font-black text-foreground">
        {value}
      </p>
    </div>
  );
}

function SmallMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] bg-white/55 px-3 py-2 dark:bg-white/[0.05]">
      <p className="text-[10px] font-black text-muted-foreground">{label}</p>

      <p className="mt-1 truncate text-xs font-black text-foreground">
        {value}
      </p>
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

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("fa-IR");
}