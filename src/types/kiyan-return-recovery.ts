export type KiyanReturnRecoveryServiceMode = "mock" | "api";

export type KiyanReturnFailureReason =
  | "source_invoice_missing"
  | "source_invoice_not_found"
  | "item_not_returnable"
  | "item_mapping_missing"
  | "quantity_exceeds_available"
  | "return_already_registered"
  | "kiyan_service_error"
  | "network_error"
  | "unknown";

export type KiyanReturnMockScenario = "success" | KiyanReturnFailureReason;

export interface KiyanReturnRecoveryItemDraft {
  id: string;
  title: string;
  parentProductCode: string;
  variantBarcode: string;
  color?: string;
  size?: string;
  receiptItemId: string;
  orderedQuantity: number;
  alreadyReturnedQuantity: number;
  availableQuantity: number;
  requestedQuantity: number;
  priceToman: number;
}

export interface KiyanReturnRecoveryDraft {
  sourceReceiptBarcode: string;
  operatorId: number;
  retailstoreId: number;
  workstationId: number;
  transactionSequence: number;
  businessDayDate: string;
  items: KiyanReturnRecoveryItemDraft[];
  warnings: string[];
}

export interface KiyanReturnRecoveryResolutionPatch {
  sourceReceiptBarcode?: string;
  operatorId?: number;
  retailstoreId?: number;
  workstationId?: number;
  transactionSequence?: number;
  businessDayDate?: string;
  existingReturnReceiptBarcode?: string;
  itemMappings?: Record<string, string>;
}

export interface KiyanReturnRecoveryPayload {
  operatorId: number;
  retailstoreId: number;
  workstationId: number;
  transactionSequence: number;
  businessDayDate: string;
  returnInfo: {
    itemId: number;
    quantity: number;
  }[];
}

export interface KiyanReturnRecoveryValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface KiyanReturnRecoveryResponse {
  success: boolean;
  category: "success" | "error";
  message: string;
  data?: {
    returnReceiptBarcode?: string;
    existingReturnReceiptBarcode?: string;
    failureReason?: KiyanReturnFailureReason;
    technicalMessage?: string;
    problemItemBarcode?: string;
    problemReceiptBarcode?: string;
  };
}