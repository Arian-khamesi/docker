"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, PackageSearch, Save } from "lucide-react";

import {
  PRODUCT_CAROUSELS_BASE_PATH,
  primaryButtonClass,
  secondaryButtonClass,
  type ProductCarouselFormMode,
} from "./product-carousel-form.constants";

interface ProductCarouselFormHeaderProps {
  mode: ProductCarouselFormMode;
  onCreateDraft: () => void;
  onSaveChanges?: () => void;
  savedText?: string;
}

export function ProductCarouselFormHeader({
  mode,
  onCreateDraft,
  onSaveChanges,
  savedText,
}: ProductCarouselFormHeaderProps) {
  const isCreateMode = mode === "create";

  return (
    <section className="glass-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-6">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-16 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-black text-primary">
            <PackageSearch className="h-4 w-4" />
            Product Carousel Studio
          </div>

          <h1 className="text-2xl font-black text-foreground">
            {isCreateMode ? "ساخت کروسل جدید" : "ویرایش کروسل"}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            {isCreateMode
              ? "برای شروع، یک پیش‌نویس بساز تا کروسل id مشخص بگیرد و وارد صفحه ویرایش شود."
              : "تغییرات این فرم در store محلی ذخیره می‌شود و قبل از انتشار در مرحله بررسی نهایی کنترل می‌شود."}
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 lg:items-end">
          <div className="flex flex-wrap gap-2">
            <Link
              href={PRODUCT_CAROUSELS_BASE_PATH}
              className={secondaryButtonClass}
            >
              <ArrowRight className="h-4 w-4" />
              بازگشت به لیست
            </Link>

            {isCreateMode ? (
              <button
                type="button"
                onClick={onCreateDraft}
                className={primaryButtonClass}
              >
                <CheckCircle2 className="h-4 w-4" />
                ایجاد پیش‌نویس
              </button>
            ) : (
              <button
                type="button"
                onClick={onSaveChanges}
                className={primaryButtonClass}
              >
                <Save className="h-4 w-4" />
                ذخیره تغییرات
              </button>
            )}
          </div>

          {savedText ? (
            <p className="text-xs font-bold text-muted-foreground">
              {savedText}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}