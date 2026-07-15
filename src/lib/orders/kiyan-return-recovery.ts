import type {
  KiyanReturnFailureReason,
  KiyanReturnRecoveryDraft,
  KiyanReturnRecoveryItemDraft,
  KiyanReturnRecoveryPayload,
  KiyanReturnRecoveryResolutionPatch,
  KiyanReturnRecoveryValidationResult,
} from "@/types/kiyan-return-recovery";
import type { SalesOrder, SalesOrderProduct } from "@/types/sales-order";

type ExtendedOrderProduct = SalesOrderProduct &
  Partial<{
    priceToman: number;
    price: number;
    unitPrice: number;
    finalPrice: number;
    kiyanItemId: string | number;
    itemId: string | number;
    itmID: string | number;
    returnQuantity: number;
  }>;

export function buildKiyanReturnRecoveryDraft(
  order: SalesOrder,
  patch?: KiyanReturnRecoveryResolutionPatch
): KiyanReturnRecoveryDraft {
  const warnings: string[] = [];
  const sourceReceiptBarcode =
    patch?.sourceReceiptBarcode ||
    order.kiyanInvoice.code ||
    order.kiyanDocuments?.find((doc) => doc.type === "primary")?.barcode ||
    "";

  const totalQuantity = order.products.reduce(
    (sum, product) => sum + Math.max(1, product.quantity),
    0
  );

  const fallbackUnitPrice = Math.round(
    order.payableAmount / Math.max(1, totalQuantity)
  );

  return {
    sourceReceiptBarcode,
    operatorId: patch?.operatorId ?? 5084,
    retailstoreId: patch?.retailstoreId ?? 0,
    workstationId: patch?.workstationId ?? 0,
    transactionSequence: patch?.transactionSequence ?? 0,
    businessDayDate: patch?.businessDayDate ?? new Date().toISOString(),
    items: order.products.map((product) =>
      createReturnItemFromOrderProduct(
        order,
        product,
        fallbackUnitPrice,
        warnings,
        patch
      )
    ),
    warnings,
  };
}

export function applyKiyanReturnQuantities(
  draft: KiyanReturnRecoveryDraft,
  quantities: Record<string, number>
): KiyanReturnRecoveryDraft {
  return {
    ...draft,
    items: draft.items.map((item) => ({
      ...item,
      requestedQuantity: Math.max(0, Number(quantities[item.id] ?? item.requestedQuantity ?? 0)),
    })),
  };
}

export function buildKiyanReturnRecoveryPayload(
  draft: KiyanReturnRecoveryDraft,
  patch?: KiyanReturnRecoveryResolutionPatch
): KiyanReturnRecoveryPayload {
  return {
    operatorId: patch?.operatorId ?? draft.operatorId,
    retailstoreId: patch?.retailstoreId ?? draft.retailstoreId,
    workstationId: patch?.workstationId ?? draft.workstationId,
    transactionSequence: patch?.transactionSequence ?? draft.transactionSequence,
    businessDayDate: patch?.businessDayDate ?? draft.businessDayDate,
    returnInfo: draft.items
      .filter((item) => item.requestedQuantity > 0)
      .map((item) => ({
        itemId: Number(
          patch?.itemMappings?.[item.variantBarcode] || item.receiptItemId || 0
        ),
        quantity: item.requestedQuantity,
      })),
  };
}

export function validateKiyanReturnRecovery(
  draft: KiyanReturnRecoveryDraft,
  payload: KiyanReturnRecoveryPayload
): KiyanReturnRecoveryValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [...draft.warnings];

  if (!draft.sourceReceiptBarcode.trim()) {
    errors.push("فاکتور فروش اصلی کیان برای مرجوعی مشخص نیست.");
  }

  if (!payload.returnInfo.length) {
    errors.push("حداقل یک آیتم برای مرجوعی باید انتخاب شود.");
  }

  draft.items.forEach((item) => {
    if (item.requestedQuantity <= 0) return;

    if (!item.receiptItemId || Number(item.receiptItemId) <= 0) {
      errors.push(`شناسه آیتم کیان برای ${item.title} معتبر نیست.`);
    }

    if (item.requestedQuantity > item.availableQuantity) {
      errors.push(
        `تعداد مرجوعی ${item.title} بیشتر از تعداد قابل مرجوعی است.`
      );
    }

    if (!item.variantBarcode) {
      warnings.push(`برای ${item.title} barcode variant ثبت نشده است.`);
    }
  });

  if (payload.operatorId <= 0) {
    errors.push("operatorId معتبر نیست.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function getKiyanReturnSelectedAmount(items: KiyanReturnRecoveryItemDraft[]) {
  return items.reduce(
    (sum, item) => sum + item.requestedQuantity * item.priceToman,
    0
  );
}

export function getKiyanReturnSelectedQuantity(items: KiyanReturnRecoveryItemDraft[]) {
  return items.reduce((sum, item) => sum + item.requestedQuantity, 0);
}

export function getKiyanReturnFailureMeta(reason: KiyanReturnFailureReason) {
  if (reason === "source_invoice_missing") {
    return {
      title: "فاکتور فروش اصلی مشخص نیست",
      description:
        "برای ثبت مرجوعی باید barcode فاکتور فروش اصلی کیان وجود داشته باشد. barcode صحیح را وارد کن و دوباره تلاش کن.",
      actionLabel: "ورود barcode فاکتور اصلی",
      tone: "rose" as const,
    };
  }

  if (reason === "source_invoice_not_found") {
    return {
      title: "فاکتور فروش در کیان پیدا نشد",
      description:
        "کیان barcode فاکتور فروش اصلی را پیدا نکرده است. barcode را بررسی کن یا فاکتور اصلی را ابتدا ثبت کن.",
      actionLabel: "اصلاح barcode فاکتور",
      tone: "rose" as const,
    };
  }

  if (reason === "item_not_returnable") {
    return {
      title: "آیتم قابل مرجوعی نیست",
      description:
        "کیان اعلام کرده یکی از آیتم‌ها قابل مرجوعی نیست یا قبلاً کامل برگشت خورده است.",
      actionLabel: "اصلاح تعداد مرجوعی",
      tone: "amber" as const,
    };
  }

  if (reason === "quantity_exceeds_available") {
    return {
      title: "تعداد مرجوعی بیشتر از مقدار مجاز است",
      description:
        "تعداد انتخاب‌شده برای مرجوعی از مقدار قابل برگشت در فاکتور اصلی بیشتر است. تعداد را اصلاح کن.",
      actionLabel: "اصلاح تعداد",
      tone: "amber" as const,
    };
  }

  if (reason === "item_mapping_missing") {
    return {
      title: "mapping آیتم کیان ناقص است",
      description:
        "یکی از barcodeها یا itemIdهای ارسالی با آیتم‌های کیان match نشده است. mapping کالا را اصلاح کن.",
      actionLabel: "اصلاح mapping",
      tone: "rose" as const,
    };
  }

  if (reason === "return_already_registered") {
    return {
      title: "مرجوعی قبلاً ثبت شده",
      description:
        "کیان اعلام کرده این مرجوعی قبلاً ثبت شده است. barcode سند مرجوعی موجود را ذخیره کن.",
      actionLabel: "ثبت barcode موجود",
      tone: "sky" as const,
    };
  }

  if (reason === "network_error") {
    return {
      title: "خطای ارتباط با کیان",
      description:
        "ارتباط با سرویس کیان برقرار نشده یا timeout رخ داده است. چند لحظه بعد دوباره تلاش کن.",
      actionLabel: "تلاش مجدد",
      tone: "amber" as const,
    };
  }

  return {
    title: "خطای نامشخص کیان",
    description:
      "کیان پاسخ قابل دسته‌بندی نداده است. متن فنی خطا را بررسی کن و در صورت نیاز برای تیم فنی پیگیری ثبت کن.",
    actionLabel: "بررسی فنی",
    tone: "slate" as const,
  };
}

function createReturnItemFromOrderProduct(
  order: SalesOrder,
  product: SalesOrderProduct,
  fallbackUnitPrice: number,
  warnings: string[],
  patch?: KiyanReturnRecoveryResolutionPatch
): KiyanReturnRecoveryItemDraft {
  const extendedProduct = product as ExtendedOrderProduct;
  const variantBarcode = product.barcode || product.productCode;
  const explicitPrice = getProductUnitPrice(extendedProduct);
  const alreadyReturnedQuantity = getAlreadyReturnedQuantity(order, product.id);
  const priceToman = explicitPrice ?? fallbackUnitPrice;

  if (explicitPrice === undefined) {
    warnings.push(
      `قیمت واحد ${product.title} از مدل local سفارش موجود نبود و برای preview از fallback استفاده شد.`
    );
  }

  return {
    id: product.id,
    title: product.title,
    parentProductCode: product.productCode,
    variantBarcode,
    color: product.color,
    size: product.size,
    receiptItemId:
      patch?.itemMappings?.[variantBarcode] ||
      String(
        extendedProduct.kiyanItemId ||
          extendedProduct.itemId ||
          extendedProduct.itmID ||
          getDefaultKiyanItemId(variantBarcode)
      ),
    orderedQuantity: product.quantity,
    alreadyReturnedQuantity,
    availableQuantity: Math.max(0, product.quantity - alreadyReturnedQuantity),
    requestedQuantity: 0,
    priceToman,
  };
}

function getAlreadyReturnedQuantity(order: SalesOrder, productId: string) {
  const itemQuantity =
    order.returnInfo?.returnedItems?.find((item) => item.productId === productId)
      ?.quantity ?? 0;

  if (itemQuantity > 0) return itemQuantity;

  return order.returnInfo?.returnedProductIds?.includes(productId) ? 1 : 0;
}

function getProductUnitPrice(product: ExtendedOrderProduct) {
  const candidates = [
    product.priceToman,
    product.price,
    product.unitPrice,
    product.finalPrice,
  ];

  return candidates.find(
    (item) => typeof item === "number" && Number.isFinite(item) && item > 0
  );
}

function getDefaultKiyanItemId(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) return "";

  return digits.slice(-9);
}