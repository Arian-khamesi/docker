import { API_ENDPOINTS } from "@/lib/api/endpoints/index";
import type {
  ApiBaseTarget,
  ApiContentType,
  ApiEndpointDefinition,
  ApiMethod,
} from "@/lib/api/endpoint.types";
import type {
  RemoteEndpointCatalog,
  RemoteEndpointDefinition,
  RemoteEndpointRejectReason,
  RemoteEndpointRegistrySnapshot,
  ResolvedApiEndpointDefinition,
} from "@/lib/api/remote-endpoint.types";
import {
  REMOTE_ENDPOINT_BASE_TARGETS,
  REMOTE_ENDPOINT_CONTENT_TYPES,
  REMOTE_ENDPOINT_METHODS,
} from "@/lib/api/remote-endpoint.types";

const REMOTE_ENDPOINT_CACHE_KEY = "jpa:api:remote-endpoint-catalog:v1";

const REMOTE_ALLOWED_PREFIXES = [
  "menu.",
  "slider.",
  "media.",
  "snapp.",
  "kiyan.",
];

const REMOTE_PROTECTED_PREFIXES = [
  "health.",
  "system.",
  "auth.",
  "permissions.",
  "navigation.",
  "liang.",
];

let remoteEndpointMap = new Map<string, RemoteEndpointDefinition>();
let remoteSnapshot: RemoteEndpointRegistrySnapshot | null = null;
let hasHydratedRemoteRegistry = false;

export function hydrateRemoteEndpointRegistryFromStorage() {
  if (hasHydratedRemoteRegistry) return remoteSnapshot;

  hasHydratedRemoteRegistry = true;

  if (typeof window === "undefined") {
    return remoteSnapshot;
  }

  try {
    const cached = window.sessionStorage.getItem(REMOTE_ENDPOINT_CACHE_KEY);

    if (!cached) {
      return remoteSnapshot;
    }

    const parsed = JSON.parse(cached) as RemoteEndpointCatalog;

    if (!parsed || !Array.isArray(parsed.endpoints)) {
      return remoteSnapshot;
    }

    return setRemoteEndpointCatalog(parsed, {
      persist: false,
    });
  } catch {
    clearRemoteEndpointCatalog();
    return remoteSnapshot;
  }
}

export function setRemoteEndpointCatalog(
  catalog: RemoteEndpointCatalog,
  options: {
    persist?: boolean;
  } = {}
): RemoteEndpointRegistrySnapshot {
  const persist = options.persist ?? true;
  const rejected: RemoteEndpointRejectReason[] = [];
  const nextMap = new Map<string, RemoteEndpointDefinition>();

  catalog.endpoints.forEach((endpoint) => {
    const normalized = normalizeRemoteEndpoint(endpoint, catalog.base);

    if (!normalized) {
      rejected.push({
        key: endpoint.key,
        path: endpoint.path,
        reason: "Invalid endpoint shape",
      });

      return;
    }

    if (normalized.enabled === false) {
      rejected.push({
        key: normalized.key,
        path: normalized.path,
        reason: "Endpoint is disabled in remote catalog",
      });

      return;
    }

    if (!isRemoteEndpointKeyAllowed(normalized.key)) {
      rejected.push({
        key: normalized.key,
        path: normalized.path,
        reason: "Remote override is not allowed for this endpoint key",
      });

      return;
    }

    nextMap.set(normalized.key, normalized);
  });

  remoteEndpointMap = nextMap;

  remoteSnapshot = {
    client: catalog.client,
    version: catalog.version,
    hash: catalog.hash,
    generatedAt: catalog.generatedAt,
    acceptedCount: nextMap.size,
    rejectedCount: rejected.length,
    rejected,
  };

  if (persist && typeof window !== "undefined") {
    window.sessionStorage.setItem(
      REMOTE_ENDPOINT_CACHE_KEY,
      JSON.stringify(catalog)
    );
  }

  return remoteSnapshot;
}

export function clearRemoteEndpointCatalog() {
  remoteEndpointMap = new Map();
  remoteSnapshot = null;

  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(REMOTE_ENDPOINT_CACHE_KEY);
  }
}

export function getRemoteEndpointDefinition(key: string) {
  hydrateRemoteEndpointRegistryFromStorage();

  return remoteEndpointMap.get(key);
}

export function getResolvedEndpointDefinition(
  key: string
): ResolvedApiEndpointDefinition {
  hydrateRemoteEndpointRegistryFromStorage();

  const remoteEndpoint = remoteEndpointMap.get(key);
  const staticEndpoint = getStaticEndpointDefinition(key);

  if (remoteEndpoint) {
    return {
      ...remoteEndpoint,
      source: "remote",
      isRemoteOverride: Boolean(staticEndpoint),
    };
  }

  if (staticEndpoint) {
    return {
      ...staticEndpoint,
      source: "static",
      isRemoteOverride: false,
    };
  }

  throw new Error(`API endpoint not found: ${key}`);
}

export function getRemoteEndpointSnapshot() {
  hydrateRemoteEndpointRegistryFromStorage();

  return remoteSnapshot;
}

export function getMergedEndpointDefinitions() {
  hydrateRemoteEndpointRegistryFromStorage();

  const merged = new Map<string, ResolvedApiEndpointDefinition>();

  API_ENDPOINTS.forEach((endpoint) => {
    merged.set(endpoint.key, {
      ...endpoint,
      source: "static",
      isRemoteOverride: false,
    });
  });

  remoteEndpointMap.forEach((endpoint) => {
    merged.set(endpoint.key, {
      ...endpoint,
      source: "remote",
      isRemoteOverride: Boolean(getStaticEndpointDefinition(endpoint.key)),
    });
  });

  return Array.from(merged.values());
}

function getStaticEndpointDefinition(key: string) {
  return API_ENDPOINTS.find((endpoint) => endpoint.key === key);
}

function normalizeRemoteEndpoint(
  endpoint: RemoteEndpointDefinition,
  catalogBase?: ApiBaseTarget
): RemoteEndpointDefinition | null {
  const key = typeof endpoint.key === "string" ? endpoint.key.trim() : "";
  const method = normalizeMethod(endpoint.method);
  const normalizedPathResult = normalizePathAndBase(endpoint.path, {
    endpointBase: endpoint.base,
    catalogBase,
  });
  const auth = Boolean(endpoint.auth);
  const contentType = normalizeContentType(endpoint.contentType);
  const enabled = endpoint.enabled ?? true;

  if (!key || !isValidEndpointKey(key)) return null;
  if (!method) return null;
  if (!normalizedPathResult) return null;

  return {
    key,
    method,
    path: normalizedPathResult.path,
    base: normalizedPathResult.base,
    auth,
    contentType,
    enabled,
    description: endpoint.description,
    source: "remote",
  };
}

function normalizeMethod(method: unknown): ApiMethod | null {
  if (typeof method !== "string") return null;

  const normalizedMethod = method.trim().toUpperCase() as ApiMethod;

  if (!REMOTE_ENDPOINT_METHODS.includes(normalizedMethod)) {
    return null;
  }

  return normalizedMethod;
}

function normalizeContentType(
  contentType: unknown
): ApiContentType | undefined {
  if (typeof contentType !== "string") {
    return "json";
  }

  const normalizedContentType = contentType.trim() as ApiContentType;

  if (!REMOTE_ENDPOINT_CONTENT_TYPES.includes(normalizedContentType)) {
    return "json";
  }

  return normalizedContentType;
}

function normalizeBaseTarget(
  base: unknown,
  fallback: ApiBaseTarget = "v1"
): ApiBaseTarget {
  if (typeof base !== "string") return fallback;

  const normalizedBase = base.trim() as ApiBaseTarget;

  if (!REMOTE_ENDPOINT_BASE_TARGETS.includes(normalizedBase)) {
    return fallback;
  }

  return normalizedBase;
}

function normalizePathAndBase(
  path: unknown,
  options: {
    endpointBase?: ApiBaseTarget;
    catalogBase?: ApiBaseTarget;
  }
): {
  path: string;
  base: ApiBaseTarget;
} | null {
  if (typeof path !== "string") return null;

  let normalizedPath = path.trim();

  if (!normalizedPath) return null;

  if (
    normalizedPath.startsWith("http://") ||
    normalizedPath.startsWith("https://")
  ) {
    return null;
  }

  if (!normalizedPath.startsWith("/")) {
    normalizedPath = `/${normalizedPath}`;
  }

  let base = normalizeBaseTarget(
    options.endpointBase,
    normalizeBaseTarget(options.catalogBase, "v1")
  );

  if (normalizedPath === "/api/v1") {
    normalizedPath = "/";
    base = "v1";
  }

  if (normalizedPath.startsWith("/api/v1/")) {
    normalizedPath = normalizedPath.replace(/^\/api\/v1/, "");
    base = "v1";
  }

  return {
    path: normalizedPath,
    base,
  };
}

function isValidEndpointKey(key: string) {
  return /^[A-Za-z][A-Za-z0-9]*(\.[A-Za-z][A-Za-z0-9]*)+$/.test(key);
}

function isRemoteEndpointKeyAllowed(key: string) {
  const isProtected = REMOTE_PROTECTED_PREFIXES.some((prefix) =>
    key.startsWith(prefix)
  );

  if (isProtected) {
    return false;
  }

  return REMOTE_ALLOWED_PREFIXES.some((prefix) => key.startsWith(prefix));
}