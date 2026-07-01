import type { ProductCarousel } from "@/types/product-carousel";
import {
  buildProductCarouselApiPayload,
  stringifyProductCarouselPayload,
} from "./product-carousel.mapper";
import type { ProductCarouselApiPayload } from "./product-carousel.mapper";

export type ProductCarouselApiMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type ProductCarouselSaveMode = "create" | "update";

export interface ProductCarouselApiRequest<TBody = unknown> {
  method: ProductCarouselApiMethod;
  endpoint: string;
  body?: TBody;
  description: string;
}

export interface ReorderProductCarouselItem {
  id: string;
  order: number;
}

export const PRODUCT_CAROUSEL_ENDPOINTS = {
  base: "/content/product-carousels",
  detail: (id: string) => `/content/product-carousels/${id}`,
  reorder: "/content/product-carousels/reorder",
};

export function buildCreateProductCarouselRequest(
  carousel: ProductCarousel
): ProductCarouselApiRequest<ProductCarouselApiPayload> {
  return {
    method: "POST",
    endpoint: PRODUCT_CAROUSEL_ENDPOINTS.base,
    body: buildProductCarouselApiPayload(carousel),
    description: "ساخت کروسل محصول جدید",
  };
}

export function buildUpdateProductCarouselRequest(
  carousel: ProductCarousel
): ProductCarouselApiRequest<ProductCarouselApiPayload> {
  return {
    method: "PATCH",
    endpoint: PRODUCT_CAROUSEL_ENDPOINTS.detail(carousel.id),
    body: buildProductCarouselApiPayload(carousel),
    description: "ویرایش کروسل محصول",
  };
}

export function buildDeleteProductCarouselRequest(
  id: string
): ProductCarouselApiRequest {
  return {
    method: "DELETE",
    endpoint: PRODUCT_CAROUSEL_ENDPOINTS.detail(id),
    description: "حذف کروسل محصول",
  };
}

export function buildReorderProductCarouselsRequest(
  items: ReorderProductCarouselItem[]
): ProductCarouselApiRequest<{ items: ReorderProductCarouselItem[] }> {
  return {
    method: "POST",
    endpoint: PRODUCT_CAROUSEL_ENDPOINTS.reorder,
    body: {
      items,
    },
    description: "مرتب‌سازی کروسل‌های محصول",
  };
}

export function buildProductCarouselSaveRequestPreview(
  carousel: ProductCarousel,
  mode: ProductCarouselSaveMode = "update"
) {
  return mode === "create"
    ? buildCreateProductCarouselRequest(carousel)
    : buildUpdateProductCarouselRequest(carousel);
}

export {
  buildProductCarouselApiPayload,
  stringifyProductCarouselPayload,
};

export type { ProductCarouselApiPayload };