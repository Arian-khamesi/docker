import { env } from "@/lib/env";
import { ApiError } from "@/lib/api/api-error";
import {
  getApiEndpointDefinition,
  type ApiEndpointKey,
} from "@/lib/api/endpoints/index";
import {
  buildQueryString,
  resolvePathParams,
} from "@/lib/api/endpoint-resolver";
import type {
  ApiBaseTarget,
  PathParams,
  QueryParams,
} from "@/lib/api/endpoint.types";

import { getResolvedEndpointDefinition } from "@/lib/api/remote-endpoint-registry";

type ParseAs = "json" | "text" | "blob" | "void";

interface HttpRequestOptions<TBody = unknown>
  extends Omit<RequestInit, "body"> {
  body?: TBody;
  query?: QueryParams;
  pathParams?: PathParams;
  token?: string | null;
  auth?: boolean;
  base?: ApiBaseTarget;
  timeoutMs?: number;
  parseAs?: ParseAs;
}

interface EndpointRequestOptions<TBody = unknown>
  extends Omit<HttpRequestOptions<TBody>, "method" | "base"> {
  method?: never;
  base?: never;
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
    pathParams,
    token,
    auth = false,
    base = "v1",
    timeoutMs = DEFAULT_TIMEOUT_MS,
    parseAs = "json",
    headers,
    method = "GET",
    signal,
    ...requestInit
  } = options;

  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const abortFromExternalSignal = () => controller.abort();

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", abortFromExternalSignal, {
        once: true,
      });
    }
  }

  if (timeoutMs > 0) {
    timeout = setTimeout(() => controller.abort(), timeoutMs);
  }

  try {
    const finalToken = token ?? (auth ? tokenResolver?.() ?? null : null);

    const response = await fetch(buildUrl(endpoint, query, pathParams, base), {
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
    if (timeout) {
      clearTimeout(timeout);
    }

    if (signal) {
      signal.removeEventListener("abort", abortFromExternalSignal);
    }
  }
}

export async function apiEndpointRequest<
  TResponse = unknown,
  TBody = unknown,
>(
  endpointKey: ApiEndpointKey,
  options: EndpointRequestOptions<TBody> = {}
): Promise<TResponse> {
  const endpoint = getResolvedEndpointDefinition(endpointKey);

  return apiRequest<TResponse, TBody>(endpoint.path, {
    ...options,
    method: endpoint.method,
    auth: options.auth ?? endpoint.auth ?? false,
    base: endpoint.base ?? "v1",
  });
}

export async function apiRuntimeEndpointRequest<
  TResponse = unknown,
  TBody = unknown,
>(
  endpointKey: string,
  options: EndpointRequestOptions<TBody> = {}
): Promise<TResponse> {
  const endpoint = getResolvedEndpointDefinition(endpointKey);

  return apiRequest<TResponse, TBody>(endpoint.path, {
    ...options,
    method: endpoint.method,
    auth: options.auth ?? endpoint.auth ?? false,
    base: endpoint.base ?? "v1",
  });
}

export const httpClient = {
  request: apiRequest,

  endpoint: apiEndpointRequest,

  runtimeEndpoint: apiRuntimeEndpointRequest,

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

function buildUrl(
  endpoint: string,
  query?: QueryParams,
  pathParams?: PathParams,
  base: ApiBaseTarget = "v1"
) {
  const resolvedEndpoint = resolvePathParams(endpoint, pathParams);

  const isAbsolute =
    resolvedEndpoint.startsWith("http://") ||
    resolvedEndpoint.startsWith("https://");

  const url = isAbsolute
    ? resolvedEndpoint
    : `${getBaseUrl(base)}${
        resolvedEndpoint.startsWith("/")
          ? resolvedEndpoint
          : `/${resolvedEndpoint}`
      }`;

  return `${url}${buildQueryString(query)}`;
}

function getBaseUrl(base: ApiBaseTarget) {
  const apiV1BaseUrl = removeTrailingSlash(env.apiBaseUrl);

  if (base === "v1") {
    return apiV1BaseUrl;
  }

  return removeTrailingSlash(apiV1BaseUrl.replace(/\/api\/v1\/?$/, ""));
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

  if (typeof FormData !== "undefined" && body instanceof FormData) {
    return false;
  }

  if (typeof Blob !== "undefined" && body instanceof Blob) {
    return false;
  }

  if (typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer) {
    return false;
  }

  if (
    typeof URLSearchParams !== "undefined" &&
    body instanceof URLSearchParams
  ) {
    return false;
  }

  return true;
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

function removeTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}