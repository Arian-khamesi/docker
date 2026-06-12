"use client";

import { Monitor, Smartphone, Tablet } from "lucide-react";

import { Slide, SlideImage } from "@/types/slider";

import { ResponsiveImageUploader } from "../uploaders/responsive-image-uploader";

interface ImagesSectionProps {
  slide: Slide;
  onChange: (updates: Partial<Slide>) => void;
}

const emptyImage: SlideImage = {
  url: "",
  alt: "",
};

export function ImagesSection({ slide, onChange }: ImagesSectionProps) {
  const updateImage = (key: keyof Slide["images"], image: SlideImage) => {
    onChange({
      images: {
        ...slide.images,
        [key]: image,
      },
    });
  };

  const completedCount = [
    slide.images.desktop.url,
    slide.images.tablet.url,
    slide.images.mobile.url,
  ].filter(Boolean).length;

  return (
    <div className="space-y-5">
      <div className="glass-card rounded-2xl p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              تصاویر واکنش‌گرا
            </p>

            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              برای کیفیت بهتر، حداقل تصویر دسکتاپ را وارد کنید. تصویر موبایل
              برای نمایش درست روی گوشی توصیه می‌شود.
            </p>
          </div>

          <span
            className={
              completedCount === 3
                ? "status-badge status-badge-success"
                : completedCount > 0
                  ? "status-badge status-badge-warning"
                  : "status-badge status-badge-muted"
            }
          >
            {completedCount}/3 تصویر
          </span>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <ResponsiveImageUploader
          icon={<Monitor size={19} />}
          label="دسکتاپ"
          recommendedSize="1920 × 700"
          value={slide.images.desktop}
          required
          onChange={(image) => updateImage("desktop", image)}
          onRemove={() => updateImage("desktop", emptyImage)}
        />

        <ResponsiveImageUploader
          icon={<Tablet size={19} />}
          label="تبلت"
          recommendedSize="1200 × 700"
          value={slide.images.tablet}
          onChange={(image) => updateImage("tablet", image)}
          onRemove={() => updateImage("tablet", emptyImage)}
        />

        <ResponsiveImageUploader
          icon={<Smartphone size={19} />}
          label="موبایل"
          recommendedSize="800 × 1000"
          value={slide.images.mobile}
          onChange={(image) => updateImage("mobile", image)}
          onRemove={() => updateImage("mobile", emptyImage)}
        />
      </div>
    </div>
  );
}