import { SlideValidationIssue } from "@/lib/slider/validate-slide";



export interface SlideImage {
  url: string;
  alt: string;
}

export interface SlideButton {
  text: string;
  url: string;
  target: "_self" | "_blank";
  isActive: boolean;
}

export type SlideStatus = "draft" | "scheduled" | "published" | "expired";

export type ContentPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type TextAlign = "right" | "center" | "left";

export interface Slide {
  id: string;

  title: string;
  subtitle: string;
  description: string;

  isActive: boolean;
  order: number;
  status: SlideStatus;

  contentPosition: ContentPosition;
  textAlign: TextAlign;
  overlayOpacity: number;

  images: {
    desktop: SlideImage;
    tablet: SlideImage;
    mobile: SlideImage;
  };

  primaryButton: SlideButton;
  secondaryButton: SlideButton;

  schedule: {
    startAt: string;
    endAt: string;
  };

  createdAt: string;
  updatedAt: string;
}

export interface SliderState {
  slides: Slide[];
  selectedSlideId: string | null;

  draftOrderIds: string[] | null;
  hasPendingOrderChanges: boolean;

  validationIssuesBySlideId: Record<string, SlideValidationIssue[]>;

  selectSlide: (id: string | null) => void;

  addSlide: () => void;
  updateSlide: (id: string, updates: Partial<Slide>) => void;
  deleteSlide: (id: string) => void;
  duplicateSlide: (id: string) => void;

  requestReorderSlides: (orderedIds: string[]) => void;
  commitOrderChanges: () => void;
  resetOrderChanges: () => void;

  publishSlide: (id: string) => void;
  unpublishSlide: (id: string) => void;
  activateSlide: (id: string) => void;
  deactivateSlide: (id: string) => void;

  clearValidationIssues: (id: string) => void;
}