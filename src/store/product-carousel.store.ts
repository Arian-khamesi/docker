import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  ProductCarousel,
  ProductCarouselBanners,
  ProductCarouselDiscountConfig,
  ProductCarouselProductRef,
  ProductCarouselSeeAllConfig,
  ProductCarouselSource,
  ProductCarouselStatus,
  ProductCarouselTheme,
  ProductCarouselTimerConfig,
} from "@/types/product-carousel";

type MoveDirection = "up" | "down";

type ProductCarouselOverrides = Partial<
  Omit<
    ProductCarousel,
    "source" | "discount" | "timer" | "seeAll" | "banners"
  >
> & {
  source?: Partial<ProductCarouselSource>;
  discount?: Partial<ProductCarouselDiscountConfig>;
  timer?: Partial<ProductCarouselTimerConfig>;
  seeAll?: Partial<ProductCarouselSeeAllConfig>;
  banners?: Partial<ProductCarouselBanners>;
};

function createId() {
  const cryptoObject = globalThis.crypto;

  if (cryptoObject && "randomUUID" in cryptoObject) {
    return cryptoObject.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function now() {
  return new Date().toISOString();
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate.toISOString();
}

function emptyImage(alt = "") {
  return {
    url: "",
    alt,
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
  direction: MoveDirection
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

function createDefaultProductCarousel(
  overrides: ProductCarouselOverrides = {}
): ProductCarousel {
  const createdAt = now();

  const base: ProductCarousel = {
    id: createId(),

    title: "کروسل محصولات جدید",
    description: "",

    status: "draft",
    isActive: false,

    startsAt: createdAt,
    endsAt: addDays(new Date(), 7),

    theme: "modern",

    productLimit: 12,

    source: {
      type: "highest_discount_percent",
      selectedCategories: [],
      manualProducts: [],
      selectedColor: null,
      sortBy: "highest_discount_percent",
    },

    discount: {
      enabled: true,
      minPercent: 0,
      maxPercent: 100,
      startsAt: createdAt,
      endsAt: addDays(new Date(), 7),
      showDiscountBadge: true,
      showOldPrice: true,
    },

    timer: {
      enabled: false,
      label: "زمان باقی‌مانده",
      target: "carousel_end",
    },

    seeAll: {
      enabled: true,
      label: "مشاهده همه",
      href: "",
      autoGenerateHref: true,
    },

    banners: {
      desktop: emptyImage("بنر دسکتاپ کروسل"),
      mobile: emptyImage("بنر موبایل کروسل"),
    },

    order: 1,

    createdAt,
    updatedAt: createdAt,
  };

  return {
    ...base,
    ...overrides,

    source: {
      ...base.source,
      ...overrides.source,
    },

    discount: {
      ...base.discount,
      ...overrides.discount,
    },

    timer: {
      ...base.timer,
      ...overrides.timer,
    },

    seeAll: {
      ...base.seeAll,
      ...overrides.seeAll,
    },

    banners: {
      ...base.banners,
      ...overrides.banners,
    },
  };
}

const initialCarousels: ProductCarousel[] = [
  createDefaultProductCarousel({
    title: "بیشترین تخفیف‌های امروز",
    status: "draft",
    isActive: false,
    theme: "deal",
    productLimit: 12,
    order: 1,
    source: {
      type: "highest_discount_percent",
      sortBy: "highest_discount_percent",
    },
    timer: {
      enabled: true,
      label: "پایان پیشنهاد",
      target: "carousel_end",
    },
  }),
];

interface ProductCarouselState {
  carousels: ProductCarousel[];
  selectedCarouselId: string | null;
  isEditorOpen: boolean;

  selectCarousel: (id: string | null) => void;
  openEditor: (id?: string | null) => void;
  closeEditor: () => void;

  addCarousel: (payload?: ProductCarouselOverrides) => string;
  duplicateCarousel: (id: string) => void;
  updateCarousel: (id: string, payload: Partial<ProductCarousel>) => void;
  removeCarousel: (id: string) => void;

  setCarouselStatus: (id: string, status: ProductCarouselStatus) => void;
  toggleCarouselActive: (id: string) => void;
  setCarouselTheme: (id: string, theme: ProductCarouselTheme) => void;

  updateCarouselSource: (
    id: string,
    payload: Partial<ProductCarouselSource>
  ) => void;

  updateCarouselDiscount: (
    id: string,
    payload: Partial<ProductCarouselDiscountConfig>
  ) => void;

  updateCarouselTimer: (
    id: string,
    payload: Partial<ProductCarouselTimerConfig>
  ) => void;

  updateCarouselSeeAll: (
    id: string,
    payload: Partial<ProductCarouselSeeAllConfig>
  ) => void;

  updateCarouselBanners: (
    id: string,
    payload: Partial<ProductCarouselBanners>
  ) => void;

  addManualProduct: (carouselId: string, product: ProductCarouselProductRef) => void;
  removeManualProduct: (carouselId: string, productId: string) => void;
  moveManualProduct: (
    carouselId: string,
    productId: string,
    direction: MoveDirection
  ) => void;

  moveCarousel: (id: string, direction: MoveDirection) => void;
  setCarousels: (carousels: ProductCarousel[]) => void;
  resetCarousels: () => void;
}

export const useProductCarouselStore = create<ProductCarouselState>()(
  persist(
    (set, get) => ({
      carousels: initialCarousels,
      selectedCarouselId: initialCarousels[0]?.id ?? null,
      isEditorOpen: false,

      selectCarousel: (id) => {
        set({
          selectedCarouselId: id,
        });
      },

      openEditor: (id = null) => {
        set({
          selectedCarouselId: id,
          isEditorOpen: true,
        });
      },

      closeEditor: () => {
        set({
          isEditorOpen: false,
        });
      },

      addCarousel: (payload) => {
        let createdId = "";

        set((state) => {
          const carousel = createDefaultProductCarousel({
            ...payload,
            order: state.carousels.length + 1,
          });

          createdId = carousel.id;

          return {
            carousels: [...state.carousels, carousel],
            selectedCarouselId: carousel.id,
            isEditorOpen: true,
          };
        });

        return createdId;
      },

      duplicateCarousel: (id) => {
        set((state) => {
          const sourceCarousel = state.carousels.find(
            (carousel) => carousel.id === id
          );

          if (!sourceCarousel) return state;

          const duplicatedCarousel: ProductCarousel = {
            ...sourceCarousel,
            id: createId(),
            title: `کپی ${sourceCarousel.title}`,
            status: "draft",
            isActive: false,
            order: state.carousels.length + 1,
            createdAt: now(),
            updatedAt: now(),
          };

          return {
            carousels: [...state.carousels, duplicatedCarousel],
            selectedCarouselId: duplicatedCarousel.id,
            isEditorOpen: true,
          };
        });
      },

      updateCarousel: (id, payload) => {
        set((state) => ({
          carousels: state.carousels.map((carousel) =>
            carousel.id === id
              ? {
                  ...carousel,
                  ...payload,
                  updatedAt: now(),
                }
              : carousel
          ),
        }));
      },

      removeCarousel: (id) => {
        set((state) => {
          const nextCarousels = reorder(
            state.carousels.filter((carousel) => carousel.id !== id)
          );

          const nextSelectedId =
            state.selectedCarouselId === id
              ? nextCarousels[0]?.id ?? null
              : state.selectedCarouselId;

          return {
            carousels: nextCarousels,
            selectedCarouselId: nextSelectedId,
            isEditorOpen:
              nextSelectedId === null ? false : state.isEditorOpen,
          };
        });
      },

      setCarouselStatus: (id, status) => {
        get().updateCarousel(id, {
          status,
        });
      },

      toggleCarouselActive: (id) => {
        set((state) => ({
          carousels: state.carousels.map((carousel) =>
            carousel.id === id
              ? {
                  ...carousel,
                  isActive: !carousel.isActive,
                  updatedAt: now(),
                }
              : carousel
          ),
        }));
      },

      setCarouselTheme: (id, theme) => {
        get().updateCarousel(id, {
          theme,
        });
      },

      updateCarouselSource: (id, payload) => {
        set((state) => ({
          carousels: state.carousels.map((carousel) =>
            carousel.id === id
              ? {
                  ...carousel,
                  source: {
                    ...carousel.source,
                    ...payload,
                  },
                  updatedAt: now(),
                }
              : carousel
          ),
        }));
      },

      updateCarouselDiscount: (id, payload) => {
        set((state) => ({
          carousels: state.carousels.map((carousel) =>
            carousel.id === id
              ? {
                  ...carousel,
                  discount: {
                    ...carousel.discount,
                    ...payload,
                  },
                  updatedAt: now(),
                }
              : carousel
          ),
        }));
      },

      updateCarouselTimer: (id, payload) => {
        set((state) => ({
          carousels: state.carousels.map((carousel) =>
            carousel.id === id
              ? {
                  ...carousel,
                  timer: {
                    ...carousel.timer,
                    ...payload,
                  },
                  updatedAt: now(),
                }
              : carousel
          ),
        }));
      },

      updateCarouselSeeAll: (id, payload) => {
        set((state) => ({
          carousels: state.carousels.map((carousel) =>
            carousel.id === id
              ? {
                  ...carousel,
                  seeAll: {
                    ...carousel.seeAll,
                    ...payload,
                  },
                  updatedAt: now(),
                }
              : carousel
          ),
        }));
      },

      updateCarouselBanners: (id, payload) => {
        set((state) => ({
          carousels: state.carousels.map((carousel) =>
            carousel.id === id
              ? {
                  ...carousel,
                  banners: {
                    ...carousel.banners,
                    ...payload,
                  },
                  updatedAt: now(),
                }
              : carousel
          ),
        }));
      },

      addManualProduct: (carouselId, product) => {
        set((state) => ({
          carousels: state.carousels.map((carousel) => {
            if (carousel.id !== carouselId) return carousel;

            const alreadyExists = carousel.source.manualProducts.some(
              (item) => item.id === product.id
            );

            if (alreadyExists) return carousel;

            return {
              ...carousel,
              source: {
                ...carousel.source,
                manualProducts: [
                  ...carousel.source.manualProducts,
                  product,
                ],
              },
              updatedAt: now(),
            };
          }),
        }));
      },

      removeManualProduct: (carouselId, productId) => {
        set((state) => ({
          carousels: state.carousels.map((carousel) =>
            carousel.id === carouselId
              ? {
                  ...carousel,
                  source: {
                    ...carousel.source,
                    manualProducts:
                      carousel.source.manualProducts.filter(
                        (product) => product.id !== productId
                      ),
                  },
                  updatedAt: now(),
                }
              : carousel
          ),
        }));
      },

      moveManualProduct: (carouselId, productId, direction) => {
        set((state) => ({
          carousels: state.carousels.map((carousel) => {
            if (carousel.id !== carouselId) return carousel;

            const manualProducts = carousel.source.manualProducts.map(
              (product, index) => ({
                ...product,
                order: index + 1,
              })
            );

            const movedProducts = moveItem(
              manualProducts,
              productId,
              direction
            ).map(({ order: _order, ...product }) => product);

            return {
              ...carousel,
              source: {
                ...carousel.source,
                manualProducts: movedProducts,
              },
              updatedAt: now(),
            };
          }),
        }));
      },

      moveCarousel: (id, direction) => {
        set((state) => ({
          carousels: moveItem(state.carousels, id, direction),
        }));
      },

      setCarousels: (carousels) => {
        set({
          carousels: reorder(carousels),
          selectedCarouselId: carousels[0]?.id ?? null,
        });
      },

      resetCarousels: () => {
        set({
          carousels: initialCarousels,
          selectedCarouselId: initialCarousels[0]?.id ?? null,
          isEditorOpen: false,
        });
      },
    }),
    {
      name: "product-carousel-storage",
    }
  )
);