import type { CategoryCarousel } from "@/types/category-carousel";

export interface CategoryCarouselApiPayload {
  id: string;
  title: string;
  description: string | null;

  status: CategoryCarousel["status"];
  is_active: boolean;

  audience: CategoryCarousel["audience"];
  custom_audience_title: string | null;

  theme: CategoryCarousel["theme"];
  placement: CategoryCarousel["placement"];

  show_title: boolean;

  see_all: {
    enabled: boolean;
    label: string;
    href: string;
  };

  items: Array<{
    id: string;
    title: string;
    href: string;
    image: {
      url: string;
      alt: string;
    } | null;
    description: string | null;
    badge: string | null;
    is_active: boolean;
    order: number;
  }>;

  order: number;

  meta: {
    created_at: string;
    updated_at: string;
    payload_version: 1;
  };
}

export function buildCategoryCarouselApiPayload(
  carousel: CategoryCarousel
): CategoryCarouselApiPayload {
  return {
    id: carousel.id,
    title: carousel.title.trim(),
    description: normalizeNullableText(carousel.description),

    status: carousel.status,
    is_active: carousel.isActive,

    audience: carousel.audience,
    custom_audience_title:
      carousel.audience === "custom"
        ? normalizeNullableText(carousel.customAudienceTitle)
        : null,

    theme: carousel.theme,
    placement: carousel.placement,

    show_title: carousel.showTitle,

    see_all: {
      enabled: carousel.seeAll.enabled,
      label: carousel.seeAll.label.trim(),
      href: carousel.seeAll.href.trim(),
    },

    items: [...carousel.items]
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        id: item.id,
        title: item.title.trim(),
        href: item.href.trim(),
        image: normalizeImage(item.image),
        description: normalizeNullableText(item.description),
        badge: normalizeNullableText(item.badge),
        is_active: item.isActive,
        order: item.order,
      })),

    order: carousel.order,

    meta: {
      created_at: carousel.createdAt,
      updated_at: carousel.updatedAt,
      payload_version: 1,
    },
  };
}

export function stringifyCategoryCarouselPayload(carousel: CategoryCarousel) {
  return JSON.stringify(buildCategoryCarouselApiPayload(carousel), null, 2);
}

function normalizeNullableText(value?: string) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function normalizeImage(image?: { url: string; alt: string }) {
  if (!image?.url?.trim()) return null;

  return {
    url: image.url.trim(),
    alt: image.alt.trim(),
  };
}