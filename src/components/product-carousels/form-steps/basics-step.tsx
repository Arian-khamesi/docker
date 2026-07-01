"use client";

import { CheckCircle2, Layers3, Palette, Power } from "lucide-react";

import type {
  ProductCarousel,
  ProductCarouselStatus,
  ProductCarouselTheme,
} from "@/types/product-carousel";
import { useProductCarouselStore } from "@/store/product-carousel.store";
import {
  CarouselFormField,
  FormSectionNote,
  carouselInputClass,
  carouselTextareaClass,
} from "../ui/carousel-form-field";

const themeOptions: Array<{
  value: ProductCarouselTheme;
  title: string;
  description: string;
}> = [
  {
    value: "classic",
    title: "کلاسیک",
    description: "چیدمان ساده و استاندارد برای کروسل‌های عمومی.",
  },
  {
    value: "modern",
    title: "مدرن",
    description: "ظاهر تمیزتر و مناسب برای صفحه اصلی فعلی.",
  },
  {
    value: "minimal",
    title: "مینیمال",
    description: "کم‌جزئیات، سبک و مناسب سکشن‌های خلوت.",
  },
  {
    value: "deal",
    title: "فروش ویژه",
    description: "مناسب کروسل‌های تخفیف‌دار و تایمردار.",
  },
  {
    value: "banner",
    title: "بنردار",
    description: "مناسب زمانی که کروسل همراه تصویر تبلیغاتی است.",
  },
  {
    value: "gray",
    title: "خاکستری",
    description: "حالت خنثی برای تم‌های ساده‌تر.",
  },
];

export function ProductCarouselBasicsStep({
  carousel,
}: {
  carousel: ProductCarousel;
}) {
  const { updateCarousel } = useProductCarouselStore();

  const titleError =
    carousel.title.trim().length === 0
      ? "عنوان کروسل اجباری است."
      : undefined;

  const productLimitError =
    carousel.productLimit < 1
      ? "تعداد محصول باید حداقل ۱ باشد."
      : carousel.productLimit > 48
        ? "برای جلوگیری از سنگین شدن صفحه، تعداد محصول بهتر است بیشتر از ۴۸ نباشد."
        : undefined;

  const setStatus = (status: ProductCarouselStatus) => {
    updateCarousel(carousel.id, { status });
  };

  const setTheme = (theme: ProductCarouselTheme) => {
    updateCarousel(carousel.id, { theme });
  };

  return (
    <div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-black text-primary">مرحله ۱</p>

        <h2 className="text-xl font-black text-foreground">
          اطلاعات اصلی کروسل
        </h2>

        <p className="text-sm leading-7 text-muted-foreground">
          این بخش مشخص می‌کند کروسل چه نامی دارد، فعال است یا نه، با چه استایلی
          نمایش داده می‌شود و چند محصول داخل آن قرار می‌گیرد.
        </p>
      </div>

      <div className="mt-5">
        <FormSectionNote
          title="راهنمای اپراتور"
          text="اول عنوان را واضح وارد کن، بعد مشخص کن این کروسل فقط پیش‌نویس است یا آماده انتشار. اگر هنوز کامل نیست، فعالش نکن."
        />
      </div>

      <div className="mt-6 grid gap-5">
        <div className="grid gap-4 md:grid-cols-2">
          <CarouselFormField
            label="عنوان کروسل"
            hint="مثلاً: بیشترین تخفیف‌های امروز"
            error={titleError}
          >
            <input
              value={carousel.title}
              onChange={(event) =>
                updateCarousel(carousel.id, { title: event.target.value })
              }
              className={carouselInputClass}
              placeholder="عنوان کروسل را وارد کنید"
            />
          </CarouselFormField>

          <CarouselFormField
            label="تعداد محصول"
            hint="تعداد محصولاتی که داخل کروسل نمایش داده می‌شود."
            error={productLimitError}
          >
            <input
              type="number"
              min={1}
              max={48}
              value={carousel.productLimit}
              onChange={(event) =>
                updateCarousel(carousel.id, {
                  productLimit: Number(event.target.value),
                })
              }
              className={carouselInputClass}
              placeholder="مثلاً 12"
            />
          </CarouselFormField>
        </div>

        <CarouselFormField
          label="توضیح داخلی"
          hint="این توضیح فعلاً برای مدیریت داخلی است و الزاماً در سایت نمایش داده نمی‌شود."
        >
          <textarea
            value={carousel.description ?? ""}
            onChange={(event) =>
              updateCarousel(carousel.id, {
                description: event.target.value,
              })
            }
            className={carouselTextareaClass}
            placeholder="توضیح کوتاه برای شناخت بهتر این کروسل"
          />
        </CarouselFormField>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-border bg-background/35 p-4 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <Power className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-black text-foreground">
                وضعیت فعال بودن
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <ChoiceButton
                active={carousel.isActive}
                title="فعال"
                description="اجازه نمایش در سایت"
                onClick={() => updateCarousel(carousel.id, { isActive: true })}
              />

              <ChoiceButton
                active={!carousel.isActive}
                title="غیرفعال"
                description="فعلاً نمایش داده نشود"
                onClick={() => updateCarousel(carousel.id, { isActive: false })}
              />
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border bg-background/35 p-4 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-black text-foreground">
                وضعیت انتشار
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <ChoiceButton
                active={carousel.status === "draft"}
                title="پیش‌نویس"
                description="هنوز نهایی نیست"
                onClick={() => setStatus("draft")}
              />

              <ChoiceButton
                active={carousel.status === "published"}
                title="منتشر شده"
                description="آماده انتشار"
                onClick={() => setStatus("published")}
              />
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-background/35 p-4 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-black text-foreground">
              استایل نمایش کروسل
            </h3>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {themeOptions.map((theme) => (
              <ThemeOption
                key={theme.value}
                active={carousel.theme === theme.value}
                title={theme.title}
                description={theme.description}
                onClick={() => setTheme(theme.value)}
              />
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-background/35 p-4 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Layers3 className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-sm font-black text-foreground">
                خلاصه این مرحله
              </h3>

              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                کروسل «{carousel.title || "بدون عنوان"}» با استایل{" "}
                {themeOptions.find((item) => item.value === carousel.theme)
                  ?.title ?? carousel.theme}{" "}
                و تعداد {carousel.productLimit || 0} محصول تنظیم شده است.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChoiceButton({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl border p-3 text-right transition",
        active
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border bg-background/40 text-foreground hover:border-primary/25 hover:bg-primary/5",
      ].join(" ")}
    >
      <span className="block text-sm font-black">{title}</span>
      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
        {description}
      </span>
    </button>
  );
}

function ThemeOption({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl border p-4 text-right transition",
        active
          ? "border-primary/30 bg-primary/10"
          : "border-border bg-background/40 hover:border-primary/25 hover:bg-primary/5",
      ].join(" ")}
    >
      <span className="block text-sm font-black text-foreground">{title}</span>

      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
        {description}
      </span>
    </button>
  );
}