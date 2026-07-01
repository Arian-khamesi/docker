"use client";

import { type ReactNode } from "react";
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  Link2,
  Monitor,
  Smartphone,
  ImagePlus,
} from "lucide-react";
import { CarouselImageUploader } from "../ui/carousel-image-uploader";

import type {
  ProductCarousel,
  ProductCarouselBanners,
} from "@/types/product-carousel";
import { useProductCarouselStore } from "@/store/product-carousel.store";
import {
  CarouselFormField,
  FormSectionNote,
  carouselInputClass,
} from "../ui/carousel-form-field";

type BannerTarget = keyof ProductCarouselBanners;

export function ProductCarouselDisplayStep({
  carousel,
}: {
  carousel: ProductCarousel;
}) {
  const { updateCarouselSeeAll, updateCarouselBanners } =
    useProductCarouselStore();

  const seeAll = carousel.seeAll;
  const autoHref = getAutoSeeAllHref(carousel);
  const effectiveHref = seeAll.autoGenerateHref ? autoHref : seeAll.href;

  const setSeeAllAutoMode = (enabled: boolean) => {
    updateCarouselSeeAll(carousel.id, {
      autoGenerateHref: enabled,
      href: enabled ? autoHref : seeAll.href,
    });
  };

  const updateBanner = (
    target: BannerTarget,
    patch: Partial<ProductCarouselImage>
  ) => {
    const current = carousel.banners[target] ?? {
      url: "",
      alt: "",
    };

    updateCarouselBanners(carousel.id, {
      [target]: {
        ...current,
        ...patch,
      },
    });
  };

  const removeBanner = (target: BannerTarget) => {
    updateCarouselBanners(carousel.id, {
      [target]: undefined,
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-black text-primary">مرحله ۵</p>

        <h2 className="text-xl font-black text-foreground">
          نمایش و بنرها
        </h2>

        <p className="text-sm leading-7 text-muted-foreground">
          این بخش مشخص می‌کند کروسل دکمه مشاهده همه داشته باشد یا نه، لینک آن
          چیست و آیا بنر دسکتاپ یا موبایل برای این سکشن نمایش داده شود.
        </p>
      </div>

      <div className="mt-5">
        <FormSectionNote
          title="راهنمای اپراتور"
          text="اگر کروسل محصول‌محور است، معمولاً دکمه مشاهده همه مفید است. اگر کروسل بیشتر تبلیغاتی یا بنری است، بنر دسکتاپ و موبایل را دقیق‌تر تنظیم کن."
        />
      </div>

      <div className="mt-6 grid gap-5">
        <section className="rounded-[1.5rem] border border-border bg-background/35 p-4 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4 text-primary" />

            <h3 className="text-sm font-black text-foreground">
              دکمه مشاهده همه
            </h3>
          </div>

          <div className="grid gap-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <ChoiceButton
                active={seeAll.enabled}
                title="نمایش دکمه"
                description="کاربر بتواند وارد لیست کامل محصولات یا دسته‌بندی شود."
                icon={<Eye className="h-4 w-4" />}
                onClick={() =>
                  updateCarouselSeeAll(carousel.id, {
                    enabled: true,
                  })
                }
              />

              <ChoiceButton
                active={!seeAll.enabled}
                title="بدون دکمه"
                description="کروسل فقط محصولات داخل خودش را نمایش می‌دهد."
                icon={<EyeOff className="h-4 w-4" />}
                onClick={() =>
                  updateCarouselSeeAll(carousel.id, {
                    enabled: false,
                  })
                }
              />
            </div>

            {seeAll.enabled ? (
              <>
                <CarouselFormField
                  label="متن دکمه"
                  hint="متنی که روی دکمه نمایش داده می‌شود."
                >
                  <input
                    value={seeAll.label}
                    onChange={(event) =>
                      updateCarouselSeeAll(carousel.id, {
                        label: event.target.value,
                      })
                    }
                    className={carouselInputClass}
                    placeholder="مثلاً مشاهده همه"
                  />
                </CarouselFormField>

                <div className="grid gap-3 sm:grid-cols-2">
                  <ChoiceButton
                    active={seeAll.autoGenerateHref}
                    title="لینک خودکار"
                    description="لینک براساس دسته‌بندی یا منبع کروسل ساخته شود."
                    icon={<Link2 className="h-4 w-4" />}
                    onClick={() => setSeeAllAutoMode(true)}
                  />

                  <ChoiceButton
                    active={!seeAll.autoGenerateHref}
                    title="لینک دستی"
                    description="اپراتور لینک مشاهده همه را خودش وارد کند."
                    icon={<ArrowUpRight className="h-4 w-4" />}
                    onClick={() => setSeeAllAutoMode(false)}
                  />
                </div>

                <CarouselFormField
                  label="لینک مشاهده همه"
                  hint={
                    seeAll.autoGenerateHref
                      ? "این لینک فعلاً به صورت خودکار از اطلاعات کروسل ساخته می‌شود."
                      : "مثلاً /category/manto یا /search?discount=1"
                  }
                  error={
                    !seeAll.autoGenerateHref && !seeAll.href.trim()
                      ? "وقتی لینک دستی فعال است، وارد کردن لینک الزامی است."
                      : undefined
                  }
                >
                  <input
                    value={effectiveHref}
                    disabled={seeAll.autoGenerateHref}
                    onChange={(event) =>
                      updateCarouselSeeAll(carousel.id, {
                        href: event.target.value,
                      })
                    }
                    className={`${carouselInputClass} disabled:cursor-not-allowed disabled:opacity-60`}
                    placeholder="/category/example"
                  />
                </CarouselFormField>
              </>
            ) : (
              <EmptyBox text="دکمه مشاهده همه برای این کروسل غیرفعال است." />
            )}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-border bg-background/35 p-4 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <ImagePlus className="h-4 w-4 text-primary" />

            <h3 className="text-sm font-black text-foreground">
              بنرهای کروسل
            </h3>
          </div>

          <div className="grid gap-5">
            <BannerEditor
              title="بنر دسکتاپ"
              description="برای نمایش در عرض‌های بزرگ‌تر. بهتر است تصویر افقی و واضح باشد."
              icon={<Monitor className="h-4 w-4" />}
              image={carousel.banners.desktop}
              onChange={(patch) => updateBanner("desktop", patch)}
              onRemove={() => removeBanner("desktop")}
            />

            <BannerEditor
              title="بنر موبایل"
              description="برای نمایش در موبایل. بهتر است تصویر عمودی‌تر یا مخصوص موبایل باشد."
              icon={<Smartphone className="h-4 w-4" />}
              image={carousel.banners.mobile}
              onChange={(patch) => updateBanner("mobile", patch)}
              onRemove={() => removeBanner("mobile")}
            />
          </div>
        </section>

        <DisplaySummary carousel={carousel} effectiveHref={effectiveHref} />
      </div>
    </div>
  );
}

function BannerEditor({
  title,
  description,
  icon,
  image,
  onChange,
  onRemove,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  image?: ProductCarouselBanners[keyof ProductCarouselBanners];
  onChange: (patch: Partial<NonNullable<ProductCarouselBanners[keyof ProductCarouselBanners]>>) => void;
  onRemove: () => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-primary">
        {icon}
        <p className="text-xs font-black text-primary">{title}</p>
      </div>

      <CarouselImageUploader
        label={title}
        description={description}
        value={image}
        onChange={onChange}
        onRemove={onRemove}
      />
    </div>
  );
}

function DisplaySummary({
  carousel,
  effectiveHref,
}: {
  carousel: ProductCarousel;
  effectiveHref: string;
}) {
  const seeAll = carousel.seeAll;
  const hasDesktopBanner = Boolean(carousel.banners.desktop?.url?.trim());
  const hasMobileBanner = Boolean(carousel.banners.mobile?.url?.trim());

  return (
    <div className="rounded-[1.5rem] border border-border bg-background/35 p-4 backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Eye className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-sm font-black text-foreground">
            خلاصه نمایش کروسل
          </h3>

          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            {seeAll.enabled
              ? `دکمه «${seeAll.label || "مشاهده همه"}» فعال است و به مسیر ${
                  effectiveHref || "تنظیم نشده"
                } می‌رود.`
              : "دکمه مشاهده همه غیرفعال است."}{" "}
            {hasDesktopBanner || hasMobileBanner
              ? "برای این کروسل بنر تنظیم شده است."
              : "هنوز بنری برای این کروسل تنظیم نشده است."}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <SummaryBadge
              label={seeAll.enabled ? "مشاهده همه فعال" : "بدون مشاهده همه"}
            />
            <SummaryBadge
              label={
                seeAll.autoGenerateHref ? "لینک خودکار" : "لینک دستی"
              }
            />
            <SummaryBadge
              label={hasDesktopBanner ? "بنر دسکتاپ دارد" : "بدون بنر دسکتاپ"}
            />
            <SummaryBadge
              label={hasMobileBanner ? "بنر موبایل دارد" : "بدون بنر موبایل"}
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

function getAutoSeeAllHref(carousel: ProductCarousel) {
  const firstCategory = carousel.source.selectedCategories[0];

  if (firstCategory?.slug) {
    return `/category/${firstCategory.slug}`;
  }

  if (firstCategory?.id) {
    return `/search?category=${firstCategory.id}`;
  }

  switch (carousel.source.type) {
    case "highest_discount_percent":
      return "/search?sort=highest_discount_percent";
    case "highest_discount_amount":
      return "/search?sort=highest_discount_amount";
    case "most_viewed":
      return "/search?sort=most_viewed";
    case "best_sellers":
      return "/search?sort=best_sellers";
    case "newest":
      return "/search?sort=newest";
    default:
      return "/search";
  }
}