import type {
  KiyanSaleFailureReason,
  KiyanSaleMockScenario,
  KiyanSaleRecoveryPayload,
  KiyanSaleRecoveryResolutionPatch,
  KiyanSaleRecoveryResponse,
  KiyanSaleRecoveryServiceMode,
} from "@/types/kiyan-sale-recovery";

interface RegisterKiyanSaleOptions {
  mode?: KiyanSaleRecoveryServiceMode;
  mockScenario?: KiyanSaleMockScenario;
  patch?: KiyanSaleRecoveryResolutionPatch;
  signal?: AbortSignal;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const KIYAN_SALE_RECOVERY_API_CONTRACT = {
  registerSiteOrderSale: "/kiyan/sale/recovery",
  syncCustomer: "/kiyan/customers/sync",
  resolveItemMapping: "/kiyan/products/mapping",
  getExistingInvoice: "/kiyan/sale/existing-invoice",
} as const;

export const kiyanSaleRecoveryService = {
  registerSiteOrderSale,
};

async function registerSiteOrderSale(
  payload: KiyanSaleRecoveryPayload,
  options: RegisterKiyanSaleOptions = {}
): Promise<KiyanSaleRecoveryResponse> {
  const mode = options.mode ?? "mock";

  if (mode === "mock") {
    return mockRegisterSiteOrderSale(payload, options.mockScenario ?? "success", options.patch);
  }

  const response = await fetch(
    `${API_BASE_URL}${KIYAN_SALE_RECOVERY_API_CONTRACT.registerSiteOrderSale}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payload,
        resolutionPatch: options.patch,
      }),
      signal: options.signal,
    }
  );

  const data = (await response.json().catch(() => null)) as
    | KiyanSaleRecoveryResponse
    | null;

  if (!response.ok) {
    return {
      success: false,
      category: "error",
      message: data?.message ?? "ثبت فروش کیان ناموفق بود.",
      data: data?.data ?? {
        failureReason: "kiyan_service_error",
      },
    };
  }

  return (
    data ?? {
      success: false,
      category: "error",
      message: "پاسخ سرویس کیان قابل خواندن نیست.",
      data: {
        failureReason: "unknown",
      },
    }
  );
}

async function mockRegisterSiteOrderSale(
  payload: KiyanSaleRecoveryPayload,
  scenario: KiyanSaleMockScenario,
  patch?: KiyanSaleRecoveryResolutionPatch
): Promise<KiyanSaleRecoveryResponse> {
  await new Promise((resolve) => setTimeout(resolve, 700));

  if (scenario === "success") {
    return createSuccessResponse(payload.uniqueInfo);
  }

  if (isScenarioResolved(scenario, patch)) {
    if (scenario === "duplicate_invoice" && patch?.existingSaleReceiptBarcode) {
      return {
        success: true,
        category: "success",
        message: "barcode فاکتور موجود روی سفارش ذخیره شد.",
        data: {
          saleReceiptBarcode: patch.existingSaleReceiptBarcode,
          existingSaleReceiptBarcode: patch.existingSaleReceiptBarcode,
        },
      };
    }

    return createSuccessResponse(payload.uniqueInfo);
  }

  return createFailureResponse(scenario, payload);
}

function createSuccessResponse(uniqueInfo: string): KiyanSaleRecoveryResponse {
  return {
    success: true,
    category: "success",
    message: "فاکتور فروش کیان با موفقیت ثبت شد.",
    data: {
      saleReceiptBarcode: `KYN-${uniqueInfo}-${Date.now().toString().slice(-6)}`,
    },
  };
}

function createFailureResponse(
  reason: KiyanSaleFailureReason,
  payload: KiyanSaleRecoveryPayload
): KiyanSaleRecoveryResponse {
  const problemItem = payload.saleTransactionItemInformation.find(
    (item) => !item.itemId || item.itemId <= 0
  );

  return {
    success: false,
    category: "error",
    message: getMockFailureMessage(reason),
    data: {
      failureReason: reason,
      technicalMessage: `Mock Kiyan failure: ${reason}`,
      problemItemBarcode: problemItem ? String(problemItem.itemId) : undefined,
      problemCustomerId: payload.customerId,
    },
  };
}

function isScenarioResolved(
  scenario: KiyanSaleFailureReason,
  patch?: KiyanSaleRecoveryResolutionPatch
) {
  if (scenario === "customer_not_found") {
    return Boolean(patch?.syncedCustomerId);
  }

  if (scenario === "gift_card_expired" || scenario === "gift_card_invalid") {
    return Boolean(patch?.giftCardCode);
  }

  if (scenario === "insufficient_credit") {
    return Boolean(patch?.creditApproved);
  }

  if (scenario === "item_not_found" || scenario === "item_mapping_missing") {
    return Boolean(patch?.itemMappings && Object.keys(patch.itemMappings).length);
  }

  if (scenario === "duplicate_invoice") {
    return Boolean(patch?.existingSaleReceiptBarcode);
  }

  return false;
}

function getMockFailureMessage(reason: KiyanSaleFailureReason) {
  if (reason === "customer_not_found") {
    return "مشتری در کیان پیدا نشد.";
  }

  if (reason === "gift_card_expired") {
    return "بن تخفیف منقضی شده است.";
  }

  if (reason === "gift_card_invalid") {
    return "بن تخفیف معتبر نیست.";
  }

  if (reason === "insufficient_credit") {
    return "اعتبار مشتری کافی نیست.";
  }

  if (reason === "item_not_found") {
    return "کالا در کیان پیدا نشد.";
  }

  if (reason === "item_mapping_missing") {
    return "mapping کالا برای کیان کامل نیست.";
  }

  if (reason === "stock_not_enough") {
    return "موجودی کیان کافی نیست.";
  }

  if (reason === "payment_mismatch") {
    return "اطلاعات پرداخت با کیان همخوانی ندارد.";
  }

  if (reason === "duplicate_invoice") {
    return "این سفارش قبلاً در کیان ثبت شده است.";
  }

  if (reason === "network_error") {
    return "ارتباط با کیان برقرار نشد.";
  }

  return "خطای نامشخص در ثبت کیان رخ داد.";
}