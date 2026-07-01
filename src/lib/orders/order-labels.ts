import type {
  SalesOrderExchangeStatus,
  SalesOrderExternalSyncProvider,
  SalesOrderExternalSyncStatus,
  SalesOrderKiyanInvoiceStatus,
  SalesOrderPaymentGateway,
  SalesOrderReturnStatus,
  SalesOrderStatus,
  SalesOrderType,
} from "@/types/sales-order";

export function getGatewayLabel(gateway: SalesOrderPaymentGateway) {
  switch (gateway) {
    case "saman":
      return "سامان";
    case "mellat":
      return "ملت";
    case "snapp_pay":
      return "اسنپ‌پی";
    case "medisa":
      return "مدیسه";
    case "wallet":
      return "کیف پول";
    case "unknown":
    default:
      return "نامشخص";
  }
}

export function getStatusLabel(status: SalesOrderStatus) {
  switch (status) {
    case "payment_success":
      return "پرداخت موفق";
    case "payment_failed":
      return "پرداخت ناموفق";
    case "payment_pending":
      return "در انتظار پرداخت";
    case "processing":
      return "در حال پردازش";
    case "sent":
      return "ارسال شده";
    case "cancelled":
      return "لغو شده";
    case "returned":
      return "مرجوع شده";
    default:
      return "نامشخص";
  }
}

export function getOrderTypeLabel(type: SalesOrderType) {
  switch (type) {
    case "site":
      return "سایت";
    case "medisa":
      return "مدیسه";
    case "snapp_pay":
      return "اسنپ‌پی";
    case "manual":
      return "دستی";
    default:
      return "نامشخص";
  }
}

export function getKiyanStatusLabel(status: SalesOrderKiyanInvoiceStatus) {
  switch (status) {
    case "created":
      return "ثبت شده";
    case "missing":
      return "ثبت نشده";
    case "not_required":
      return "نیاز ندارد";
    default:
      return "نامشخص";
  }
}

export function getReturnStatusLabel(status: SalesOrderReturnStatus) {
  switch (status) {
    case "none":
      return "مرجوعی ندارد";
    case "requested":
      return "درخواست مرجوعی ثبت شده";
    case "approved":
      return "مرجوعی تایید شده";
    case "kiyan_return_registered":
      return "فاکتور مرجوعی کیان ثبت شده";
    case "completed":
      return "مرجوعی تکمیل شده";
    case "cancelled":
      return "مرجوعی لغو شده";
    default:
      return "وضعیت مرجوعی نامشخص";
  }
}

export function getExchangeStatusLabel(status: SalesOrderExchangeStatus) {
  switch (status) {
    case "none":
      return "تعویض ندارد";
    case "requested":
      return "درخواست تعویض ثبت شده";
    case "processing":
      return "تعویض در حال پردازش است";
    case "replacement_order_created":
      return "سفارش جایگزین ساخته شده";
    case "kiyan_exchange_registered":
      return "فاکتور تعویضی کیان ثبت شده";
    case "completed":
      return "تعویض تکمیل شده";
    case "cancelled":
      return "تعویض لغو شده";
    case "needs_review":
      return "تعویض نیازمند بررسی است";
    default:
      return "وضعیت تعویض نامشخص";
  }
}

export function getExternalSyncStatusLabel(
  status: SalesOrderExternalSyncStatus
) {
  switch (status) {
    case "not_required":
      return "نیاز ندارد";
    case "pending":
      return "در انتظار بروزرسانی";
    case "synced":
      return "سینک شده";
    case "failed":
      return "خطا در سینک";
    case "manual_review":
      return "بررسی دستی";
    default:
      return "نامشخص";
  }
}

export function getExternalProviderLabel(
  provider: SalesOrderExternalSyncProvider
) {
  switch (provider) {
    case "snapp_pay":
      return "اسنپ‌پی";
    case "medisa":
      return "مدیسه";
    case "kiyan":
      return "کیان";
    case "none":
      return "بدون سرویس";
    default:
      return "سرویس خارجی";
  }
}