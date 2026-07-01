import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  FeaturedCategoryCard,
  FeatureDisplayMode,
  HighlightImage,
  HomepageFeatureItem,
  HomepageHighlightsContent,
  HomepageHighlightsStatus,
} from "@/types/homepage-highlights";

function createId() {
  if (
    typeof globalThis.crypto !== "undefined" &&
    "randomUUID" in globalThis.crypto
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function now() {
  return new Date().toISOString();
}

function emptyImage(): HighlightImage {
  return {
    url: "",
    alt: "",
  };
}

function reorder<T extends { order: number }>(items: T[]) {
  return items.map((item, index) => ({
    ...item,
    order: index + 1,
  }));
}

function moveItem<T extends { id: string; order: number }>(
  items: T[],
  id: string,
  direction: "up" | "down"
) {
  const sorted = [...items].sort((a, b) => a.order - b.order);
  const currentIndex = sorted.findIndex((item) => item.id === id);

  if (currentIndex === -1) return items;

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= sorted.length) return items;

  const current = sorted[currentIndex];
  sorted[currentIndex] = sorted[targetIndex];
  sorted[targetIndex] = current;

  return reorder(sorted);
}

interface HomepageHighlightsState extends HomepageHighlightsContent {
  setSectionMeta: (
    payload: Partial<
      Pick<HomepageHighlightsContent, "sectionTitle" | "sectionDescription">
    >
  ) => void;

  setFeaturedCategoriesMeta: (
    payload: Partial<
      Pick<
        HomepageHighlightsContent,
        "featuredCategoriesTitle" | "featuredCategoriesDescription"
      >
    >
  ) => void;

  setFeatureDisplayMode: (mode: FeatureDisplayMode) => void;
  setAutoplay: (payload: {
    autoplay?: boolean;
    autoplayDelayMs?: number;
  }) => void;
  setStatus: (status: HomepageHighlightsStatus) => void;

  addFeature: () => void;
  updateFeature: (id: string, payload: Partial<HomepageFeatureItem>) => void;
  removeFeature: (id: string) => void;
  moveFeature: (id: string, direction: "up" | "down") => void;

  addFeaturedCategory: () => void;
  updateFeaturedCategory: (
    id: string,
    payload: Partial<FeaturedCategoryCard>
  ) => void;
  removeFeaturedCategory: (id: string) => void;
  moveFeaturedCategory: (id: string, direction: "up" | "down") => void;
}

const initialFeatures: HomepageFeatureItem[] = [
  {
    id: createId(),
    title: "ارسال سریع و مطمئن",
    description:
      "سفارش‌ها با بسته‌بندی مناسب و در کوتاه‌ترین زمان آماده ارسال می‌شوند.",
    image: {
      url: "",
      alt: "ارسال سریع و مطمئن",
    },
    isActive: true,
    order: 1,
  },
  {
    id: createId(),
    title: "ضمانت اصالت کالا",
    description:
      "محصولات با کنترل کیفیت و اطمینان از اصالت در اختیار مشتری قرار می‌گیرند.",
    image: {
      url: "",
      alt: "ضمانت اصالت کالا",
    },
    isActive: true,
    order: 2,
  },
];

const initialFeaturedCategories: FeaturedCategoryCard[] = [
  {
    id: createId(),
    title: "مانتو و رویه",
    description: "منتخب جدیدترین مدل‌های مانتو و رویه.",
    href: "/category/manto",
    image: emptyImage(),
    isActive: true,
    order: 1,
  },
];

export const useHomepageHighlightsStore = create<HomepageHighlightsState>()(
  persist(
    (set) => ({
      sectionTitle: "مزیت‌های خرید از ما",
      sectionDescription:
        "تجربه‌ای مطمئن‌تر، سریع‌تر و حرفه‌ای‌تر برای خرید آنلاین.",

      featureDisplayMode: "carousel",
      autoplay: true,
      autoplayDelayMs: 4500,

      features: initialFeatures,

      featuredCategoriesTitle: "دسته‌بندی‌های منتخب",
      featuredCategoriesDescription:
        "دسته‌بندی‌هایی که می‌خواهیم در صفحه اصلی بیشتر دیده شوند.",
      featuredCategories: initialFeaturedCategories,

      status: "draft",
      updatedAt: now(),

      setSectionMeta: (payload) => {
        set((state) => ({
          ...state,
          ...payload,
          updatedAt: now(),
        }));
      },

      setFeaturedCategoriesMeta: (payload) => {
        set((state) => ({
          ...state,
          ...payload,
          updatedAt: now(),
        }));
      },

      setFeatureDisplayMode: (mode) => {
        set({
          featureDisplayMode: mode,
          updatedAt: now(),
        });
      },

      setAutoplay: (payload) => {
        set((state) => ({
          autoplay: payload.autoplay ?? state.autoplay,
          autoplayDelayMs: payload.autoplayDelayMs ?? state.autoplayDelayMs,
          updatedAt: now(),
        }));
      },

      setStatus: (status) => {
        set({
          status,
          updatedAt: now(),
        });
      },

      addFeature: () => {
        set((state) => ({
          features: [
            ...state.features,
            {
              id: createId(),
              title: "مزیت جدید",
              description: "توضیح کوتاه برای این مزیت را وارد کنید.",
              image: emptyImage(),
              isActive: true,
              order: state.features.length + 1,
            },
          ],
          updatedAt: now(),
        }));
      },

      updateFeature: (id, payload) => {
        set((state) => ({
          features: state.features.map((feature) =>
            feature.id === id ? { ...feature, ...payload } : feature
          ),
          updatedAt: now(),
        }));
      },

      removeFeature: (id) => {
        set((state) => ({
          features: reorder(
            state.features.filter((feature) => feature.id !== id)
          ),
          updatedAt: now(),
        }));
      },

      moveFeature: (id, direction) => {
        set((state) => ({
          features: moveItem(state.features, id, direction),
          updatedAt: now(),
        }));
      },

      addFeaturedCategory: () => {
        set((state) => {
          if (state.featuredCategories.length >= 3) return state;

          return {
            featuredCategories: [
              ...state.featuredCategories,
              {
                id: createId(),
                title: "دسته‌بندی جدید",
                description: "توضیح کوتاه دسته‌بندی را وارد کنید.",
                href: "/category",
                image: emptyImage(),
                isActive: true,
                order: state.featuredCategories.length + 1,
              },
            ],
            updatedAt: now(),
          };
        });
      },

      updateFeaturedCategory: (id, payload) => {
        set((state) => ({
          featuredCategories: state.featuredCategories.map((category) =>
            category.id === id ? { ...category, ...payload } : category
          ),
          updatedAt: now(),
        }));
      },

      removeFeaturedCategory: (id) => {
        set((state) => ({
          featuredCategories: reorder(
            state.featuredCategories.filter((category) => category.id !== id)
          ),
          updatedAt: now(),
        }));
      },

      moveFeaturedCategory: (id, direction) => {
        set((state) => ({
          featuredCategories: moveItem(state.featuredCategories, id, direction),
          updatedAt: now(),
        }));
      },
    }),
    {
      name: "homepage-highlights-storage",
    }
  )
);