"use client";

import { useMemo } from "react";

import { useSliderStore } from "@/store/slider.store";

import { ContentSection } from "./sections/content-section";
import { ImagesSection } from "./sections/images-section";
import { ButtonsSection } from "./sections/buttons-section";
import { SettingsSection } from "./sections/settings-section";
import { ScheduleSection } from "./sections/schedule-section";

export function SliderEditor() {
  const { slides, selectedSlideId, updateSlide } = useSliderStore();

  const slide = useMemo(
    () => slides.find((item) => item.id === selectedSlideId),
    [slides, selectedSlideId]
  );

  if (!slide) {
    return (
      <div className="glass-panel flex min-h-[420px] items-center justify-center rounded-3xl p-8 text-center">
        <div>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl glass-card text-primary">
            +
          </div>

          <h3 className="text-base font-semibold text-foreground">
            اسلایدی انتخاب نشده است
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            از لیست بالا یک اسلاید را انتخاب کنید یا اسلاید جدید بسازید.
          </p>
        </div>
      </div>
    );
  }

  const handleChange = (updates: Partial<typeof slide>) => {
    updateSlide(slide.id, updates);
  };

  return (
    <div className="space-y-5">
      <EditorSection
        eyebrow="Content"
        title="محتوای اسلاید"
        description="عنوان، زیرعنوان و توضیحاتی که روی تصویر نمایش داده می‌شوند."
      >
        <ContentSection slide={slide} onChange={handleChange} />
      </EditorSection>

      <EditorSection
        eyebrow="Media"
        title="تصاویر واکنش‌گرا"
        description="تصویر مناسب برای دسکتاپ، تبلت و موبایل را مدیریت کنید."
      >
        <ImagesSection slide={slide} onChange={handleChange} />
      </EditorSection>

      <EditorSection
        eyebrow="CTA"
        title="دکمه‌های اقدام"
        description="دکمه اصلی و دکمه دوم را برای هدایت کاربر تنظیم کنید."
      >
        <ButtonsSection slide={slide} onChange={handleChange} />
      </EditorSection>

      <EditorSection
        eyebrow="Display"
        title="تنظیمات نمایش"
        description="موقعیت محتوا، تراز متن و پوشش تیره تصویر را تنظیم کنید."
      >
        <SettingsSection slide={slide} onChange={handleChange} />
      </EditorSection>

      <EditorSection
        eyebrow="Schedule"
        title="زمان‌بندی نمایش"
        description="بازه زمانی مجاز برای نمایش اسلاید را مشخص کنید."
      >
        <ScheduleSection slide={slide} onChange={handleChange} />
      </EditorSection>
    </div>
  );
}

function EditorSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-panel overflow-hidden rounded-3xl">
      <div className="border-b glass-divider p-5">
        <div className="mb-2 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
          {eyebrow}
        </div>

        <h3 className="text-base font-bold text-foreground">{title}</h3>

        <p className="mt-1 text-xs leading-6 text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}