"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calculator,
  Database,
  FileWarning,
  Minus,
  PackageCheck,
  Plus,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  Save,
} from "lucide-react";

import {
  SALES_ORDERS_BASE_PATH,
  SALES_ORDERS_RETURNS_PATH,
  getSalesOrderDetailPath,
} from "@/components/sales/orders/sales-orders.constants";
import { OrderNotFound } from "@/components/sales/orders/detail/order-detail-core-sections";
import {
  OrderWorkflowSection,
  OrderWorkflowShell,
  OrderWorkflowStepper,
  WorkflowInfoCard,
  WorkflowPayloadPreview,
  WorkflowResultBox,
  type OrderWorkflowStep,
} from "@/components/sales/orders/ux/order-workflow-shell";
import {
  applyKiyanReturnQuantities,
  buildKiyanReturnRecoveryDraft,
  buildKiyanReturnRecoveryPayload,
  getKiyanReturnFailureMeta,
  getKiyanReturnSelectedAmount,
  getKiyanReturnSelectedQuantity,
  validateKiyanReturnRecovery,
} from "@/lib/orders/kiyan-return-recovery";
import { kiyanReturnRecoveryService } from "@/services/kiyan-return-recovery.service";
import { useSalesOrdersStore } from "@/store/sales-orders.store";
import type {
  KiyanReturnFailureReason,
  KiyanReturnMockScenario,
  KiyanReturnRecoveryResponse,
  KiyanReturnRecoveryResolutionPatch,
  KiyanReturnRecoveryServiceMode,
} from "@/types/kiyan-return-recovery";

const MOCK_SCENARIOS: { value: KiyanReturnMockScenario; label: string }[] = [
  { value: "success", label: "موفق" },
  { value: "source_invoice_missing", label: "فاکتور اصلی مشخص نیست" },
  { value: "source_invoice_not_found", label: "فاکتور اصلی پیدا نشد" },
  { value: "item_not_returnable", label: "آیتم قابل مرجوعی نیست" },
  { value: "quantity_exceeds_available", label: "تعداد بیشتر از مجاز" },
  { value: "item_mapping_missing", label: "mapping آیتم ناقص است" },
  { value: "return_already_registered", label: "مرجوعی تکراری" },
  { value: "network_error", label: "خطای ارتباط" },
];

export default function KiyanReturnRecoveryPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const numericOrderId = Number(orderId);

  const orders = useSalesOrdersStore((state) => state.orders);
  const registerReturnKiyanBarcode = useSalesOrdersStore(
    (state) => state.registerReturnKiyanBarcode
  );
  const markOrderNeedsFollowUp = useSalesOrdersStore(
    (state) => state.markOrderNeedsFollowUp
  );

  const order = useMemo(
    () => orders.find((item) => item.id === numericOrderId),
    [numericOrderId, orders]
  );

  const [serviceMode, setServiceMode] =
    useState<KiyanReturnRecoveryServiceMode>("mock");
  const [mockScenario, setMockScenario] =
    useState<KiyanReturnMockScenario>("success");

  const [sourceReceiptBarcode, setSourceReceiptBarcode] = useState("");
  const [existingReturnReceiptBarcode, setExistingReturnReceiptBarcode] =
    useState("");
  const [itemMappingBarcode, setItemMappingBarcode] = useState("");
  const [itemMappingId, setItemMappingId] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] =
    useState<KiyanReturnRecoveryResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resolutionPatch = useMemo<KiyanReturnRecoveryResolutionPatch>(
    () => ({
      sourceReceiptBarcode: sourceReceiptBarcode.trim() || undefined,
      existingReturnReceiptBarcode:
        existingReturnReceiptBarcode.trim() || undefined,
      itemMappings:
        itemMappingBarcode.trim() && itemMappingId.trim()
          ? {
              [itemMappingBarcode.trim()]: itemMappingId.trim(),
            }
          : undefined,
    }),
    [existingReturnReceiptBarcode, itemMappingBarcode, itemMappingId, sourceReceiptBarcode]
  );

  const baseDraft = useMemo(
    () => (order ? buildKiyanReturnRecoveryDraft(order, resolutionPatch) : null),
    [order, resolutionPatch]
  );

  const draft = useMemo(
    () =>
      baseDraft ? applyKiyanReturnQuantities(baseDraft, quantities) : null,
    [baseDraft, quantities]
  );

  const payload = useMemo(
    () =>
      draft
        ? buildKiyanReturnRecoveryPayload(draft, resolutionPatch)
        : null,
    [draft, resolutionPatch]
  );

  const validation = useMemo(
    () =>
      draft && payload
        ? validateKiyanReturnRecovery(draft, payload)
        : {
            isValid: false,
            errors: ["سفارش یا payload قابل ساخت نیست."],
            warnings: [],
          },
    [draft, payload]
  );

  if (!order || !draft || !payload) {
    return <OrderNotFound orderId={orderId} />;
  }

  const selectedQuantity = getKiyanReturnSelectedQuantity(draft.items);
  const selectedAmount = getKiyanReturnSelectedAmount(draft.items);
  const failureReason = response?.data?.failureReason;

  const steps = getWorkflowSteps({
    hasSelectedItems: selectedQuantity > 0,
    hasValidationError: validation.errors.length > 0,
    hasResponse: Boolean(response),
    isSubmitting,
    failureReason,
  });

  function updateQuantity(itemId: string, value: number) {
    setQuantities((current) => ({
      ...current,
      [itemId]: Math.max(0, value),
    }));
  }

  async function submitReturnRecovery() {
    if (!validation.isValid) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setResponse(null);

    try {
      const result = await kiyanReturnRecoveryService.registerReturnItems(
        payload,
        {
          mode: serviceMode,
          mockScenario,
          patch: resolutionPatch,
          sourceReceiptBarcode: draft.sourceReceiptBarcode,
        }
      );

      setResponse(result);

      if (result.success && result.data?.returnReceiptBarcode) {
        registerReturnKiyanBarcode(order.id, result.data.returnReceiptBarcode);
        markOrderNeedsFollowUp(
          order.id,
          false,
          "سند مرجوعی کیان برای سفارش ثبت شد"
        );
      } else {
        markOrderNeedsFollowUp(
          order.id,
          true,
          result.data?.failureReason
            ? `ثبت مرجوعی کیان ناموفق: ${result.data.failureReason}`
            : "ثبت مرجوعی کیان ناموفق بود"
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "خطای ناشناخته هنگام ثبت مرجوعی کیان رخ داد.";

      setSubmitError(message);
      markOrderNeedsFollowUp(order.id, true, message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function useFirstItemAsMappingTarget() {
    const firstItem = draft.items[0];

    if (!firstItem) return;

    setItemMappingBarcode(firstItem.variantBarcode);
    setItemMappingId(firstItem.receiptItemId || "");
  }

  return (
    <main className="space-y-4">
      <OrderWorkflowShell
        eyebrow="Kiyan Return Recovery"
        title={`ثبت سند مرجوعی کیان برای سفارش #${order.id}`}
        description="مرجوعی از روی فاکتور فروش اصلی کیان انجام می‌شود. اپراتور فقط از آیتم‌های قابل مرجوعی انتخاب می‌کند و کالا را آزادانه وارد نمی‌کند."
        orderLabel={`Order #${order.id}`}
        tone="rose"
        icon={RotateCcw}
        breadcrumb={[
          {
            label: "همه سفارشات",
            href: SALES_ORDERS_BASE_PATH,
          },
          {
            label: "مرجوعی‌ها",
            href: SALES_ORDERS_RETURNS_PATH,
          },
          {
            label: `سفارش #${order.id}`,
            href: getSalesOrderDetailPath(order.id),
          },
          {
            label: "ثبت مرجوعی کیان",
          },
        ]}
        goal="انتخاب آیتم‌های قابل مرجوعی، ساخت payload مرجوعی و ثبت returnReceiptBarcode."
        currentStep={getCurrentStepLabel(steps)}
        expectedResult="ذخیره returnKiyanBarcode روی سفارش یا نمایش دلیل دقیق ثبت نشدن."
        secondaryActions={[
          {
            label: "جزئیات سفارش",
            href: getSalesOrderDetailPath(order.id),
          },
          {
            label: "لیست مرجوعی‌ها",
            href: SALES_ORDERS_RETURNS_PATH,
          },
        ]}
      >
        <OrderWorkflowStepper steps={steps} />

        <OrderWorkflowSection
          title="۱. Context سفارش و فاکتور اصلی"
          description="برای ثبت مرجوعی، فاکتور فروش اصلی کیان باید مشخص باشد."
          variant="context"
          icon={Database}
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <WorkflowInfoCard label="شماره سفارش" value={`#${order.id}`} tone="rose" />
            <WorkflowInfoCard
              label="فاکتور فروش اصلی"
              value={draft.sourceReceiptBarcode || "ثبت نشده"}
              tone={draft.sourceReceiptBarcode ? "emerald" : "rose"}
            />
            <WorkflowInfoCard
              label="مبلغ انتخاب‌شده برای مرجوعی"
              value={`${selectedAmount.toLocaleString("fa-IR")} تومان`}
              tone="amber"
            />
            <WorkflowInfoCard
              label="تعداد انتخاب‌شده"
              value={selectedQuantity.toLocaleString("fa-IR")}
              tone="sky"
            />
          </div>
        </OrderWorkflowSection>

        <OrderWorkflowSection
          title="۲. انتخاب آیتم‌های قابل مرجوعی"
          description="از بین آیتم‌های فاکتور اصلی، تعداد مرجوعی را انتخاب کن. تعداد نمی‌تواند بیشتر از مقدار قابل برگشت باشد."
          variant="input"
          icon={PackageCheck}
        >
          <div className="grid gap-3">
            {draft.items.map((item) => (
              <ReturnItemSelector
                key={item.id}
                item={item}
                onQuantityChange={(value) => updateQuantity(item.id, value)}
              />
            ))}
          </div>
        </OrderWorkflowSection>

        <OrderWorkflowSection
          title="۳. کنترل قبل از ارسال"
          description="قبل از تلاش برای ثبت سند مرجوعی، خطاها و هشدارها بررسی می‌شوند."
          variant="validation"
          icon={Calculator}
        >
          <div className="grid gap-3">
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
                title="Payload مرجوعی آماده ارسال است"
                message="آیتم‌ها و تعدادهای مرجوعی کنترل شده‌اند."
              />
            ) : null}
          </div>
        </OrderWorkflowSection>

        <WorkflowPayloadPreview
          payload={payload}
          title="۴. Preview Payload مرجوعی کیان"
          description="این payload مطابق ساختار sale-return-items کیان ساخته شده است."
        />

        <OrderWorkflowSection
          title="۵. ارسال به کیان و ثبت نتیجه"
          description="اگر ثبت موفق باشد returnReceiptBarcode روی سفارش ذخیره می‌شود. اگر خطا بدهد، دلیل و ابزار رفع نمایش داده می‌شود."
          variant="submit"
          icon={Save}
        >
          <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[1.7rem] bg-white/45 p-4 dark:bg-white/[0.04]">
              <p className="text-sm font-black text-foreground">تنظیمات تلاش</p>

              <div className="mt-3 grid gap-3">
                <SelectInput
                  label="حالت سرویس"
                  value={serviceMode}
                  onChange={(value) =>
                    setServiceMode(value as KiyanReturnRecoveryServiceMode)
                  }
                  options={[
                    { value: "mock", label: "mock" },
                    { value: "api", label: "api" },
                  ]}
                />

                {serviceMode === "mock" ? (
                  <SelectInput
                    label="سناریوی تست"
                    value={mockScenario}
                    onChange={(value) =>
                      setMockScenario(value as KiyanReturnMockScenario)
                    }
                    options={MOCK_SCENARIOS}
                  />
                ) : null}
              </div>

              <button
                type="button"
                disabled={!validation.isValid || isSubmitting}
                onClick={submitReturnRecovery}
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
                تلاش برای ثبت مرجوعی کیان
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
              {response ? (
                <WorkflowResultBox
                  type={response.success ? "success" : "error"}
                  title={
                    response.success
                      ? "مرجوعی کیان ثبت شد"
                      : "ثبت مرجوعی ناموفق بود"
                  }
                  message={response.message}
                  details={
                    response.data ? (
                      <pre
                        dir="ltr"
                        className="overflow-auto rounded-[1.2rem] bg-slate-950 p-3 text-left text-xs leading-6 text-slate-100"
                      >
                        {JSON.stringify(response.data, null, 2)}
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

              {!response && !submitError ? (
                <WorkflowResultBox
                  type="info"
                  title="هنوز تلاشی ثبت نشده"
                  message="بعد از انتخاب آیتم‌ها و بررسی payload، تلاش برای ثبت مرجوعی را انجام بده."
                />
              ) : null}
            </div>
          </div>
        </OrderWorkflowSection>

        {failureReason ? (
          <FailureResolutionPanel
            reason={failureReason}
            sourceReceiptBarcode={sourceReceiptBarcode}
            setSourceReceiptBarcode={setSourceReceiptBarcode}
            existingReturnReceiptBarcode={existingReturnReceiptBarcode}
            setExistingReturnReceiptBarcode={setExistingReturnReceiptBarcode}
            itemMappingBarcode={itemMappingBarcode}
            setItemMappingBarcode={setItemMappingBarcode}
            itemMappingId={itemMappingId}
            setItemMappingId={setItemMappingId}
            useFirstItemAsMappingTarget={useFirstItemAsMappingTarget}
            onRetry={submitReturnRecovery}
            isRetryDisabled={!validation.isValid || isSubmitting}
          />
        ) : null}
      </OrderWorkflowShell>
    </main>
  );
}

function ReturnItemSelector({
  item,
  onQuantityChange,
}: {
  item: ReturnType<typeof buildKiyanReturnRecoveryDraft>["items"][number];
  onQuantityChange: (value: number) => void;
}) {
  const maxQuantity = item.availableQuantity;

  return (
    <div className="rounded-[1.7rem] bg-white/45 p-4 dark:bg-white/[0.04]">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-sm font-black text-foreground">{item.title}</h3>

          <div className="mt-2 flex flex-wrap gap-2">
            <Badge text={`کد پدر: ${item.parentProductCode}`} />
            <Badge text={`barcode: ${item.variantBarcode}`} tone="sky" dir="ltr" />
            <Badge text={`itemId: ${item.receiptItemId}`} tone="violet" dir="ltr" />
            {item.color ? <Badge text={`رنگ: ${item.color}`} tone="amber" /> : null}
            {item.size ? <Badge text={`سایز: ${item.size}`} tone="amber" /> : null}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <InfoMini label="خرید" value={item.orderedQuantity.toLocaleString("fa-IR")} />
          <InfoMini label="برگشتی" value={item.alreadyReturnedQuantity.toLocaleString("fa-IR")} />
          <InfoMini label="قابل برگشت" value={item.availableQuantity.toLocaleString("fa-IR")} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onQuantityChange(Math.max(0, item.requestedQuantity - 1))}
          className="inline-flex h-10 items-center justify-center rounded-[1.2rem] bg-white/65 px-3 text-xs font-black text-foreground dark:bg-white/[0.05]"
        >
          <Minus className="h-4 w-4" />
        </button>

        <input
          value={String(item.requestedQuantity)}
          type="number"
          min={0}
          max={maxQuantity}
          dir="ltr"
          onChange={(event) => onQuantityChange(Number(event.target.value || 0))}
          className="h-10 w-24 rounded-[1.2rem] bg-white/65 px-3 text-center text-sm font-black text-foreground outline-none dark:bg-white/[0.05]"
        />

        <button
          type="button"
          onClick={() =>
            onQuantityChange(Math.min(maxQuantity, item.requestedQuantity + 1))
          }
          className="inline-flex h-10 items-center justify-center rounded-[1.2rem] bg-white/65 px-3 text-xs font-black text-foreground dark:bg-white/[0.05]"
        >
          <Plus className="h-4 w-4" />
        </button>

        <span className="inline-flex h-10 items-center rounded-[1.2rem] bg-rose-500/10 px-3 text-xs font-black text-rose-700 dark:text-rose-300">
          مبلغ انتخابی:{" "}
          {(item.requestedQuantity * item.priceToman).toLocaleString("fa-IR")} تومان
        </span>
      </div>
    </div>
  );
}

function FailureResolutionPanel({
  reason,
  sourceReceiptBarcode,
  setSourceReceiptBarcode,
  existingReturnReceiptBarcode,
  setExistingReturnReceiptBarcode,
  itemMappingBarcode,
  setItemMappingBarcode,
  itemMappingId,
  setItemMappingId,
  useFirstItemAsMappingTarget,
  onRetry,
  isRetryDisabled,
}: {
  reason: KiyanReturnFailureReason;
  sourceReceiptBarcode: string;
  setSourceReceiptBarcode: (value: string) => void;
  existingReturnReceiptBarcode: string;
  setExistingReturnReceiptBarcode: (value: string) => void;
  itemMappingBarcode: string;
  setItemMappingBarcode: (value: string) => void;
  itemMappingId: string;
  setItemMappingId: (value: string) => void;
  useFirstItemAsMappingTarget: () => void;
  onRetry: () => void;
  isRetryDisabled: boolean;
}) {
  const meta = getKiyanReturnFailureMeta(reason);

  return (
    <OrderWorkflowSection
      title="۶. رفع مشکل ثبت نشدن مرجوعی"
      description="این بخش بعد از خطای کیان نمایش داده می‌شود و فقط ابزارهای محدود برای رفع همان خطا را نشان می‌دهد."
      variant="result"
      icon={FileWarning}
    >
      <div className="rounded-[1.7rem] bg-rose-500/10 p-4 text-rose-700 dark:text-rose-300">
        <h3 className="text-base font-black">{meta.title}</h3>
        <p className="mt-2 text-sm font-bold leading-7">{meta.description}</p>
      </div>

      <div className="mt-4 grid gap-4">
        {reason === "source_invoice_missing" || reason === "source_invoice_not_found" ? (
          <div className="rounded-[1.7rem] bg-white/45 p-4 dark:bg-white/[0.04]">
            <SectionMiniTitle icon={ReceiptText} title="اصلاح فاکتور فروش اصلی" />
            <TextInput
              label="Source Sale Receipt Barcode"
              value={sourceReceiptBarcode}
              onChange={setSourceReceiptBarcode}
              dir="ltr"
            />
          </div>
        ) : null}

        {reason === "item_mapping_missing" ? (
          <div className="rounded-[1.7rem] bg-white/45 p-4 dark:bg-white/[0.04]">
            <SectionMiniTitle icon={PackageCheck} title="اصلاح mapping آیتم" />
            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <TextInput
                label="Variant Barcode"
                value={itemMappingBarcode}
                onChange={setItemMappingBarcode}
                dir="ltr"
              />
              <TextInput
                label="Kiyan Item ID صحیح"
                value={itemMappingId}
                onChange={setItemMappingId}
                dir="ltr"
              />
              <button
                type="button"
                onClick={useFirstItemAsMappingTarget}
                className="self-end rounded-[1.3rem] bg-sky-600 px-5 py-3 text-xs font-black text-white"
              >
                پر کردن از آیتم اول
              </button>
            </div>
          </div>
        ) : null}

        {reason === "quantity_exceeds_available" || reason === "item_not_returnable" ? (
          <WorkflowResultBox
            type="warning"
            title="اصلاح تعداد لازم است"
            message="تعداد مرجوعی را در مرحله انتخاب آیتم‌ها اصلاح کن و سپس دوباره تلاش کن."
          />
        ) : null}

        {reason === "return_already_registered" ? (
          <div className="rounded-[1.7rem] bg-white/45 p-4 dark:bg-white/[0.04]">
            <SectionMiniTitle icon={ReceiptText} title="ذخیره barcode مرجوعی موجود" />
            <TextInput
              label="Existing Return Receipt Barcode"
              value={existingReturnReceiptBarcode}
              onChange={setExistingReturnReceiptBarcode}
              dir="ltr"
            />
          </div>
        ) : null}

        <button
          type="button"
          onClick={onRetry}
          disabled={isRetryDisabled}
          className={[
            "inline-flex h-12 items-center justify-center gap-2 rounded-[1.4rem] px-5 text-sm font-black text-white transition",
            isRetryDisabled
              ? "cursor-not-allowed bg-slate-400"
              : "bg-emerald-600 hover:-translate-y-0.5",
          ].join(" ")}
        >
          <RefreshCw className="h-4 w-4" />
          تلاش مجدد بعد از رفع مشکل
        </button>
      </div>
    </OrderWorkflowSection>
  );
}

function Badge({
  text,
  tone = "slate",
  dir,
}: {
  text: string;
  tone?: "slate" | "sky" | "violet" | "amber";
  dir?: "ltr" | "rtl";
}) {
  const className =
    tone === "sky"
      ? "bg-sky-500/10 text-sky-700 dark:text-sky-300"
      : tone === "violet"
        ? "bg-violet-500/10 text-violet-700 dark:text-violet-300"
        : tone === "amber"
          ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
          : "bg-slate-500/10 text-slate-700 dark:text-slate-300";

  return (
    <span
      dir={dir}
      className={`rounded-full px-3 py-1 text-[11px] font-black ${className}`}
    >
      {text}
    </span>
  );
}

function InfoMini({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.2rem] bg-white/45 p-3 dark:bg-white/[0.04]">
      <p className="text-[11px] font-black text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-black text-foreground">{value}</p>
    </div>
  );
}

function SectionMiniTitle({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-rose-700 dark:text-rose-300" />
      <p className="text-sm font-black text-foreground">{title}</p>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  dir = "rtl",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dir?: "rtl" | "ltr";
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-black text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        dir={dir}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-[1.25rem] bg-white/65 px-4 text-sm font-bold text-foreground outline-none dark:bg-white/[0.05]"
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

function getWorkflowSteps({
  hasSelectedItems,
  hasValidationError,
  hasResponse,
  isSubmitting,
  failureReason,
}: {
  hasSelectedItems: boolean;
  hasValidationError: boolean;
  hasResponse: boolean;
  isSubmitting: boolean;
  failureReason?: KiyanReturnFailureReason;
}): OrderWorkflowStep[] {
  return [
    {
      id: "context",
      title: "Context سفارش",
      description: "فاکتور اصلی کیان",
      status: "done",
    },
    {
      id: "items",
      title: "انتخاب آیتم",
      description: "تعداد قابل مرجوعی",
      status: hasSelectedItems ? "done" : "current",
    },
    {
      id: "validation",
      title: "کنترل payload",
      description: "خطاها و هشدارها",
      status: hasValidationError ? "warning" : hasSelectedItems ? "done" : "todo",
    },
    {
      id: "submit",
      title: "ارسال به کیان",
      description: "ثبت یا دریافت خطا",
      status: hasResponse ? "done" : isSubmitting ? "current" : "todo",
    },
    {
      id: "resolution",
      title: "رفع خطا",
      description: "ابزار retry",
      status: failureReason ? "current" : hasResponse ? "done" : "todo",
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