import { env } from "@/lib/env";

function assetUrl(path: string) {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!env.assetsBaseUrl) {
    return normalizedPath;
  }

  return `${env.assetsBaseUrl}${normalizedPath}`;
}

export const ASSETS = {
  avatars: {
    default: assetUrl("/assets/avatars/default.png"),
  },

  images: {
    placeholder: assetUrl("/assets/images/placeholder.png"),
    emptyState: assetUrl("/assets/images/empty-state.png"),
  },

  logos: {
    main: assetUrl("/assets/logos/logo.png"),
  },
} as const;

export { assetUrl };