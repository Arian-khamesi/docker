export type KiyanSaleRecoveryServiceMode = "mock" | "api";

export type KiyanSaleFailureReason =
  | "customer_not_found"
  | "gift_card_expired"
  | "gift_card_invalid"
  | "insufficient_credit"
  | "item_not_found"
  | "item_mapping_missing"
  | "stock_not_enough"
  | "payment_mismatch"
  | "duplicate_invoice"
  | "kiyan_service_error"
  | "network_error"
  | "unknown";

export type KiyanSaleMockScenario = "success" | KiyanSaleFailureReason;

export interface KiyanSaleRecoveryItemDraft {
  id: string;
  title: string;
  parentProductCode: string;
  variantBarcode: string;
  color?: string;
  size?: string;
  kiyanItemId: string;
  quantity: number;
  priceToman: number;
  priceWithDiscountToman: number;
  usedFallbackPrice?: boolean;
}

export interface KiyanSaleRecoveryPaymentDraft {
  id: string;
  tenderId: string;
  title: string;
  amountToman: number;
  serialNumber: string;
  giftCardCode?: string;
}

export interface KiyanSaleRecoveryDraft {
  uniqueInfo: string;
  customerId: string;
  items: KiyanSaleRecoveryItemDraft[];
  payments: KiyanSaleRecoveryPaymentDraft[];
  warnings: string[];
}

export interface KiyanSaleRecoveryResolutionPatch {
  giftCardCode?: string;
  syncedCustomerId?: string;
  creditApproved?: boolean;
  existingSaleReceiptBarcode?: string;
  itemMappings?: Record<string, string>;
}

export interface KiyanSaleRecoveryPayload {
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

export interface KiyanSaleRecoveryValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface KiyanSaleRecoveryResponse {
  success: boolean;
  category: "success" | "error";
  message: string;
  data?: {
    saleReceiptBarcode?: string;
    existingSaleReceiptBarcode?: string;
    failureReason?: KiyanSaleFailureReason;
    technicalMessage?: string;
    problemItemBarcode?: string;
    problemCustomerId?: string;
  };
}