import { defineEndpoints } from "@/lib/api/endpoint.types";

export const systemEndpoints = defineEndpoints([
  {
    key: "health.check",
    method: "GET",
    path: "/api/health",
    base: "root",
    auth: false,
    description: "Backend health check",
  },
  {
    key: "system.endpointCatalog",
    method: "GET",
    path: "/api/endpoints",
    base: "root",
    auth: false,
    description: "Get runtime API endpoint catalog",
  },
] as const);