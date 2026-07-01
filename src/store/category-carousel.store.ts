import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  CategoryCarousel,
  CategoryCarouselAudience,
  CategoryCarouselItem,
  CategoryCarouselTheme,
} from "@/types/category-carousel";

interface CategoryCarouselStore {
  carousels: CategoryCarousel[];
  selectedCarouselId: string | null;

  addCarousel: (payload?: Partial<CategoryCarousel>) => string;
  duplicateCarousel: (id: string) => string | null;
  updateCarousel: (id: string, updates: Partial<CategoryCarousel>) => void;
  removeCarousel: (id: string) => void;

  setSelectedCarouselId: (id: string | null) => void;

  toggleCarouselActive: (id: string) => void;
  publishCarousel: (id: string) => void;
  saveCarouselAsDraft: (id: string) => void;

  setCarouselAudience: (
    id: string,
    audience: CategoryCarouselAudience,
    customAudienceTitle?: string
  ) => void;

  setCarouselTheme: (id: string, theme: CategoryCarouselTheme) => void;

  moveCarousel: (fromIndex: number, toIndex: number) => void;

  addItem: (
    carouselId: string,
    payload?: Partial<CategoryCarouselItem>
  ) => string | null;
  updateItem: (
    carouselId: string,
    itemId: string,
    updates: Partial<CategoryCarouselItem>
  ) => void;
  removeItem: (carouselId: string, itemId: string) => void;
  toggleItemActive: (carouselId: string, itemId: string) => void;
  moveItem: (carouselId: string, fromIndex: number, toIndex: number) => void;

  resetCarousels: () => void;
}

export const useCategoryCarouselStore = create<CategoryCarouselStore>()(
  persist(
    (set, get) => ({
      carousels: createInitialCategoryCarousels(),
      selectedCarouselId: null,

      addCarousel: (payload) => {
        const currentCarousels = get().carousels;
        const now = new Date().toISOString();

        const carousel: CategoryCarousel = {
          ...createDefaultCategoryCarousel(currentCarousels.length),
          ...payload,
          id: payload?.id ?? createId(),
          createdAt: payload?.createdAt ?? now,
          updatedAt: now,
          order: payload?.order ?? currentCarousels.length + 1,
          items: payload?.items ?? [],
        };

        set((state) => ({
          carousels: normalizeCarouselOrders([...state.carousels, carousel]),
          selectedCarouselId: carousel.id,
        }));

        return carousel.id;
      },

      duplicateCarousel: (id) => {
        const source = get().carousels.find((carousel) => carousel.id === id);

        if (!source) return null;

        const now = new Date().toISOString();
        const duplicatedId = createId();

        const duplicated: CategoryCarousel = {
          ...source,
          id: duplicatedId,
          title: `${source.title} - کپی`,
          status: "draft",
          isActive: false,
          order: get().carousels.length + 1,
          createdAt: now,
          updatedAt: now,
          items: source.items.map((item, index) => ({
            ...item,
            id: createId(),
            order: index + 1,
            createdAt: now,
            updatedAt: now,
          })),
        };

        set((state) => ({
          carousels: normalizeCarouselOrders([...state.carousels, duplicated]),
          selectedCarouselId: duplicatedId,
        }));

        return duplicatedId;
      },

      updateCarousel: (id, updates) => {
        set((state) => ({
          carousels: state.carousels.map((carousel) =>
            carousel.id === id
              ? {
                  ...carousel,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : carousel
          ),
        }));
      },

      removeCarousel: (id) => {
        set((state) => ({
          carousels: normalizeCarouselOrders(
            state.carousels.filter((carousel) => carousel.id !== id)
          ),
          selectedCarouselId:
            state.selectedCarouselId === id ? null : state.selectedCarouselId,
        }));
      },

      setSelectedCarouselId: (id) => {
        set({ selectedCarouselId: id });
      },

      toggleCarouselActive: (id) => {
        set((state) => ({
          carousels: state.carousels.map((carousel) =>
            carousel.id === id
              ? {
                  ...carousel,
                  isActive: !carousel.isActive,
                  updatedAt: new Date().toISOString(),
                }
              : carousel
          ),
        }));
      },

      publishCarousel: (id) => {
        set((state) => ({
          carousels: state.carousels.map((carousel) =>
            carousel.id === id
              ? {
                  ...carousel,
                  status: "published",
                  isActive: true,
                  updatedAt: new Date().toISOString(),
                }
              : carousel
          ),
        }));
      },

      saveCarouselAsDraft: (id) => {
        set((state) => ({
          carousels: state.carousels.map((carousel) =>
            carousel.id === id
              ? {
                  ...carousel,
                  status: "draft",
                  isActive: false,
                  updatedAt: new Date().toISOString(),
                }
              : carousel
          ),
        }));
      },

      setCarouselAudience: (id, audience, customAudienceTitle) => {
        set((state) => ({
          carousels: state.carousels.map((carousel) =>
            carousel.id === id
              ? {
                  ...carousel,
                  audience,
                  customAudienceTitle:
                    audience === "custom" ? customAudienceTitle : undefined,
                  updatedAt: new Date().toISOString(),
                }
              : carousel
          ),
        }));
      },

      setCarouselTheme: (id, theme) => {
        set((state) => ({
          carousels: state.carousels.map((carousel) =>
            carousel.id === id
              ? {
                  ...carousel,
                  theme,
                  updatedAt: new Date().toISOString(),
                }
              : carousel
          ),
        }));
      },

      moveCarousel: (fromIndex, toIndex) => {
        set((state) => ({
          carousels: normalizeCarouselOrders(
            moveInArray(state.carousels, fromIndex, toIndex)
          ),
        }));
      },

      addItem: (carouselId, payload) => {
        const carousel = get().carousels.find((item) => item.id === carouselId);

        if (!carousel) return null;

        const now = new Date().toISOString();
        const itemId = payload?.id ?? createId();

        const newItem: CategoryCarouselItem = {
          id: itemId,
          title: payload?.title ?? "دسته‌بندی جدید",
          href: payload?.href ?? "",
          image: payload?.image,
          description: payload?.description ?? "",
          badge: payload?.badge ?? "",
          isActive: payload?.isActive ?? true,
          order: payload?.order ?? carousel.items.length + 1,
          createdAt: payload?.createdAt ?? now,
          updatedAt: now,
        };

        set((state) => ({
          carousels: state.carousels.map((currentCarousel) =>
            currentCarousel.id === carouselId
              ? {
                  ...currentCarousel,
                  items: normalizeItemOrders([
                    ...currentCarousel.items,
                    newItem,
                  ]),
                  updatedAt: now,
                }
              : currentCarousel
          ),
        }));

        return itemId;
      },

      updateItem: (carouselId, itemId, updates) => {
        const now = new Date().toISOString();

        set((state) => ({
          carousels: state.carousels.map((carousel) =>
            carousel.id === carouselId
              ? {
                  ...carousel,
                  items: carousel.items.map((item) =>
                    item.id === itemId
                      ? {
                          ...item,
                          ...updates,
                          updatedAt: now,
                        }
                      : item
                  ),
                  updatedAt: now,
                }
              : carousel
          ),
        }));
      },

      removeItem: (carouselId, itemId) => {
        const now = new Date().toISOString();

        set((state) => ({
          carousels: state.carousels.map((carousel) =>
            carousel.id === carouselId
              ? {
                  ...carousel,
                  items: normalizeItemOrders(
                    carousel.items.filter((item) => item.id !== itemId)
                  ),
                  updatedAt: now,
                }
              : carousel
          ),
        }));
      },

      toggleItemActive: (carouselId, itemId) => {
        const now = new Date().toISOString();

        set((state) => ({
          carousels: state.carousels.map((carousel) =>
            carousel.id === carouselId
              ? {
                  ...carousel,
                  items: carousel.items.map((item) =>
                    item.id === itemId
                      ? {
                          ...item,
                          isActive: !item.isActive,
                          updatedAt: now,
                        }
                      : item
                  ),
                  updatedAt: now,
                }
              : carousel
          ),
        }));
      },

      moveItem: (carouselId, fromIndex, toIndex) => {
        const now = new Date().toISOString();

        set((state) => ({
          carousels: state.carousels.map((carousel) =>
            carousel.id === carouselId
              ? {
                  ...carousel,
                  items: normalizeItemOrders(
                    moveInArray(carousel.items, fromIndex, toIndex)
                  ),
                  updatedAt: now,
                }
              : carousel
          ),
        }));
      },

      resetCarousels: () => {
        set({
          carousels: createInitialCategoryCarousels(),
          selectedCarouselId: null,
        });
      },
    }),
    {
      name: "category-carousel-store-v1",
    }
  )
);

export function createDefaultCategoryCarousel(
  order = 1
): CategoryCarousel {
  const now = new Date().toISOString();

  return {
    id: createId(),
    title: "دسته‌بندی‌های مردانه",
    description: "کروسل دسته‌بندی‌های منتخب برای نمایش در صفحه اصلی.",
    status: "draft",
    isActive: false,
    audience: "men",
    theme: "modern",
    placement: "home_after_product_carousels",
    showTitle: true,
    seeAll: {
      enabled: true,
      label: "مشاهده همه",
      href: "/men",
    },
    items: [],
    order,
    createdAt: now,
    updatedAt: now,
  };
}

function createInitialCategoryCarousels(): CategoryCarousel[] {
  const now = new Date().toISOString();

  return [
    {
      id: createId(),
      title: "دسته‌بندی‌های مردانه",
      description: "کروسل دسته‌بندی‌های مردانه برای صفحه اصلی.",
      status: "draft",
      isActive: false,
      audience: "men",
      theme: "modern",
      placement: "home_after_product_carousels",
      showTitle: true,
      seeAll: {
        enabled: true,
        label: "مشاهده همه مردانه",
        href: "/men",
      },
      items: [
        createInitialItem({
          title: "تیشرت مردانه",
          href: "/men/t-shirts",
          order: 1,
          createdAt: now,
        }),
        createInitialItem({
          title: "شلوار مردانه",
          href: "/men/pants",
          order: 2,
          createdAt: now,
        }),
      ],
      order: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createId(),
      title: "دسته‌بندی‌های زنانه",
      description: "کروسل دسته‌بندی‌های زنانه برای صفحه اصلی.",
      status: "draft",
      isActive: false,
      audience: "women",
      theme: "modern",
      placement: "home_after_product_carousels",
      showTitle: true,
      seeAll: {
        enabled: true,
        label: "مشاهده همه زنانه",
        href: "/women",
      },
      items: [
        createInitialItem({
          title: "ست راحتی زنانه",
          href: "/women/lounge-sets",
          order: 1,
          createdAt: now,
        }),
        createInitialItem({
          title: "شلوار زنانه",
          href: "/women/pants",
          order: 2,
          createdAt: now,
        }),
      ],
      order: 2,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function createInitialItem(payload: {
  title: string;
  href: string;
  order: number;
  createdAt: string;
}): CategoryCarouselItem {
  return {
    id: createId(),
    title: payload.title,
    href: payload.href,
    image: {
      url: "",
      alt: payload.title,
    },
    description: "",
    badge: "",
    isActive: true,
    order: payload.order,
    createdAt: payload.createdAt,
    updatedAt: payload.createdAt,
  };
}

function normalizeCarouselOrders(
  carousels: CategoryCarousel[]
): CategoryCarousel[] {
  return carousels.map((carousel, index) => ({
    ...carousel,
    order: index + 1,
  }));
}

function normalizeItemOrders(items: CategoryCarouselItem[]) {
  return items.map((item, index) => ({
    ...item,
    order: index + 1,
  }));
}

function moveInArray<T>(items: T[], fromIndex: number, toIndex: number) {
  const clonedItems = [...items];

  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= clonedItems.length ||
    toIndex >= clonedItems.length
  ) {
    return clonedItems;
  }

  const [movedItem] = clonedItems.splice(fromIndex, 1);

  if (!movedItem) return clonedItems;

  clonedItems.splice(toIndex, 0, movedItem);

  return clonedItems;
}

function createId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `category-carousel-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}