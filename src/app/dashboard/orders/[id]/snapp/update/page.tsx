"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  PackagePlus,
  ReceiptText,
  RefreshCw,
  Smartphone,
  Trash2,
} from "lucide-react";

import {
  getSalesOrderDetailPath,
  salesOrdersPageClass,
} from "@/components/sales/orders/sales-orders.constants";
import { getGatewayLabel, getStatusLabel } from "@/lib/orders/order-labels";
import { useSalesOrdersStore } from "@/store/sales-orders.store";
import type { SalesOrder, SalesOrderProduct } from "@/types/sales-order";

interface SnappBasketDraftItem {
  id: string;
  sourceProductId?: string;
  productCode: string;
  snappProductId: string;
  name: string;
  category: string;
  color?: string;
  size?: string;
  count: number;
  unitAmountRial: number;
}

interface SnappUpdatePayload {
  order_id: number | string;
  user_id: number | string;
  payment_token: string;
  all_amount: number;
  currency: "IRR";
  computed_amount: number;
  override_amount: number;
  difference: number;
  parameters: {
    amount: number;
    category: string;
    count: number;
    id: string;
    name: string;
  }[];
  mode: "simulate";
}

export default function SnappUpdateWorkflowPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const orderId = Number(params.id);

  const { orders, updateExternalSyncStatus, markOrderNeedsFollowUp } =
    useSalesOrdersStore();

  const order = useMemo(
    () => orders.find((item) => item.id === orderId),
    [orderId, orders]
  );

  const [basketItems, setBasketItems] = useState<SnappBasketDraftItem[]>(() =>
    order ? buildInitialSnappBasket(order) : []
  );

  const [manualProductCode, setManualProductCode] = useState("");
  const [manualSnappProductId, setManualSnappProductId] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualCategory, setManualCategory] = useState("");
  const [manualColor, setManualColor] = useState("");
  const [manualSize, setManualSize] = useState("");
  const [manualCount, setManualCount] = useState("1");
  const [manualUnitAmountToman, setManualUnitAmountToman] = useState("");

  const [overrideAmountToman, setOverrideAmountToman] = useState(() =>
    order ? String(getOrderPayableAmountToman(order)) : ""
  );

  const [showPayload, setShowPayload] = useState(true);
  const [operatorNote, setOperatorNote] = useState("");
  const [mockResult, setMockResult] = useState<
    | {
        type: "success" | "error";
        title: string;
        message: string;
      }
    | null
  >(null);

  const computedAmountRial = useMemo(
    () =>
      basketItems.reduce(
        (total, item) => total + item.unitAmountRial * item.count,
        0
      ),
    [basketItems]
  );

  const overrideAmountRial = toNumberFromText(overrideAmountToman) * 10;
  const originalAmountRial = order ? getOrderPayableAmountToman(order) * 10 : 0;
  const difference = overrideAmountRial - computedAmountRial;

  const payload = useMemo<SnappUpdatePayload | null>(() => {
    if (!order) return null;

    return {
      order_id: order.id,
      user_id: getOrderUserId(order),
      payment_token: getOrderPaymentToken(order),
      all_amount: overrideAmountRial || computedAmountRial,
      currency: "IRR",
      computed_amount: computedAmountRial,
      override_amount: overrideAmountRial,
      difference,
      parameters: basketItems.map((item) => ({
        amount: item.unitAmountRial,
        category: item.category || "نامشخص",
        count: item.count,
        id: item.snappProductId,
        name: item.name || item.productCode || "محصول",
      })),
      mode: "simulate",
    };
  }, [basketItems, computedAmountRial, difference, order, overrideAmountRial]);

  const validation = useMemo(() => {
    if (!order) return "سفارش پیدا نشد.";

    if (!isSnappOrder(order)) {
      return "این سفارش SnappPay نیست و امکان آپدیت اسنپ برای آن فعال نیست.";
    }

    if (!getOrderPaymentToken(order)) {
      return "payment_token سفارش مشخص نیست.";
    }

    if (!basketItems.length) {
      return "سبد جدید خالی است. حداقل یک محصول باید در سبد باشد.";
    }

    if (!overrideAmountRial || overrideAmountRial <= 0) {
      return "مبلغ نهایی کل را وارد کن.";
    }

    if (overrideAmountRial > originalAmountRial) {
      return "در آپدیت اسنپ، مبلغ جدید نمی‌تواند از مبلغ اولیه سفارش بیشتر باشد.";
    }

    const invalidItem = basketItems.find(
      (item) =>
        !item.snappProductId ||
        !item.name ||
        !item.category ||
        !item.count ||
        !item.unitAmountRial
    );

    if (invalidItem) {
      return "همه آیتم‌های سبد باید شناسه اسنپ، نام، دسته‌بندی، تعداد و مبلغ واحد داشته باشند.";
    }

    return "";
  }, [basketItems, order, originalAmountRial, overrideAmountRial]);

  if (!order) {
    return (
      <main className={salesOrdersPageClass}>
        <section className="rounded-[2rem] bg-white/55 p-8 text-center shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
          <h1 className="text-xl font-black text-foreground">
            سفارش پیدا نشد
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            شماره سفارش معتبر نیست یا در store فعلی وجود ندارد.
          </p>

          <Link
            href="/dashboard/orders/snapp"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-[1.3rem] bg-sky-600 px-5 text-sm font-black text-white"
          >
            بازگشت به سفارش‌های اسنپ
          </Link>
        </section>
      </main>
    );
  }

  function addManualItem() {
    const count = Math.max(1, Number(manualCount || 1));
    const unitAmountRial = toNumberFromText(manualUnitAmountToman) * 10;

    if (!manualProductCode.trim()) return;
    if (!manualName.trim()) return;
    if (!manualCategory.trim()) return;
    if (!unitAmountRial) return;

    const snappProductId =
      manualSnappProductId.trim() ||
      buildSnappProductId({
        productCode: manualProductCode,
        color: manualColor,
        size: manualSize,
      });

    setBasketItems((prev) => [
      ...prev,
      {
        id: `manual-${Date.now()}`,
        productCode: manualProductCode.trim(),
        snappProductId,
        name: manualName.trim(),
        category: manualCategory.trim(),
        color: manualColor.trim() || undefined,
        size: manualSize.trim() || undefined,
        count,
        unitAmountRial,
      },
    ]);

    setManualProductCode("");
    setManualSnappProductId("");
    setManualName("");
    setManualCategory("");
    setManualColor("");
    setManualSize("");
    setManualCount("1");
    setManualUnitAmountToman("");
  }

  function addProductToBasket(product: SalesOrderProduct) {
    const item = createDraftItemFromProduct(product);

    setBasketItems((prev) => [
      ...prev,
      {
        ...item,
        id: `${item.id}-${Date.now()}`,
      },
    ]);
  }

  function updateBasketItem(
    itemId: string,
    patch: Partial<SnappBasketDraftItem>
  ) {
    setBasketItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...patch } : item))
    );
  }

  function removeBasketItem(itemId: string) {
    setBasketItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  function submitMockSync() {
    if (validation || !payload) {
      setMockResult({
        type: "error",
        title: "ارسال انجام نشد",
        message: validation || "payload معتبر نیست.",
      });
      return;
    }

    updateExternalSyncStatus(
      order.id,
      "synced",
      operatorNote.trim() || undefined
    );

    markOrderNeedsFollowUp(
      order.id,
      false,
      "آپدیت SnappPay با موفقیت mock شد."
    );

    setMockResult({
      type: "success",
      title: "آپدیت mock موفق",
      message:
        "payload اسنپ ساخته شد و وضعیت externalSync سفارش به synced تغییر کرد.",
    });
  }

  function markAsManualReview() {
    updateExternalSyncStatus(
      order.id,
      "manual_review",
      operatorNote.trim() || "نیازمند بررسی دستی آپدیت اسنپ."
    );

    markOrderNeedsFollowUp(
      order.id,
      true,
      "آپدیت SnappPay نیازمند بررسی دستی است."
    );

    setMockResult({
      type: "error",
      title: "ثبت بررسی دستی",
      message: "وضعیت سفارش برای بررسی دستی sync اسنپ ذخیره شد.",
    });
  }

  function markAsFailed() {
    updateExternalSyncStatus(
      order.id,
      "failed",
      operatorNote.trim() || "خطای mock در آپدیت SnappPay."
    );

    markOrderNeedsFollowUp(
      order.id,
      true,
      "آپدیت SnappPay با خطا مواجه شد."
    );

    setMockResult({
      type: "error",
      title: "ثبت خطای sync",
      message: "وضعیت externalSync سفارش به failed تغییر کرد.",
    });
  }

  return (
    <main className={salesOrdersPageClass}>
      <section className="relative overflow-hidden rounded-[2.2rem] bg-sky-500/[0.08] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-sky-400/[0.07]">
        <div className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full bg-sky-500/15 blur-3xl" />

        <div className="relative flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
                <Smartphone className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-black text-sky-700 dark:text-sky-300">
                  SnappPay Update Workflow
                </p>

                <h1 className="mt-1 text-2xl font-black text-foreground">
                  آپدیت سفارش اسنپ #{order.id}
                </h1>
              </div>
            </div>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
              این workflow برای ساخت سبد جدید اسنپ، کنترل مبلغ نهایی، مشاهده
              payload و ثبت وضعیت sync استفاده می‌شود.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={getSalesOrderDetailPath(order.id)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[1.3rem] bg-white/65 px-4 text-xs font-black text-foreground transition hover:-translate-y-0.5 dark:bg-white/[0.06]"
            >
              جزئیات سفارش
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex h-11 items-center justify-center rounded-[1.3rem] bg-white/45 px-4 text-xs font-black text-muted-foreground transition hover:-translate-y-0.5 dark:bg-white/[0.04]"
            >
              بازگشت
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <div className="grid gap-4">
          <OrderSnapshot order={order} />

          <SuggestedProductsPanel order={order} onAdd={addProductToBasket} />

          <ManualProductPanel
            productCode={manualProductCode}
            setProductCode={setManualProductCode}
            snappProductId={manualSnappProductId}
            setSnappProductId={setManualSnappProductId}
            name={manualName}
            setName={setManualName}
            category={manualCategory}
            setCategory={setManualCategory}
            color={manualColor}
            setColor={setManualColor}
            size={manualSize}
            setSize={setManualSize}
            count={manualCount}
            setCount={setManualCount}
            unitAmountToman={manualUnitAmountToman}
            setUnitAmountToman={setManualUnitAmountToman}
            onAdd={addManualItem}
          />

          <BasketBuilderPanel
            items={basketItems}
            updateItem={updateBasketItem}
            removeItem={removeBasketItem}
            clearItems={() => setBasketItems([])}
          />
        </div>

        <aside className="grid content-start gap-4">
          <AmountControlPanel
            originalAmountRial={originalAmountRial}
            computedAmountRial={computedAmountRial}
            overrideAmountToman={overrideAmountToman}
            setOverrideAmountToman={setOverrideAmountToman}
            difference={difference}
            validation={validation}
          />

          <PayloadPreviewPanel
            payload={payload}
            showPayload={showPayload}
            setShowPayload={setShowPayload}
          />

          <ActionPanel
            validation={validation}
            operatorNote={operatorNote}
            setOperatorNote={setOperatorNote}
            onSubmit={submitMockSync}
            onManualReview={markAsManualReview}
            onFailed={markAsFailed}
          />

          {mockResult ? <ResultPanel result={mockResult} /> : null}
        </aside>
      </section>
    </main>
  );
}

function OrderSnapshot({ order }: { order: SalesOrder }) {
  return (
    <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
          <ReceiptText className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-black text-foreground">
            اطلاعات سفارش
          </h2>

          <p className="mt-2 text-sm font-bold text-muted-foreground">
            {order.customer.fullName} · {order.customer.mobile} ·{" "}
            {order.customer.city}
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <InfoRow label="وضعیت سفارش" value={getStatusLabel(order.status)} />
            <InfoRow label="درگاه" value={getGatewayLabel(order.payment.gateway)} />
            <InfoRow
              label="مبلغ اولیه"
              value={`${getOrderPayableAmountToman(order).toLocaleString(
                "fa-IR"
              )} تومان`}
            />
            <InfoRow
              label="payment token"
              value={getOrderPaymentToken(order)}
              dir="ltr"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function SuggestedProductsPanel({
  order,
  onAdd,
}: {
  order: SalesOrder;
  onAdd: (product: SalesOrderProduct) => void;
}) {
  const suggestedProducts = [
    ...(order.exchangeInfo?.replacementProducts ?? []),
    ...order.products,
  ];

  return (
    <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-foreground">
            محصولات پیشنهادی برای سبد جدید
          </h2>

          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            برای تعویض، محصولات جایگزین در اولویت نمایش داده می‌شوند. برای
            مرجوعی می‌توانی فقط کالاهای باقی‌مانده را در سبد نگه داری.
          </p>
        </div>

        <PackagePlus className="h-5 w-5 text-sky-700 dark:text-sky-300" />
      </div>

      <div className="mt-4 grid gap-2">
        {suggestedProducts.map((product) => (
          <div
            key={`${product.id}-${product.productCode}-${product.color}-${product.size}`}
            className="flex flex-col gap-3 rounded-[1.4rem] bg-white/45 p-3 dark:bg-white/[0.04] md:flex-row md:items-center md:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-foreground">
                {product.title}
              </p>

              <p className="mt-1 text-xs font-bold text-muted-foreground">
                {product.productCode} · {product.color ?? "-"} ·{" "}
                {product.size ?? "-"} · {product.quantity} عدد
              </p>
            </div>

            <button
              type="button"
              onClick={() => onAdd(product)}
              className="h-10 rounded-[1.2rem] bg-sky-600 px-4 text-xs font-black text-white transition hover:-translate-y-0.5"
            >
              افزودن به سبد اسنپ
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function ManualProductPanel({
  productCode,
  setProductCode,
  snappProductId,
  setSnappProductId,
  name,
  setName,
  category,
  setCategory,
  color,
  setColor,
  size,
  setSize,
  count,
  setCount,
  unitAmountToman,
  setUnitAmountToman,
  onAdd,
}: {
  productCode: string;
  setProductCode: (value: string) => void;
  snappProductId: string;
  setSnappProductId: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  color: string;
  setColor: (value: string) => void;
  size: string;
  setSize: (value: string) => void;
  count: string;
  setCount: (value: string) => void;
  unitAmountToman: string;
  setUnitAmountToman: (value: string) => void;
  onAdd: () => void;
}) {
  return (
    <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
      <h2 className="text-lg font-black text-foreground">
        افزودن دستی محصول
      </h2>

      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        وقتی محصول از سفارش یا تعویض در دسترس نیست، می‌توانی آیتم را دستی وارد
        کنی. شناسه اسنپ را اگر دقیق داری وارد کن؛ اگر خالی باشد، موقتاً ساخته
        می‌شود.
      </p>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <SnappInput
          label="کد محصول"
          value={productCode}
          onChange={setProductCode}
          placeholder="02280"
        />

        <SnappInput
          label="شناسه محصول اسنپ"
          value={snappProductId}
          onChange={setSnappProductId}
          placeholder="مثلاً 0413035"
          dir="ltr"
        />

        <SnappInput
          label="نام محصول"
          value={name}
          onChange={setName}
          placeholder="نام کالا"
        />

        <SnappInput
          label="دسته‌بندی"
          value={category}
          onChange={setCategory}
          placeholder="مثلاً پوشاک"
        />

        <SnappInput
          label="رنگ"
          value={color}
          onChange={setColor}
          placeholder="مشکی"
        />

        <SnappInput
          label="سایز"
          value={size}
          onChange={setSize}
          placeholder="L"
        />

        <SnappInput
          label="تعداد"
          value={count}
          onChange={setCount}
          placeholder="1"
          type="number"
          dir="ltr"
        />

        <SnappInput
          label="قیمت واحد نهایی، تومان"
          value={unitAmountToman}
          onChange={setUnitAmountToman}
          placeholder="1,250,000"
          dir="ltr"
        />
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-4 h-11 rounded-[1.3rem] bg-sky-600 px-5 text-sm font-black text-white transition hover:-translate-y-0.5"
      >
        افزودن آیتم دستی
      </button>
    </section>
  );
}

function BasketBuilderPanel({
  items,
  updateItem,
  removeItem,
  clearItems,
}: {
  items: SnappBasketDraftItem[];
  updateItem: (id: string, patch: Partial<SnappBasketDraftItem>) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
}) {
  return (
    <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-foreground">
            سبد جدید اسنپ
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            این سبد داخل payload به عنوان `parameters` ارسال می‌شود.
          </p>
        </div>

        <button
          type="button"
          onClick={clearItems}
          className="h-10 rounded-[1.2rem] bg-rose-500/10 px-4 text-xs font-black text-rose-700 transition hover:-translate-y-0.5 dark:text-rose-300"
        >
          پاک کردن سبد
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        {items.length ? (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-[1.5rem] bg-white/45 p-3 dark:bg-white/[0.04]"
            >
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="grid flex-1 gap-2 md:grid-cols-2">
                  <SnappInput
                    label="شناسه اسنپ"
                    value={item.snappProductId}
                    onChange={(value) =>
                      updateItem(item.id, { snappProductId: value })
                    }
                    dir="ltr"
                  />

                  <SnappInput
                    label="نام"
                    value={item.name}
                    onChange={(value) => updateItem(item.id, { name: value })}
                  />

                  <SnappInput
                    label="دسته‌بندی"
                    value={item.category}
                    onChange={(value) =>
                      updateItem(item.id, { category: value })
                    }
                  />

                  <SnappInput
                    label="تعداد"
                    value={String(item.count)}
                    onChange={(value) =>
                      updateItem(item.id, {
                        count: Math.max(1, Number(value || 1)),
                      })
                    }
                    type="number"
                    dir="ltr"
                  />

                  <SnappInput
                    label="قیمت واحد، تومان"
                    value={String(Math.round(item.unitAmountRial / 10))}
                    onChange={(value) =>
                      updateItem(item.id, {
                        unitAmountRial: toNumberFromText(value) * 10,
                      })
                    }
                    dir="ltr"
                  />

                  <InfoRow
                    label="جمع آیتم"
                    value={`${Math.round(
                      (item.unitAmountRial * item.count) / 10
                    ).toLocaleString("fa-IR")} تومان`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-[1.3rem] bg-rose-500/10 text-xs font-black text-rose-700 transition hover:-translate-y-0.5 dark:text-rose-300 xl:w-32"
                >
                  حذف
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-[1.5rem] bg-amber-500/10 px-4 py-3 text-sm font-black text-amber-700 dark:text-amber-300">
            سبد جدید خالی است.
          </p>
        )}
      </div>
    </section>
  );
}

function AmountControlPanel({
  originalAmountRial,
  computedAmountRial,
  overrideAmountToman,
  setOverrideAmountToman,
  difference,
  validation,
}: {
  originalAmountRial: number;
  computedAmountRial: number;
  overrideAmountToman: string;
  setOverrideAmountToman: (value: string) => void;
  difference: number;
  validation: string;
}) {
  const isMoreThanOriginal =
    toNumberFromText(overrideAmountToman) * 10 > originalAmountRial;

  return (
    <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
      <div className="flex items-center gap-2">
        <ClipboardCheck className="h-5 w-5 text-sky-700 dark:text-sky-300" />
        <h2 className="text-lg font-black text-foreground">کنترل مبلغ</h2>
      </div>

      <div className="mt-4 grid gap-2">
        <InfoRow
          label="مبلغ اولیه"
          value={`${Math.round(originalAmountRial / 10).toLocaleString(
            "fa-IR"
          )} تومان`}
        />

        <InfoRow
          label="جمع آیتم‌ها"
          value={`${Math.round(computedAmountRial / 10).toLocaleString(
            "fa-IR"
          )} تومان`}
        />

        <SnappInput
          label="مبلغ نهایی کل، تومان"
          value={overrideAmountToman}
          onChange={setOverrideAmountToman}
          placeholder="مثلاً 1,250,000"
          dir="ltr"
        />

        <InfoRow
          label="اختلاف"
          value={`${Math.round(difference / 10).toLocaleString("fa-IR")} تومان`}
        />
      </div>

      {isMoreThanOriginal ? (
        <WarningBox text="مبلغ جدید از مبلغ اولیه سفارش بیشتر است. طبق قانون فعلی، ارسال مجاز نیست." />
      ) : null}

      {difference !== 0 && !isMoreThanOriginal ? (
        <WarningBox text="مبلغ نهایی با جمع آیتم‌ها برابر نیست. در ارسال واقعی باید اپراتور این اختلاف را آگاهانه تایید کند." />
      ) : null}

      {validation ? <ErrorBox text={validation} /> : null}
    </section>
  );
}

function PayloadPreviewPanel({
  payload,
  showPayload,
  setShowPayload,
}: {
  payload: SnappUpdatePayload | null;
  showPayload: boolean;
  setShowPayload: (value: boolean) => void;
}) {
  return (
    <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
      <button
        type="button"
        onClick={() => setShowPayload(!showPayload)}
        className="flex w-full items-center justify-between gap-3 text-right"
      >
        <span className="flex items-center gap-2 text-lg font-black text-foreground">
          <Eye className="h-5 w-5 text-sky-700 dark:text-sky-300" />
          preview payload
        </span>

        <span className="text-xs font-black text-muted-foreground">
          {showPayload ? "بستن" : "نمایش"}
        </span>
      </button>

      {showPayload ? (
        <pre
          dir="ltr"
          className="mt-4 max-h-[420px] overflow-auto rounded-[1.4rem] bg-slate-950 p-4 text-left text-xs leading-6 text-slate-100"
        >
          {JSON.stringify(payload, null, 2)}
        </pre>
      ) : null}
    </section>
  );
}

function ActionPanel({
  validation,
  operatorNote,
  setOperatorNote,
  onSubmit,
  onManualReview,
  onFailed,
}: {
  validation: string;
  operatorNote: string;
  setOperatorNote: (value: string) => void;
  onSubmit: () => void;
  onManualReview: () => void;
  onFailed: () => void;
}) {
  return (
    <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
      <div className="flex items-center gap-2">
        <RefreshCw className="h-5 w-5 text-sky-700 dark:text-sky-300" />
        <h2 className="text-lg font-black text-foreground">ثبت نتیجه sync</h2>
      </div>

      <textarea
        value={operatorNote}
        onChange={(event) => setOperatorNote(event.target.value)}
        placeholder="یادداشت اپراتور / دلیل خطا / توضیح sync..."
        className="mt-4 min-h-24 w-full resize-none rounded-[1.4rem] bg-white/55 p-4 text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground/70 dark:bg-white/[0.05]"
      />

      <div className="mt-4 grid gap-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={Boolean(validation)}
          className="h-12 rounded-[1.4rem] bg-sky-600 px-4 text-sm font-black text-white shadow-[0_14px_32px_rgba(2,132,199,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ارسال mock و ثبت synced
        </button>

        <button
          type="button"
          onClick={onManualReview}
          className="h-12 rounded-[1.4rem] bg-violet-500/10 px-4 text-sm font-black text-violet-700 transition hover:-translate-y-0.5 dark:text-violet-300"
        >
          ثبت manual review
        </button>

        <button
          type="button"
          onClick={onFailed}
          className="h-12 rounded-[1.4rem] bg-rose-500/10 px-4 text-sm font-black text-rose-700 transition hover:-translate-y-0.5 dark:text-rose-300"
        >
          ثبت failed
        </button>
      </div>
    </section>
  );
}

function ResultPanel({
  result,
}: {
  result: { type: "success" | "error"; title: string; message: string };
}) {
  const isSuccess = result.type === "success";

  return (
    <section
      className={[
        "rounded-[2rem] p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl",
        isSuccess
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "bg-rose-500/10 text-rose-700 dark:text-rose-300",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        {isSuccess ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5" />
        ) : (
          <AlertTriangle className="mt-0.5 h-5 w-5" />
        )}

        <div>
          <h3 className="font-black">{result.title}</h3>
          <p className="mt-1 text-sm font-bold leading-7">{result.message}</p>
        </div>
      </div>
    </section>
  );
}

function SnappInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  dir = "rtl",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number";
  dir?: "rtl" | "ltr";
}) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-black text-muted-foreground">{label}</span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        dir={dir}
        className="h-11 rounded-[1.3rem] bg-white/60 px-4 text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground/60 focus:bg-white/80 dark:bg-white/[0.05] dark:focus:bg-white/[0.07]"
      />
    </label>
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
    <div className="flex items-center justify-between gap-3 rounded-[1.2rem] bg-white/45 px-3 py-2 dark:bg-white/[0.04]">
      <span className="shrink-0 text-xs font-black text-muted-foreground">
        {label}
      </span>

      <span
        dir={dir}
        className="truncate text-xs font-black text-foreground"
      >
        {value}
      </span>
    </div>
  );
}

function WarningBox({ text }: { text: string }) {
  return (
    <div className="mt-3 rounded-[1.4rem] bg-amber-500/10 px-4 py-3 text-xs font-black leading-6 text-amber-700 dark:text-amber-300">
      {text}
    </div>
  );
}

function ErrorBox({ text }: { text: string }) {
  return (
    <div className="mt-3 rounded-[1.4rem] bg-rose-500/10 px-4 py-3 text-xs font-black leading-6 text-rose-700 dark:text-rose-300">
      {text}
    </div>
  );
}

function buildInitialSnappBasket(order: SalesOrder): SnappBasketDraftItem[] {
  const sourceProducts = order.exchangeInfo?.replacementProducts?.length
    ? order.exchangeInfo.replacementProducts
    : order.products;

  return sourceProducts.map(createDraftItemFromProduct);
}

function createDraftItemFromProduct(
  product: SalesOrderProduct
): SnappBasketDraftItem {
  const unitAmountToman = estimateProductUnitAmountToman(product);

  return {
    id: `product-${product.id}`,
    sourceProductId: product.id,
    productCode: product.productCode,
    snappProductId: buildSnappProductId({
      productCode: product.productCode,
      color: product.color,
      size: product.size,
    }),
    name: product.title,
    category: "پوشاک",
    color: product.color,
    size: product.size,
    count: product.quantity,
    unitAmountRial: unitAmountToman * 10,
  };
}

function buildSnappProductId({
  productCode,
  color,
  size,
}: {
  productCode: string;
  color?: string;
  size?: string;
}) {
  const codePart = onlyDigits(productCode).padStart(2, "0");
  const colorPart = stableTwoDigitCode(color || "00");
  const sizePart = stableThreeDigitCode(size || "000");

  return `${codePart}${colorPart}${sizePart}`;
}

function stableTwoDigitCode(value: string) {
  const digits = onlyDigits(value);

  if (digits) return digits.padStart(2, "0").slice(-2);

  return String(hashText(value) % 100).padStart(2, "0");
}

function stableThreeDigitCode(value: string) {
  const digits = onlyDigits(value);

  if (digits) return digits.padStart(3, "0").slice(-3);

  return String(hashText(value) % 1000).padStart(3, "0");
}

function hashText(value: string) {
  return value.split("").reduce((hash, char) => {
    return hash + char.charCodeAt(0);
  }, 0);
}

function onlyDigits(value: string) {
  return String(value || "").replace(/\D/g, "");
}

function toNumberFromText(value: string) {
  const normalized = String(value || "").replace(/[^\d]/g, "");

  return Number(normalized || 0);
}

function estimateProductUnitAmountToman(product: SalesOrderProduct) {
  const maybeProduct = product as SalesOrderProduct & {
    unitPrice?: number;
    price?: number;
    finalPrice?: number;
    payableAmount?: number;
  };

  return Number(
    maybeProduct.finalPrice ||
      maybeProduct.payableAmount ||
      maybeProduct.unitPrice ||
      maybeProduct.price ||
      0
  );
}

function getOrderPayableAmountToman(order: SalesOrder) {
  const maybeOrder = order as SalesOrder & {
    payableAmount?: number;
    totalAmount?: number;
    paidAmount?: number;
  };

  return Number(
    maybeOrder.payableAmount ||
      maybeOrder.paidAmount ||
      order.payment.paidAmount ||
      maybeOrder.totalAmount ||
      0
  );
}

function getOrderPaymentToken(order: SalesOrder) {
  const maybeOrder = order as SalesOrder & {
    paymentToken?: string;
    payment_token?: string;
    snappPaymentToken?: string;
  };

  const maybeExternalSync = order.externalSync as
    | {
        paymentToken?: string;
        payment_token?: string;
      }
    | undefined;

  return (
    maybeOrder.paymentToken ||
    maybeOrder.payment_token ||
    maybeOrder.snappPaymentToken ||
    maybeExternalSync?.paymentToken ||
    maybeExternalSync?.payment_token ||
    `mock-snapp-token-${order.id}`
  );
}

function getOrderUserId(order: SalesOrder) {
  const maybeOrder = order as SalesOrder & {
    userId?: number | string;
    userID?: number | string;
    customerId?: number | string;
  };

  return maybeOrder.userId || maybeOrder.userID || maybeOrder.customerId || order.id;
}

function isSnappOrder(order: SalesOrder) {
  return (
    order.payment.gateway === "snapp_pay" ||
    order.externalSync?.provider === "snapp_pay"
  );
}