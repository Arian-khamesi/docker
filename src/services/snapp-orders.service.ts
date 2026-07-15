import type {
  SnappOrdersServiceMode,
  SnappUpdateApiResponse,
  SnappUpdatePayload,
} from "@/types/snapp-order";

interface SnappServiceOptions {
  mode?: SnappOrdersServiceMode;
  signal?: AbortSignal;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const SNAPP_API_CONTRACT = {
  getOrderReceiptDetail: "/snapp/orders/receipt-detail",
  getProductDetail: "/snapp/products/detail",
  updateTransactionByAdmin: "/snapp/orders/update-transaction",
} as const;

export const SNAPP_LEGACY_ENDPOINTS = {
  getOrderReceiptDetail: "liang/getOrderReceiptDetailSnapp",
  getProductDetail: "liang/get_product_detail",
  updateTransactionByAdmin: "liang/update_snapp_transaction_by_admin",
} as const;

export const snappOrdersService = {
  updateTransaction,
};

async function updateTransaction(
  payload: SnappUpdatePayload,
  options: SnappServiceOptions = {}
): Promise<SnappUpdateApiResponse> {
  const mode = options.mode ?? "mock";

  if (mode === "mock") {
    return mockUpdateTransaction(payload);
  }

  return postJson<SnappUpdateApiResponse>(
    SNAPP_API_CONTRACT.updateTransactionByAdmin,
    payload,
    options.signal
  );
}

async function postJson<T>(
  path: string,
  payload: unknown,
  signal?: AbortSignal
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as T | null;

  if (!response.ok) {
    throw new Error(
      extractApiErrorMessage(data) || `Request failed with status ${response.status}`
    );
  }

  if (!data) {
    throw new Error("Empty API response.");
  }

  return normalizeSnappUpdateResponse(data);
}

function mockUpdateTransaction(
  payload: SnappUpdatePayload
): Promise<SnappUpdateApiResponse> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      if (!payload.payment_token) {
        resolve({
          success: false,
          category: "error",
          message: "payment_token نامعتبر است.",
        });

        return;
      }

      if (!payload.parameters.length) {
        resolve({
          success: false,
          category: "error",
          message: "سبد جدید اسنپ خالی است.",
        });

        return;
      }

      resolve({
        success: true,
        category: "success",
        message: "آپدیت سفارش اسنپ با موفقیت شبیه‌سازی شد.",
        data: {
          order_id: payload.order_id,
          payment_token: payload.payment_token,
          amount: payload.all_amount / 10,
          transaction_id: `mock-snapp-${payload.order_id}-${Date.now()}`,
          technical_log: {
            mode: payload.mode,
            computed_amount: payload.computed_amount,
            override_amount: payload.override_amount,
            difference: payload.difference,
            parameters_count: payload.parameters.length,
          },
        },
      });
    }, 450);
  });
}

function normalizeSnappUpdateResponse<T>(response: T): T {
  return response;
}

function extractApiErrorMessage(data: unknown) {
  if (!data || typeof data !== "object") return "";

  const maybeData = data as {
    message?: string;
    error?: string;
  };

  return maybeData.message || maybeData.error || "";
}