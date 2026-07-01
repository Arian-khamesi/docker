export interface ApiErrorPayload {
  message?: string;
  code?: string;
  errors?: unknown;
  details?: unknown;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  errors?: unknown;
  details?: unknown;
  payload?: unknown;

  constructor({
    message,
    status,
    code,
    errors,
    details,
    payload,
  }: {
    message: string;
    status: number;
    code?: string;
    errors?: unknown;
    details?: unknown;
    payload?: unknown;
  }) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.errors = errors;
    this.details = details;
    this.payload = payload;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isValidationError() {
    return this.status === 422 || this.status === 400;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getApiErrorMessage(error: unknown) {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "خطای غیرمنتظره‌ای رخ داد.";
}