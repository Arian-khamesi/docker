"use client";

import type { ProductCarousel } from "@/types/product-carousel";
import {
    type ProductCarouselFormMode,
    type ProductCarouselFormStepId,
} from "./product-carousel-form.constants";
import { ProductCarouselStepPlaceholder } from "./product-carousel-step-placeholder";
import { ProductCarouselBasicsStep } from "./form-steps/basics-step";
import { ProductCarouselScheduleStep } from "./form-steps/schedule-step";
import { ProductCarouselSourceStep } from "./form-steps/source-step";
import { ProductCarouselDiscountStep } from "./form-steps/discount-step";
import { ProductCarouselDisplayStep } from "./form-steps/display-step";
import { ProductCarouselReviewStep } from "./form-steps/review-step";

interface ProductCarouselFormStepRendererProps {
    mode: ProductCarouselFormMode;
    step: ProductCarouselFormStepId;
    carousel: ProductCarousel | null;
}

export function ProductCarouselFormStepRenderer({
    mode,
    step,
    carousel,
}: ProductCarouselFormStepRendererProps) {
    if (!carousel) {
        return <CreateDraftRequired mode={mode} step={step} />;
    }

    switch (step) {
        case "basics":
            return <ProductCarouselBasicsStep carousel={carousel} />;

        case "schedule":
            return <ProductCarouselScheduleStep carousel={carousel} />;

        case "source":
            return <ProductCarouselSourceStep carousel={carousel} />;

        case "discount":
            return <ProductCarouselDiscountStep carousel={carousel} />;

        case "display":
            return <ProductCarouselDisplayStep carousel={carousel} />;

        case "review":
            return <ProductCarouselReviewStep carousel={carousel} />;

        default:
            return <ProductCarouselStepPlaceholder step={step} />;
    }
}

function CreateDraftRequired({
    mode,
    step,
}: {
    mode: ProductCarouselFormMode;
    step: ProductCarouselFormStepId;
}) {
    if (mode !== "create") {
        return <ProductCarouselStepPlaceholder step={step} />;
    }

    return (
        <div>
            <p className="text-xs font-black text-primary">شروع ساخت کروسل</p>

            <h2 className="mt-2 text-xl font-black text-foreground">
                اول پیش‌نویس بساز
            </h2>

            <p className="mt-2 text-sm leading-7 text-muted-foreground">
                برای اینکه اطلاعات فرم در store ذخیره شود و route ویرایش مشخص داشته
                باشیم، ابتدا باید یک پیش‌نویس ساخته شود. بعد از ساخت پیش‌نویس، وارد صفحه
                ویرایش همان کروسل می‌شوی.
            </p>

            <div className="mt-5 rounded-2xl border border-primary/10 bg-primary/5 p-4">
                <p className="text-sm font-black text-primary">چرا این کار بهتر است؟</p>

                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                    چون هر کروسل از همان ابتدا id مشخص دارد، ویرایش، ذخیره، اتصال API و
                    برگشت به فرم بعداً تمیزتر و قابل کنترل‌تر می‌شود.
                </p>
            </div>
        </div>
    );
}