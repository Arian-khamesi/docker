"use client";

import { useRef } from "react";
import { ImagePlus, Link2, Trash2, Upload } from "lucide-react";

import type { ProductCarouselImage } from "@/types/product-carousel";
import {
  CarouselFormField,
  carouselInputClass,
} from "./carousel-form-field";

interface CarouselImageUploaderProps {
  label: string;
  description: string;
  value?: ProductCarouselImage;
  onChange: (patch: Partial<ProductCarouselImage>) => void;
  onRemove: () => void;
}

export function CarouselImageUploader({
  label,
  description,
  value,
  onChange,
  onRemove,
}: CarouselImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const hasImage = Boolean(value?.url?.trim());

  const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    onChange({
      url: previewUrl,
      alt: value?.alt || file.name,
    });

    event.target.value = "";
  };

  return (
    <div className="rounded-[1.5rem] border border-border bg-background/35 p-4 backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-black text-foreground">{label}</h4>

          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        {hasImage ? (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-destructive/15 bg-destructive/10 text-destructive transition hover:bg-destructive/15"
            title="حذف تصویر"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
        <div className="grid gap-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSelectFile}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground transition hover:bg-primary/90"
          >
            <Upload className="h-4 w-4" />
            {hasImage ? "تغییر تصویر" : "آپلود تصویر"}
          </button>

          <CarouselFormField
            label="آدرس تصویر"
            hint="می‌توانی تصویر را آپلود کنی یا آدرس مستقیم تصویر را دستی وارد کنی."
          >
            <div className="relative">
              <Link2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                value={value?.url ?? ""}
                onChange={(event) => onChange({ url: event.target.value })}
                className={`${carouselInputClass} pr-10`}
                placeholder="https://example.com/banner.jpg"
              />
            </div>
          </CarouselFormField>

          <CarouselFormField
            label="متن جایگزین تصویر"
            hint="برای دسترسی‌پذیری و SEO بهتر."
          >
            <input
              value={value?.alt ?? ""}
              onChange={(event) => onChange({ alt: event.target.value })}
              className={carouselInputClass}
              placeholder="مثلاً بنر تخفیف مانتو"
            />
          </CarouselFormField>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-background/40">
          {hasImage ? (
            <img
              src={value?.url}
              alt={value?.alt || label}
              className="h-44 w-full object-cover"
            />
          ) : (
            <div className="flex h-44 flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground">
              <ImagePlus className="h-8 w-8" />

              <p className="text-xs font-bold leading-6">
                هنوز تصویری انتخاب نشده است.
              </p>

              <p className="text-[11px] leading-5 text-muted-foreground/80">
                JPG ، PNG ، WEBP
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}