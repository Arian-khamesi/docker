function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "";

export const env = {
  appUrl: trimTrailingSlash(process.env.NEXT_PUBLIC_APP_URL || ""),

  apiBaseUrl: trimTrailingSlash(apiBaseUrl),

  assetsBaseUrl: trimTrailingSlash(
    process.env.NEXT_PUBLIC_ASSETS_BASE_URL || ""
  ),

  nodeEnv: process.env.NODE_ENV,
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;