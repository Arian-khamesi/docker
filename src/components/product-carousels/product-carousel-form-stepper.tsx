"use client";

import { CheckCircle2 } from "lucide-react";

import {
  PRODUCT_CAROUSEL_FORM_STEPS,
  sidePanelClass,
} from "./product-carousel-form.constants";

interface ProductCarouselFormStepperProps {
  activeStepIndex: number;
  onStepChange: (index: number) => void;
}

export function ProductCarouselFormStepper({
  activeStepIndex,
  onStepChange,
}: ProductCarouselFormStepperProps) {
  return (
    <section className={sidePanelClass}>
      <p className="text-xs font-black text-primary">مراحل فرم</p>

      <div className="mt-4 grid gap-2">
        {PRODUCT_CAROUSEL_FORM_STEPS.map((step, index) => {
          const isActive = index === activeStepIndex;
          const isDone = index < activeStepIndex;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange(index)}
              className={[
                "flex w-full items-start gap-3 rounded-2xl border p-3 text-right transition",
                isActive
                  ? "border-primary/30 bg-primary/10"
                  : "border-border bg-background/35 hover:border-primary/20 hover:bg-primary/5",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                  isActive || isDone
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : step.icon}
              </span>

              <span className="min-w-0">
                <span className="block text-sm font-black text-foreground">
                  {index + 1}. {step.title}
                </span>

                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
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