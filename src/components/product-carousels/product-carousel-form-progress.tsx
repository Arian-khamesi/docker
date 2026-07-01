"use client";

import { CheckCircle2 } from "lucide-react";

import { PRODUCT_CAROUSEL_FORM_STEPS } from "./product-carousel-form.constants";

interface ProductCarouselFormProgressProps {
  activeStepIndex: number;
  onStepChange: (index: number) => void;
}

export function ProductCarouselFormProgress({
  activeStepIndex,
  onStepChange,
}: ProductCarouselFormProgressProps) {
  return (
    <section className="glass-card rounded-[2rem] p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <p className="text-xs font-black text-primary">مراحل فرم</p>
          <p className="mt-1 text-xs text-muted-foreground">
            مرحله فعلی را انتخاب کن یا با دکمه‌های پایین فرم جلو برو.
          </p>
        </div>

        <div className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary sm:block">
          مرحله {activeStepIndex + 1} از {PRODUCT_CAROUSEL_FORM_STEPS.length}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {PRODUCT_CAROUSEL_FORM_STEPS.map((step, index) => {
          const isActive = index === activeStepIndex;
          const isDone = index < activeStepIndex;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange(index)}
              className={[
                "group flex min-w-[190px] flex-1 items-center gap-3 rounded-2xl border px-3 py-3 text-right transition",
                isActive
                  ? "border-primary/30 bg-primary/10"
                  : "border-border bg-background/35 hover:border-primary/25 hover:bg-primary/5",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition",
                  isActive || isDone
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:text-primary",
                ].join(" ")}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : step.icon}
              </span>

              <span className="min-w-0">
                <span className="block truncate text-sm font-black text-foreground">
                  {index + 1}. {step.title}
                </span>

                <span className="mt-1 block truncate text-xs text-muted-foreground">
                  {step.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}