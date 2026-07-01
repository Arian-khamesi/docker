import type { User } from "./auth.types";

import { ENDPOINTS } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/api-error";
import {
  type ApiEnvelope,
  unwrapApiData,
} from "@/lib/api/api-response";
import {
  httpClient,
  setApiTokenResolver,
} from "@/lib/api/http-client";

const TOKEN_KEY = "jpa_cms_token";
const USER_KEY = "jpa_cms_user";

export type LoginCredentials = {
  username: string;
  password: string;
};

interface LoginResponseData {
  token: string;
  user: User;
}

interface SessionResponseData {
  user: User;
}

setApiTokenResolver(getToken);

export async function login(
  username: string,
  password: string
): Promise<User> {
  const response = await httpClient.post<
    ApiEnvelope<LoginResponseData>,
    LoginCredentials
  >(ENDPOINTS.auth.login, {
    username,
    password,
  });

  const data = unwrapApiData(response, "ورود با خطا مواجه شد.");

  if (!data.token || !data.user) {
    throw new ApiError({
      status: 500,
      code: "INVALID_LOGIN_RESPONSE",
      message: "پاسخ ورود از سمت سرور معتبر نیست.",
      payload: response,
    });
  }

  saveAuthSession(data.token, data.user);

  return data.user;
}

export async function loginWithCredentials(
  credentials: LoginCredentials
): Promise<User> {
  return login(credentials.username, credentials.password);
}

export async function getSession(): Promise<User | null> {
  const token = getToken();

  if (!token) return null;

  try {
    const response = await httpClient.get<ApiEnvelope<SessionResponseData>>(
      ENDPOINTS.auth.me,
      {
        auth: true,
      }
    );

    const data = unwrapApiData(response, "دریافت اطلاعات کاربر با خطا مواجه شد.");

    if (!data.user) {
      clearAuthSession();
      return null;
    }

    saveStoredUser(data.user);

    return data.user;
  } catch {
    clearAuthSession();
    return null;
  }
}

export async function logout() {
  try {
    const token = getToken();

    if (token) {
      await httpClient.post<ApiEnvelope<unknown>>(
        ENDPOINTS.auth.logout,
        undefined,
        {
          auth: true,
        }
      );
    }
  } finally {
    clearAuthSession();
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;

  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;

  const storedUser = window.localStorage.getItem(USER_KEY);

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

function saveAuthSession(token: string, user: User) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(TOKEN_KEY, token);
  saveStoredUser(user);
}

function saveStoredUser(user: User) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}