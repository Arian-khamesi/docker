"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  Layers3,
  Package,
  PackageSearch,
  Plus,
  ShoppingBag,
  Sparkles,
  Tags,
  TrendingUp,
} from "lucide-react";

import type {
  ProductCarouselSortBy,
  ProductCarouselSourceType,
  ProductCarouselTheme,
} from "@/types/product-carousel";
import { useProductCarouselStore } from "@/store/product-carousel.store";
import {
  PRODUCT_CAROUSELS_BASE_PATH,
  getProductCarouselEditPath,
  heroClass,
  pageClass,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./product-carousel-form.constants";
import {
  carouselInputClass,
  carouselTextareaClass,
} from "./ui/carousel-form-field";

type CreateTemplateId =
  | "deal"
  | "manual"
  | "newest"
  | "best_sellers"
  | "category"
  | "banner";

interface CreateTemplate {
  id: CreateTemplateId;
  title: string;
  description: string;
  defaultTitle: string;
  defaultDescription: string;
  badge: string;
  icon: ReactNode;
  theme: ProductCarouselTheme;
  sourceType: ProductCarouselSourceType;
  sortBy: ProductCarouselSortBy;
  productLimit: number;
  discountEnabled: boolean;
  timerEnabled: boolean;
  seeAllEnabled: boolean;
  seeAllHref: string;
}

const createTemplates: CreateTemplate[] = [
  {
    id: "deal",
    title: "کروسل تخفیفی",
    description: "مناسب کمپین‌ها، فروش ویژه و محصولات با بیشترین درصد تخفیف.",
    defaultTitle: "بیشترین تخفیف‌های امروز",
    defaultDescription: "کروسل خودکار برای نمایش محصولات تخفیف‌دار صفحه اصلی.",
    badge: "پیشنهادی",
    icon: <BadgePercent className="h-5 w-5" />,
    theme: "deal",
    sourceType: "highest_discount_percent",
    sortBy: "highest_discount_percent",
    productLimit: 12,
    discountEnabled: true,
    timerEnabled: true,
    seeAllEnabled: true,
    seeAllHref: "/search?sort=highest_discount_percent",
  },
  {
    id: "manual",
    title: "انتخاب دستی",
    description: "برای زمانی که اپراتور دقیقاً می‌داند چه محصولاتی باید نمایش داده شوند.",
    defaultTitle: "منتخب جامه پوش آرا",
    defaultDescription: "کروسل curated با محصولات انتخابی اپراتور.",
    badge: "کنترل کامل",
    icon: <Package className="h-5 w-5" />,
    theme: "modern",
    sourceType: "manual",
    sortBy: "default",
    productLimit: 8,
    discountEnabled: false,
    timerEnabled: false,
    seeAllEnabled: false,
    seeAllHref: "",
  },
  {
    id: "newest",
    title: "جدیدترین محصولات",
    description: "برای نمایش تازه‌ترین کالاها در صفحه اصلی یا landing page.",
    defaultTitle: "جدیدترین محصولات",
    defaultDescription: "کروسل خودکار برای محصولات تازه اضافه‌شده.",
    badge: "تازه‌ها",
    icon: <Sparkles className="h-5 w-5" />,
    theme: "minimal",
    sourceType: "newest",
    sortBy: "newest",
    productLimit: 12,
    discountEnabled: false,
    timerEnabled: false,
    seeAllEnabled: true,
    seeAllHref: "/search?sort=newest",
  },
  {
    id: "best_sellers",
    title: "پرفروش‌ترین‌ها",
    description: "برای نمایش کالاهای محبوب و فروش‌رفته‌تر.",
    defaultTitle: "پرفروش‌ترین‌های هفته",
    defaultDescription: "کروسل خودکار براساس فروش محصولات.",
    badge: "محبوب",
    icon: <TrendingUp className="h-5 w-5" />,
    theme: "modern",
    sourceType: "best_sellers",
    sortBy: "best_sellers",
    productLimit: 12,
    discountEnabled: false,
    timerEnabled: false,
    seeAllEnabled: true,
    seeAllHref: "/search?sort=best_sellers",
  },
  {
    id: "category",
    title: "دسته‌بندی محور",
    description: "برای ساخت کروسل براساس یک یا چند دسته‌بندی محصول.",
    defaultTitle: "پیشنهادهای دسته‌بندی",
    defaultDescription: "کروسل وابسته به دسته‌بندی‌های انتخابی.",
    badge: "دسته‌بندی",
    icon: <Tags className="h-5 w-5" />,
    theme: "classic",
    sourceType: "category_only",
    sortBy: "default",
    productLimit: 12,
    discountEnabled: false,
    timerEnabled: false,
    seeAllEnabled: true,
    seeAllHref: "/search",
  },
  {
    id: "banner",
    title: "بنردار / محتوای آزاد",
    description: "برای سکشن‌های تبلیغاتی، بنری یا ترکیبی با محصول کمتر.",
    defaultTitle: "کمپین ویژه",
    defaultDescription: "کروسل یا سکشن بنردار برای کمپین‌های خاص.",
    badge: "بنردار",
    icon: <Layers3 className="h-5 w-5" />,
    theme: "banner",
    sourceType: "free_content",
    sortBy: "default",
    productLimit: 1,
    discountEnabled: false,
    timerEnabled: false,
    seeAllEnabled: true,
    seeAllHref: "/search",
  },
];

export function ProductCarouselCreateStart() {
  const router = useRouter();
  const { addCarousel } = useProductCarouselStore();

  const [selectedTemplateId, setSelectedTemplateId] =
    useState<CreateTemplateId>("deal");

  const selectedTemplate = useMemo(
    () =>
      createTemplates.find((template) => template.id === selectedTemplateId) ??
      createTemplates[0]!,
    [selectedTemplateId]
  );

  const [title, setTitle] = useState(selectedTemplate.defaultTitle);
  const [description, setDescription] = useState(
    selectedTemplate.defaultDescription
  );
  const [productLimit, setProductLimit] = useState(
    selectedTemplate.productLimit
  );

  const handleSelectTemplate = (template: CreateTemplate) => {
    setSelectedTemplateId(template.id);
    setTitle(template.defaultTitle);
    setDescription(template.defaultDescription);
    setProductLimit(template.productLimit);
  };

  const handleCreateCarousel = () => {
    const normalizedTitle = title.trim() || selectedTemplate.defaultTitle;
    const normalizedDescription =
      description.trim() || selectedTemplate.defaultDescription;
    const normalizedProductLimit = clampNumber(productLimit, 1, 48);

    const id = addCarousel({
      title: normalizedTitle,
      description: normalizedDescription,
      status: "draft",
      isActive: false,
      theme: selectedTemplate.theme,
      productLimit: normalizedProductLimit,
      source: {
        type: selectedTemplate.sourceType,
        sortBy: selectedTemplate.sortBy,
        selectedCategories: [],
        manualProducts: [],
        selectedColor: null,
      },
      discount: {
        enabled: selectedTemplate.discountEnabled,
        minPercent: selectedTemplate.discountEnabled ? 10 : undefined,
        maxPercent: selectedTemplate.discountEnabled ? 70 : undefined,
        startsAt: undefined,
        endsAt: undefined,
        showDiscountBadge: selectedTemplate.discountEnabled,
        showOldPrice: selectedTemplate.discountEnabled,
      },
      timer: {
        enabled: selectedTemplate.timerEnabled,
        label: selectedTemplate.timerEnabled ? "زمان باقی‌مانده" : "پایان پیشنهاد",
        target: "carousel_end",
        customEndsAt: undefined,
      },
      seeAll: {
        enabled: selectedTemplate.seeAllEnabled,
        label: "مشاهده همه",
        href: selectedTemplate.seeAllHref,
        autoGenerateHref: true,
      },
      banners: {},
    });

    router.push(getProductCarouselEditPath(id));
  };

  return (
    <div className={pageClass}>
      <section className={heroClass}>
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-16 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-black text-primary">
              <PackageSearch className="h-4 w-4" />
              Product Carousel Studio
            </div>

            <h1 className="text-2xl font-black text-foreground">
              ساخت کروسل جدید
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              این صفحه فقط برای شروع ساخت است. یک قالب اولیه انتخاب کن، پیش‌نویس
              ساخته می‌شود و بعد وارد صفحه ویرایش کامل همان کروسل می‌شوی.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href={PRODUCT_CAROUSELS_BASE_PATH} className={secondaryButtonClass}>
              <ArrowRight className="h-4 w-4" />
              بازگشت به لیست
            </Link>

            <button
              type="button"
              onClick={handleCreateCarousel}
              className={primaryButtonClass}
            >
              <Plus className="h-4 w-4" />
              ساخت و ادامه ویرایش
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <main className="min-w-0">
          <section className={panelClass}>
            <div className="mb-5">
              <p className="text-xs font-black text-primary">قالب شروع</p>

              <h2 className="mt-1 text-xl font-black text-foreground">
                نوع کروسل را انتخاب کن
              </h2>

              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                قالب فقط مقدارهای اولیه را تنظیم می‌کند. همه چیز بعداً در صفحه
                ویرایش قابل تغییر است.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {createTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  active={template.id === selectedTemplateId}
                  onClick={() => handleSelectTemplate(template)}
                />
              ))}
            </div>

            <div className="mt-6 grid gap-5 rounded-[1.5rem] border border-border bg-background/35 p-4 backdrop-blur-xl">
              <div>
                <p className="text-xs font-black text-primary">
                  تنظیمات اولیه
                </p>

                <h3 className="mt-1 text-base font-black text-foreground">
                  پیش‌نویس با چه اطلاعاتی ساخته شود؟
                </h3>

                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  این فیلدها فقط مقدار اولیه هستند و در فرم edit دوباره قابل
                  تغییرند.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs font-black text-foreground">
                    عنوان اولیه
                  </span>

                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className={carouselInputClass}
                    placeholder="مثلاً بیشترین تخفیف‌های امروز"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-black text-foreground">
                    تعداد محصول اولیه
                  </span>

                  <input
                    type="number"
                    min={1}
                    max={48}
                    value={productLimit}
                    onChange={(event) =>
                      setProductLimit(Number(event.target.value))
                    }
                    className={carouselInputClass}
                    placeholder="مثلاً ۱۲"
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-xs font-black text-foreground">
                  توضیح داخلی
                </span>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className={carouselTextareaClass}
                  placeholder="توضیح کوتاه برای شناخت بهتر این کروسل"
                />
              </label>
            </div>
          </section>
        </main>

        <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start">
          <section className="glass-context-panel rounded-[2rem] p-4 sm:p-5">
            <p className="text-xs font-black text-primary">خلاصه ساخت</p>

            <h2 className="mt-1 text-lg font-black text-foreground">
              {title.trim() || selectedTemplate.defaultTitle}
            </h2>

            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              با زدن دکمه ساخت، کروسل به صورت پیش‌نویس و غیرفعال ساخته می‌شود.
              سپس وارد صفحه ویرایش کامل می‌شوی.
            </p>

            <div className="mt-5 grid gap-3">
              <SummaryRow label="قالب" value={selectedTemplate.title} />
              <SummaryRow label="استایل" value={getThemeLabel(selectedTemplate.theme)} />
              <SummaryRow label="منبع" value={getSourceTypeLabel(selectedTemplate.sourceType)} />
              <SummaryRow
                label="تعداد"
                value={`${clampNumber(productLimit, 1, 48)} محصول`}
              />
              <SummaryRow
                label="تخفیف"
                value={selectedTemplate.discountEnabled ? "فعال" : "غیرفعال"}
              />
              <SummaryRow
                label="تایمر"
                value={selectedTemplate.timerEnabled ? "فعال" : "غیرفعال"}
              />
              <SummaryRow label="وضعیت" value="پیش‌نویس / غیرفعال" />
            </div>

            <button
              type="button"
              onClick={handleCreateCarousel}
              className={`${primaryButtonClass} mt-5 w-full`}
            >
              ساخت و ادامه ویرایش
              <ArrowLeft className="h-4 w-4" />
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  active,
  onClick,
}: {
  template: CreateTemplate;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-[1.5rem] border p-4 text-right transition",
        active
          ? "border-primary/30 bg-primary/10"
          : "border-border bg-background/35 hover:border-primary/25 hover:bg-primary/5",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            active
              ? "bg-primary text-primary-foreground"
              : "bg-primary/10 text-primary",
          ].join(" ")}
        >
          {template.icon}
        </span>

        <span className="rounded-full bg-background/55 px-3 py-1 text-[11px] font-black text-muted-foreground">
          {template.badge}
        </span>
      </div>

      <h3 className="mt-4 text-sm font-black text-foreground">
        {template.title}
      </h3>

      <p className="mt-2 text-xs leading-6 text-muted-foreground">
        {template.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <MiniBadge label={getSourceTypeLabel(template.sourceType)} />
        <MiniBadge label={`${template.productLimit} محصول`} />
      </div>

      {active ? (
        <div className="mt-4 flex items-center gap-2 text-xs font-black text-primary">
          <CheckCircle2 className="h-4 w-4" />
          انتخاب شده
        </div>
      ) : null}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/35 px-4 py-3">
      <span className="text-xs font-black text-muted-foreground">{label}</span>
      <span className="max-w-[160px] truncate text-left text-xs font-black text-foreground">
        {value}
      </span>
    </div>
  );
}

function MiniBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-black text-primary">
      {label}
    </span>
  );
}

function getThemeLabel(theme: ProductCarouselTheme) {
  switch (theme) {
    case "classic":
      return "کلاسیک";
    case "modern":
      return "مدرن";
    case "minimal":
      return "مینیمال";
    case "deal":
      return "فروش ویژه";
    case "banner":
      return "بنردار";
    case "gray":
      return "خاکستری";
    default:
      return theme;
  }
}

function getSourceTypeLabel(type: ProductCarouselSourceType) {
  switch (type) {
    case "most_viewed":
      return "پربازدیدترین";
    case "highest_discount_percent":
      return "بیشترین درصد تخفیف";
    case "highest_discount_amount":
      return "بیشترین مبلغ تخفیف";
    case "newest":
      return "جدیدترین";
    case "best_sellers":
      return "پرفروش‌ترین";
    case "manual":
      return "انتخاب دستی";
    case "color":
      return "رنگ انتخابی";
    case "category_only":
      return "فقط دسته‌بندی";
    case "free_content":
      return "محتوای آزاد";
    default:
      return type;
  }
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;

  return Math.min(Math.max(value, min), max);
}