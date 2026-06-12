import { create } from "zustand";
import { nanoid } from "nanoid";

import { Slide, SliderState } from "@/types/slider";
import { validateSlideForPublish } from "@/lib/slider/validate-slide";

function nowIso() {
  return new Date().toISOString();
}

function normalizeOrders(slides: Slide[]) {
  return [...slides]
    .sort((a, b) => a.order - b.order)
    .map((slide, index) => ({
      ...slide,
      order: index,
    }));
}

function createEmptySlide(order = 0): Slide {
  const now = nowIso();

  return {
    id: nanoid(),

    title: "اسلاید جدید",
    subtitle: "",
    description: "",

    isActive: false,
    order,
    status: "draft",

    contentPosition: "center-right",
    textAlign: "right",
    overlayOpacity: 30,

    images: {
      desktop: { url: "", alt: "" },
      tablet: { url: "", alt: "" },
      mobile: { url: "", alt: "" },
    },

    primaryButton: {
      text: "",
      url: "",
      target: "_self",
      isActive: false,
    },

    secondaryButton: {
      text: "",
      url: "",
      target: "_self",
      isActive: false,
    },

    schedule: {
      startAt: "",
      endAt: "",
    },

    createdAt: now,
    updatedAt: now,
  };
}

function cloneSlide(source: Slide, order: number): Slide {
  const now = nowIso();

  return {
    ...source,
    id: nanoid(),
    title: `${source.title} (کپی)`,
    order,
    status: "draft",
    isActive: false,

    images: {
      desktop: { ...source.images.desktop },
      tablet: { ...source.images.tablet },
      mobile: { ...source.images.mobile },
    },

    primaryButton: { ...source.primaryButton },
    secondaryButton: { ...source.secondaryButton },
    schedule: { ...source.schedule },

    createdAt: now,
    updatedAt: now,
  };
}

export const useSliderStore = create<SliderState>((set) => ({
  slides: [],

  selectedSlideId: null,

  draftOrderIds: null,
  hasPendingOrderChanges: false,

  validationIssuesBySlideId: {},

  selectSlide: (id) =>
    set({
      selectedSlideId: id,
    }),

  addSlide: () =>
    set((state) => {
      const slide = createEmptySlide(state.slides.length);

      return {
        slides: [...state.slides, slide],
        selectedSlideId: slide.id,
      };
    }),

  updateSlide: (id, updates) =>
    set((state) => {
      const nextIssues = {
        ...state.validationIssuesBySlideId,
      };

      delete nextIssues[id];

      return {
        validationIssuesBySlideId: nextIssues,

        slides: state.slides.map((slide) =>
          slide.id === id
            ? {
                ...slide,
                ...updates,
                updatedAt: nowIso(),
              }
            : slide
        ),
      };
    }),

  deleteSlide: (id) =>
    set((state) => {
      const remaining = normalizeOrders(
        state.slides.filter((slide) => slide.id !== id)
      );

      const nextIssues = {
        ...state.validationIssuesBySlideId,
      };

      delete nextIssues[id];

      return {
        slides: remaining,

        selectedSlideId:
          state.selectedSlideId === id
            ? remaining[0]?.id ?? null
            : state.selectedSlideId,

        draftOrderIds: null,
        hasPendingOrderChanges: false,

        validationIssuesBySlideId: nextIssues,
      };
    }),

  duplicateSlide: (id) =>
    set((state) => {
      const source = state.slides.find((slide) => slide.id === id);

      if (!source) return {};

      const duplicated = cloneSlide(source, state.slides.length);

      return {
        slides: normalizeOrders([...state.slides, duplicated]),
        selectedSlideId: duplicated.id,

        draftOrderIds: null,
        hasPendingOrderChanges: false,
      };
    }),

  requestReorderSlides: (orderedIds) =>
    set({
      draftOrderIds: orderedIds,
      hasPendingOrderChanges: true,
    }),

  commitOrderChanges: () =>
    set((state) => {
      if (!state.draftOrderIds) return {};

      const slideMap = new Map(state.slides.map((slide) => [slide.id, slide]));

      const reordered = state.draftOrderIds
        .map((id) => slideMap.get(id))
        .filter((slide): slide is Slide => Boolean(slide))
        .map((slide, index) => ({
          ...slide,
          order: index,
          updatedAt: nowIso(),
        }));

      const missingSlides = state.slides.filter(
        (slide) => !state.draftOrderIds?.includes(slide.id)
      );

      return {
        slides: normalizeOrders([...reordered, ...missingSlides]),

        draftOrderIds: null,
        hasPendingOrderChanges: false,
      };
    }),

  resetOrderChanges: () =>
    set({
      draftOrderIds: null,
      hasPendingOrderChanges: false,
    }),

  publishSlide: (id) =>
    set((state) => {
      const targetSlide = state.slides.find((slide) => slide.id === id);

      if (!targetSlide) return {};

      const validation = validateSlideForPublish(targetSlide);

      if (!validation.canPublish) {
        return {
          validationIssuesBySlideId: {
            ...state.validationIssuesBySlideId,
            [id]: validation.issues,
          },
        };
      }

      const nextIssues = {
        ...state.validationIssuesBySlideId,
      };

      delete nextIssues[id];

      return {
        validationIssuesBySlideId: nextIssues,

        slides: state.slides.map((slide) =>
          slide.id === id
            ? {
                ...slide,
                status: "published",
                updatedAt: nowIso(),
              }
            : slide
        ),
      };
    }),

  unpublishSlide: (id) =>
    set((state) => {
      const nextIssues = {
        ...state.validationIssuesBySlideId,
      };

      delete nextIssues[id];

      return {
        validationIssuesBySlideId: nextIssues,

        slides: state.slides.map((slide) =>
          slide.id === id
            ? {
                ...slide,
                status: "draft",
                isActive: false,
                updatedAt: nowIso(),
              }
            : slide
        ),
      };
    }),

  activateSlide: (id) =>
    set((state) => {
      const targetSlide = state.slides.find((slide) => slide.id === id);

      if (!targetSlide) return {};

      if (targetSlide.status !== "published") {
        return {
          validationIssuesBySlideId: {
            ...state.validationIssuesBySlideId,
            [id]: [
              {
                field: "status",
                message: "برای فعال‌سازی، ابتدا اسلاید را منتشر کنید.",
                severity: "error",
              },
            ],
          },
        };
      }

      const nextIssues = {
        ...state.validationIssuesBySlideId,
      };

      delete nextIssues[id];

      return {
        validationIssuesBySlideId: nextIssues,

        slides: state.slides.map((slide) =>
          slide.id === id
            ? {
                ...slide,
                isActive: true,
                updatedAt: nowIso(),
              }
            : slide
        ),
      };
    }),

  deactivateSlide: (id) =>
    set((state) => {
      const nextIssues = {
        ...state.validationIssuesBySlideId,
      };

      delete nextIssues[id];

      return {
        validationIssuesBySlideId: nextIssues,

        slides: state.slides.map((slide) =>
          slide.id === id
            ? {
                ...slide,
                isActive: false,
                updatedAt: nowIso(),
              }
            : slide
        ),
      };
    }),

  clearValidationIssues: (id) =>
    set((state) => {
      const nextIssues = {
        ...state.validationIssuesBySlideId,
      };

      delete nextIssues[id];

      return {
        validationIssuesBySlideId: nextIssues,
      };
    }),
}));