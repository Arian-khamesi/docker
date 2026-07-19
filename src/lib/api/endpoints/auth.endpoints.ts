import { defineEndpoints } from "@/lib/api/endpoint.types";

export const authEndpoints = defineEndpoints([
  {
    key: "auth.login",
    method: "POST",
    path: "/auth/login",
    auth: false,
    description: "Login user",
  },
  {
    key: "auth.me",
    method: "GET",
    path: "/auth/me",
    auth: true,
    description: "Get current authenticated user",
  },
  {
    key: "auth.logout",
    method: "POST",
    path: "/auth/logout",
    auth: true,
    description: "Logout user",
  },
  {
    key: "permissions.list",
    method: "GET",
    path: "/permissions",
    auth: true,
    description: "Get user permissions",
  },
  {
    key: "navigation.list",
    method: "GET",
    path: "/navigation",
    auth: true,
    description: "Get dashboard navigation",
  },
  {
    key: "liang.navCounts",
    method: "GET",
    path: "/liang/nav-counts",
    auth: true,
    description: "Get Liang navigation counts",
  },
] as const);