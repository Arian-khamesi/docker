export type ProductCarouselStatus = "draft" | "published";

export type ProductCarouselRuntimeStatus =
  | "not_started"
  | "running"
  | "expired";

export type ProductCarouselTheme =
  | "classic"
  | "modern"
  | "minimal"
  | "deal"
  | "banner"
  | "gray";

export type ProductCarouselSourceType =
  | "most_viewed"
  | "highest_discount_percent"
  | "highest_discount_amount"
  | "newest"
  | "best_sellers"
  | "manual"
  | "color"
  | "category_only"
  | "free_content";

export type ProductCarouselSortBy =
  | "default"
  | "most_viewed"
  | "newest"
  | "best_sellers"
  | "highest_discount_percent"
  | "highest_discount_amount"
  | "price_asc"
  | "price_desc";

export interface ProductCarouselImage {
  url: string;
  alt: string;
}

export interface ProductCarouselCategoryRef {
  id: string;
  title: string;
  slug?: string;
}

export interface ProductCarouselColorRef {
  code: string;
  title: string;
  hex?: string;
}

export interface ProductCarouselProductRef {
  id: string;
  jpaCode?: string;
  title?: string;
  imageUrl?: string;
  price?: number;
  discountPercent?: number;
}

export interface ProductCarouselSource {
  type: ProductCarouselSourceType;

  selectedCategories: ProductCarouselCategoryRef[];

  manualProducts: ProductCarouselProductRef[];

  selectedColor?: ProductCarouselColorRef | null;

  sortBy: ProductCarouselSortBy;
}

export interface ProductCarouselDiscountConfig {
  enabled: boolean;

  minPercent?: number;
  maxPercent?: number;

  startsAt?: string;
  endsAt?: string;

  showDiscountBadge: boolean;
  showOldPrice: boolean;
}

export interface ProductCarouselTimerConfig {
  enabled: boolean;
  label: string;

  target: "carousel_end" | "discount_end" | "custom";

  customEndsAt?: string;
}

export interface ProductCarouselSeeAllConfig {
  enabled: boolean;
  label: string;
  href: string;
  autoGenerateHref: boolean;
}

export interface ProductCarouselBanners {
  desktop?: ProductCarouselImage;
  mobile?: ProductCarouselImage;
}

export interface ProductCarousel {
  id: string;

  title: string;
  description?: string;

  status: ProductCarouselStatus;
  isActive: boolean;

  startsAt: string;
  endsAt: string;

  theme: ProductCarouselTheme;

  productLimit: number;

  source: ProductCarouselSource;

  discount: ProductCarouselDiscountConfig;

  timer: ProductCarouselTimerConfig;

  seeAll: ProductCarouselSeeAllConfig;

  banners: ProductCarouselBanners;

  order: number;

  createdAt: string;
  updatedAt: string;
}

export interface ProductCarouselValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}