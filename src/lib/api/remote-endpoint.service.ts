import { unwrapApiData, type ApiEnvelope } from "@/lib/api/api-response";
import { httpClient } from "@/lib/api/http-client";
import {
  hydrateRemoteEndpointRegistryFromStorage,
  setRemoteEndpointCatalog,
} from "@/lib/api/remote-endpoint-registry";
import type {
  RemoteEndpointCatalog,
  RemoteEndpointRegistrySnapshot,
} from "@/lib/api/remote-endpoint.types";

interface SyncRemoteEndpointCatalogOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  persist?: boolean;
}

type RemoteEndpointCatalogResponse =
  | ApiEnvelope<RemoteEndpointCatalog>
  | RemoteEndpointCatalog;

export const remoteEndpointService = {
  hydrateFromStorage: hydrateRemoteEndpointRegistryFromStorage,
  sync: syncRemoteEndpointCatalog,
};

export async function syncRemoteEndpointCatalog(
  options: SyncRemoteEndpointCatalogOptions = {}
): Promise<RemoteEndpointRegistrySnapshot> {
  hydrateRemoteEndpointRegistryFromStorage();

  const response =
    await httpClient.endpoint<RemoteEndpointCatalogResponse>(
      "system.endpointCatalog",
      {
        signal: options.signal,
        timeoutMs: options.timeoutMs ?? 8_000,
      }
    );

  const catalog = normalizeCatalogResponse(response);

  return setRemoteEndpointCatalog(catalog, {
    persist: options.persist ?? true,
  });
}

function normalizeCatalogResponse(
  response: RemoteEndpointCatalogResponse
): RemoteEndpointCatalog {
  if (isApiEnvelope(response)) {
    return unwrapApiData(response, "دریافت لیست endpointهای ریموت ناموفق بود.");
  }

  return response;
}

function isApiEnvelope(
  value: RemoteEndpointCatalogResponse
): value is ApiEnvelope<RemoteEndpointCatalog> {
  return (
    value !== null &&
    typeof value === "object" &&
    ("data" in value || "ok" in value || "success" in value)
  );
}