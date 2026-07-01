import { env } from "@/lib/env";
import { ApiError } from "@/lib/api/api-error";

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue | QueryValue[]>;

type ParseAs = "json" | "text" | "blob" | "void";

interface HttpRequestOptions<TBody = unknown>
  extends Omit<RequestInit, "body"> {
  body?: TBody;
  query?: QueryParams;
  token?: string | null;
  auth?: boolean;
  timeoutMs?: number;
  parseAs?: ParseAs;
}

const DEFAULT_TIMEOUT_MS = 30_000;

let tokenResolver: (() => string | null) | null = null;

export function setApiTokenResolver(resolver: (() => string | null) | null) {
  tokenResolver = resolver;
}

export async function apiRequest<TResponse = unknown, TBody = unknown>(
  endpoint: string,
  options: HttpRequestOptions<TBody> = {}
): Promise<TResponse> {
  const {
    body,
    query,
    token,
    auth = false,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    parseAs = "json",
    headers,
    method = "GET",
    ...requestInit
  } = options;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const finalToken = token ?? (auth ? tokenResolver?.() ?? null : null);

    const response = await fetch(buildUrl(endpoint, query), {
      ...requestInit,
      method,
      headers: buildHeaders(headers, body, finalToken),
      body: buildBody(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw await createApiError(response);
    }

    return parseResponse<TResponse>(response, parseAs);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError({
        status: 408,
        message: "زمان پاسخ‌گویی سرور به پایان رسید.",
        code: "REQUEST_TIMEOUT",
      });
    }

    throw new ApiError({
      status: 0,
      message:
        error instanceof Error
          ? error.message
          : "ارتباط با سرور برقرار نشد.",
      code: "NETWORK_ERROR",
      payload: error,
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

export const httpClient = {
  get<TResponse = unknown>(
    endpoint: string,
    options?: Omit<HttpRequestOptions, "method" | "body">
  ) {
    return apiRequest<TResponse>(endpoint, {
      ...options,
      method: "GET",
    });
  },

  post<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: Omit<HttpRequestOptions<TBody>, "method" | "body">
  ) {
    return apiRequest<TResponse, TBody>(endpoint, {
      ...options,
      method: "POST",
      body,
    });
  },

  put<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: Omit<HttpRequestOptions<TBody>, "method" | "body">
  ) {
    return apiRequest<TResponse, TBody>(endpoint, {
      ...options,
      method: "PUT",
      body,
    });
  },

  patch<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: Omit<HttpRequestOptions<TBody>, "method" | "body">
  ) {
    return apiRequest<TResponse, TBody>(endpoint, {
      ...options,
      method: "PATCH",
      body,
    });
  },

  delete<TResponse = unknown>(
    endpoint: string,
    options?: Omit<HttpRequestOptions, "method" | "body">
  ) {
    return apiRequest<TResponse>(endpoint, {
      ...options,
      method: "DELETE",
    });
  },
};

function buildUrl(endpoint: string, query?: QueryParams) {
  const baseUrl = env.apiBaseUrl;

  const isAbsolute =
    endpoint.startsWith("http://") || endpoint.startsWith("https://");

  const url = isAbsolute
    ? endpoint
    : `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const queryString = buildQueryString(query);

  return `${url}${queryString}`;
}

function buildQueryString(query?: QueryParams) {
  if (!query) return "";

  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item));
        }
      });

      return;
    }

    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

function buildHeaders(
  headers: HeadersInit | undefined,
  body: unknown,
  token: string | null
): HeadersInit {
  const finalHeaders = new Headers(headers);

  if (!finalHeaders.has("Accept")) {
    finalHeaders.set("Accept", "application/json");
  }

  if (token) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  if (body && shouldSendJson(body) && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  return finalHeaders;
}

function buildBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;

  if (shouldSendJson(body)) {
    return JSON.stringify(body);
  }

  return body as BodyInit;
}

function shouldSendJson(body: unknown) {
  if (!body) return false;

  return !(
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    body instanceof URLSearchParams
  );
}

async function parseResponse<TResponse>(
  response: Response,
  parseAs: ParseAs
): Promise<TResponse> {
  if (parseAs === "void" || response.status === 204) {
    return undefined as TResponse;
  }

  if (parseAs === "text") {
    return response.text() as Promise<TResponse>;
  }

  if (parseAs === "blob") {
    return response.blob() as Promise<TResponse>;
  }

  const text = await response.text();

  if (!text) {
    return undefined as TResponse;
  }

  return JSON.parse(text) as TResponse;
}

async function createApiError(response: Response) {
  const payload = await safeParseErrorPayload(response);

  const message =
    payload?.message ||
    getFallbackErrorMessage(response.status) ||
    "خطای نامشخصی از سمت سرور رخ داد.";

  return new ApiError({
    status: response.status,
    message,
    code: payload?.code,
    errors: payload?.errors,
    details: payload?.details,
    payload,
  });
}

async function safeParseErrorPayload(response: Response) {
  try {
    const text = await response.text();

    if (!text) return null;

    return JSON.parse(text) as {
      message?: string;
      code?: string;
      errors?: unknown;
      details?: unknown;
    };
  } catch {
    return null;
  }
}

function getFallbackErrorMessage(status: number) {
  switch (status) {
    case 400:
      return "درخواست نامعتبر است.";
    case 401:
      return "برای ادامه باید وارد حساب کاربری شوید.";
    case 403:
      return "شما دسترسی لازم برای انجام این عملیات را ندارید.";
    case 404:
      return "منبع مورد نظر پیدا نشد.";
    case 422:
      return "اطلاعات ارسال‌شده معتبر نیست.";
    case 500:
      return "خطای داخلی سرور رخ داده است.";
    default:
      return null;
  }
}