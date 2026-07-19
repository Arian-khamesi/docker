import { ApiError } from "@/lib/api/api-error";

export interface ApiEnvelope<TData> {
  ok?: boolean;
  success?: boolean;
  message?: string;
  data?: TData;
  errors?: unknown;
  [key: string]: unknown;
}

export function unwrapApiData<TData>(
  response: ApiEnvelope<TData>,
  fallbackMessage = "عملیات با خطا مواجه شد."
): TData {
  const statusFlag = response?.ok ?? response?.success;

  if (statusFlag === false) {
    throw new ApiError({
      status: 200,
      code: "API_RESPONSE_NOT_OK",
      message: response?.message || fallbackMessage,
      errors: response?.errors,
      payload: response,
    });
  }

  if (response.data === undefined || response.data === null) {
    throw new ApiError({
      status: 500,
      code: "API_RESPONSE_DATA_MISSING",
      message: "داده مورد انتظار از سمت سرور دریافت نشد.",
      payload: response,
    });
  }

  return response.data;
}