export type CategoryCarouselStatus = "draft" | "published";

export type CategoryCarouselRuntimeStatus =
  | "inactive"
  | "draft"
  | "published";

export type CategoryCarouselAudience =
  | "men"
  | "women"
  | "unisex"
  | "kids"
  | "custom";

export type CategoryCarouselTheme =
  | "classic"
  | "modern"
  | "minimal"
  | "glass"
  | "gray";

export type CategoryCarouselPlacement =
  | "home_after_product_carousels"
  | "home_before_product_carousels"
  | "custom";

export interface CategoryCarouselImage {
  url: string;
  alt: string;
}

export interface CategoryCarouselItem {
  id: string;
  title: string;
  href: string;
  image?: CategoryCarouselImage;
  description?: string;
  badge?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryCarouselSeeAllConfig {
  enabled: boolean;
  label: string;
  href: string;
}

export interface CategoryCarousel {
  id: string;
  title: string;
  description?: string;

  status: CategoryCarouselStatus;
  isActive: boolean;

  audience: CategoryCarouselAudience;
  customAudienceTitle?: string;

  theme: CategoryCarouselTheme;
  placement: CategoryCarouselPlacement;

  showTitle: boolean;
  seeAll: CategoryCarouselSeeAllConfig;

  items: CategoryCarouselItem[];

  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryCarouselValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}