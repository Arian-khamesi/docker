import {
  getSalesOrderExchangeCreatePath,
  getSalesOrderKiyanSaleCreatePath,
  getSalesOrderReturnCreatePath,
  getSalesOrderSnappUpdatePath,
} from "@/components/sales/orders/sales-orders.constants";
import type { SalesOrder } from "@/types/sales-order";

export type OrderActionTone =
  | "sky"
  | "violet"
  | "rose"
  | "amber"
  | "emerald"
  | "slate";

export type OrderSignalStatus =
  | "ok"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

export interface OrderOperationalAction {
  label: string;
  href: string;
  tone: OrderActionTone;
  reason?: string;
  afterAction?: string;
}

export interface OrderOperationalSignal {
  id: string;
  label: string;
  value: string;
  status: OrderSignalStatus;
  description?: string;
}

export interface OrderOperationalSummary {
  currentStatus: string;
  goal: string;
  reason: string;
  recommendedAction: string;
  afterAction: string;
  primaryAction?: OrderOperationalAction;
  secondaryActions: OrderOperationalAction[];
  dataSignals: OrderOperationalSignal[];
  followupSignals: OrderOperationalSignal[];
  operationSignals: OrderOperationalSignal[];
}

export function getOrderOperationalSummary(
  order: SalesOrder
): OrderOperationalSummary {
  const paymentSuccess = isPaymentSuccess(order);
  const paymentFailed = isPaymentFailed(order);
  const primaryKiyanCode = getPrimaryKiyanCode(order);
  const hasPrimaryKiyan = Boolean(primaryKiyanCode);
  const hasReturn = hasReturnFlow(order);
  const hasExchange = hasExchangeFlow(order);
  const returnBarcode = getReturnKiyanBarcode(order);
  const exchangeReturnBarcode = getExchangeReturnKiyanBarcode(order);
  const exchangeSaleBarcode = getExchangeSaleKiyanBarcode(order);
  const snappOrder = isSnappOrder(order);
  const snappNeedsSync = isSnappNeedsSync(order);
  const externalSyncStatus = order.externalSync?.status ?? "not_required";

  const secondaryActions = getAvailableActions(order);

  const baseSummary: OrderOperationalSummary = {
    goal: "بررسی کامل سفارش، تشخیص وضعیت عملیاتی و انتخاب اقدام درست بعدی.",
    currentStatus: "در حال بررسی",
    reason: "این سفارش برای مشاهده وضعیت کلی و تصمیم‌گیری عملیاتی باز شده است.",
    recommendedAction: "وضعیت‌ها را بررسی کن و در صورت نیاز از بخش عملیات اقدام کن.",
    afterAction:
      "بعد از انجام عملیات، وضعیت سفارش، لاگ‌ها و workspaceهای مربوطه به‌روزرسانی می‌شوند.",
    secondaryActions,
    dataSignals: [
      {
        id: "payment",
        label: "پرداخت",
        value: paymentSuccess
          ? "موفق"
          : paymentFailed
            ? "ناموفق"
            : "در انتظار / نامشخص",
        status: paymentSuccess ? "ok" : paymentFailed ? "danger" : "warning",
        description: paymentSuccess
          ? "امکان بررسی ثبت کیان و عملیات بعدی وجود دارد."
          : "قبل از عملیات مالی باید وضعیت پرداخت بررسی شود.",
      },
      {
        id: "kiyan-primary",
        label: "فاکتور اصلی کیان",
        value: hasPrimaryKiyan ? primaryKiyanCode : "ثبت نشده",
        status: hasPrimaryKiyan ? "ok" : paymentSuccess ? "danger" : "neutral",
        description: hasPrimaryKiyan
          ? "فروش اصلی در کیان ثبت شده است."
          : "برای سفارش پرداخت موفق، نبود فاکتور کیان نیازمند اقدام است.",
      },
      {
        id: "gateway",
        label: "نوع سفارش / درگاه",
        value: snappOrder ? "SnappPay" : getGatewayText(order),
        status: snappOrder ? "info" : "neutral",
        description: snappOrder
          ? "بعد از مرجوعی یا تعویض، sync اسنپ باید بررسی شود."
          : "سفارش غیر اسنپ است.",
      },
      {
        id: "external-sync",
        label: "Sync خارجی",
        value: externalSyncStatus,
        status:
          externalSyncStatus === "synced"
            ? "ok"
            : externalSyncStatus === "failed" ||
                externalSyncStatus === "manual_review"
              ? "danger"
              : externalSyncStatus === "pending"
                ? "warning"
                : "neutral",
        description: "وضعیت هماهنگی سفارش با سرویس‌های خارجی مثل SnappPay.",
      },
    ],
    followupSignals: [
      {
        id: "needs-followup",
        label: "نیازمند پیگیری",
        value: order.needsFollowUp ? "بله" : "خیر",
        status: order.needsFollowUp ? "warning" : "ok",
        description: order.needsFollowUp
          ? "این سفارش توسط سیستم یا اپراتور برای پیگیری علامت خورده است."
          : "مورد پیگیری فوری روی سفارش ثبت نشده است.",
      },
      {
        id: "return-status",
        label: "مرجوعی",
        value: hasReturn
          ? returnBarcode
            ? `ثبت کیان: ${returnBarcode}`
            : "در جریان / بدون سند کیان"
          : "ندارد",
        status: hasReturn ? (returnBarcode ? "ok" : "warning") : "neutral",
        description: hasReturn
          ? "برای مرجوعی باید سند برگشت کیان و در صورت اسنپ بودن sync بررسی شود."
          : "برای این سفارش مرجوعی ثبت نشده است.",
      },
      {
        id: "exchange-status",
        label: "تعویض",
        value: hasExchange
          ? exchangeReturnBarcode && exchangeSaleBarcode
            ? "سند برگشت و فروش جایگزین دارد"
            : "ناقص / نیازمند تکمیل"
          : "ندارد",
        status: hasExchange
          ? exchangeReturnBarcode && exchangeSaleBarcode
            ? "ok"
            : "warning"
          : "neutral",
        description: hasExchange
          ? "تعویض باید هم سند برگشت و هم فروش جایگزین کیان داشته باشد."
          : "برای این سفارش تعویض ثبت نشده است.",
      },
    ],
    operationSignals: [
      {
        id: "kiyan-operation",
        label: "عملیات کیان",
        value: paymentSuccess
          ? hasPrimaryKiyan
            ? "ثبت شده"
            : "نیازمند ثبت فروش"
          : "فعلاً قابل بررسی",
        status: paymentSuccess
          ? hasPrimaryKiyan
            ? "ok"
            : "danger"
          : "neutral",
        description:
          "ثبت فروش، مرجوعی و تعویض کیان باید از workflowهای اختصاصی انجام شود.",
      },
      {
        id: "snapp-operation",
        label: "عملیات اسنپ",
        value: snappOrder
          ? snappNeedsSync
            ? "نیازمند آپدیت"
            : "بدون اقدام فوری"
          : "غیر اسنپ",
        status: snappOrder ? (snappNeedsSync ? "warning" : "ok") : "neutral",
        description:
          "آپدیت اسنپ یعنی ساخت سبد جدید، کنترل مبلغ و ثبت نتیجه sync.",
      },
    ],
  };

  if (paymentSuccess && !hasPrimaryKiyan) {
    return {
      ...baseSummary,
      currentStatus: "پرداخت موفق، اما فاکتور کیان ثبت نشده",
      reason:
        "این سفارش پرداخت موفق دارد ولی فروش اصلی آن در کیان ثبت نشده یا barcode ندارد.",
      recommendedAction: "ثبت فروش اصلی در کیان",
      afterAction:
        "بعد از ثبت، سفارش از صف مشکل‌دار کیان خارج می‌شود و barcode فاکتور ذخیره می‌شود.",
      primaryAction: {
        label: "ثبت فروش کیان",
        href: getSalesOrderKiyanSaleCreatePath(order.id),
        tone: "sky",
      },
    };
  }

  if (paymentFailed && hasPrimaryKiyan) {
    return {
      ...baseSummary,
      currentStatus: "پرداخت ناموفق، اما دارای فاکتور کیان",
      reason:
        "این حالت می‌تواند مغایرت مالی ایجاد کند؛ چون پرداخت موفق نیست ولی سند کیان وجود دارد.",
      recommendedAction: "بررسی مالی و تعیین تکلیف سند کیان",
      afterAction:
        "بعد از بررسی، سفارش باید اصلاح، لغو، یا برای پیگیری بیشتر علامت‌گذاری شود.",
      primaryAction: {
        label: "بررسی عملیات کیان",
        href: getSalesOrderKiyanSaleCreatePath(order.id),
        tone: "rose",
      },
    };
  }

  if (hasReturn && !returnBarcode) {
    return {
      ...baseSummary,
      currentStatus: "مرجوعی دارد، اما سند برگشت کیان ثبت نشده",
      reason:
        "برای این سفارش مرجوعی ثبت شده ولی هنوز barcode مرجوعی کیان مشخص نیست.",
      recommendedAction: "تکمیل مرجوعی و ثبت سند کیان",
      afterAction:
        "بعد از ثبت سند مرجوعی، اگر سفارش SnappPay باشد باید sync اسنپ هم بررسی شود.",
      primaryAction: {
        label: "ادامه مرجوعی",
        href: getSalesOrderReturnCreatePath(order.id),
        tone: "rose",
      },
    };
  }

  if (hasExchange && (!exchangeReturnBarcode || !exchangeSaleBarcode)) {
    return {
      ...baseSummary,
      currentStatus: "تعویض ناقص است",
      reason:
        "تعویض باید هم سند برگشت کالای قبلی و هم فاکتور فروش جایگزین داشته باشد.",
      recommendedAction: "تکمیل workflow تعویض",
      afterAction:
        "بعد از تکمیل تعویض، اگر سفارش SnappPay باشد باید آپدیت اسنپ انجام شود.",
      primaryAction: {
        label: "ادامه تعویض",
        href: getSalesOrderExchangeCreatePath(order.id),
        tone: "violet",
      },
    };
  }

  if (snappOrder && snappNeedsSync) {
    return {
      ...baseSummary,
      currentStatus: "SnappPay نیازمند sync است",
      reason:
        "این سفارش اسنپ است و بعد از مرجوعی، تعویض یا خطای قبلی هنوز sync کامل نشده است.",
      recommendedAction: "آپدیت اسنپ",
      afterAction:
        "بعد از آپدیت موفق، externalSync روی synced قرار می‌گیرد و پیگیری بسته می‌شود.",
      primaryAction: {
        label: "آپدیت اسنپ",
        href: getSalesOrderSnappUpdatePath(order.id),
        tone: "sky",
      },
    };
  }

  if (order.needsFollowUp) {
    return {
      ...baseSummary,
      currentStatus: "نیازمند پیگیری اپراتور",
      reason:
        "این سفارش برای پیگیری علامت‌گذاری شده و باید یادداشت‌ها، لاگ‌ها و وضعیت‌ها بررسی شوند.",
      recommendedAction: "بررسی یادداشت‌ها و تعیین اقدام بعدی",
      afterAction:
        "بعد از بررسی، می‌توان پیگیری را بست یا سفارش را به workflow مناسب هدایت کرد.",
      primaryAction: undefined,
    };
  }

  if (paymentSuccess && hasPrimaryKiyan && !hasReturn && !hasExchange) {
    return {
      ...baseSummary,
      currentStatus: "سفارش عادی و ثبت‌شده",
      reason:
        "پرداخت موفق است و فاکتور اصلی کیان هم ثبت شده؛ فعلاً عملیات فوری مشخص نیست.",
      recommendedAction: "فقط در صورت نیاز مرجوعی، تعویض یا پیگیری ثبت کن.",
      afterAction:
        "اگر عملیات جدیدی ثبت شود، وضعیت سفارش در همین صفحه و workspaceهای مربوطه دیده می‌شود.",
      primaryAction: undefined,
    };
  }

  return baseSummary;
}

function getAvailableActions(order: SalesOrder): OrderOperationalAction[] {
  const actions: OrderOperationalAction[] = [];

  actions.push({
    label: "ثبت فروش کیان",
    href: getSalesOrderKiyanSaleCreatePath(order.id),
    tone: "sky",
  });

  actions.push({
    label: "ثبت مرجوعی",
    href: getSalesOrderReturnCreatePath(order.id),
    tone: "rose",
  });

  actions.push({
    label: "ثبت تعویض",
    href: getSalesOrderExchangeCreatePath(order.id),
    tone: "violet",
  });

  if (isSnappOrder(order)) {
    actions.push({
      label: "آپدیت اسنپ",
      href: getSalesOrderSnappUpdatePath(order.id),
      tone: "sky",
    });
  }

  return actions;
}

function isPaymentSuccess(order: SalesOrder) {
  return order.status === "payment_success" || order.payment.statusCode === 100;
}

function isPaymentFailed(order: SalesOrder) {
  return order.status === "payment_failed" || order.payment.statusCode !== 100;
}

function isSnappOrder(order: SalesOrder) {
  return (
    order.payment.gateway === "snapp_pay" ||
    order.externalSync?.provider === "snapp_pay"
  );
}

function isSnappNeedsSync(order: SalesOrder) {
  if (!isSnappOrder(order)) return false;

  const syncStatus = order.externalSync?.status;

  if (
    syncStatus === "pending" ||
    syncStatus === "failed" ||
    syncStatus === "manual_review"
  ) {
    return true;
  }

  if (order.returnInfo?.status === "kiyan_return_registered") {
    return true;
  }

  if (order.exchangeInfo?.status === "kiyan_exchange_registered") {
    return true;
  }

  return false;
}

function hasReturnFlow(order: SalesOrder) {
  return Boolean(order.returnInfo && order.returnInfo.status !== "none");
}

function hasExchangeFlow(order: SalesOrder) {
  return Boolean(order.exchangeInfo && order.exchangeInfo.status !== "none");
}

function getPrimaryKiyanCode(order: SalesOrder) {
  if (order.kiyanInvoice?.status === "created" && order.kiyanInvoice.code) {
    return order.kiyanInvoice.code;
  }

  return order.kiyanDocuments?.find((doc) => doc.type === "primary")?.barcode;
}

function getReturnKiyanBarcode(order: SalesOrder) {
  return (
    order.returnInfo?.returnKiyanBarcode ||
    order.kiyanDocuments?.find((doc) => doc.type === "return")?.barcode
  );
}

function getExchangeReturnKiyanBarcode(order: SalesOrder) {
  return order.exchangeInfo?.returnKiyanBarcode;
}

function getExchangeSaleKiyanBarcode(order: SalesOrder) {
  return order.exchangeInfo?.replacementKiyanBarcode;
}

function getGatewayText(order: SalesOrder) {
  if (order.payment.gateway === "saman") return "سامان";
  if (order.payment.gateway === "mellat") return "ملت";
  if (order.payment.gateway === "snapp_pay") return "SnappPay";
  if (order.payment.gateway === "medisa") return "مدیسه";
  if (order.payment.gateway === "wallet") return "کیف پول";

  return "نامشخص";
}