import { getResolvedEndpointDefinition } from "@/lib/api/remote-endpoint-registry";
import type { PathParams, QueryParams } from "@/lib/api/endpoint.types";

export function endpointPath(
  key: string,
  options: {
    pathParams?: PathParams;
    query?: QueryParams;
  } = {}
) {
  const endpoint = getResolvedEndpointDefinition(key);
  const resolvedPath = resolvePathParams(endpoint.path, options.pathParams);

  return withQuery(normalizePath(resolvedPath), options.query);
}

export function resolvePathParams(path: string, params?: PathParams) {
  return path.replace(/:([A-Za-z0-9_]+)/g, (_, key: string) => {
    const value = params?.[key];

    if (value === undefined || value === null || value === "") {
      throw new Error(`Missing endpoint path param: ${key}`);
    }

    return encodeURIComponent(String(value));
  });
}

export function buildQueryString(params?: QueryParams) {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
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

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

export function withQuery(path: string, params?: QueryParams) {
  return `${path}${buildQueryString(params)}`;
}

export function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}