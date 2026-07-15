"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calculator,
  Database,
  Minus,
  PackagePlus,
  Plus,
  RefreshCw,
  Save,
  ShoppingBasket,
  Smartphone,
  Trash2,
} from "lucide-react";

import {
  SALES_ORDERS_BASE_PATH,
  SALES_ORDERS_SNAPP_PATH,
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
import {
  buildInitialSnappBasket,
  buildSnappUpdatePayload,
  formatRialAsToman,
  formatToman,
  getComputedAmountRial,
  getOrderPayableAmountToman,
  getOrderPaymentToken,
  getOrderUserId,
  validateSnappUpdatePayload,
} from "@/lib/orders/snapp-payload";
import { snappOrdersService } from "@/services/snapp-orders.service";
import { useSalesOrdersStore } from "@/store/sales-orders.store";
import type { ProductVariantSelection } from "@/types/product-variant";
import type {
  SnappBasketDraftItem,
  SnappOrdersServiceMode,
  SnappUpdateApiResponse,
} from "@/types/snapp-order";

export default function SnappUpdateWorkflowPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const numericOrderId = Number(orderId);

  const orders = useSalesOrdersStore((state) => state.orders);
  const updateExternalSyncStatus = useSalesOrdersStore(
    (state) => state.updateExternalSyncStatus
  );

  const order = useMemo(
    () => orders.find((item) => item.id === numericOrderId),
    [orders, numericOrderId]
  );

  const [basketItems, setBasketItems] = useState<SnappBasketDraftItem[]>(() =>
    order ? buildInitialSnappBasket(order) : []
  );

  const [overrideAmountToman, setOverrideAmountToman] = useState(() =>
    order ? String(getOrderPayableAmountToman(order)) : ""
  );

  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantSelection | null>(null);

  const [selectedVariantCount, setSelectedVariantCount] = useState("1");

  const [serviceMode, setServiceMode] =
    useState<SnappOrdersServiceMode>("mock");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] =
    useState<SnappUpdateApiResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const payload = useMemo(() => {
    if (!order) return null;

    return buildSnappUpdatePayload({
      order,
      basketItems,
      overrideAmountToman: Number(overrideAmountToman || 0),
    });
  }, [basketItems, order, overrideAmountToman]);

  const validation = useMemo(() => {
    if (!order || !payload) {
      return {
        isValid: false,
        errors: ["سفارش یا payload قابل ساخت نیست."],
        warnings: [],
      };
    }

    return validateSnappUpdatePayload({
      order,
      basketItems,
      payload,
    });
  }, [basketItems, order, payload]);

  const computedAmountRial = useMemo(
    () => getComputedAmountRial(basketItems),
    [basketItems]
  );

  if (!order) {
    return <OrderNotFound orderId={orderId} />;
  }

  const steps = getWorkflowSteps({
    hasBasket: basketItems.length > 0,
    hasValidationError: validation.errors.length > 0,
    hasPayload: Boolean(payload),
    hasResponse: Boolean(apiResponse),
    isSubmitting,
  });

  function updateBasketItem(
    itemId: string,
    patch: Partial<SnappBasketDraftItem>
  ) {
    setBasketItems((current) =>
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

  function removeBasketItem(itemId: string) {
    setBasketItems((current) => current.filter((item) => item.id !== itemId));
  }

  function addSelectedVariantToBasket() {
    if (!selectedVariant) return;

    const count = Math.max(1, Number(selectedVariantCount || 1));

    const newItem: SnappBasketDraftItem = {
      id: `variant-${selectedVariant.variantBarcode}`,
      sourceProductId: selectedVariant.parentProductId,
      productCode: selectedVariant.parentProductCode,
      snappProductId: selectedVariant.variantBarcode,
      name: selectedVariant.parentProductTitle,
      category: selectedVariant.categoryTitle ?? "نامشخص",
      color: selectedVariant.colorTitle,
      size: selectedVariant.sizeTitle,
      count,
      unitAmountRial: selectedVariant.priceToman * 10,
    };

    setBasketItems((current) => {
      const existingItem = current.find(
        (item) => item.snappProductId === selectedVariant.variantBarcode
      );

      if (!existingItem) {
        return [...current, newItem];
      }

      return current.map((item) =>
        item.id === existingItem.id
          ? {
              ...item,
              productCode: newItem.productCode,
              snappProductId: newItem.snappProductId,
              name: newItem.name,
              category: newItem.category,
              color: newItem.color,
              size: newItem.size,
              unitAmountRial: newItem.unitAmountRial,
              count: item.count + count,
            }
          : item
      );
    });

    setSelectedVariant(null);
    setSelectedVariantCount("1");
  }

  async function submitSync() {
    if (!payload || !validation.isValid) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setApiResponse(null);

    try {
      const response = await snappOrdersService.updateTransaction(payload, {
        mode: serviceMode,
      });

      setApiResponse(response);

      if (response.success && response.category === "success") {
        updateExternalSyncStatus(order.id, "synced");
      } else {
        updateExternalSyncStatus(order.id, "manual_review", response.message);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "خطای ناشناخته هنگام آپدیت اسنپ رخ داد.";

      setSubmitError(message);
      updateExternalSyncStatus(order.id, "failed", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="space-y-4">
      <OrderWorkflowShell
        eyebrow="SnappPay Update"
        title={`آپدیت اسنپ برای سفارش #${order.id}`}
        description="این workflow برای زمانی است که بعد از مرجوعی، تعویض یا اصلاح سفارش باید سبد و مبلغ جدید به SnappPay اعلام شود."
        orderLabel={`Order #${order.id}`}
        tone="sky"
        icon={Smartphone}
        breadcrumb={[
          {
            label: "همه سفارشات",
            href: SALES_ORDERS_BASE_PATH,
          },
          {
            label: "سفارش‌های اسنپ",
            href: SALES_ORDERS_SNAPP_PATH,
          },
          {
            label: `سفارش #${order.id}`,
            href: getSalesOrderDetailPath(order.id),
          },
          {
            label: "آپدیت اسنپ",
          },
        ]}
        goal="ساخت سبد نهایی، کنترل مبلغ و ثبت نتیجه sync اسنپ."
        currentStep={getCurrentStepLabel(steps)}
        expectedResult="ثبت وضعیت synced یا manual_review برای سفارش."
        secondaryActions={[
          {
            label: "جزئیات سفارش",
            href: getSalesOrderDetailPath(order.id),
          },
          {
            label: "سفارش‌های اسنپ",
            href: SALES_ORDERS_SNAPP_PATH,
          },
        ]}
      >
        <OrderWorkflowStepper steps={steps} />

        <OrderWorkflowSection
          title="۱. Context سفارش"
          description="قبل از تغییر سبد، اول مطمئن شو سفارش، token، user و مبلغ اولیه درست هستند."
          variant="context"
          icon={Database}
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <WorkflowInfoCard
              label="شماره سفارش"
              value={`#${order.id}`}
              tone="sky"
            />

            <WorkflowInfoCard
              label="User ID"
              value={String(getOrderUserId(order))}
              tone="slate"
            />

            <WorkflowInfoCard
              label="Payment Token"
              value={getOrderPaymentToken(order)}
              tone="violet"
            />

            <WorkflowInfoCard
              label="مبلغ اولیه سفارش"
              value={`${formatToman(getOrderPayableAmountToman(order))} تومان`}
              tone="emerald"
            />
          </div>
        </OrderWorkflowSection>

        <OrderWorkflowSection
          title="۲. ساخت سبد جدید اسنپ"
          description="سبد جدید باید وضعیت نهایی سفارش بعد از مرجوعی یا تعویض را نشان دهد. هر کالای جدید باید با barcode یونیک variant انتخاب شود."
          variant="input"
          icon={ShoppingBasket}
        >
          <div className="grid gap-3">
            {basketItems.length ? (
              basketItems.map((item) => (
                <BasketItemEditor
                  key={item.id}
                  item={item}
                  onChange={(patch) => updateBasketItem(item.id, patch)}
                  onRemove={() => removeBasketItem(item.id)}
                />
              ))
            ) : (
              <WorkflowResultBox
                type="warning"
                title="سبد خالی است"
                message="برای ارسال آپدیت به اسنپ باید حداقل یک آیتم در سبد جدید وجود داشته باشد."
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
                  افزودن محصول از کاتالوگ variant
                </h3>

                <p className="mt-1 text-xs font-bold leading-6 text-muted-foreground">
                  رنگ و سایز دستی وارد نمی‌شوند؛ محصول مادر، رنگ و سایز از
                  گزینه‌های واقعی انتخاب می‌شوند و barcode یونیک variant به سبد
                  اضافه می‌شود.
                </p>
              </div>
            </div>

            <ProductVariantSelector
              products={mockProductVariantCatalog}
              value={selectedVariant}
              onChange={setSelectedVariant}
              title="انتخاب کالای دقیق"
              description="محصول مادر را انتخاب کن، سپس رنگ و سایز را انتخاب کن تا barcode نهایی همان variant مشخص شود."
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
                  onClick={addSelectedVariantToBasket}
                  disabled={!selectedVariant}
                  className={[
                    "inline-flex h-11 items-center justify-center gap-2 rounded-[1.3rem] px-5 text-xs font-black text-white transition",
                    selectedVariant
                      ? "bg-violet-600 hover:-translate-y-0.5"
                      : "cursor-not-allowed bg-slate-400",
                  ].join(" ")}
                >
                  <Plus className="h-4 w-4" />
                  افزودن variant انتخاب‌شده به سبد
                </button>
              </div>
            </div>
          </div>
        </OrderWorkflowSection>

        <OrderWorkflowSection
          title="۳. کنترل مبلغ و اعتبارسنجی"
          description="مبلغ نهایی نباید بیشتر از مبلغ اولیه سفارش باشد. اگر مبلغ override با مبلغ محاسبه‌شده فرق دارد، اپراتور باید آگاه باشد."
          variant="validation"
          icon={Calculator}
        >
          <div className="grid gap-3 md:grid-cols-3">
            <WorkflowInfoCard
              label="مبلغ محاسبه‌شده سبد"
              value={`${formatRialAsToman(computedAmountRial)} تومان`}
              tone="sky"
            />

            <WorkflowInput
              label="مبلغ نهایی قابل ارسال / تومان"
              value={overrideAmountToman}
              onChange={setOverrideAmountToman}
              dir="ltr"
              type="number"
            />

            <WorkflowInfoCard
              label="اختلاف"
              value={
                payload
                  ? `${formatRialAsToman(payload.difference)} تومان`
                  : "نامشخص"
              }
              tone={payload?.difference === 0 ? "emerald" : "amber"}
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
                title="Payload قابل ارسال است"
                message="کنترل‌های اصلی انجام شده و امکان ارسال آپدیت وجود دارد."
              />
            ) : null}
          </div>
        </OrderWorkflowSection>

        {payload ? (
          <WorkflowPayloadPreview
            payload={payload}
            title="۴. Preview Payload اسنپ"
            description="این payload قبل از ارسال باید توسط اپراتور بررسی شود."
          />
        ) : null}

        <OrderWorkflowSection
          title="۵. ارسال و ثبت نتیجه"
          description="فعلاً امکان ارسال mock و api-ready داریم. در حالت mock، نتیجه در store local ثبت می‌شود."
          variant="submit"
          icon={Save}
        >
          <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[1.7rem] bg-white/45 p-4 dark:bg-white/[0.04]">
              <p className="text-sm font-black text-foreground">حالت ارسال</p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setServiceMode("mock")}
                  className={[
                    "h-11 rounded-[1.3rem] text-xs font-black transition",
                    serviceMode === "mock"
                      ? "bg-sky-600 text-white"
                      : "bg-white/65 text-foreground dark:bg-white/[0.05]",
                  ].join(" ")}
                >
                  mock
                </button>

                <button
                  type="button"
                  onClick={() => setServiceMode("api")}
                  className={[
                    "h-11 rounded-[1.3rem] text-xs font-black transition",
                    serviceMode === "api"
                      ? "bg-violet-600 text-white"
                      : "bg-white/65 text-foreground dark:bg-white/[0.05]",
                  ].join(" ")}
                >
                  api
                </button>
              </div>

              <button
                type="button"
                disabled={!validation.isValid || isSubmitting}
                onClick={submitSync}
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
                ثبت نتیجه sync
              </button>

              <Link
                href={getSalesOrderDetailPath(order.id)}
                className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[1.3rem] bg-white/65 text-xs font-black text-foreground transition hover:-translate-y-0.5 dark:bg-white/[0.05]"
              >
                بازگشت به جزئیات سفارش
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {apiResponse ? (
                <WorkflowResultBox
                  type={
                    apiResponse.success && apiResponse.category === "success"
                      ? "success"
                      : "warning"
                  }
                  title={
                    apiResponse.success && apiResponse.category === "success"
                      ? "Sync موفق ثبت شد"
                      : "نتیجه نیازمند بررسی است"
                  }
                  message={apiResponse.message}
                  details={
                    apiResponse.data ? (
                      <pre
                        dir="ltr"
                        className="overflow-auto rounded-[1.2rem] bg-slate-950 p-3 text-left text-xs leading-6 text-slate-100"
                      >
                        {JSON.stringify(apiResponse.data, null, 2)}
                      </pre>
                    ) : null
                  }
                />
              ) : null}

              {submitError ? (
                <WorkflowResultBox
                  type="error"
                  title="ارسال ناموفق بود"
                  message={submitError}
                />
              ) : null}

              {!apiResponse && !submitError ? (
                <WorkflowResultBox
                  type="info"
                  title="هنوز نتیجه‌ای ثبت نشده"
                  message="بعد از کنترل payload، روی ثبت نتیجه sync بزن."
                />
              ) : null}
            </div>
          </div>
        </OrderWorkflowSection>
      </OrderWorkflowShell>
    </main>
  );
}

function BasketItemEditor({
  item,
  onChange,
  onRemove,
}: {
  item: SnappBasketDraftItem;
  onChange: (patch: Partial<SnappBasketDraftItem>) => void;
  onRemove: () => void;
}) {
  const unitAmountToman = Math.round(item.unitAmountRial / 10);
  const totalRial = item.unitAmountRial * item.count;

  return (
    <div className="rounded-[1.7rem] bg-white/45 p-4 dark:bg-white/[0.04]">
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-sm font-black text-foreground">{item.name}</h3>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-500/10 px-3 py-1 text-[11px] font-black text-slate-700 dark:text-slate-300">
              کد پدر: {item.productCode}
            </span>

            <span
              dir="ltr"
              className="rounded-full bg-sky-500/10 px-3 py-1 text-[11px] font-black text-sky-700 dark:text-sky-300"
            >
              barcode: {item.snappProductId}
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

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <WorkflowInput
          label="نام کالا"
          value={item.name}
          onChange={(value) => onChange({ name: value })}
        />

        <WorkflowInput
          label="دسته‌بندی"
          value={item.category}
          onChange={(value) => onChange({ category: value })}
        />

        <WorkflowInput
          label="تعداد"
          value={String(item.count)}
          onChange={(value) => onChange({ count: Number(value || 0) })}
          dir="ltr"
          type="number"
        />

        <WorkflowInput
          label="مبلغ واحد / تومان"
          value={String(unitAmountToman)}
          onChange={(value) =>
            onChange({ unitAmountRial: Number(value || 0) * 10 })
          }
          dir="ltr"
          type="number"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange({ count: Math.max(1, item.count - 1) })}
          className="inline-flex h-9 items-center justify-center rounded-[1.1rem] bg-white/65 px-3 text-xs font-black text-foreground dark:bg-white/[0.05]"
        >
          <Minus className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onChange({ count: item.count + 1 })}
          className="inline-flex h-9 items-center justify-center rounded-[1.1rem] bg-white/65 px-3 text-xs font-black text-foreground dark:bg-white/[0.05]"
        >
          <Plus className="h-4 w-4" />
        </button>

        <span className="inline-flex h-9 items-center rounded-[1.1rem] bg-sky-500/10 px-3 text-xs font-black text-sky-700 dark:text-sky-300">
          جمع این ردیف: {formatRialAsToman(totalRial)} تومان
        </span>
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

function getWorkflowSteps({
  hasBasket,
  hasValidationError,
  hasPayload,
  hasResponse,
  isSubmitting,
}: {
  hasBasket: boolean;
  hasValidationError: boolean;
  hasPayload: boolean;
  hasResponse: boolean;
  isSubmitting: boolean;
}): OrderWorkflowStep[] {
  return [
    {
      id: "context",
      title: "بررسی سفارش",
      description: "token، user و مبلغ اولیه",
      status: "done",
    },
    {
      id: "basket",
      title: "سبد جدید",
      description: "محصولات نهایی اسنپ",
      status: hasBasket ? "done" : "current",
    },
    {
      id: "validation",
      title: "کنترل مبلغ",
      description: "خطاها و هشدارها",
      status: hasValidationError ? "warning" : hasBasket ? "done" : "todo",
    },
    {
      id: "payload",
      title: "Preview Payload",
      description: "کنترل نهایی قبل ارسال",
      status: hasPayload && !hasValidationError ? "done" : "todo",
    },
    {
      id: "submit",
      title: "ثبت نتیجه",
      description: "sync / manual review",
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