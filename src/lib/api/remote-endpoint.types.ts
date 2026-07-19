import type {
  ApiBaseTarget,
  ApiContentType,
  ApiEndpointDefinition,
  ApiMethod,
} from "@/lib/api/endpoint.types";

export interface RemoteEndpointDefinition
  extends ApiEndpointDefinition<string> {
  enabled?: boolean;
  source?: "remote";
}

export interface RemoteEndpointCatalog {
  client?: string;
  version?: string;
  hash?: string;
  generatedAt?: string;
  base?: ApiBaseTarget;
  endpoints: RemoteEndpointDefinition[];
}

export interface RemoteEndpointRejectReason {
  key?: string;
  path?: string;
  reason: string;
}

export interface RemoteEndpointRegistrySnapshot {
  client?: string;
  version?: string;
  hash?: string;
  generatedAt?: string;
  acceptedCount: number;
  rejectedCount: number;
  rejected: RemoteEndpointRejectReason[];
}

export interface ResolvedApiEndpointDefinition
  extends ApiEndpointDefinition<string> {
  source: "static" | "remote";
  isRemoteOverride?: boolean;
}

export const REMOTE_ENDPOINT_METHODS: ApiMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
];

export const REMOTE_ENDPOINT_CONTENT_TYPES: ApiContentType[] = [
  "json",
  "multipart",
];

export const REMOTE_ENDPOINT_BASE_TARGETS: ApiBaseTarget[] = [
  "root",
  "v1",
];