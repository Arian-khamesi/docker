// src/components/slider/empty-slider-state.tsx

"use client";

import { ImagePlus } from "lucide-react";

import { useSliderStore } from "@/store/slider.store";

export function EmptySliderState() {
  const { addSlide } =
    useSliderStore();

  return (
    <div
      className="
      rounded-2xl
      border
      border-dashed
      bg-card
      py-20
      px-6
      text-center
    "
    >
      <div
        className="
        mx-auto
        mb-5

        flex
        h-16
        w-16
        items-center
        justify-center

        rounded-2xl
        bg-muted
      "
      >
        <ImagePlus
          className="h-8 w-8 text-muted-foreground"
        />
      </div>

      <h3
        className="
        text-lg
        font-semibold
      "
      >
        هنوز اسلایدی ایجاد نشده
      </h3>

      <p
        className="
        mt-2
        text-sm
        text-muted-foreground
        max-w-md
        mx-auto
      "
      >
        برای شروع مدیریت بنرهای صفحه اصلی،
        اولین اسلاید خود را ایجاد کنید.
      </p>

      <button
        onClick={addSlide}
        className="
        mt-6

        h-11
        px-5

        rounded-xl

        bg-primary
        text-primary-foreground

        text-sm
        font-medium
      "
      >
        ایجاد اولین اسلاید
      </button>
    </div>
  );
}