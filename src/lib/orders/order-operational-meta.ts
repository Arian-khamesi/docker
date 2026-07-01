import type { SalesOrder } from "@/types/sales-order";
import { getExternalProviderLabel } from "@/lib/orders/order-labels";

export type OperationalTone = "success" | "danger" | "warning" | "info" | "muted";

export interface OperationalMeta {
  value: string;
  description: string;
  tone: OperationalTone;
}

export function getOperationalToneClass(tone: OperationalTone) {
  switch (tone) {
    case "success":
      return {
        icon: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        text: "text-emerald-700 dark:text-emerald-300",
      };

    case "danger":
      return {
        icon: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
        text: "text-rose-700 dark:text-rose-300",
      };

    case "warning":
      return {
        icon: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
        text: "text-amber-700 dark:text-amber-300",
      };

    case "info":
      return {
        icon: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
        text: "text-sky-700 dark:text-sky-300",
      };

    case "muted":
    default:
      return {
        icon: "bg-black/[0.05] text-muted-foreground dark:bg-white/[0.06]",
        text: "text-muted-foreground",
      };
  }
}

export function getPaymentOperationalMeta(order: SalesOrder): OperationalMeta {
  if (order.payment.statusCode === 100) {
    return {
      value: "موفق",
      description: `${order.payment.paidAmount.toLocaleString(
        "fa-IR"
      )} تومان پرداخت شده`,
      tone: "success",
    };
  }

  if (order.status === "payment_pending") {
    return {
      value: "در انتظار",
      description: "پرداخت هنوز نهایی نشده است",
      tone: "warning",
    };
  }

  return {
    value: "ناموفق",
    description: "پرداخت کامل یا موفق نیست",
    tone: "danger",
  };
}

export function getAccountingOperationalMeta(
  order: SalesOrder
): OperationalMeta {
  const status =
    order.accountingStatus ??
    (order.kiyanInvoice.status === "created"
      ? "registered"
      : "not_registered");

  switch (status) {
    case "registered":
      return {
        value: "ثبت شده",
        description: order.kiyanInvoice.code ?? "فاکتور اصلی کیان ثبت شده",
        tone: "success",
      };

    case "not_registered":
      return {
        value: "ثبت نشده",
        description: "فاکتور در کیان هنوز ثبت نشده است",
        tone: "danger",
      };

    case "cancelled":
      return {
        value: "کنسل شده",
        description: "فاکتور اصلی کیان کنسل شده است",
        tone: "warning",
      };

    case "return_registered":
      return {
        value: "مرجوعی ثبت شده",
        description:
          order.returnInfo?.returnKiyanBarcode ??
          "فاکتور مرجوعی کیان ثبت شده است",
        tone: "info",
      };

    case "exchange_registered":
      return {
        value: "تعویضی ثبت شده",
        description:
          order.exchangeInfo?.replacementKiyanBarcode ??
          "فاکتور تعویضی کیان ثبت شده است",
        tone: "info",
      };

    case "needs_review":
      return {
        value: "نیازمند بررسی",
        description: "وضعیت کیان باید توسط اپراتور بررسی شود",
        tone: "warning",
      };

    default:
      return {
        value: "نامشخص",
        description: "وضعیت حسابداری مشخص نیست",
        tone: "muted",
      };
  }
}

export function getReturnOperationalMeta(order: SalesOrder): OperationalMeta {
  const status = order.returnInfo?.status ?? "none";

  switch (status) {
    case "none":
      return {
        value: "ندارد",
        description: "مرجوعی برای این سفارش ثبت نشده",
        tone: "muted",
      };

    case "requested":
      return {
        value: "درخواست شده",
        description: order.returnInfo?.reason ?? "درخواست مرجوعی ثبت شده",
        tone: "warning",
      };

    case "approved":
      return {
        value: "تایید شده",
        description: "مرجوعی تایید شده ولی هنوز کامل نشده",
        tone: "warning",
      };

    case "kiyan_return_registered":
      return {
        value: "کیان ثبت شده",
        description:
          order.returnInfo?.returnKiyanBarcode ??
          "بارکد مرجوعی کیان ثبت شده",
        tone: "info",
      };

    case "completed":
      return {
        value: "تکمیل شده",
        description: "فرآیند مرجوعی کامل شده است",
        tone: "success",
      };

    case "cancelled":
      return {
        value: "لغو شده",
        description: "فرآیند مرجوعی لغو شده است",
        tone: "muted",
      };

    default:
      return {
        value: "نامشخص",
        description: "وضعیت مرجوعی مشخص نیست",
        tone: "muted",
      };
  }
}

export function getExchangeOperationalMeta(order: SalesOrder): OperationalMeta {
  const status = order.exchangeInfo?.status ?? "none";

  switch (status) {
    case "none":
      return {
        value: "ندارد",
        description: "تعویضی برای این سفارش ثبت نشده",
        tone: "muted",
      };

    case "requested":
      return {
        value: "درخواست شده",
        description: "درخواست تعویض ثبت شده است",
        tone: "warning",
      };

    case "processing":
      return {
        value: "در حال انجام",
        description: "تعویض در مرحله پردازش است",
        tone: "warning",
      };

    case "replacement_order_created":
      return {
        value: "سفارش جدید دارد",
        description:
          order.exchangeInfo?.replacementOrderNumber ??
          "سفارش جایگزین ساخته شده",
        tone: "info",
      };

    case "kiyan_exchange_registered":
      return {
        value: "کیان ثبت شده",
        description:
          order.exchangeInfo?.replacementKiyanBarcode ??
          "فاکتور تعویضی کیان ثبت شده",
        tone: "info",
      };

    case "completed":
      return {
        value: "تکمیل شده",
        description: getExchangeAmountText(order),
        tone: "success",
      };

    case "needs_review":
      return {
        value: "نیازمند بررسی",
        description: "وضعیت تعویض باید بررسی شود",
        tone: "warning",
      };

    case "cancelled":
      return {
        value: "لغو شده",
        description: "فرآیند تعویض لغو شده است",
        tone: "muted",
      };

    default:
      return {
        value: "نامشخص",
        description: "وضعیت تعویض مشخص نیست",
        tone: "muted",
      };
  }
}

export function getExternalSyncOperationalMeta(
  order: SalesOrder
): OperationalMeta {
  const sync = order.externalSync;

  if (!sync || sync.status === "not_required") {
    return {
      value: "نیاز ندارد",
      description:
        order.payment.gateway === "snapp_pay"
          ? "فعلاً بروزرسانی اسنپ‌پی لازم نیست"
          : "برای این سفارش سینک خارجی نیاز نیست",
      tone: "muted",
    };
  }

  switch (sync.status) {
    case "pending":
      return {
        value: "در انتظار",
        description: `${getExternalProviderLabel(
          sync.provider
        )} باید بروزرسانی شود`,
        tone: "warning",
      };

    case "synced":
      return {
        value: "سینک شده",
        description: sync.lastSyncedAt
          ? "آخرین بروزرسانی ثبت شده"
          : "اطلاعات با سرویس خارجی هماهنگ است",
        tone: "success",
      };

    case "failed":
      return {
        value: "خطا",
        description: sync.failedReason ?? "سینک خارجی با خطا مواجه شده",
        tone: "danger",
      };

    case "manual_review":
      return {
        value: "بررسی دستی",
        description: "نیازمند بررسی دستی توسط اپراتور",
        tone: "warning",
      };

    default:
      return {
        value: "نامشخص",
        description: "وضعیت سینک مشخص نیست",
        tone: "muted",
      };
  }
}

export function getExchangeAmountText(order: SalesOrder) {
  const exchange = order.exchangeInfo;

  if (!exchange || exchange.status === "none") {
    return "بدون تعویض";
  }

  if (exchange.amountDirection === "equal") {
    return "بدون اختلاف مبلغ";
  }

  const formattedAmount = exchange.amountDifference.toLocaleString("fa-IR");

  if (exchange.amountDirection === "up") {
    return `رو به بالا +${formattedAmount} تومان`;
  }

  return `رو به پایین -${formattedAmount} تومان`;
}

export function getReturnedProducts(order: SalesOrder): SalesOrder["products"] {
  const returnedProductIds = order.returnInfo?.returnedProductIds ?? [];

  return order.products.filter((product) =>
    returnedProductIds.includes(product.id)
  );
}

export function getExchangeReturnedProducts(
  order: SalesOrder
): SalesOrder["products"] {
  const returnedProductIds = order.exchangeInfo?.returnedProductIds ?? [];

  return order.products.filter((product) =>
    returnedProductIds.includes(product.id)
  );
}