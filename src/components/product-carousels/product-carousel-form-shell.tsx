"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { useProductCarouselStore } from "@/store/product-carousel.store";
import { ProductCarouselFormHeader } from "./product-carousel-form-header";
import { ProductCarouselFormProgress } from "./product-carousel-form-progress";
import { ProductCarouselFormStepRenderer } from "./product-carousel-form-step-renderer";
import {
  ProductCarouselCreateSummary,
  ProductCarouselEditSummary,
} from "./product-carousel-form-summary";
import {
  PRODUCT_CAROUSELS_BASE_PATH,
  PRODUCT_CAROUSEL_FORM_STEPS,
  formGridClass,
  getProductCarouselEditPath,
  pageClass,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
  sidePanelClass,
  type ProductCarouselFormMode,
} from "./product-carousel-form.constants";

interface ProductCarouselFormShellProps {
  mode: ProductCarouselFormMode;
  carouselId?: string;
}

export function ProductCarouselFormShell({
  mode,
  carouselId,
}: ProductCarouselFormShellProps) {
  const router = useRouter();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const { carousels, addCarousel } = useProductCarouselStore();

  const isCreateMode = mode === "create";

  const carousel = useMemo(() => {
    if (mode !== "edit" || !carouselId) return null;

    return carousels.find((item) => item.id === carouselId) ?? null;
  }, [carousels, carouselId, mode]);

  const activeStep =
    PRODUCT_CAROUSEL_FORM_STEPS[activeStepIndex] ??
    PRODUCT_CAROUSEL_FORM_STEPS[0];

  const handleSaveChanges = () => {
    const savedTime = new Intl.DateTimeFormat("fa-IR", {
      timeStyle: "short",
    }).format(new Date());

    setLastSavedAt(savedTime);
  };

  const handleCreateDraft = () => {
    const id = addCarousel({
      title: "کروسل محصولات جدید",
      status: "draft",
      isActive: false,
    });

    router.replace(getProductCarouselEditPath(id));
  };

  const goNext = () => {
    setActiveStepIndex((current) =>
      Math.min(current + 1, PRODUCT_CAROUSEL_FORM_STEPS.length - 1)
    );
  };

  const goPrev = () => {
    setActiveStepIndex((current) => Math.max(current - 1, 0));
  };

  if (!activeStep) return null;

  if (mode === "edit" && !carousel) {
    return (
      <div className={pageClass}>
        <section className="glass-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-6">
          <div className="relative">
            <p className="text-xs font-black text-primary">
              Product Carousel Studio
            </p>

            <h1 className="mt-2 text-2xl font-black text-foreground">
              کروسل پیدا نشد
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              این کروسل در store وجود ندارد یا قبلاً حذف شده است.
            </p>

            <Link
              href={PRODUCT_CAROUSELS_BASE_PATH}
              className={`${primaryButtonClass} mt-5`}
            >
              بازگشت به لیست کروسل‌ها
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={pageClass}>
      <ProductCarouselFormHeader
        mode={mode}
        onCreateDraft={handleCreateDraft}
        onSaveChanges={handleSaveChanges}
        savedText={lastSavedAt ? `آخرین ذخیره محلی: ${lastSavedAt}` : undefined}
      />

      <ProductCarouselFormProgress
        activeStepIndex={activeStepIndex}
        onStepChange={setActiveStepIndex}
      />

      <div className={formGridClass}>

        <main className="min-w-0">
          <section className={panelClass}>
            <ProductCarouselFormStepRenderer
              mode={mode}
              step={activeStep.id}
              carousel={carousel}
            />
            <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goPrev}
                disabled={activeStepIndex === 0}
                className={secondaryButtonClass}
              >
                <ArrowRight className="h-4 w-4" />
                مرحله قبل
              </button>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  href={PRODUCT_CAROUSELS_BASE_PATH}
                  className={secondaryButtonClass}
                >
                  انصراف
                </Link>

                <button
                  type="button"
                  onClick={goNext}
                  disabled={
                    activeStepIndex === PRODUCT_CAROUSEL_FORM_STEPS.length - 1
                  }
                  className={primaryButtonClass}
                >
                  مرحله بعد
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        </main>

        <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start">
          <section className={sidePanelClass}>
            {isCreateMode ? (
              <ProductCarouselCreateSummary />
            ) : carousel ? (
              <ProductCarouselEditSummary carousel={carousel} />
            ) : null}
          </section>
        </aside>
      </div>
    </div>
  );
}