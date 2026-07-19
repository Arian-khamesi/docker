import { authEndpoints } from "@/lib/api/endpoints/auth.endpoints";
import { contentEndpoints } from "@/lib/api/endpoints/content.endpoints";
import { kiyanEndpoints } from "@/lib/api/endpoints/kiyan.endpoints";
import { mediaEndpoints } from "@/lib/api/endpoints/media.endpoints";
import { snappEndpoints } from "@/lib/api/endpoints/snapp.endpoints";
import { systemEndpoints } from "@/lib/api/endpoints/system.endpoints";

export const API_ENDPOINTS = [
  ...systemEndpoints,
  ...authEndpoints,
  ...contentEndpoints,
  ...mediaEndpoints,
  ...snappEndpoints,
  ...kiyanEndpoints,
] as const;

export type ApiEndpointKey = (typeof API_ENDPOINTS)[number]["key"];

export function getApiEndpointDefinition(key: ApiEndpointKey) {
  const endpoint = API_ENDPOINTS.find((item) => item.key === key);

  if (!endpoint) {
    throw new Error(`API endpoint not found: ${key}`);
  }

  return endpoint;
}