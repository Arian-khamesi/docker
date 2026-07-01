import type { ProductCarousel } from "@/types/product-carousel";

export interface ProductCarouselApiPayload {
  id: string;
  title: string;
  description: string | null;
  status: ProductCarousel["status"];
  is_active: boolean;
  starts_at: string;
  ends_at: string;
  theme: ProductCarousel["theme"];
  product_limit: number;
  order: number;

  source: {
    type: ProductCarousel["source"]["type"];
    sort_by: ProductCarousel["source"]["sortBy"];
    selected_categories: Array<{
      id: string;
      title: string;
      slug: string | null;
    }>;
    manual_products: Array<{
      id: string;
      jpa_code: string | null;
      title: string | null;
      image_url: string | null;
      price: number | null;
      discount_percent: number | null;
    }>;
    selected_color: {
      code: string;
      title: string;
      hex: string | null;
    } | null;
  };

  discount: {
    enabled: boolean;
    min_percent: number | null;
    max_percent: number | null;
    starts_at: string | null;
    ends_at: string | null;
    show_discount_badge: boolean;
    show_old_price: boolean;
  };

  timer: {
    enabled: boolean;
    label: string;
    target: ProductCarousel["timer"]["target"];
    custom_ends_at: string | null;
  };

  see_all: {
    enabled: boolean;
    label: string;
    href: string;
    auto_generate_href: boolean;
  };

  banners: {
    desktop: { url: string; alt: string } | null;
    mobile: { url: string; alt: string } | null;
  };

  meta: {
    created_at: string;
    updated_at: string;
    payload_version: 1;
  };
}

export function buildProductCarouselApiPayload(
  carousel: ProductCarousel
): ProductCarouselApiPayload {
  return {
    id: carousel.id,
    title: carousel.title.trim(),
    description: normalizeNullableText(carousel.description),
    status: carousel.status,
    is_active: carousel.isActive,
    starts_at: carousel.startsAt,
    ends_at: carousel.endsAt,
    theme: carousel.theme,
    product_limit: carousel.productLimit,
    order: carousel.order,

    source: {
      type: carousel.source.type,
      sort_by: carousel.source.sortBy,
      selected_categories: carousel.source.selectedCategories.map((category) => ({
        id: category.id,
        title: category.title,
        slug: category.slug ?? null,
      })),
      manual_products: carousel.source.manualProducts.map((product) => ({
        id: product.id,
        jpa_code: product.jpaCode ?? null,
        title: product.title ?? null,
        image_url: product.imageUrl ?? null,
        price: product.price ?? null,
        discount_percent: product.discountPercent ?? null,
      })),
      selected_color: carousel.source.selectedColor
        ? {
            code: carousel.source.selectedColor.code,
            title: carousel.source.selectedColor.title,
            hex: carousel.source.selectedColor.hex ?? null,
          }
        : null,
    },

    discount: {
      enabled: carousel.discount.enabled,
      min_percent: carousel.discount.enabled
        ? carousel.discount.minPercent ?? null
        : null,
      max_percent: carousel.discount.enabled
        ? carousel.discount.maxPercent ?? null
        : null,
      starts_at: carousel.discount.enabled
        ? carousel.discount.startsAt ?? null
        : null,
      ends_at: carousel.discount.enabled
        ? carousel.discount.endsAt ?? null
        : null,
      show_discount_badge: carousel.discount.showDiscountBadge,
      show_old_price: carousel.discount.showOldPrice,
    },

    timer: {
      enabled: carousel.timer.enabled,
      label: carousel.timer.label.trim(),
      target: carousel.timer.target,
      custom_ends_at:
        carousel.timer.enabled && carousel.timer.target === "custom"
          ? carousel.timer.customEndsAt ?? null
          : null,
    },

    see_all: {
      enabled: carousel.seeAll.enabled,
      label: carousel.seeAll.label.trim(),
      href: carousel.seeAll.href.trim(),
      auto_generate_href: carousel.seeAll.autoGenerateHref,
    },

    banners: {
      desktop: normalizeBanner(carousel.banners.desktop),
      mobile: normalizeBanner(carousel.banners.mobile),
    },

    meta: {
      created_at: carousel.createdAt,
      updated_at: carousel.updatedAt,
      payload_version: 1,
    },
  };
}

export function stringifyProductCarouselPayload(carousel: ProductCarousel) {
  return JSON.stringify(buildProductCarouselApiPayload(carousel), null, 2);
}

function normalizeNullableText(value?: string) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function normalizeBanner(banner?: { url: string; alt: string }) {
  if (!banner?.url?.trim()) return null;

  return {
    url: banner.url.trim(),
    alt: banner.alt.trim(),
  };
}