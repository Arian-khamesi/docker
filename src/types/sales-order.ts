export type SalesOrderPaymentGateway =
  | "saman"
  | "mellat"
  | "snapp_pay"
  | "medisa"
  | "wallet"
  | "unknown";

export type SalesOrderStatus =
  | "payment_success"
  | "payment_failed"
  | "payment_pending"
  | "processing"
  | "sent"
  | "cancelled"
  | "returned";

export type SalesOrderType = "site" | "medisa" | "snapp_pay" | "manual";

export type SalesOrderKiyanInvoiceStatus =
  | "created"
  | "missing"
  | "not_required";

export interface SalesOrderProduct {
  id: string;
  title: string;
  productCode: string;
  barcode: string;
  color?: string;
  size?: string;
  quantity: number;
  thumbnailUrl?: string;
}

export interface SalesOrderCustomer {
  fullName: string;
  mobile: string;
  city: string;
  province?: string;
}

export interface SalesOrderPayment {
  gateway: SalesOrderPaymentGateway;
  statusCode: number;
  paidAmount: number;
  paidAt?: string;
  trackingCode?: string;
}

export interface SalesOrderShipping {
  method: string;
  trackingCode?: string;
}

export interface SalesOrderKiyanInvoice {
  status: SalesOrderKiyanInvoiceStatus;
  code?: string;
}

export interface SalesOrder {
  id: number;
  externalOrderId?: string;
  medisaCode?: string;

  createdAt: string;
  gregorianDate: string;
  displayDate: string;

  status: SalesOrderStatus;
  type: SalesOrderType;

  customer: SalesOrderCustomer;
  payment: SalesOrderPayment;
  shipping: SalesOrderShipping;
  kiyanInvoice: SalesOrderKiyanInvoice;

  products: SalesOrderProduct[];

  totalAmount: number;
  payableAmount: number;
  paidAmount: number;

  accountingStatus?: SalesOrderAccountingStatus;
  needsFollowUp?: boolean;
  kiyanDocuments?: SalesOrderKiyanDocument[];
  returnInfo?: SalesOrderReturnInfo;
  exchangeInfo?: SalesOrderExchangeInfo;
  externalSync?: SalesOrderExternalSyncInfo;
  operatorNotes?: SalesOrderOperatorNote[];
  actionLogs?: SalesOrderActionLog[];

  notes?: string;
}

export interface SalesOrderDailySummary {
  ordersToday: number;
  salesToday: number;
  successfulPaymentsToday: number;
  pendingOrFailedToday: number;
  missingKiyanInvoiceToday: number;
}

export type SalesOrderAccountingStatus =
  | "not_registered"
  | "registered"
  | "cancelled"
  | "return_registered"
  | "exchange_registered"
  | "needs_review";

export type SalesOrderReturnStatus =
  | "none"
  | "requested"
  | "approved"
  | "kiyan_return_registered"
  | "completed"
  | "cancelled";

export type SalesOrderExchangeStatus =
  | "none"
  | "requested"
  | "processing"
  | "replacement_order_created"
  | "kiyan_exchange_registered"
  | "completed"
  | "cancelled"
  | "needs_review";

export type SalesOrderExchangeDirection = "down" | "equal" | "up";

export type SalesOrderExternalSyncProvider =
  | "snapp_pay"
  | "medisa"
  | "kiyan"
  | "none";

export type SalesOrderExternalSyncStatus =
  | "not_required"
  | "pending"
  | "synced"
  | "failed"
  | "manual_review";

export type SalesOrderKiyanDocumentType =
  | "primary"
  | "return"
  | "exchange";

export type SalesOrderActionType =
  | "payment_recheck"
  | "kiyan_primary_registered"
  | "kiyan_return_registered"
  | "kiyan_exchange_registered"
  | "kiyan_cancelled"
  | "return_requested"
  | "return_completed"
  | "exchange_requested"
  | "exchange_completed"
  | "shipping_tracking_updated"
  | "external_sync_updated"
  | "operator_note_added"
  | "follow_up_marked"
  | "follow_up_resolved";

export interface SalesOrderKiyanDocument {
  id: string;
  type: SalesOrderKiyanDocumentType;
  status: SalesOrderAccountingStatus;
  barcode?: string;
  relatedOrderId?: number;
  createdAt?: string;
  cancelledAt?: string;
  description?: string;
}

export interface SalesOrderReturnItem {
  productId: string;
  quantity: number;
}

export interface SalesOrderReturnInfo {
  status: SalesOrderReturnStatus;
  returnKiyanBarcode?: string;
  reason?: string;
  createdAt?: string;
  completedAt?: string;
  returnedProductIds: string[];
  returnedItems?: SalesOrderReturnItem[];
  returnedAmount?: number;
}

export interface SalesOrderExchangeInfo {
  status: SalesOrderExchangeStatus;
  originalOrderId: number;
  replacementOrderId?: number;
  replacementOrderNumber?: string;
  returnKiyanBarcode?: string;
  replacementKiyanBarcode?: string;
  returnedProductIds: string[];
  returnedItems?: SalesOrderReturnItem[];
  replacementProducts: SalesOrderProduct[];
  amountDirection: SalesOrderExchangeDirection;
  amountDifference: number;
  createdAt?: string;
  completedAt?: string;
}

export interface SalesOrderExternalSyncInfo {
  provider: SalesOrderExternalSyncProvider;
  status: SalesOrderExternalSyncStatus;
  lastSyncedAt?: string;
  failedReason?: string;
  shouldSyncProducts?: boolean;
  shouldSyncAmount?: boolean;
}

export interface SalesOrderOperatorNote {
  id: string;
  message: string;
  createdAt: string;
  createdBy?: string;
}

export interface SalesOrderActionLog {
  id: string;
  type: SalesOrderActionType;
  title: string;
  description?: string;
  createdAt: string;
  createdBy?: string;
}