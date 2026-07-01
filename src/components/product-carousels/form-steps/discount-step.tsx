"use client";

import { type ReactNode } from "react";
import {
  BadgePercent,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  Percent,
  Timer,
} from "lucide-react";

import type { ProductCarousel } from "@/types/product-carousel";
import { useProductCarouselStore } from "@/store/product-carousel.store";
import {
  CarouselFormField,
  FormSectionNote,
  carouselInputClass,
} from "../ui/carousel-form-field";

type TimerTarget = ProductCarousel["timer"]["target"];

const timerTargetOptions: Array<{
  value: TimerTarget;
  title: string;
  description: string;
}> = [
  {
    value: "carousel_end",
    title: "پایان کروسل",
    description: "تایمر تا تاریخ پایان نمایش کروسل حساب می‌شود.",
  },
  {
    value: "discount_end",
    title: "پایان تخفیف",
    description: "تایمر تا تاریخ پایان بازه تخفیف حساب می‌شود.",
  },
  {
    value: "custom",
    title: "زمان دلخواه",
    description: "یک زمان جدا برای پایان تایمر مشخص می‌کنی.",
  },
];

export function ProductCarouselDiscountStep({
  carousel,
}: {
  carousel: ProductCarousel;
}) {
  const { updateCarouselDiscount, updateCarouselTimer } =
    useProductCarouselStore();

  const discount = carousel.discount;
  const timer = carousel.timer;

  const discountError = getDiscountError(
    discount.minPercent,
    discount.maxPercent
  );

  const discountScheduleError = getDateRangeError(
    discount.startsAt,
    discount.endsAt
  );

  const timerError = getTimerError(carousel);

  return (
    <div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-black text-primary">مرحله ۴</p>

        <h2 className="text-xl font-black text-foreground">
          تخفیف و تایمر
        </h2>

        <p className="text-sm leading-7 text-muted-foreground">
          این بخش مشخص می‌کند محصولات کروسل با چه بازه تخفیفی انتخاب شوند و آیا
          کروسل تایمر داشته باشد یا نه.
        </p>
      </div>

      <div className="mt-5">
        <FormSectionNote
          title="نکته مهم"
          text="تخفیف اینجا فعلاً برای فیلتر و نمایش کروسل تنظیم می‌شود. اعمال واقعی تخفیف روی محصول باید بعداً در API و بک‌اند مشخص شود."
        />
      </div>

      <div className="mt-6 grid gap-5">
        <section className="rounded-[1.5rem] border border-border bg-background/35 p-4 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <BadgePercent className="h-4 w-4 text-primary" />

            <h3 className="text-sm font-black text-foreground">
              تنظیمات تخفیف
            </h3>
          </div>

          <div className="grid gap-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <ChoiceButton
                active={discount.enabled}
                title="تخفیف فعال"
                description="محصولات براساس بازه تخفیف فیلتر یا نمایش داده می‌شوند."
                icon={<Eye className="h-4 w-4" />}
                onClick={() =>
                  updateCarouselDiscount(carousel.id, {
                    enabled: true,
                  })
                }
              />

              <ChoiceButton
                active={!discount.enabled}
                title="بدون تخفیف"
                description="کروسل بدون شرط تخفیف ساخته می‌شود."
                icon={<EyeOff className="h-4 w-4" />}
                onClick={() =>
                  updateCarouselDiscount(carousel.id, {
                    enabled: false,
                  })
                }
              />
            </div>

            {discount.enabled ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <CarouselFormField
                    label="حداقل درصد تخفیف"
                    hint="کمترین درصد تخفیفی که محصولات باید داشته باشند."
                  >
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={discount.minPercent ?? 0}
                      onChange={(event) =>
                        updateCarouselDiscount(carousel.id, {
                          minPercent: Number(event.target.value),
                        })
                      }
                      className={carouselInputClass}
                      placeholder="مثلاً ۱۰"
                    />
                  </CarouselFormField>

                  <CarouselFormField
                    label="حداکثر درصد تخفیف"
                    hint="بیشترین درصد تخفیفی که در کروسل مجاز است."
                    error={discountError}
                  >
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={discount.maxPercent ?? 100}
                      onChange={(event) =>
                        updateCarouselDiscount(carousel.id, {
                          maxPercent: Number(event.target.value),
                        })
                      }
                      className={carouselInputClass}
                      placeholder="مثلاً ۷۰"
                    />
                  </CarouselFormField>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <CarouselFormField
                    label="شروع بازه تخفیف"
                    hint="اختیاری؛ برای هماهنگی با کمپین تخفیفی."
                  >
                    <input
                      type="datetime-local"
                      value={toDatetimeLocal(discount.startsAt)}
                      onChange={(event) =>
                        updateCarouselDiscount(carousel.id, {
                          startsAt: fromDatetimeLocal(event.target.value),
                        })
                      }
                      className={carouselInputClass}
                    />
                  </CarouselFormField>

                  <CarouselFormField
                    label="پایان بازه تخفیف"
                    hint="اگر تایمر روی پایان تخفیف باشد، از این زمان استفاده می‌شود."
                    error={discountScheduleError}
                  >
                    <input
                      type="datetime-local"
                      value={toDatetimeLocal(discount.endsAt)}
                      onChange={(event) =>
                        updateCarouselDiscount(carousel.id, {
                          endsAt: fromDatetimeLocal(event.target.value),
                        })
                      }
                      className={carouselInputClass}
                    />
                  </CarouselFormField>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <ChoiceButton
                    active={discount.showDiscountBadge}
                    title="نمایش لیبل تخفیف"
                    description="روی کارت محصول نشان دهد چند درصد تخفیف دارد."
                    icon={<Percent className="h-4 w-4" />}
                    onClick={() =>
                      updateCarouselDiscount(carousel.id, {
                        showDiscountBadge: !discount.showDiscountBadge,
                      })
                    }
                  />

                  <ChoiceButton
                    active={discount.showOldPrice}
                    title="نمایش قیمت قبل"
                    description="قیمت قبل از تخفیف کنار قیمت جدید نمایش داده شود."
                    icon={<BadgePercent className="h-4 w-4" />}
                    onClick={() =>
                      updateCarouselDiscount(carousel.id, {
                        showOldPrice: !discount.showOldPrice,
                      })
                    }
                  />
                </div>
              </>
            ) : (
              <EmptyBox text="تخفیف برای این کروسل غیرفعال است. محصولات بدون فیلتر تخفیف ساخته می‌شوند." />
            )}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-border bg-background/35 p-4 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <Timer className="h-4 w-4 text-primary" />

            <h3 className="text-sm font-black text-foreground">
              تنظیمات تایمر
            </h3>
          </div>

          <div className="grid gap-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <ChoiceButton
                active={timer.enabled}
                title="تایمر فعال"
                description="برای کروسل شمارش معکوس نمایش داده شود."
                icon={<Clock3 className="h-4 w-4" />}
                onClick={() =>
                  updateCarouselTimer(carousel.id, {
                    enabled: true,
                  })
                }
              />

              <ChoiceButton
                active={!timer.enabled}
                title="بدون تایمر"
                description="کروسل بدون شمارش معکوس نمایش داده شود."
                icon={<EyeOff className="h-4 w-4" />}
                onClick={() =>
                  updateCarouselTimer(carousel.id, {
                    enabled: false,
                  })
                }
              />
            </div>

            {timer.enabled ? (
              <>
                <CarouselFormField
                  label="متن تایمر"
                  hint="متنی که کنار یا بالای تایمر نمایش داده می‌شود."
                >
                  <input
                    value={timer.label}
                    onChange={(event) =>
                      updateCarouselTimer(carousel.id, {
                        label: event.target.value,
                      })
                    }
                    className={carouselInputClass}
                    placeholder="مثلاً پایان پیشنهاد"
                  />
                </CarouselFormField>

                <div>
                  <p className="mb-3 text-xs font-black text-foreground">
                    تایمر تا چه زمانی حساب شود؟
                  </p>

                  <div className="grid gap-3 md:grid-cols-3">
                    {timerTargetOptions.map((option) => (
                      <ChoiceButton
                        key={option.value}
                        active={timer.target === option.value}
                        title={option.title}
                        description={option.description}
                        icon={<CalendarClock className="h-4 w-4" />}
                        onClick={() =>
                          updateCarouselTimer(carousel.id, {
                            target: option.value,
                          })
                        }
                      />
                    ))}
                  </div>
                </div>

                {timer.target === "custom" ? (
                  <CarouselFormField
                    label="زمان پایان تایمر"
                    hint="فقط زمانی استفاده می‌شود که هدف تایمر روی زمان دلخواه باشد."
                    error={timerError}
                  >
                    <input
                      type="datetime-local"
                      value={toDatetimeLocal(timer.customEndsAt)}
                      onChange={(event) =>
                        updateCarouselTimer(carousel.id, {
                          customEndsAt: fromDatetimeLocal(event.target.value),
                        })
                      }
                      className={carouselInputClass}
                    />
                  </CarouselFormField>
                ) : timerError ? (
                  <div className="rounded-2xl border border-destructive/15 bg-destructive/10 px-4 py-3 text-xs font-bold leading-6 text-destructive">
                    {timerError}
                  </div>
                ) : null}
              </>
            ) : (
              <EmptyBox text="تایمر برای این کروسل غیرفعال است." />
            )}
          </div>
        </section>

        <DiscountTimerSummary carousel={carousel} />
      </div>
    </div>
  );
}

function DiscountTimerSummary({ carousel }: { carousel: ProductCarousel }) {
  const discount = carousel.discount;
  const timer = carousel.timer;

  return (
    <div className="rounded-[1.5rem] border border-border bg-background/35 p-4 backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CheckCircle2 className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-sm font-black text-foreground">
            خلاصه تخفیف و تایمر
          </h3>

          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            {discount.enabled
              ? `تخفیف فعال است و بازه درصدی از ${
                  discount.minPercent ?? 0
                }٪ تا ${discount.maxPercent ?? 100}٪ تنظیم شده است.`
              : "تخفیف برای این کروسل غیرفعال است."}{" "}
            {timer.enabled
              ? `تایمر با عنوان «${timer.label || "بدون عنوان"}» فعال است.`
              : "تایمر غیرفعال است."}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <SummaryBadge
              label={discount.enabled ? "تخفیف فعال" : "بدون تخفیف"}
            />
            <SummaryBadge label={timer.enabled ? "تایمر فعال" : "بدون تایمر"} />
            <SummaryBadge
              label={
                discount.showDiscountBadge
                  ? "لیبل تخفیف نمایش داده می‌شود"
                  : "بدون لیبل تخفیف"
              }
            />
            <SummaryBadge
              label={
                discount.showOldPrice
                  ? "قیمت قبل نمایش داده می‌شود"
                  : "بدون قیمت قبل"
              }
            />
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
  icon,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  icon: ReactNode;
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
      <span className="flex items-center gap-2 text-primary">{icon}</span>

      <span className="mt-3 block text-sm font-black text-foreground">
        {title}
      </span>

      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
        {description}
      </span>
    </button>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-5 text-center text-xs leading-6 text-muted-foreground">
      {text}
    </div>
  );
}

function SummaryBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
      {label}
    </span>
  );
}

function getDiscountError(minPercent?: number, maxPercent?: number) {
  const min = minPercent ?? 0;
  const max = maxPercent ?? 100;

  if (min < 0 || min > 100 || max < 0 || max > 100) {
    return "درصد تخفیف باید بین ۰ تا ۱۰۰ باشد.";
  }

  if (min > max) {
    return "حداقل درصد تخفیف نباید بیشتر از حداکثر باشد.";
  }

  return undefined;
}

function getDateRangeError(startsAt?: string, endsAt?: string) {
  if (!startsAt || !endsAt) return undefined;

  const startTime = new Date(startsAt).getTime();
  const endTime = new Date(endsAt).getTime();

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    return "تاریخ شروع و پایان باید معتبر باشد.";
  }

  if (endTime <= startTime) {
    return "تاریخ پایان باید بعد از تاریخ شروع باشد.";
  }

  return undefined;
}

function getTimerError(carousel: ProductCarousel) {
  if (!carousel.timer.enabled) return undefined;

  if (carousel.timer.target === "discount_end") {
    if (!carousel.discount.enabled) {
      return "برای استفاده از پایان تخفیف، ابتدا تخفیف را فعال کن.";
    }

    if (!carousel.discount.endsAt) {
      return "تاریخ پایان تخفیف تنظیم نشده است.";
    }

    return undefined;
  }

  if (carousel.timer.target === "custom") {
    if (!carousel.timer.customEndsAt) {
      return "برای تایمر دلخواه باید زمان پایان تایمر را وارد کنی.";
    }

    const customTime = new Date(carousel.timer.customEndsAt).getTime();

    if (Number.isNaN(customTime)) {
      return "زمان پایان تایمر معتبر نیست.";
    }

    if (customTime <= Date.now()) {
      return "زمان پایان تایمر باید در آینده باشد.";
    }
  }

  return undefined;
}

function toDatetimeLocal(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  const localDate = new Date(date.getTime() - timezoneOffset);

  return localDate.toISOString().slice(0, 16);
}

function fromDatetimeLocal(value: string) {
  if (!value) return "";

  return new Date(value).toISOString();
}