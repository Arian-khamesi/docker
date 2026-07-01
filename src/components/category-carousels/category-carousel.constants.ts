export const CATEGORY_CAROUSELS_BASE_PATH =
  "/dashboard/content/category-carousels";

export const CATEGORY_CAROUSEL_NEW_PATH = `${CATEGORY_CAROUSELS_BASE_PATH}/new`;

export function getCategoryCarouselEditPath(id: string) {
  return `${CATEGORY_CAROUSELS_BASE_PATH}/${id}/edit`;
}

export const categoryCarouselPageClass =
  "mx-auto flex w-full max-w-[1540px] flex-col gap-6 p-4 sm:p-6";

export const categoryCarouselHeroClass =
  "glass-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-6";

export const categoryCarouselPanelClass =
  "glass-card rounded-[2rem] p-4 sm:p-5";

export const categoryCarouselPrimaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50";

export const categoryCarouselSecondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background/45 px-4 py-3 text-sm font-black text-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:pointer-events-none disabled:opacity-50";

export const categoryCarouselDangerButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-black text-destructive transition hover:bg-destructive/15 disabled:pointer-events-none disabled:opacity-50";

export const categoryCarouselInputClass =
  "h-12 w-full rounded-2xl border border-border bg-background/45 px-4 text-sm font-bold text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary/40 focus:bg-background/65";