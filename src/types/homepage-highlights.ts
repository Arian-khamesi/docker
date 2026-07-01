export type HomepageHighlightsStatus = "draft" | "published";

export type FeatureDisplayMode = "carousel" | "static";

export interface HighlightImage {
  url: string;
  alt: string;
}

export interface HomepageFeatureItem {
  id: string;
  title: string;
  description: string;
  image: HighlightImage;
  mobileImage?: HighlightImage;
  isActive: boolean;
  order: number;
}

export interface FeaturedCategoryCard {
  id: string;
  title: string;
  description: string;
  href: string;
  image: HighlightImage;
  isActive: boolean;
  order: number;
}

export interface HomepageHighlightsContent {
  sectionTitle: string;
  sectionDescription: string;

  featureDisplayMode: FeatureDisplayMode;
  autoplay: boolean;
  autoplayDelayMs: number;

  features: HomepageFeatureItem[];

  featuredCategoriesTitle: string;
  featuredCategoriesDescription: string;
  featuredCategories: FeaturedCategoryCard[];

  status: HomepageHighlightsStatus;
  updatedAt: string;
}