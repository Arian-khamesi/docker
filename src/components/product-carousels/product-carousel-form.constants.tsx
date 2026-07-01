import type { ReactNode } from "react";
import {
    CalendarClock,
    Eye,
    ImagePlus,
    Percent,
    Settings2,
    ShoppingBag,
} from "lucide-react";

export type ProductCarouselFormMode = "create" | "edit";

export type ProductCarouselFormStepId =
    | "basics"
    | "schedule"
    | "source"
    | "discount"
    | "display"
    | "review";

export interface ProductCarouselFormStep {
    id: ProductCarouselFormStepId;
    title: string;
    description: string;
    icon: ReactNode;
}

export const PRODUCT_CAROUSELS_BASE_PATH =
    "/dashboard/content/product-carousels";

export const PRODUCT_CAROUSEL_NEW_PATH = `${PRODUCT_CAROUSELS_BASE_PATH}/new`;

export function getProductCarouselEditPath(id: string) {
    return `${PRODUCT_CAROUSELS_BASE_PATH}/${id}/edit`;
}

export const PRODUCT_CAROUSEL_FORM_STEPS: ProductCarouselFormStep[] = [
    {
        id: "basics",
        title: "اطلاعات اصلی",
        description: "عنوان، وضعیت، تعداد محصول و استایل",
        icon: <Settings2 className="h-4 w-4" />,
    },
    {
        id: "schedule",
        title: "زمان‌بندی",
        description: "تاریخ شروع و پایان نمایش",
        icon: <CalendarClock className="h-4 w-4" />,
    },
    {
        id: "source",
        title: "منبع محصولات",
        description: "خودکار، دستی، رنگ، دسته‌بندی یا محتوای آزاد",
        icon: <ShoppingBag className="h-4 w-4" />,
    },
    {
        id: "discount",
        title: "تخفیف و تایمر",
        description: "بازه تخفیف، تایمر و لیبل‌های فروش",
        icon: <Percent className="h-4 w-4" />,
    },
    {
        id: "display",
        title: "نمایش و بنرها",
        description: "مشاهده همه، بنر دسکتاپ و موبایل",
        icon: <ImagePlus className="h-4 w-4" />,
    },
    {
        id: "review",
        title: "بررسی نهایی",
        description: "چک نهایی قبل از انتشار",
        icon: <Eye className="h-4 w-4" />,
    },
];

export const pageClass =
    "mx-auto flex w-full max-w-[1540px] flex-col gap-6 p-4 sm:p-6";

export const heroClass =
    "glass-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-6";

export const panelClass = "glass-card rounded-[2rem] p-4 sm:p-5";

export const sidePanelClass =
    "glass-context-panel rounded-[2rem] p-4 sm:p-5";

export const primaryButtonClass =
    "inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40";

export const secondaryButtonClass =
    "inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background/45 px-4 py-2.5 text-sm font-black text-foreground backdrop-blur-xl transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary";


export const formGridClass =
  "grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_320px]";