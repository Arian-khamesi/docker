import { defineEndpoints } from "@/lib/api/endpoint.types";

export const mediaEndpoints = defineEndpoints([
  {
    key: "media.upload",
    method: "POST",
    path: "/media",
    auth: true,
    contentType: "multipart",
    description: "Upload media file",
  },
] as const);