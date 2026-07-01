import type { CategoryCarousel } from "@/types/category-carousel";
import {
  buildCategoryCarouselApiPayload,
  stringifyCategoryCarouselPayload,
} from "./category-carousel.mapper";
import type { CategoryCarouselApiPayload } from "./category-carousel.mapper";

export type CategoryCarouselApiMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type CategoryCarouselSaveMode = "create" | "update";

export interface CategoryCarouselApiRequest<TBody = unknown> {
  method: CategoryCarouselApiMethod;
  endpoint: string;
  body?: TBody;
  description: string;
}

export interface ReorderCategoryCarouselItem {
  id: string;
  order: number;
}

export const CATEGORY_CAROUSEL_ENDPOINTS = {
  base: "/content/category-carousels",
  detail: (id: string) => `/content/category-carousels/${id}`,
  reorder: "/content/category-carousels/reorder",
};

export function buildCreateCategoryCarouselRequest(
  carousel: CategoryCarousel
): CategoryCarouselApiRequest<CategoryCarouselApiPayload> {
  return {
    method: "POST",
    endpoint: CATEGORY_CAROUSEL_ENDPOINTS.base,
    body: buildCategoryCarouselApiPayload(carousel),
    description: "ساخت کروسل دسته‌بندی جدید",
  };
}

export function buildUpdateCategoryCarouselRequest(
  carousel: CategoryCarousel
): CategoryCarouselApiRequest<CategoryCarouselApiPayload> {
  return {
    method: "PATCH",
    endpoint: CATEGORY_CAROUSEL_ENDPOINTS.detail(carousel.id),
    body: buildCategoryCarouselApiPayload(carousel),
    description: "ویرایش کروسل دسته‌بندی",
  };
}

export function buildDeleteCategoryCarouselRequest(
  id: string
): CategoryCarouselApiRequest {
  return {
    method: "DELETE",
    endpoint: CATEGORY_CAROUSEL_ENDPOINTS.detail(id),
    description: "حذف کروسل دسته‌بندی",
  };
}

export function buildReorderCategoryCarouselsRequest(
  items: ReorderCategoryCarouselItem[]
): CategoryCarouselApiRequest<{ items: ReorderCategoryCarouselItem[] }> {
  return {
    method: "POST",
    endpoint: CATEGORY_CAROUSEL_ENDPOINTS.reorder,
    body: {
      items,
    },
    description: "مرتب‌سازی کروسل‌های دسته‌بندی",
  };
}

export function buildCategoryCarouselSaveRequestPreview(
  carousel: CategoryCarousel,
  mode: CategoryCarouselSaveMode = "update"
) {
  return mode === "create"
    ? buildCreateCategoryCarouselRequest(carousel)
    : buildUpdateCategoryCarouselRequest(carousel);
}

export {
  buildCategoryCarouselApiPayload,
  stringifyCategoryCarouselPayload,
};

export type { CategoryCarouselApiPayload };