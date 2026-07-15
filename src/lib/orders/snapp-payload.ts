import type { SalesOrder, SalesOrderProduct } from "@/types/sales-order";
import type {
  SnappBasketDraftItem,
  SnappUpdatePayload,
  SnappUpdateValidationResult,
} from "@/types/snapp-order";

export function buildInitialSnappBasket(order: SalesOrder): SnappBasketDraftItem[] {
  const sourceProducts = order.exchangeInfo?.replacementProducts?.length
    ? order.exchangeInfo.replacementProducts
    : order.products;

  return sourceProducts.map(createSnappDraftItemFromProduct);
}

export function createSnappDraftItemFromProduct(
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

export function buildSnappUpdatePayload({
  order,
  basketItems,
  overrideAmountToman,
}: {
  order: SalesOrder;
  basketItems: SnappBasketDraftItem[];
  overrideAmountToman: string | number;
}): SnappUpdatePayload {
  const computedAmount = getComputedAmountRial(basketItems);
  const overrideAmount = parseAmountToNumber(overrideAmountToman) * 10;
  const allAmount = overrideAmount > 0 ? overrideAmount : computedAmount;

  return {
    order_id: order.id,
    user_id: getOrderUserId(order),
    payment_token: getOrderPaymentToken(order),
    all_amount: allAmount,
    currency: "IRR",
    computed_amount: computedAmount,
    override_amount: overrideAmount,
    difference: overrideAmount - computedAmount,
    parameters: basketItems.map((item) => ({
      amount: item.unitAmountRial,
      category: item.category || "نامشخص",
      count: item.count,
      id: item.snappProductId,
      name: item.name || item.productCode || "محصول",
    })),
    mode: "simulate",
  };
}

export function validateSnappUpdatePayload({
  order,
  basketItems,
  payload,
}: {
  order: SalesOrder;
  basketItems: SnappBasketDraftItem[];
  payload: SnappUpdatePayload;
}): SnappUpdateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const originalAmountRial = getOrderPayableAmountToman(order) * 10;

  if (!isSnappOrder(order)) {
    errors.push("این سفارش SnappPay نیست.");
  }

  if (!payload.payment_token) {
    errors.push("payment_token سفارش مشخص نیست.");
  }

  if (!basketItems.length) {
    errors.push("سبد جدید اسنپ خالی است.");
  }

  if (!payload.override_amount || payload.override_amount <= 0) {
    errors.push("مبلغ نهایی کل باید وارد شود.");
  }

  if (payload.override_amount > originalAmountRial) {
    errors.push("مبلغ جدید اسنپ نمی‌تواند از مبلغ اولیه سفارش بیشتر باشد.");
  }

  const invalidItem = basketItems.find((item) => {
    return (
      !item.snappProductId ||
      !item.name ||
      !item.category ||
      !item.count ||
      item.count <= 0 ||
      !item.unitAmountRial ||
      item.unitAmountRial <= 0
    );
  });

  if (invalidItem) {
    errors.push(
      "همه آیتم‌های سبد باید شناسه اسنپ، نام، دسته‌بندی، تعداد و مبلغ واحد معتبر داشته باشند."
    );
  }

  if (payload.difference !== 0 && payload.override_amount <= originalAmountRial) {
    warnings.push(
      "مبلغ نهایی با جمع آیتم‌ها برابر نیست. در ارسال واقعی باید اپراتور اختلاف را تایید کند."
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function getComputedAmountRial(items: SnappBasketDraftItem[]) {
  return items.reduce(
    (total, item) => total + Number(item.unitAmountRial || 0) * Number(item.count || 0),
    0
  );
}

export function buildSnappProductId({
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

export function parseAmountToNumber(value: string | number) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const normalized = String(value || "").replace(/[^\d]/g, "");

  return Number(normalized || 0);
}

export function onlyDigits(value: string | number) {
  return String(value || "").replace(/\D/g, "");
}

export function formatToman(value: number) {
  return `${Math.round(value).toLocaleString("fa-IR")} تومان`;
}

export function formatRialAsToman(value: number) {
  return formatToman(value / 10);
}

export function getOrderPayableAmountToman(order: SalesOrder) {
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

export function getOrderPaymentToken(order: SalesOrder) {
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

export function getOrderUserId(order: SalesOrder) {
  const maybeOrder = order as SalesOrder & {
    userId?: number | string;
    userID?: number | string;
    customerId?: number | string;
  };

  return maybeOrder.userId || maybeOrder.userID || maybeOrder.customerId || order.id;
}

export function isSnappOrder(order: SalesOrder) {
  return (
    order.payment.gateway === "snapp_pay" ||
    order.externalSync?.provider === "snapp_pay"
  );
}

export function estimateProductUnitAmountToman(product: SalesOrderProduct) {
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
  return value.split("").reduce((hash, char) => hash + char.charCodeAt(0), 0);
}