import type {
  KiyanReturnFailureReason,
  KiyanReturnMockScenario,
  KiyanReturnRecoveryPayload,
  KiyanReturnRecoveryResolutionPatch,
  KiyanReturnRecoveryResponse,
  KiyanReturnRecoveryServiceMode,
} from "@/types/kiyan-return-recovery";

interface RegisterKiyanReturnOptions {
  mode?: KiyanReturnRecoveryServiceMode;
  mockScenario?: KiyanReturnMockScenario;
  patch?: KiyanReturnRecoveryResolutionPatch;
  sourceReceiptBarcode?: string;
  signal?: AbortSignal;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const KIYAN_RETURN_RECOVERY_API_CONTRACT = {
  registerReturnItems: "/kiyan/sale/return-items",
  getReceiptHeader: "/kiyan/sale/receipt-header",
  getExistingReturn: "/kiyan/sale/existing-return",
} as const;

export const kiyanReturnRecoveryService = {
  registerReturnItems,
};

async function registerReturnItems(
  payload: KiyanReturnRecoveryPayload,
  options: RegisterKiyanReturnOptions = {}
): Promise<KiyanReturnRecoveryResponse> {
  const mode = options.mode ?? "mock";

  if (mode === "mock") {
    return mockRegisterReturnItems(
      payload,
      options.mockScenario ?? "success",
      options.patch,
      options.sourceReceiptBarcode
    );
  }

  const response = await fetch(
    `${API_BASE_URL}${KIYAN_RETURN_RECOVERY_API_CONTRACT.registerReturnItems}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourceReceiptBarcode: options.sourceReceiptBarcode,
        payload,
        resolutionPatch: options.patch,
      }),
      signal: options.signal,
    }
  );

  const data = (await response.json().catch(() => null)) as
    | KiyanReturnRecoveryResponse
    | null;

  if (!response.ok) {
    return {
      success: false,
      category: "error",
      message: data?.message ?? "ثبت سند مرجوعی کیان ناموفق بود.",
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

async function mockRegisterReturnItems(
  payload: KiyanReturnRecoveryPayload,
  scenario: KiyanReturnMockScenario,
  patch?: KiyanReturnRecoveryResolutionPatch,
  sourceReceiptBarcode?: string
): Promise<KiyanReturnRecoveryResponse> {
  await new Promise((resolve) => setTimeout(resolve, 700));

  if (scenario === "success") {
    return createSuccessResponse(sourceReceiptBarcode);
  }

  if (isScenarioResolved(scenario, patch)) {
    if (
      scenario === "return_already_registered" &&
      patch?.existingReturnReceiptBarcode
    ) {
      return {
        success: true,
        category: "success",
        message: "barcode سند مرجوعی موجود روی سفارش ذخیره شد.",
        data: {
          returnReceiptBarcode: patch.existingReturnReceiptBarcode,
          existingReturnReceiptBarcode: patch.existingReturnReceiptBarcode,
        },
      };
    }

    return createSuccessResponse(sourceReceiptBarcode);
  }

  return createFailureResponse(scenario, payload, sourceReceiptBarcode);
}

function createSuccessResponse(sourceReceiptBarcode?: string): KiyanReturnRecoveryResponse {
  return {
    success: true,
    category: "success",
    message: "سند مرجوعی کیان با موفقیت ثبت شد.",
    data: {
      returnReceiptBarcode: `KYN-RETURN-${sourceReceiptBarcode || "NO-SRC"}-${Date.now()
        .toString()
        .slice(-6)}`,
    },
  };
}

function createFailureResponse(
  reason: KiyanReturnFailureReason,
  payload: KiyanReturnRecoveryPayload,
  sourceReceiptBarcode?: string
): KiyanReturnRecoveryResponse {
  return {
    success: false,
    category: "error",
    message: getMockFailureMessage(reason),
    data: {
      failureReason: reason,
      technicalMessage: `Mock Kiyan return failure: ${reason}`,
      problemItemBarcode: payload.returnInfo[0]?.itemId
        ? String(payload.returnInfo[0].itemId)
        : undefined,
      problemReceiptBarcode: sourceReceiptBarcode,
    },
  };
}

function isScenarioResolved(
  scenario: KiyanReturnFailureReason,
  patch?: KiyanReturnRecoveryResolutionPatch
) {
  if (scenario === "source_invoice_missing" || scenario === "source_invoice_not_found") {
    return Boolean(patch?.sourceReceiptBarcode);
  }

  if (scenario === "item_mapping_missing") {
    return Boolean(patch?.itemMappings && Object.keys(patch.itemMappings).length);
  }

  if (scenario === "return_already_registered") {
    return Boolean(patch?.existingReturnReceiptBarcode);
  }

  return false;
}

function getMockFailureMessage(reason: KiyanReturnFailureReason) {
  if (reason === "source_invoice_missing") {
    return "فاکتور فروش اصلی برای ثبت مرجوعی مشخص نیست.";
  }

  if (reason === "source_invoice_not_found") {
    return "فاکتور فروش اصلی در کیان پیدا نشد.";
  }

  if (reason === "item_not_returnable") {
    return "یکی از آیتم‌ها قابل مرجوعی نیست.";
  }

  if (reason === "quantity_exceeds_available") {
    return "تعداد مرجوعی بیشتر از مقدار قابل برگشت است.";
  }

  if (reason === "item_mapping_missing") {
    return "mapping آیتم برای کیان کامل نیست.";
  }

  if (reason === "return_already_registered") {
    return "این مرجوعی قبلاً در کیان ثبت شده است.";
  }

  if (reason === "network_error") {
    return "ارتباط با کیان برقرار نشد.";
  }

  return "خطای نامشخص در ثبت مرجوعی کیان رخ داد.";
}