import type {
  KiyanSaleFailureReason,
  KiyanSaleRecoveryDraft,
  KiyanSaleRecoveryItemDraft,
  KiyanSaleRecoveryPayload,
  KiyanSaleRecoveryPaymentDraft,
  KiyanSaleRecoveryResolutionPatch,
  KiyanSaleRecoveryValidationResult,
} from "@/types/kiyan-sale-recovery";
import type { SalesOrder, SalesOrderProduct } from "@/types/sales-order";

type ExtendedOrderProduct = SalesOrderProduct &
  Partial<{
    priceToman: number;
    price: number;
    unitPrice: number;
    finalPrice: number;
    discountToman: number;
    discountTotal: number;
    kiyanItemId: string | number;
    itemId: string | number;
    itmID: string | number;
  }>;

export function buildKiyanSaleRecoveryDraft(
  order: SalesOrder,
  patch?: KiyanSaleRecoveryResolutionPatch
): KiyanSaleRecoveryDraft {
  const warnings: string[] = [];
  const totalQuantity = order.products.reduce(
    (sum, product) => sum + Math.max(1, product.quantity),
    0
  );
  const fallbackUnitPrice = Math.round(order.payableAmount / Math.max(1, totalQuantity));

  const items = order.products.map((product) =>
    createRecoveryItemFromOrderProduct(product, fallbackUnitPrice, warnings, patch)
  );

  return {
    uniqueInfo: `${order.id}-${getDefaultCustomerId(order)}`,
    customerId: patch?.syncedCustomerId || getDefaultCustomerId(order),
    items,
    payments: createRecoveryPayments(order, patch),
    warnings,
  };
}

export function buildKiyanSaleRecoveryPayload(
  draft: KiyanSaleRecoveryDraft,
  patch?: KiyanSaleRecoveryResolutionPatch
): KiyanSaleRecoveryPayload {
  return {
    uniqueInfo: draft.uniqueInfo,
    customerId: patch?.syncedCustomerId || draft.customerId,
    saleTransactionItemInformation: draft.items.map((item) => ({
      itemId: Number(
        patch?.itemMappings?.[item.variantBarcode] || item.kiyanItemId || 0
      ),
      quantity: item.quantity,
      price: item.priceToman,
      priceWithDiscount: item.priceWithDiscountToman,
      tax: 0,
      charge: 0,
      workerId: 0,
      isCancel: false,
    })),
    paymentInformation: draft.payments.map((payment) => ({
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
      giftCardPassword: shouldAttachGiftCard(payment.tenderId)
        ? patch?.giftCardCode || payment.giftCardCode || ""
        : "",
    })),
  };
}

export function validateKiyanSaleRecovery(
  draft: KiyanSaleRecoveryDraft,
  payload: KiyanSaleRecoveryPayload
): KiyanSaleRecoveryValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [...draft.warnings];

  if (!draft.customerId.trim()) {
    errors.push("Customer ID کیان برای سفارش مشخص نیست.");
  }

  if (!draft.uniqueInfo.trim()) {
    errors.push("Unique Info سفارش مشخص نیست.");
  }

  if (!draft.items.length) {
    errors.push("سفارش آیتمی برای ارسال به کیان ندارد.");
  }

  payload.saleTransactionItemInformation.forEach((item, index) => {
    const draftItem = draft.items[index];

    if (!item.itemId || item.itemId <= 0) {
      errors.push(
        `شناسه آیتم کیان برای ${draftItem?.title ?? "یکی از کالاها"} معتبر نیست.`
      );
    }

    if (item.quantity <= 0) {
      errors.push(`تعداد ${draftItem?.title ?? "یکی از کالاها"} معتبر نیست.`);
    }

    if (item.price <= 0) {
      errors.push(`قیمت ${draftItem?.title ?? "یکی از کالاها"} معتبر نیست.`);
    }

    if (!draftItem?.variantBarcode) {
      warnings.push(`برای ${draftItem?.title ?? "یکی از کالاها"} barcode ثبت نشده است.`);
    }
  });

  if (!draft.payments.length) {
    errors.push("اطلاعات پرداخت سفارش برای ارسال به کیان وجود ندارد.");
  }

  draft.payments.forEach((payment) => {
    if (payment.amountToman <= 0) {
      errors.push(`مبلغ پرداخت ${payment.title} معتبر نیست.`);
    }
  });

  const itemsTotal = getRecoveryItemsTotal(draft.items);
  const paymentsTotal = getRecoveryPaymentsTotal(draft.payments);

  if (itemsTotal !== paymentsTotal) {
    warnings.push(
      `جمع آیتم‌ها با جمع پرداخت‌ها برابر نیست. اختلاف: ${(
        paymentsTotal - itemsTotal
      ).toLocaleString("fa-IR")} تومان`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function getRecoveryItemsTotal(items: KiyanSaleRecoveryItemDraft[]) {
  return items.reduce(
    (sum, item) => sum + item.priceWithDiscountToman * item.quantity,
    0
  );
}

export function getRecoveryPaymentsTotal(
  payments: KiyanSaleRecoveryPaymentDraft[]
) {
  return payments.reduce((sum, payment) => sum + payment.amountToman, 0);
}

export function getKiyanSaleFailureMeta(reason: KiyanSaleFailureReason) {
  if (reason === "customer_not_found") {
    return {
      title: "مشتری در کیان پیدا نشد",
      description:
        "کیان نتوانسته مشتری این سفارش را پیدا کند. باید مشتری در کیان ثبت یا sync شود و سپس ثبت فاکتور دوباره انجام شود.",
      actionLabel: "ثبت / Sync مشتری",
      tone: "rose" as const,
    };
  }

  if (reason === "gift_card_expired" || reason === "gift_card_invalid") {
    return {
      title: "بن تخفیف معتبر نیست",
      description:
        "بن تخفیف یا کد هدیه سفارش در کیان معتبر نیست یا منقضی شده است. می‌توان بن جدید وارد کرد و دوباره تلاش کرد.",
      actionLabel: "ورود بن جدید",
      tone: "amber" as const,
    };
  }

  if (reason === "insufficient_credit") {
    return {
      title: "اعتبار مشتری کافی نیست",
      description:
        "کیان اعلام کرده اعتبار مشتری برای این نوع پرداخت کافی نیست. باید اعتبار بررسی یا تایید مالی ثبت شود.",
      actionLabel: "بررسی اعتبار",
      tone: "amber" as const,
    };
  }

  if (reason === "item_not_found" || reason === "item_mapping_missing") {
    return {
      title: "کالا یا mapping در کیان پیدا نشد",
      description:
        "یکی از کالاهای سفارش با barcode یا itemId فعلی در کیان قابل شناسایی نیست. mapping کالا باید اصلاح شود.",
      actionLabel: "اصلاح mapping کالا",
      tone: "rose" as const,
    };
  }

  if (reason === "stock_not_enough") {
    return {
      title: "موجودی کیان کافی نیست",
      description:
        "کیان اعلام کرده موجودی یکی از آیتم‌ها کافی نیست. باید موجودی یا فرآیند انبار بررسی شود.",
      actionLabel: "پیگیری انبار",
      tone: "amber" as const,
    };
  }

  if (reason === "payment_mismatch") {
    return {
      title: "مغایرت پرداخت",
      description:
        "کیان مبلغ یا ترکیب پرداخت را با payload فعلی قبول نکرده است. باید tenderها و مبلغ پرداخت بررسی شوند.",
      actionLabel: "بررسی پرداخت",
      tone: "rose" as const,
    };
  }

  if (reason === "duplicate_invoice") {
    return {
      title: "فاکتور قبلاً در کیان ثبت شده",
      description:
        "کیان اعلام کرده این سفارش یا uniqueInfo قبلاً ثبت شده است. باید barcode فاکتور موجود دریافت و روی سفارش ذخیره شود.",
      actionLabel: "ثبت barcode موجود",
      tone: "sky" as const,
    };
  }

  if (reason === "network_error") {
    return {
      title: "خطای ارتباط با کیان",
      description:
        "ارتباط با سرویس کیان برقرار نشده یا timeout رخ داده است. بعد از چند لحظه دوباره تلاش کن.",
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

function createRecoveryItemFromOrderProduct(
  product: SalesOrderProduct,
  fallbackUnitPrice: number,
  warnings: string[],
  patch?: KiyanSaleRecoveryResolutionPatch
): KiyanSaleRecoveryItemDraft {
  const extendedProduct = product as ExtendedOrderProduct;
  const variantBarcode = product.barcode || product.productCode;
  const explicitPrice = getProductUnitPrice(extendedProduct);
  const discount = Number(extendedProduct.discountToman ?? 0);
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
    kiyanItemId:
      patch?.itemMappings?.[variantBarcode] ||
      String(
        extendedProduct.kiyanItemId ||
          extendedProduct.itemId ||
          extendedProduct.itmID ||
          getDefaultKiyanItemId(variantBarcode)
      ),
    quantity: product.quantity,
    priceToman,
    priceWithDiscountToman: Math.max(0, priceToman - discount),
    usedFallbackPrice: explicitPrice === undefined,
  };
}

function createRecoveryPayments(
  order: SalesOrder,
  patch?: KiyanSaleRecoveryResolutionPatch
): KiyanSaleRecoveryPaymentDraft[] {
  return [
    {
      id: `payment-${order.id}`,
      tenderId: getDefaultTenderId(order),
      title: getDefaultTenderTitle(order),
      amountToman: order.payableAmount,
      serialNumber: order.payment.trackingCode ?? "",
      giftCardCode: patch?.giftCardCode,
    },
  ];
}

function getProductUnitPrice(product: ExtendedOrderProduct) {
  const candidates = [
    product.priceToman,
    product.price,
    product.unitPrice,
    product.finalPrice,
  ];

  const value = candidates.find(
    (item) => typeof item === "number" && Number.isFinite(item) && item > 0
  );

  return value;
}

function getDefaultCustomerId(order: SalesOrder) {
  return order.customer.mobile.replace(/\D/g, "") || String(order.id);
}

function getDefaultKiyanItemId(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) return "";

  return digits.slice(-9);
}

function getDefaultTenderId(order: SalesOrder) {
  if (order.payment.gateway === "saman") return "621";
  if (order.payment.gateway === "medisa") return "1247";
  if (order.payment.gateway === "snapp_pay") return "1015";
  if (order.payment.gateway === "wallet") return "399";

  return "1";
}

function getDefaultTenderTitle(order: SalesOrder) {
  if (order.payment.gateway === "saman") return "سامان";
  if (order.payment.gateway === "medisa") return "مدیسه";
  if (order.payment.gateway === "snapp_pay") return "اسنپ";
  if (order.payment.gateway === "wallet") return "اعتبار";

  return "پرداخت سفارش";
}

function shouldAttachGiftCard(tenderId: string) {
  return tenderId === "125" || tenderId === "126";
}