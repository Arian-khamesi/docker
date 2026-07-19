export type QueryValue = string | number | boolean | null | undefined;

export type QueryParams = Record<string, QueryValue | QueryValue[]>;

export type PathParams = Record<string, string | number>;

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiBaseTarget = "root" | "v1";

export type ApiContentType = "json" | "multipart";

export interface ApiEndpointDefinition<TKey extends string = string> {
  key: TKey;
  method: ApiMethod;
  path: string;
  base?: ApiBaseTarget;
  auth?: boolean;
  contentType?: ApiContentType;
  description?: string;
}

export function defineEndpoints<
  const TEndpoints extends readonly ApiEndpointDefinition[],
>(endpoints: TEndpoints) {
  return endpoints;
}