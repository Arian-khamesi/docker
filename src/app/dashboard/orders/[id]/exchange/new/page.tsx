"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeDollarSign,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileJson,
  Minus,
  PackageCheck,
  Plus,
  ReceiptText,
  Repeat2,
  Save,
  Send,
  Trash2,
} from "lucide-react";

import { getSalesOrderDetailPath } from "@/components/sales/orders/sales-orders.constants";
import { getGatewayLabel, getStatusLabel } from "@/lib/orders/order-labels";
import { useSalesOrdersStore } from "@/store/sales-orders.store";
import type {
  SalesOrder,
  SalesOrderExchangeDirection,
  SalesOrderProduct,
} from "@/types/sales-order";

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

interface ReplacementProductDraft {
  id: string;
  title: string;
  productCode: string;
  barcode: string;
  color: string;
  size: string;
  quantity: string;
  kiyanItemId: string;
  price: string;
  priceWithDiscount: string;
}

interface KiyanPaymentDraft {
  id: string;
  tenderId: string;
  amount: string;
  serialNumber: string;
  confirmed: boolean;
  label?: string;
}

interface MockExchangeResponse {
  success: boolean;
  returnReceiptBarcode: string;
  replacementSaleReceiptBarcode: string;
  message: string;
  createdAt: string;
  rawResponse: {
    returnReceiptBarcode: string;
    replacementSaleReceiptBarcode: string;
  };
}

const KIYAN_GATEWAYS = [
  { id: "1", title: "نقد" },
  { id: "621", title: "سامان" },
  { id: "1247", title: "مدیسه" },
  { id: "1015", title: "اسنپ" },
  { id: "399", title: "اعتبار" },
];

const quickReasons = [
  "تعویض سایز",
  "تعویض رنگ",
  "ایراد کالا",
  "درخواست مشتری",
  "اصلاح سفارش",
];

export default function CreateOrderExchangePage() {
  const params = useParams<{ id: string }>();

  const {
    orders,
    registerExchangeInfo,
    registerExchangeKiyanBarcode,
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
  const [returnQuantities, setReturnQuantities] =
    useState<SelectedReceiptQuantities>({});

  const [exchangeReason, setExchangeReason] = useState("");
  const [returnedAmount, setReturnedAmount] = useState("");
  const [replacementAmount, setReplacementAmount] = useState("");
  const [replacementOrderId, setReplacementOrderId] = useState("");
  const [replacementOrderNumber, setReplacementOrderNumber] = useState("");
  const [kiyanCustomerId, setKiyanCustomerId] = useState("");
  const [manualExchangeKiyanBarcode, setManualExchangeKiyanBarcode] =
    useState("");

  const [replacementDrafts, setReplacementDrafts] = useState<
    ReplacementProductDraft[]
  >([]);

  const [paymentDrafts, setPaymentDrafts] = useState<KiyanPaymentDraft[]>([]);
  const [newTenderId, setNewTenderId] = useState("621");
  const [newPaymentAmount, setNewPaymentAmount] = useState("");

  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [mockResponse, setMockResponse] =
    useState<MockExchangeResponse | null>(null);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!order || hydratedOrderId === String(order.id)) return;

    setSourceReceiptBarcode(order.kiyanInvoice.code ?? "");
    setExchangeReason(order.exchangeInfo?.status ? "تعویض سفارش" : "");
    setReturnedAmount(
      order.exchangeInfo?.amountDifference
        ? String(order.exchangeInfo.amountDifference)
        : String(order.payableAmount)
    );
    setReplacementAmount(String(order.payableAmount));
    setReplacementOrderId(
      order.exchangeInfo?.replacementOrderId
        ? String(order.exchangeInfo.replacementOrderId)
        : ""
    );
    setReplacementOrderNumber(
      order.exchangeInfo?.replacementOrderNumber ?? `EX-${order.id}`
    );
    setKiyanCustomerId(buildMockKiyanCustomerId(order));
    setManualExchangeKiyanBarcode(
      order.exchangeInfo?.replacementKiyanBarcode ?? ""
    );

    setReplacementDrafts(buildInitialReplacementDrafts(order));
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

  const selectedReceiptItems = useMemo(() => {
    if (!receipt) return [];

    return receipt.receiptsDetail
      .map((item) => {
        const uid = getReceiptItemUid(item);

        return {
          uid,
          item,
          quantity: returnQuantities[uid] ?? 0,
        };
      })
      .filter((item) => item.quantity > 0);
  }, [receipt, returnQuantities]);

  const returnedItemsQuantity = selectedReceiptItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const parsedOperatorId = Number(operatorId);
  const isOperatorValid =
    operatorId.trim().length > 0 &&
    Number.isFinite(parsedOperatorId) &&
    parsedOperatorId > 0;

  const parsedReturnedAmount = parseMoney(returnedAmount);
  const parsedReplacementAmount = parseMoney(replacementAmount);

  const amountDiffRaw = parsedReplacementAmount - parsedReturnedAmount;

  const amountDirection: SalesOrderExchangeDirection =
    amountDiffRaw > 0 ? "up" : amountDiffRaw < 0 ? "down" : "equal";

  const amountDifference = Math.abs(amountDiffRaw);

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

  const returnPayload = useMemo(() => {
    if (!receipt || !selectedReceiptItems.length || !isOperatorValid) {
      return null;
    }

    return buildRealKiyanReturnPayload(receipt, {
      operatorId: parsedOperatorId,
      selectedItems: selectedReceiptItems,
    });
  }, [isOperatorValid, parsedOperatorId, receipt, selectedReceiptItems]);

  const salePayload = useMemo(() => {
    if (!order) return null;

    return buildReplacementSalePayload(order, {
      kiyanCustomerId,
      replacementOrderNumber,
      replacementDrafts,
      paymentDrafts: confirmedPayments,
    });
  }, [
    confirmedPayments,
    kiyanCustomerId,
    order,
    replacementDrafts,
    replacementOrderNumber,
  ]);

  const canFetchReceipt =
    Boolean(order) &&
    sourceReceiptBarcode.trim().length > 0 &&
    requestState !== "fetching";

  const returnValidationError = useMemo(
    () =>
      validateReturnPart({
        receipt,
        selectedReceiptItems,
        isOperatorValid,
      }),
    [isOperatorValid, receipt, selectedReceiptItems]
  );

  const saleValidationError = useMemo(
    () =>
      validateReplacementSalePart({
        order,
        kiyanCustomerId,
        replacementDrafts,
        paymentDrafts,
        replacementAmount: parsedReplacementAmount,
        confirmedPaymentTotal,
      }),
    [
      confirmedPaymentTotal,
      kiyanCustomerId,
      order,
      paymentDrafts,
      parsedReplacementAmount,
      replacementDrafts,
    ]
  );

  const dashboardValidationError = useMemo(() => {
    if (!exchangeReason.trim() || exchangeReason.trim().length < 3) {
      return "دلیل تعویض را کامل‌تر وارد کن.";
    }

    if (parsedReturnedAmount <= 0) {
      return "ارزش کالای برگشتی معتبر نیست.";
    }

    if (parsedReplacementAmount <= 0) {
      return "مبلغ سفارش جایگزین معتبر نیست.";
    }

    return "";
  }, [exchangeReason, parsedReplacementAmount, parsedReturnedAmount]);

  const finalValidationError =
    returnValidationError || saleValidationError || dashboardValidationError;

  const canSend =
    Boolean(order) &&
    Boolean(returnPayload) &&
    Boolean(salePayload) &&
    !finalValidationError &&
    requestState !== "sending";

  const isSnappOrder = order?.payment.gateway === "snapp_pay";

  function handleFetchMockReceipt() {
    if (!order) return;

    setSubmitError("");
    setMockResponse(null);

    if (!sourceReceiptBarcode.trim()) {
      setSubmitError(
        "برای تعویض، ابتدا بارکد فاکتور فروش کیان سفارش اصلی را وارد کن."
      );
      return;
    }

    setRequestState("fetching");

    window.setTimeout(() => {
      const nextReceipt = buildMockKiyanReceipt(order);
      const initialQuantities = buildInitialQuantitiesFromExistingExchange(
        order,
        nextReceipt
      );

      setReceipt(nextReceipt);
      setReturnQuantities(initialQuantities);
      setRequestState("idle");
    }, 450);
  }

  function updateReturnQuantity(uid: string, nextQuantity: number) {
    if (!receipt) return;

    const item = receipt.receiptsDetail.find(
      (receiptItem) => getReceiptItemUid(receiptItem) === uid
    );

    if (!item) return;

    const maxQuantity = getAvailableReturnQuantity(item);
    const safeQuantity = Math.max(0, Math.min(maxQuantity, nextQuantity));

    setReturnQuantities((current) => {
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

  function updateReplacementDraft(
    id: string,
    field: keyof Omit<ReplacementProductDraft, "id">,
    value: string
  ) {
    setReplacementDrafts((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function addReplacementDraft() {
    setReplacementDrafts((current) => [
      ...current,
      createEmptyReplacementDraft(),
    ]);
  }

  function removeReplacementDraft(id: string) {
    setReplacementDrafts((current) =>
      current.length <= 1 ? current : current.filter((item) => item.id !== id)
    );
  }

  function addPaymentRow() {
    const amount = parseMoney(newPaymentAmount);

    if (!newTenderId || amount <= 0) {
      setSubmitError("درگاه و مبلغ پرداخت جایگزین را درست وارد کن.");
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
        payment.id === id
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

  function syncSinglePaymentWithReplacementAmount() {
    setPaymentDrafts([
      {
        id: createDraftId(),
        tenderId: resolveKiyanTenderId(order),
        amount: String(parsedReplacementAmount || 0),
        serialNumber: "",
        confirmed: true,
        label: getGatewayLabel(order.payment.gateway),
      },
    ]);
  }

  function buildInternalReturnedItems() {
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

  function buildReplacementProducts(): SalesOrderProduct[] {
    return replacementDrafts
      .map((draft) => {
        const quantity = Number(draft.quantity);
        const title = draft.title.trim();
        const barcode = draft.barcode.trim();
        const productCode = draft.productCode.trim();

        if (!title || !barcode || !productCode || quantity <= 0) return null;

        return {
          id: draft.id,
          title,
          productCode,
          barcode,
          color: draft.color.trim() || undefined,
          size: draft.size.trim() || undefined,
          quantity,
        };
      })
      .filter((item): item is SalesOrderProduct => Boolean(item));
  }

  async function handleMockExchangeSubmit() {
    if (!order) return;

    setSubmitError(finalValidationError);

    if (finalValidationError || !returnPayload || !salePayload) return;

    setRequestState("sending");
    setMockResponse(null);

    await new Promise((resolve) => setTimeout(resolve, 950));

    const returnReceiptBarcode = `KY-EX-RETURN-${order.id}-${Date.now()
      .toString()
      .slice(-6)}`;

    const replacementSaleReceiptBarcode =
      manualExchangeKiyanBarcode.trim() ||
      `KY-EX-SALE-${order.id}-${Date.now().toString().slice(-6)}`;

    const response: MockExchangeResponse = {
      success: true,
      returnReceiptBarcode,
      replacementSaleReceiptBarcode,
      message: isSnappOrder
        ? "تعویض در کیان ثبت شد و برای سفارش اسنپ، وضعیت sync نیاز به پیگیری دارد."
        : "تعویض با موفقیت در کیان ثبت شد.",
      createdAt: new Date().toISOString(),
      rawResponse: {
        returnReceiptBarcode,
        replacementSaleReceiptBarcode,
      },
    };

    const returnedItems = buildInternalReturnedItems();
    const replacementProducts = buildReplacementProducts();

 registerExchangeInfo(order.id, {
  status: isSnappOrder ? "kiyan_exchange_registered" : "completed",
  originalOrderId: order.id,
  replacementOrderId: replacementOrderId.trim()
    ? Number(replacementOrderId)
    : undefined,
  replacementOrderNumber: replacementOrderNumber.trim() || undefined,
  returnKiyanBarcode: response.returnReceiptBarcode,
  replacementKiyanBarcode: response.replacementSaleReceiptBarcode,
  returnedProductIds: returnedItems.map((item) => item.productId),
  returnedItems,
  replacementProducts,
  amountDirection,
  amountDifference,
  createdAt: order.exchangeInfo?.createdAt ?? new Date().toISOString(),
  completedAt: isSnappOrder ? undefined : new Date().toISOString(),
});

registerExchangeKiyanBarcode(
  order.id,
  response.replacementSaleReceiptBarcode,
  response.returnReceiptBarcode
);

    registerExchangeKiyanBarcode(
      order.id,
      response.replacementSaleReceiptBarcode
    );

    markOrderNeedsFollowUp(
      order.id,
      isSnappOrder,
      isSnappOrder
        ? "تعویض کیان ثبت شد؛ sync اسنپ باید بررسی شود."
        : "تعویض کیان با موفقیت تکمیل شد."
    );

    setManualExchangeKiyanBarcode(response.replacementSaleReceiptBarcode);
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
            برای ثبت تعویض، ابتدا باید سفارش معتبر انتخاب شود.
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
          <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="pointer-events-none absolute right-20 top-0 h-px w-72 bg-gradient-to-l from-transparent via-white/70 to-transparent dark:via-white/10" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
                <Repeat2 className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-black text-violet-700 dark:text-violet-300">
                  Exchange Kiyan Workflow
                </p>

                <h1 className="mt-1 text-2xl font-black text-foreground">
                  ثبت تعویض سفارش #{order.id}
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                  در این صفحه، تعویض به دو عملیات جدا تبدیل می‌شود: برگشت کالای
                  قبلی با payload مرجوعی کیان و ثبت کالای جایگزین با payload
                  فروش کیان.
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
                eyebrow="Step 1"
                title="دریافت فاکتور فروش کیان سفارش اصلی"
              />

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_180px]">
                <KiyanInput
                  label="بارکد فاکتور فروش کیان"
                  value={sourceReceiptBarcode}
                  onChange={setSourceReceiptBarcode}
                  placeholder="مثلاً 99T024SWP2FTM5R"
                  dir="ltr"
                />

                <KiyanInput
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
                      ? "bg-violet-600 text-white shadow-[0_14px_32px_rgba(124,58,237,0.18)] hover:-translate-y-0.5"
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
            </section>

            {receipt ? (
              <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
                <SectionTitle
                  icon={ClipboardCheck}
                  eyebrow="Kiyan Receipt"
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
                    label="تاریخ"
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
                  eyebrow="Step 2"
                  title="انتخاب کالاهای برگشتی از فاکتور کیان"
                />

                <div className="mt-4 grid gap-3">
                  {receipt.receiptsDetail.map((item) => {
                    const uid = getReceiptItemUid(item);
                    const selectedQuantity = returnQuantities[uid] ?? 0;
                    const availableQuantity = getAvailableReturnQuantity(item);
                    const isSelected = selectedQuantity > 0;
                    const isDisabled = availableQuantity <= 0;

                    return (
                      <article
                        key={uid}
                        className={[
                          "flex flex-col gap-3 rounded-[1.6rem] p-3 transition sm:flex-row sm:items-center",
                          isSelected
                            ? "bg-violet-500/[0.075] dark:bg-violet-400/[0.08]"
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
                              label="قابل برگشت"
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
                              updateReturnQuantity(uid, selectedQuantity - 1)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/70 text-foreground transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/[0.06]"
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          <div className="text-center">
                            <p className="text-[10px] font-black text-muted-foreground">
                              تعداد برگشتی
                            </p>

                            <p className="text-sm font-black text-foreground">
                              {selectedQuantity.toLocaleString("fa-IR")}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() =>
                              updateReturnQuantity(uid, selectedQuantity + 1)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 dark:text-violet-300"
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
                icon={Repeat2}
                eyebrow="Step 3"
                title="اطلاعات داخلی تعویض"
              />

              <div className="mt-4 grid gap-4">
                <div>
                  <label className="text-xs font-black text-muted-foreground">
                    دلیل تعویض
                  </label>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {quickReasons.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setExchangeReason(item)}
                        className={[
                          "rounded-full px-3 py-1.5 text-xs font-black transition",
                          exchangeReason === item
                            ? "bg-violet-500/10 text-violet-700 dark:text-violet-300"
                            : "bg-white/55 text-muted-foreground hover:bg-white/70 dark:bg-white/[0.05]",
                        ].join(" ")}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={exchangeReason}
                    onChange={(event) => setExchangeReason(event.target.value)}
                    rows={4}
                    placeholder="مثلاً: مشتری درخواست تعویض سایز داده است."
                    className="mt-3 min-h-28 w-full resize-none rounded-[1.5rem] bg-white/55 px-4 py-3 text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground/70 focus:bg-white/70 dark:bg-white/[0.05] dark:focus:bg-white/[0.07]"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <KiyanInput
                    label="ارزش کالاهای برگشتی"
                    value={returnedAmount}
                    onChange={setReturnedAmount}
                    placeholder="مثلاً 1200000"
                    inputMode="numeric"
                    dir="ltr"
                  />

                  <KiyanInput
                    label="مبلغ سفارش جایگزین"
                    value={replacementAmount}
                    onChange={setReplacementAmount}
                    placeholder="مثلاً 1500000"
                    inputMode="numeric"
                    dir="ltr"
                  />

                  <KiyanInput
                    label="شناسه سفارش جایگزین"
                    value={replacementOrderId}
                    onChange={setReplacementOrderId}
                    placeholder="اختیاری"
                    inputMode="numeric"
                    dir="ltr"
                  />

                  <KiyanInput
                    label="شماره سفارش جایگزین"
                    value={replacementOrderNumber}
                    onChange={setReplacementOrderNumber}
                    placeholder="EX-..."
                    dir="ltr"
                  />

                  <KiyanInput
                    label="customerId کیان"
                    value={kiyanCustomerId}
                    onChange={setKiyanCustomerId}
                    placeholder="شناسه مشتری کیان"
                    inputMode="numeric"
                    dir="ltr"
                  />

                  <KiyanInput
                    label="بارکد فروش جایگزین دستی"
                    value={manualExchangeKiyanBarcode}
                    onChange={setManualExchangeKiyanBarcode}
                    placeholder="KY-EX-SALE-..."
                    dir="ltr"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
              <SectionTitle
                icon={BadgeDollarSign}
                eyebrow="Step 4"
                title="کالاهای جایگزین برای فروش کیان"
              />

              <div className="mt-4 grid gap-3">
                {replacementDrafts.map((draft, index) => (
                  <article
                    key={draft.id}
                    className="rounded-[1.6rem] bg-white/45 p-3 dark:bg-white/[0.04]"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-black text-foreground">
                        کالای جایگزین #{index + 1}
                      </p>

                      <button
                        type="button"
                        onClick={() => removeReplacementDraft(draft.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-700 transition hover:-translate-y-0.5 dark:text-rose-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <KiyanInput
                        label="عنوان کالا"
                        value={draft.title}
                        onChange={(value) =>
                          updateReplacementDraft(draft.id, "title", value)
                        }
                        placeholder="مثلاً شلوار جایگزین"
                      />

                      <KiyanInput
                        label="کد محصول"
                        value={draft.productCode}
                        onChange={(value) =>
                          updateReplacementDraft(
                            draft.id,
                            "productCode",
                            value
                          )
                        }
                        placeholder="productCode"
                        dir="ltr"
                      />

                      <KiyanInput
                        label="بارکد"
                        value={draft.barcode}
                        onChange={(value) =>
                          updateReplacementDraft(draft.id, "barcode", value)
                        }
                        placeholder="barcode"
                        dir="ltr"
                      />

                      <KiyanInput
                        label="itemId کیان"
                        value={draft.kiyanItemId}
                        onChange={(value) =>
                          updateReplacementDraft(draft.id, "kiyanItemId", value)
                        }
                        placeholder="itemId"
                        inputMode="numeric"
                        dir="ltr"
                      />

                      <KiyanInput
                        label="تعداد"
                        value={draft.quantity}
                        onChange={(value) =>
                          updateReplacementDraft(draft.id, "quantity", value)
                        }
                        placeholder="1"
                        inputMode="numeric"
                        dir="ltr"
                      />

                      <KiyanInput
                        label="price"
                        value={draft.price}
                        onChange={(value) =>
                          updateReplacementDraft(draft.id, "price", value)
                        }
                        placeholder="price"
                        inputMode="numeric"
                        dir="ltr"
                      />

                      <KiyanInput
                        label="priceWithDiscount"
                        value={draft.priceWithDiscount}
                        onChange={(value) =>
                          updateReplacementDraft(
                            draft.id,
                            "priceWithDiscount",
                            value
                          )
                        }
                        placeholder="priceWithDiscount"
                        inputMode="numeric"
                        dir="ltr"
                      />

                      <KiyanInput
                        label="رنگ"
                        value={draft.color}
                        onChange={(value) =>
                          updateReplacementDraft(draft.id, "color", value)
                        }
                        placeholder="اختیاری"
                      />

                      <KiyanInput
                        label="سایز"
                        value={draft.size}
                        onChange={(value) =>
                          updateReplacementDraft(draft.id, "size", value)
                        }
                        placeholder="اختیاری"
                      />
                    </div>
                  </article>
                ))}

                <button
                  type="button"
                  onClick={addReplacementDraft}
                  className="flex h-12 items-center justify-center gap-2 rounded-[1.5rem] bg-violet-500/10 text-sm font-black text-violet-700 transition hover:-translate-y-0.5 dark:text-violet-300"
                >
                  <Plus className="h-4 w-4" />
                  افزودن کالای جایگزین
                </button>
              </div>
            </section>

            <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
              <SectionTitle
                icon={CreditCard}
                eyebrow="Step 5"
                title="پرداخت سفارش جایگزین"
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
                  inputMode="numeric"
                  dir="ltr"
                />

                <button
                  type="button"
                  onClick={addPaymentRow}
                  className="mt-auto flex h-12 items-center justify-center gap-2 rounded-[1.4rem] bg-violet-600 px-4 text-sm font-black text-white shadow-[0_14px_32px_rgba(124,58,237,0.18)] transition hover:-translate-y-0.5"
                >
                  <Plus className="h-4 w-4" />
                  افزودن
                </button>
              </div>

              <button
                type="button"
                onClick={syncSinglePaymentWithReplacementAmount}
                className="mt-3 flex h-11 items-center justify-center rounded-[1.4rem] bg-white/65 px-4 text-xs font-black text-foreground transition hover:-translate-y-0.5 dark:bg-white/[0.06]"
              >
                تنظیم پرداخت با مبلغ سفارش جایگزین
              </button>

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
                icon={FileJson}
                eyebrow="Payload Preview"
                title="پیش‌نمایش payloadهای تعویض"
              />

              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-black text-muted-foreground">
                    Payload برگشت کالای قبلی
                  </p>

                  <pre
                    dir="ltr"
                    className="max-h-[460px] overflow-auto rounded-[1.5rem] bg-slate-950/95 p-4 text-left text-xs leading-6 text-slate-100"
                  >
                    {returnPayload
                      ? JSON.stringify(returnPayload, null, 2)
                      : JSON.stringify(
                          {
                            message:
                              "برای ساخت payload برگشت، فاکتور کیان را دریافت و آیتم برگشتی را انتخاب کن.",
                          },
                          null,
                          2
                        )}
                  </pre>
                </div>

                <div>
                  <p className="mb-2 text-xs font-black text-muted-foreground">
                    Payload فروش کالای جایگزین
                  </p>

                  <pre
                    dir="ltr"
                    className="max-h-[460px] overflow-auto rounded-[1.5rem] bg-slate-950/95 p-4 text-left text-xs leading-6 text-slate-100"
                  >
                    {salePayload
                      ? JSON.stringify(salePayload, null, 2)
                      : JSON.stringify(
                          {
                            message:
                              "برای ساخت payload فروش جایگزین، customerId، کالاهای جایگزین و پرداخت‌ها باید کامل باشند.",
                          },
                          null,
                          2
                        )}
                  </pre>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
              <h2 className="text-base font-black text-foreground">
                خلاصه سفارش اصلی
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

            <section className="rounded-[2rem] bg-violet-500/[0.07] p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-violet-400/[0.08]">
              <h2 className="text-base font-black text-foreground">
                خلاصه تعویض
              </h2>

              <div className="mt-4 grid gap-2">
                <InfoRow
                  label="تعداد آیتم برگشتی"
                  value={`${selectedReceiptItems.length.toLocaleString(
                    "fa-IR"
                  )} ردیف`}
                />
                <InfoRow
                  label="مجموع تعداد برگشتی"
                  value={`${returnedItemsQuantity.toLocaleString(
                    "fa-IR"
                  )} عدد`}
                />
                <InfoRow
                  label="ارزش برگشتی"
                  value={`${parsedReturnedAmount.toLocaleString(
                    "fa-IR"
                  )} تومان`}
                />
                <InfoRow
                  label="مبلغ جایگزین"
                  value={`${parsedReplacementAmount.toLocaleString(
                    "fa-IR"
                  )} تومان`}
                />
                <InfoRow
                  label="اختلاف"
                  value={`${amountDifference.toLocaleString("fa-IR")} تومان`}
                />
                <InfoRow
                  label="جهت اختلاف"
                  value={getAmountDirectionLabel(amountDirection)}
                />
              </div>
            </section>

            <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
              <h2 className="text-base font-black text-foreground">
                کنترل پرداخت جایگزین
              </h2>

              <div className="mt-4 grid gap-2">
                <InfoRow
                  label="مبلغ هدف"
                  value={`${parsedReplacementAmount.toLocaleString(
                    "fa-IR"
                  )} تومان`}
                />
                <InfoRow
                  label="جمع پرداخت تاییدشده"
                  value={`${confirmedPaymentTotal.toLocaleString(
                    "fa-IR"
                  )} تومان`}
                />
                <InfoRow
                  label="اختلاف پرداخت"
                  value={`${(
                    parsedReplacementAmount - confirmedPaymentTotal
                  ).toLocaleString("fa-IR")} تومان`}
                />
              </div>
            </section>

            {isSnappOrder ? (
              <section className="rounded-[2rem] bg-sky-500/[0.08] p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-sky-400/[0.08]">
                <h2 className="text-base font-black text-foreground">
                  وضعیت اسنپ
                </h2>

                <p className="mt-3 text-xs font-bold leading-6 text-muted-foreground">
                  این سفارش با SnappPay پرداخت شده. بعد از ثبت تعویض در کیان،
                  سفارش به عنوان نیازمند sync اسنپ علامت می‌خورد تا مبلغ و
                  کالاهای جایگزین در پنل اسنپ هم بررسی شوند.
                </p>
              </section>
            ) : null}

            <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
              <h2 className="text-base font-black text-foreground">
                آمادگی عملیات
              </h2>

              <div className="mt-4 grid gap-2">
                <ReadyLine active={Boolean(receipt)} label="فاکتور کیان" />
                <ReadyLine
                  active={selectedReceiptItems.length > 0}
                  label="آیتم برگشتی"
                />
                <ReadyLine
                  active={Boolean(returnPayload)}
                  label="payload برگشت"
                />
                <ReadyLine
                  active={replacementDrafts.length > 0}
                  label="کالای جایگزین"
                />
                <ReadyLine
                  active={Boolean(salePayload)}
                  label="payload فروش"
                />
                <ReadyLine
                  active={confirmedPaymentTotal === parsedReplacementAmount}
                  label="تراز پرداخت"
                />
                <ReadyLine active={!finalValidationError} label="آماده ارسال" />
              </div>
            </section>

            {submitError || finalValidationError ? (
              <p className="rounded-[1.5rem] bg-rose-500/10 px-4 py-3 text-xs font-black leading-6 text-rose-700 dark:text-rose-300">
                {submitError || finalValidationError}
              </p>
            ) : null}

            <button
              type="button"
              disabled={!canSend}
              onClick={handleMockExchangeSubmit}
              className={[
                "flex w-full items-center justify-center gap-2 rounded-[1.6rem] px-4 py-3 text-sm font-black transition",
                canSend
                  ? "bg-violet-600 text-white shadow-[0_14px_32px_rgba(124,58,237,0.20)] hover:-translate-y-0.5"
                  : "cursor-not-allowed bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {requestState === "sending" ? (
                <>
                  <Send className="h-4 w-4 animate-pulse" />
                  در حال ثبت mock تعویض...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  ثبت mock تعویض در کیان
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
                        label="بارکد برگشت"
                        value={mockResponse.returnReceiptBarcode}
                      />
                      <InfoRow
                        label="بارکد فروش جایگزین"
                        value={mockResponse.replacementSaleReceiptBarcode}
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
  const readonly = payment.confirmed;

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
            {KIYAN_GATEWAYS.map((gateway) => (
              <option key={gateway.id} value={gateway.id}>
                {gateway.title}
              </option>
            ))}
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
          placeholder="اختیاری"
          dir="ltr"
          disabled={readonly}
        />

        <div className="flex gap-2">
          {payment.confirmed ? (
            <button
              type="button"
              onClick={() => onEdit(payment.id)}
              className="flex h-11 items-center justify-center rounded-2xl bg-white/65 px-3 text-xs font-black text-foreground transition hover:-translate-y-0.5 dark:bg-white/[0.06]"
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
          {payment.label || getTenderTitle(payment.tenderId)}
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

        <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-black text-violet-700 dark:text-violet-300">
          payload: {(parseMoney(payment.amount) * 10).toLocaleString("fa-IR")}{" "}
          ریال
        </span>
      </div>
    </article>
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

  return {
    operatorId: Number(fields.operatorId),
    retailstoreId: Number(receipt.receiptHeader.retailStoreID),
    workstationId: Number(receipt.receiptHeader.workstaionID),
    transactionSequence: Number(receipt.receiptHeader.transactionSeqNo),
    businessDayDate: String(receipt.receiptHeader.transactionDate),
    returnInfo: Array.from(mergedReturnInfo.entries()).map(
      ([itemId, quantity]) => ({
        itemId: Number(itemId),
        quantity: Number(quantity),
      })
    ),
  };
}

function buildReplacementSalePayload(
  order: SalesOrder,
  fields: {
    kiyanCustomerId: string;
    replacementOrderNumber: string;
    replacementDrafts: ReplacementProductDraft[];
    paymentDrafts: KiyanPaymentDraft[];
  }
): KiyanSalePayload {
  return {
    uniqueInfo: `${order.id}-EX-${fields.replacementOrderNumber || "draft"}-${
      fields.kiyanCustomerId
    }`,
    customerId: fields.kiyanCustomerId.trim(),
    saleTransactionItemInformation: fields.replacementDrafts.map((item) => ({
      itemId: Number(item.kiyanItemId),
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

function validateReturnPart({
  receipt,
  selectedReceiptItems,
  isOperatorValid,
}: {
  receipt: KiyanReceiptResponse | null;
  selectedReceiptItems: {
    uid: string;
    item: KiyanReceiptDetail;
    quantity: number;
  }[];
  isOperatorValid: boolean;
}) {
  if (!receipt) return "ابتدا فاکتور فروش کیان سفارش اصلی را دریافت کن.";

  if (!isOperatorValid) return "operatorId معتبر نیست.";

  if (!selectedReceiptItems.length) {
    return "حداقل یک آیتم برگشتی از فاکتور کیان انتخاب کن.";
  }

  for (const selected of selectedReceiptItems) {
    const available = getAvailableReturnQuantity(selected.item);

    if (selected.quantity <= 0) {
      return `تعداد برگشتی ${selected.item.itemName} معتبر نیست.`;
    }

    if (selected.quantity > available) {
      return `تعداد برگشتی ${selected.item.itemName} بیشتر از مقدار قابل برگشت است.`;
    }
  }

  return "";
}

function validateReplacementSalePart({
  order,
  kiyanCustomerId,
  replacementDrafts,
  paymentDrafts,
  replacementAmount,
  confirmedPaymentTotal,
}: {
  order: SalesOrder | undefined;
  kiyanCustomerId: string;
  replacementDrafts: ReplacementProductDraft[];
  paymentDrafts: KiyanPaymentDraft[];
  replacementAmount: number;
  confirmedPaymentTotal: number;
}) {
  if (!order) return "سفارش معتبر نیست.";

  if (!kiyanCustomerId.trim() || Number(kiyanCustomerId) <= 0) {
    return "customerId کیان معتبر نیست.";
  }

  if (!replacementDrafts.length) {
    return "حداقل یک کالای جایگزین وارد کن.";
  }

  for (const item of replacementDrafts) {
    if (!item.title.trim()) return "عنوان یکی از کالاهای جایگزین خالی است.";

    if (!item.productCode.trim()) {
      return "کد محصول یکی از کالاهای جایگزین خالی است.";
    }

    if (!item.barcode.trim()) {
      return "بارکد یکی از کالاهای جایگزین خالی است.";
    }

    if (Number(item.kiyanItemId) <= 0) {
      return "itemId کیان یکی از کالاهای جایگزین معتبر نیست.";
    }

    if (Number(item.quantity) <= 0) {
      return "تعداد یکی از کالاهای جایگزین معتبر نیست.";
    }

    if (parseMoney(item.price) <= 0) {
      return "price یکی از کالاهای جایگزین معتبر نیست.";
    }

    if (parseMoney(item.priceWithDiscount) < 0) {
      return "priceWithDiscount یکی از کالاهای جایگزین معتبر نیست.";
    }
  }

  const confirmedRows = paymentDrafts.filter((payment) => payment.confirmed);

  if (!confirmedRows.length) {
    return "هیچ پرداخت تاییدشده‌ای برای سفارش جایگزین وجود ندارد.";
  }

  if (paymentDrafts.some((payment) => !payment.confirmed)) {
    return "یک یا چند ردیف پرداخت هنوز تایید نشده‌اند.";
  }

  for (const payment of confirmedRows) {
    if (!payment.tenderId) return "tenderId یکی از پرداخت‌ها معتبر نیست.";

    if (parseMoney(payment.amount) <= 0) {
      return "مبلغ یکی از پرداخت‌های جایگزین معتبر نیست.";
    }
  }

  if (replacementAmount - confirmedPaymentTotal !== 0) {
    return "جمع پرداخت‌های تاییدشده باید با مبلغ سفارش جایگزین برابر باشد.";
  }

  return "";
}

function buildMockKiyanReceipt(order: SalesOrder): KiyanReceiptResponse {
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
        order.exchangeInfo?.returnedItems?.find(
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

function buildInitialQuantitiesFromExistingExchange(
  order: SalesOrder,
  receipt: KiyanReceiptResponse
): SelectedReceiptQuantities {
  const initialQuantities: SelectedReceiptQuantities = {};

  if (!order.exchangeInfo?.returnedItems?.length) return initialQuantities;

  receipt.receiptsDetail.forEach((item) => {
    const productId = resolveOrderProductId(order, item);
    const existingReturnItem = order.exchangeInfo?.returnedItems?.find(
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

function buildInitialReplacementDrafts(order: SalesOrder) {
  if (order.exchangeInfo?.replacementProducts?.length) {
    return order.exchangeInfo.replacementProducts.map((product) =>
      createReplacementDraftFromProduct(product)
    );
  }

  return [createReplacementDraftFromProduct(order.products[0])];
}

function createReplacementDraftFromProduct(
  product?: SalesOrderProduct
): ReplacementProductDraft {
  const fallbackPrice = product ? resolveProductUnitPrice(product, 0) : 0;
  const priceWithDiscount = product
    ? resolveProductDiscountedPrice(product, fallbackPrice)
    : 0;

  return {
    id: product?.id ? `${product.id}-replacement` : createDraftId(),
    title: product?.title ?? "",
    productCode: product?.productCode ?? "",
    barcode: product?.barcode ?? "",
    color: product?.color ?? "",
    size: product?.size ?? "",
    quantity: product?.quantity ? String(product.quantity) : "1",
    kiyanItemId: product ? String(resolveKiyanItemId(product)) : "",
    price: fallbackPrice ? String(fallbackPrice) : "",
    priceWithDiscount: priceWithDiscount ? String(priceWithDiscount) : "",
  };
}

function createEmptyReplacementDraft(): ReplacementProductDraft {
  return {
    id: createDraftId(),
    title: "",
    productCode: "",
    barcode: "",
    color: "",
    size: "",
    quantity: "1",
    kiyanItemId: "",
    price: "",
    priceWithDiscount: "",
  };
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

function resolveKiyanTenderId(order?: SalesOrder) {
  if (!order) return "1";
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
  return (
    KIYAN_GATEWAYS.find((gateway) => gateway.id === tenderId)?.title ??
    `Tender ${tenderId}`
  );
}

function getAmountDirectionLabel(direction: SalesOrderExchangeDirection) {
  if (direction === "up") return "پرداخت بیشتر";
  if (direction === "down") return "برگشت مبلغ";
  return "برابر";
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
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="text-xs font-black text-violet-700 dark:text-violet-300">
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