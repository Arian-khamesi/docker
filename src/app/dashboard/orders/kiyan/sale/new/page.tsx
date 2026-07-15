"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeDollarSign,
  Calculator,
  CreditCard,
  Database,
  FileCode2,
  Minus,
  PackagePlus,
  Plus,
  ReceiptText,
  RefreshCw,
  Save,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import {
  SALES_ORDERS_BASE_PATH,
  getSalesOrderDetailPath,
} from "@/components/sales/orders/sales-orders.constants";
import { OrderNotFound } from "@/components/sales/orders/detail/order-detail-core-sections";
import { ProductVariantSelector } from "@/components/sales/orders/products/product-variant-selector";
import {
  OrderWorkflowSection,
  OrderWorkflowShell,
  OrderWorkflowStepper,
  WorkflowInfoCard,
  WorkflowPayloadPreview,
  WorkflowResultBox,
  type OrderWorkflowStep,
} from "@/components/sales/orders/ux/order-workflow-shell";
import { mockProductVariantCatalog } from "@/data/mock-product-variants";
import { useSalesOrdersStore } from "@/store/sales-orders.store";
import type { ProductVariantSelection } from "@/types/product-variant";
import type { SalesOrder, SalesOrderProduct } from "@/types/sales-order";

type KiyanTenderId = "1" | "621" | "1247" | "1015" | "399" | "125" | "126";

interface KiyanSaleItemDraft {
  id: string;
  parentProductCode: string;
  variantBarcode: string;
  title: string;
  color?: string;
  size?: string;
  kiyanItemId: string;
  quantity: number;
  priceToman: number;
  discountToman: number;
}

interface KiyanPaymentDraft {
  id: string;
  tenderId: KiyanTenderId;
  title: string;
  amountToman: number;
  serialNumber: string;
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

interface KiyanMockResponse {
  success: boolean;
  saleReceiptBarcode?: string;
  message: string;
}

const TENDER_OPTIONS: { id: KiyanTenderId; title: string; description: string }[] =
  [
    {
      id: "1",
      title: "نقد",
      description: "پرداخت نقدی / عمومی",
    },
    {
      id: "621",
      title: "سامان",
      description: "درگاه سامان",
    },
    {
      id: "1247",
      title: "مدیسه",
      description: "پرداخت مدیسه",
    },
    {
      id: "1015",
      title: "اسنپ",
      description: "SnappPay",
    },
    {
      id: "399",
      title: "اعتبار",
      description: "اعتبار مشتری",
    },
    {
      id: "125",
      title: "تخفیف درصدی",
      description: "تخفیف درصدی",
    },
    {
      id: "126",
      title: "بن ریالی",
      description: "تخفیف مبلغی / بن",
    },
  ];

export default function KiyanSaleWorkflowPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const numericOrderId = Number(orderId);

  const orders = useSalesOrdersStore((state) => state.orders);
  const updatePrimaryKiyanInvoice = useSalesOrdersStore(
    (state) => state.updatePrimaryKiyanInvoice
  );
  const markOrderNeedsFollowUp = useSalesOrdersStore(
    (state) => state.markOrderNeedsFollowUp
  );

  const order = useMemo(
    () => orders.find((item) => item.id === numericOrderId),
    [numericOrderId, orders]
  );

  const [customerId, setCustomerId] = useState(() =>
    order ? getDefaultCustomerId(order) : ""
  );

  const [uniqueInfo, setUniqueInfo] = useState(() =>
    order ? `${order.id}-${getDefaultCustomerId(order)}` : ""
  );

  const [saleItems, setSaleItems] = useState<KiyanSaleItemDraft[]>(() =>
    order ? createInitialSaleItems(order) : []
  );

  const [payments, setPayments] = useState<KiyanPaymentDraft[]>(() =>
    order ? createInitialPayments(order) : []
  );

  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantSelection | null>(null);
  const [selectedVariantCount, setSelectedVariantCount] = useState("1");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<KiyanMockResponse | null>(null);

  const payload = useMemo(
    () =>
      buildKiyanSalePayload({
        uniqueInfo,
        customerId,
        saleItems,
        payments,
      }),
    [customerId, payments, saleItems, uniqueInfo]
  );

  const validation = useMemo(
    () =>
      validateKiyanSaleWorkflow({
        order,
        uniqueInfo,
        customerId,
        saleItems,
        payments,
      }),
    [customerId, order, payments, saleItems, uniqueInfo]
  );

  if (!order) {
    return <OrderNotFound orderId={orderId} />;
  }

  const steps = getWorkflowSteps({
    hasItems: saleItems.length > 0,
    hasPayments: payments.length > 0,
    hasValidationError: validation.errors.length > 0,
    hasResponse: Boolean(response),
    isSubmitting,
  });

  const itemsTotal = getSaleItemsTotal(saleItems);
  const paymentsTotal = getPaymentsTotal(payments);

  function updateSaleItem(
    itemId: string,
    patch: Partial<KiyanSaleItemDraft>
  ) {
    setSaleItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              ...patch,
            }
          : item
      )
    );
  }

  function removeSaleItem(itemId: string) {
    setSaleItems((current) => current.filter((item) => item.id !== itemId));
  }

  function addSelectedVariantToItems() {
    if (!selectedVariant) return;

    const count = Math.max(1, Number(selectedVariantCount || 1));

    const newItem: KiyanSaleItemDraft = {
      id: `variant-${selectedVariant.variantBarcode}`,
      parentProductCode: selectedVariant.parentProductCode,
      variantBarcode: selectedVariant.variantBarcode,
      title: selectedVariant.parentProductTitle,
      color: selectedVariant.colorTitle,
      size: selectedVariant.sizeTitle,
      kiyanItemId: getDefaultKiyanItemId(selectedVariant.variantBarcode),
      quantity: count,
      priceToman: selectedVariant.priceToman,
      discountToman: 0,
    };

    setSaleItems((current) => {
      const existing = current.find(
        (item) => item.variantBarcode === selectedVariant.variantBarcode
      );

      if (!existing) return [...current, newItem];

      return current.map((item) =>
        item.id === existing.id
          ? {
              ...item,
              quantity: item.quantity + count,
              priceToman: newItem.priceToman,
            }
          : item
      );
    });

    setSelectedVariant(null);
    setSelectedVariantCount("1");
  }

  function updatePayment(
    paymentId: string,
    patch: Partial<KiyanPaymentDraft>
  ) {
    setPayments((current) =>
      current.map((payment) =>
        payment.id === paymentId
          ? {
              ...payment,
              ...patch,
            }
          : payment
      )
    );
  }

  function addPayment() {
    setPayments((current) => [
      ...current,
      {
        id: `payment-${Date.now()}`,
        tenderId: "1",
        title: "پرداخت جدید",
        amountToman: 0,
        serialNumber: "",
      },
    ]);
  }

  function removePayment(paymentId: string) {
    setPayments((current) =>
      current.filter((payment) => payment.id !== paymentId)
    );
  }

  async function submitMockKiyanSale() {
    if (!validation.isValid) return;

    setIsSubmitting(true);
    setResponse(null);

    await new Promise((resolve) => window.setTimeout(resolve, 700));

    const saleReceiptBarcode = `KYN-SALE-${order.id}-${Date.now()
      .toString()
      .slice(-6)}`;

    updatePrimaryKiyanInvoice(order.id, saleReceiptBarcode);
    markOrderNeedsFollowUp(
      order.id,
      false,
      "فاکتور فروش کیان برای سفارش ثبت شد"
    );

    setResponse({
      success: true,
      saleReceiptBarcode,
      message: "فروش کیان به‌صورت mock ثبت شد و barcode روی سفارش ذخیره شد.",
    });

    setIsSubmitting(false);
  }

  return (
    <main className="space-y-4">
      <OrderWorkflowShell
        eyebrow="Kiyan Sale"
        title={`ثبت فروش کیان برای سفارش #${order.id}`}
        description="این workflow برای ثبت فاکتور فروش اصلی سفارش در کیان است. آیتم‌ها باید با variant دقیق و شناسه قابل ارسال به کیان کنترل شوند."
        orderLabel={`Order #${order.id}`}
        tone="violet"
        icon={BadgeDollarSign}
        breadcrumb={[
          {
            label: "همه سفارشات",
            href: SALES_ORDERS_BASE_PATH,
          },
          {
            label: `سفارش #${order.id}`,
            href: getSalesOrderDetailPath(order.id),
          },
          {
            label: "ثبت فروش کیان",
          },
        ]}
        goal="ساخت payload فروش کیان، کنترل آیتم‌ها و پرداخت‌ها، ثبت barcode فاکتور کیان."
        currentStep={getCurrentStepLabel(steps)}
        expectedResult="ثبت saleReceiptBarcode روی سفارش و خروج از صف سفارش‌های بدون کیان."
        secondaryActions={[
          {
            label: "جزئیات سفارش",
            href: getSalesOrderDetailPath(order.id),
          },
        ]}
      >
        <OrderWorkflowStepper steps={steps} />

        <OrderWorkflowSection
          title="۱. Context سفارش"
          description="قبل از ساخت payload، اطلاعات پایه سفارش، مشتری و وضعیت فعلی فاکتور کیان را بررسی کن."
          variant="context"
          icon={Database}
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <WorkflowInfoCard
              label="شماره سفارش"
              value={`#${order.id}`}
              tone="violet"
            />

            <WorkflowInfoCard
              label="مشتری"
              value={order.customer.fullName}
              tone="slate"
            />

            <WorkflowInfoCard
              label="مبلغ سفارش"
              value={`${order.payableAmount.toLocaleString("fa-IR")} تومان`}
              tone="emerald"
            />

            <WorkflowInfoCard
              label="فاکتور فعلی کیان"
              value={order.kiyanInvoice.code ?? "ثبت نشده"}
              tone={order.kiyanInvoice.code ? "emerald" : "rose"}
            />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <WorkflowInput
              label="Customer ID کیان"
              value={customerId}
              onChange={setCustomerId}
              dir="ltr"
            />

            <WorkflowInput
              label="Unique Info"
              value={uniqueInfo}
              onChange={setUniqueInfo}
              dir="ltr"
            />
          </div>
        </OrderWorkflowSection>

        <OrderWorkflowSection
          title="۲. آیتم‌های فروش کیان"
          description="اینجا کالاهای قابل ارسال به کیان کنترل می‌شوند. کد پدر و barcode variant باید تفکیک شده باشند."
          variant="input"
          icon={ShoppingBag}
        >
          <div className="grid gap-3">
            {saleItems.length ? (
              saleItems.map((item) => (
                <KiyanSaleItemEditor
                  key={item.id}
                  item={item}
                  onChange={(patch) => updateSaleItem(item.id, patch)}
                  onRemove={() => removeSaleItem(item.id)}
                />
              ))
            ) : (
              <WorkflowResultBox
                type="warning"
                title="آیتم فروش وجود ندارد"
                message="برای ثبت فروش کیان باید حداقل یک آیتم در payload وجود داشته باشد."
              />
            )}
          </div>

          <div className="mt-4 rounded-[1.7rem] bg-white/45 p-4 dark:bg-white/[0.04]">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
                <PackagePlus className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-sm font-black text-foreground">
                  افزودن آیتم از کاتالوگ variant
                </h3>

                <p className="mt-1 text-xs font-bold leading-6 text-muted-foreground">
                  محصول مادر، رنگ و سایز انتخاب می‌شوند و barcode یونیک همان
                  variant به آیتم فروش اضافه می‌شود.
                </p>
              </div>
            </div>

            <ProductVariantSelector
              products={mockProductVariantCatalog}
              value={selectedVariant}
              onChange={setSelectedVariant}
              title="انتخاب کالای دقیق برای فروش کیان"
              description="کالای دقیق باید بر اساس رنگ و سایز مشخص شود. barcode نهایی variant مبنای تشخیص کالا است."
            />

            <div className="mt-4 grid gap-3 md:grid-cols-[240px_1fr]">
              <WorkflowInput
                label="تعداد برای افزودن"
                value={selectedVariantCount}
                onChange={setSelectedVariantCount}
                dir="ltr"
                type="number"
              />

              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={addSelectedVariantToItems}
                  disabled={!selectedVariant}
                  className={[
                    "inline-flex h-11 items-center justify-center gap-2 rounded-[1.3rem] px-5 text-xs font-black text-white transition",
                    selectedVariant
                      ? "bg-violet-600 hover:-translate-y-0.5"
                      : "cursor-not-allowed bg-slate-400",
                  ].join(" ")}
                >
                  <Plus className="h-4 w-4" />
                  افزودن به آیتم‌های کیان
                </button>
              </div>
            </div>
          </div>
        </OrderWorkflowSection>

        <OrderWorkflowSection
          title="۳. پرداخت‌ها و Tender"
          description="جمع پرداخت‌ها باید با جمع آیتم‌های فروش هماهنگ باشد. مقدار paymentAmount در payload به ریال ارسال می‌شود."
          variant="input"
          icon={CreditCard}
        >
          <div className="grid gap-3">
            {payments.map((payment) => (
              <PaymentEditor
                key={payment.id}
                payment={payment}
                onChange={(patch) => updatePayment(payment.id, patch)}
                onRemove={() => removePayment(payment.id)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addPayment}
            className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-[1.3rem] bg-violet-600 px-5 text-xs font-black text-white transition hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            افزودن پرداخت
          </button>
        </OrderWorkflowSection>

        <OrderWorkflowSection
          title="۴. کنترل مبلغ و اعتبارسنجی"
          description="قبل از ثبت کیان، آیتم‌ها، پرداخت‌ها، شناسه مشتری، uniqueInfo و اختلاف مبلغ باید کنترل شوند."
          variant="validation"
          icon={Calculator}
        >
          <div className="grid gap-3 md:grid-cols-3">
            <WorkflowInfoCard
              label="جمع آیتم‌ها"
              value={`${itemsTotal.toLocaleString("fa-IR")} تومان`}
              tone="sky"
            />

            <WorkflowInfoCard
              label="جمع پرداخت‌ها"
              value={`${paymentsTotal.toLocaleString("fa-IR")} تومان`}
              tone="violet"
            />

            <WorkflowInfoCard
              label="اختلاف"
              value={`${(paymentsTotal - itemsTotal).toLocaleString(
                "fa-IR"
              )} تومان`}
              tone={paymentsTotal === itemsTotal ? "emerald" : "amber"}
            />
          </div>

          <div className="mt-4 grid gap-3">
            {validation.errors.map((error) => (
              <WorkflowResultBox
                key={error}
                type="error"
                title="خطای اعتبارسنجی"
                message={error}
              />
            ))}

            {validation.warnings.map((warning) => (
              <WorkflowResultBox
                key={warning}
                type="warning"
                title="هشدار"
                message={warning}
              />
            ))}

            {validation.isValid ? (
              <WorkflowResultBox
                type="success"
                title="Payload فروش کیان قابل ثبت است"
                message="آیتم‌ها و پرداخت‌ها کنترل شده‌اند و امکان ثبت mock وجود دارد."
              />
            ) : null}
          </div>
        </OrderWorkflowSection>

        <WorkflowPayloadPreview
          payload={payload}
          title="۵. Preview Payload فروش کیان"
          description="این payload مطابق ساختار فروش کیان ساخته شده و قبل از ارسال باید کنترل شود."
        />

        <OrderWorkflowSection
          title="۶. ثبت نتیجه فروش کیان"
          description="در این مرحله فعلاً ثبت mock انجام می‌شود و barcode فاکتور فروش روی سفارش ذخیره می‌شود."
          variant="submit"
          icon={Save}
        >
          <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[1.7rem] bg-white/45 p-4 dark:bg-white/[0.04]">
              <p className="text-sm font-black text-foreground">
                ثبت فروش کیان
              </p>

              <p className="mt-2 text-xs font-bold leading-6 text-muted-foreground">
                بعد از ثبت موفق، سفارش دیگر به‌عنوان «پرداخت موفق بدون فاکتور
                کیان» نمایش داده نمی‌شود.
              </p>

              <button
                type="button"
                disabled={!validation.isValid || isSubmitting}
                onClick={submitMockKiyanSale}
                className={[
                  "mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1.4rem] text-sm font-black text-white transition",
                  validation.isValid && !isSubmitting
                    ? "bg-emerald-600 hover:-translate-y-0.5"
                    : "cursor-not-allowed bg-slate-400",
                ].join(" ")}
              >
                {isSubmitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                ثبت mock فروش کیان
              </button>

              <Link
                href={getSalesOrderDetailPath(order.id)}
                className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[1.3rem] bg-white/65 text-xs font-black text-foreground transition hover:-translate-y-0.5 dark:bg-white/[0.05]"
              >
                بازگشت به جزئیات سفارش
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>

            <div>
              {response ? (
                <WorkflowResultBox
                  type={response.success ? "success" : "error"}
                  title={response.success ? "فروش کیان ثبت شد" : "ثبت ناموفق"}
                  message={response.message}
                  details={
                    response.saleReceiptBarcode ? (
                      <div
                        dir="ltr"
                        className="rounded-[1.2rem] bg-white/45 p-3 text-sm font-black dark:bg-white/[0.05]"
                      >
                        {response.saleReceiptBarcode}
                      </div>
                    ) : null
                  }
                />
              ) : (
                <WorkflowResultBox
                  type="info"
                  title="هنوز نتیجه‌ای ثبت نشده"
                  message="بعد از کنترل payload، روی ثبت mock فروش کیان بزن."
                />
              )}
            </div>
          </div>
        </OrderWorkflowSection>
      </OrderWorkflowShell>
    </main>
  );
}

function KiyanSaleItemEditor({
  item,
  onChange,
  onRemove,
}: {
  item: KiyanSaleItemDraft;
  onChange: (patch: Partial<KiyanSaleItemDraft>) => void;
  onRemove: () => void;
}) {
  const rowTotal = Math.max(0, item.priceToman - item.discountToman) * item.quantity;

  return (
    <div className="rounded-[1.7rem] bg-white/45 p-4 dark:bg-white/[0.04]">
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-sm font-black text-foreground">{item.title}</h3>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-500/10 px-3 py-1 text-[11px] font-black text-slate-700 dark:text-slate-300">
              کد پدر: {item.parentProductCode}
            </span>

            <span
              dir="ltr"
              className="rounded-full bg-sky-500/10 px-3 py-1 text-[11px] font-black text-sky-700 dark:text-sky-300"
            >
              barcode: {item.variantBarcode}
            </span>

            {item.color ? (
              <span className="rounded-full bg-violet-500/10 px-3 py-1 text-[11px] font-black text-violet-700 dark:text-violet-300">
                رنگ: {item.color}
              </span>
            ) : null}

            {item.size ? (
              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-black text-amber-700 dark:text-amber-300">
                سایز: {item.size}
              </span>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[1.2rem] bg-rose-500/10 px-3 text-xs font-black text-rose-700 dark:text-rose-300"
        >
          <Trash2 className="h-4 w-4" />
          حذف
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <WorkflowInput
          label="شناسه آیتم کیان"
          value={item.kiyanItemId}
          onChange={(value) => onChange({ kiyanItemId: value })}
          dir="ltr"
          type="number"
        />

        <WorkflowInput
          label="تعداد"
          value={String(item.quantity)}
          onChange={(value) =>
            onChange({ quantity: Math.max(1, Number(value || 1)) })
          }
          dir="ltr"
          type="number"
        />

        <WorkflowInput
          label="قیمت واحد / تومان"
          value={String(item.priceToman)}
          onChange={(value) => onChange({ priceToman: Number(value || 0) })}
          dir="ltr"
          type="number"
        />

        <WorkflowInput
          label="تخفیف واحد / تومان"
          value={String(item.discountToman)}
          onChange={(value) => onChange({ discountToman: Number(value || 0) })}
          dir="ltr"
          type="number"
        />

        <WorkflowInfoCard
          label="جمع ردیف"
          value={`${rowTotal.toLocaleString("fa-IR")} تومان`}
          tone="emerald"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            onChange({ quantity: Math.max(1, item.quantity - 1) })
          }
          className="inline-flex h-9 items-center justify-center rounded-[1.1rem] bg-white/65 px-3 text-xs font-black text-foreground dark:bg-white/[0.05]"
        >
          <Minus className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onChange({ quantity: item.quantity + 1 })}
          className="inline-flex h-9 items-center justify-center rounded-[1.1rem] bg-white/65 px-3 text-xs font-black text-foreground dark:bg-white/[0.05]"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function PaymentEditor({
  payment,
  onChange,
  onRemove,
}: {
  payment: KiyanPaymentDraft;
  onChange: (patch: Partial<KiyanPaymentDraft>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-[1.7rem] bg-white/45 p-4 dark:bg-white/[0.04]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-foreground">
            {payment.title}
          </h3>

          <p className="mt-1 text-xs font-bold text-muted-foreground">
            tenderId = {payment.tenderId}
          </p>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[1.2rem] bg-rose-500/10 px-3 text-xs font-black text-rose-700 dark:text-rose-300"
        >
          <Trash2 className="h-4 w-4" />
          حذف
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SelectInput
          label="Tender"
          value={payment.tenderId}
          onChange={(value) => {
            const option = TENDER_OPTIONS.find((item) => item.id === value);

            onChange({
              tenderId: value as KiyanTenderId,
              title: option?.title ?? payment.title,
            });
          }}
          options={TENDER_OPTIONS.map((item) => ({
            value: item.id,
            label: `${item.title} / ${item.id}`,
          }))}
        />

        <WorkflowInput
          label="عنوان"
          value={payment.title}
          onChange={(value) => onChange({ title: value })}
        />

        <WorkflowInput
          label="مبلغ / تومان"
          value={String(payment.amountToman)}
          onChange={(value) => onChange({ amountToman: Number(value || 0) })}
          dir="ltr"
          type="number"
        />

        <WorkflowInput
          label="Serial Number"
          value={payment.serialNumber}
          onChange={(value) => onChange({ serialNumber: value })}
          dir="ltr"
        />
      </div>
    </div>
  );
}

function WorkflowInput({
  label,
  value,
  onChange,
  dir = "rtl",
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dir?: "rtl" | "ltr";
  type?: "text" | "number";
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-black text-muted-foreground">
        {label}
      </span>

      <input
        value={value}
        type={type}
        dir={dir}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-[1.25rem] bg-white/65 px-4 text-sm font-bold text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:bg-white dark:bg-white/[0.05]"
      />
    </label>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-black text-muted-foreground">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-[1.25rem] bg-white/65 px-4 text-sm font-bold text-foreground outline-none dark:bg-white/[0.05]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function createInitialSaleItems(order: SalesOrder): KiyanSaleItemDraft[] {
  return order.products.map((product) => createSaleItemFromOrderProduct(product));
}

function createSaleItemFromOrderProduct(
  product: SalesOrderProduct
): KiyanSaleItemDraft {
  const variantBarcode = product.barcode || product.productCode;

  return {
    id: product.id,
    parentProductCode: product.productCode,
    variantBarcode,
    title: product.title,
    color: product.color,
    size: product.size,
    kiyanItemId: getDefaultKiyanItemId(variantBarcode),
    quantity: product.quantity,
    priceToman: 0,
    discountToman: 0,
  };
}

function createInitialPayments(order: SalesOrder): KiyanPaymentDraft[] {
  return [
    {
      id: `payment-${order.id}`,
      tenderId: getDefaultTenderId(order),
      title: getDefaultTenderTitle(order),
      amountToman: order.payableAmount,
      serialNumber: order.payment.trackingCode ?? "",
    },
  ];
}

function buildKiyanSalePayload({
  uniqueInfo,
  customerId,
  saleItems,
  payments,
}: {
  uniqueInfo: string;
  customerId: string;
  saleItems: KiyanSaleItemDraft[];
  payments: KiyanPaymentDraft[];
}): KiyanSalePayload {
  return {
    uniqueInfo,
    customerId,
    saleTransactionItemInformation: saleItems.map((item) => ({
      itemId: Number(item.kiyanItemId || 0),
      quantity: item.quantity,
      price: item.priceToman,
      priceWithDiscount: Math.max(0, item.priceToman - item.discountToman),
      tax: 0,
      charge: 0,
      workerId: 0,
      isCancel: false,
    })),
    paymentInformation: payments.map((payment) => ({
      tenderId: payment.tenderId,
      paymentAmount: payment.amountToman * 10,
      discountedAmount: 0,
      rrn: "",
      stan: "",
      cardNumber: "",
      hashedCardNumber: "",
      customerIdentifier: "",
      terminalCode: "",
      serialNumber: payment.serialNumber,
      giftCardPassword: "",
    })),
  };
}

function validateKiyanSaleWorkflow({
  order,
  uniqueInfo,
  customerId,
  saleItems,
  payments,
}: {
  order?: SalesOrder;
  uniqueInfo: string;
  customerId: string;
  saleItems: KiyanSaleItemDraft[];
  payments: KiyanPaymentDraft[];
}) {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!order) {
    errors.push("سفارش پیدا نشد.");
  }

  if (!customerId.trim()) {
    errors.push("Customer ID کیان الزامی است.");
  }

  if (!uniqueInfo.trim()) {
    errors.push("Unique Info الزامی است.");
  }

  if (!saleItems.length) {
    errors.push("حداقل یک آیتم فروش باید وجود داشته باشد.");
  }

  saleItems.forEach((item) => {
    if (!item.kiyanItemId || Number(item.kiyanItemId) <= 0) {
      errors.push(`شناسه آیتم کیان برای ${item.title} معتبر نیست.`);
    }

    if (!item.variantBarcode) {
      warnings.push(`برای ${item.title} barcode variant ثبت نشده است.`);
    }

    if (!item.parentProductCode) {
      warnings.push(`برای ${item.title} کد پدر محصول ثبت نشده است.`);
    }

    if (item.priceToman <= 0) {
      warnings.push(`قیمت واحد برای ${item.title} صفر است و باید کنترل شود.`);
    }

    if (item.discountToman > item.priceToman) {
      errors.push(`تخفیف ${item.title} نمی‌تواند بیشتر از قیمت واحد باشد.`);
    }
  });

  if (!payments.length) {
    errors.push("حداقل یک پرداخت باید وجود داشته باشد.");
  }

  payments.forEach((payment) => {
    if (payment.amountToman <= 0) {
      errors.push(`مبلغ پرداخت ${payment.title} معتبر نیست.`);
    }
  });

  const itemsTotal = getSaleItemsTotal(saleItems);
  const paymentsTotal = getPaymentsTotal(payments);

  if (itemsTotal > 0 && paymentsTotal !== itemsTotal) {
    warnings.push(
      `جمع پرداخت‌ها با جمع آیتم‌ها برابر نیست. اختلاف: ${(
        paymentsTotal - itemsTotal
      ).toLocaleString("fa-IR")} تومان`
    );
  }

  if (order && order.kiyanInvoice.code) {
    warnings.push("این سفارش از قبل فاکتور کیان دارد. ثبت مجدد را بررسی کن.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

function getSaleItemsTotal(items: KiyanSaleItemDraft[]) {
  return items.reduce(
    (sum, item) =>
      sum + Math.max(0, item.priceToman - item.discountToman) * item.quantity,
    0
  );
}

function getPaymentsTotal(payments: KiyanPaymentDraft[]) {
  return payments.reduce((sum, payment) => sum + payment.amountToman, 0);
}

function getDefaultCustomerId(order: SalesOrder) {
  return order.customer.mobile.replace(/\D/g, "") || String(order.id);
}

function getDefaultKiyanItemId(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) return "";

  return digits.slice(-9);
}

function getDefaultTenderId(order: SalesOrder): KiyanTenderId {
  if (order.payment.gateway === "saman") return "621";
  if (order.payment.gateway === "medisa") return "1247";
  if (order.payment.gateway === "snapp_pay") return "1015";
  if (order.payment.gateway === "wallet") return "399";

  return "1";
}

function getDefaultTenderTitle(order: SalesOrder) {
  const tenderId = getDefaultTenderId(order);

  return TENDER_OPTIONS.find((item) => item.id === tenderId)?.title ?? "پرداخت";
}

function getWorkflowSteps({
  hasItems,
  hasPayments,
  hasValidationError,
  hasResponse,
  isSubmitting,
}: {
  hasItems: boolean;
  hasPayments: boolean;
  hasValidationError: boolean;
  hasResponse: boolean;
  isSubmitting: boolean;
}): OrderWorkflowStep[] {
  return [
    {
      id: "context",
      title: "Context سفارش",
      description: "مشتری و وضعیت کیان",
      status: "done",
    },
    {
      id: "items",
      title: "آیتم‌های فروش",
      description: "محصول، variant و itemId",
      status: hasItems ? "done" : "current",
    },
    {
      id: "payments",
      title: "پرداخت‌ها",
      description: "Tender و مبلغ",
      status: hasPayments ? "done" : "todo",
    },
    {
      id: "validation",
      title: "کنترل نهایی",
      description: "خطاها و هشدارها",
      status: hasValidationError ? "warning" : hasItems && hasPayments ? "done" : "todo",
    },
    {
      id: "submit",
      title: "ثبت نتیجه",
      description: "barcode فاکتور کیان",
      status: hasResponse ? "done" : isSubmitting ? "current" : "todo",
    },
  ];
}

function getCurrentStepLabel(steps: OrderWorkflowStep[]) {
  const current =
    steps.find((step) => step.status === "current") ??
    steps.find((step) => step.status === "warning") ??
    steps.find((step) => step.status === "todo") ??
    steps[steps.length - 1];

  return current?.title ?? "در حال بررسی";
}