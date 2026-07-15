import type { SalesOrderProduct } from "@/types/sales-order";

export type SnappUpdateCurrency = "IRR";
export type SnappUpdateRequestMode = "simulate";
export type SnappOrdersServiceMode = "mock" | "api";

export type SnappUpdateResponseCategory = "success" | "error" | "warning";

export interface SnappBasketDraftItem {
  id: string;
  sourceProductId?: string;
  productCode: string;
  snappProductId: string;
  name: string;
  category: string;
  color?: string;
  size?: string;
  count: number;
  unitAmountRial: number;
}

export interface SnappUpdateParameter {
  amount: number;
  category: string;
  count: number;
  id: string;
  name: string;
}

export interface SnappUpdatePayload {
  order_id: number | string;
  user_id: number | string;
  payment_token: string;
  all_amount: number;
  currency: SnappUpdateCurrency;
  computed_amount: number;
  override_amount: number;
  difference: number;
  parameters: SnappUpdateParameter[];
  mode: SnappUpdateRequestMode;
}

export interface SnappUpdateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SnappUpdateApiResponse {
  success: boolean;
  category: SnappUpdateResponseCategory;
  message: string;
  data?: {
    order_id?: number | string;
    payment_token?: string;
    amount?: number;
    payment_page_url?: string;
    transaction_id?: string;
    technical_log?: unknown;
  };
}

export interface SnappProductSearchResult extends Partial<SalesOrderProduct> {
  id: string | number;
  jpa_id?: string;
  title: string;
  catName?: string;
  catNick?: string;
  barcode?: string;
  price?: number | string;
  price_total?: number | string;
  discount?: number | string;
}