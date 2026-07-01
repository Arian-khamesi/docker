import {
  AlertTriangle,
  BadgePercent,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Eye,
  ImagePlus,
  Layers3,
  PackageSearch,
  Timer,
} from "lucide-react";

import type { ProductCarousel } from "@/types/product-carousel";
import {
  getProductCarouselSourceTypeLabel,
  getProductCarouselThemeLabel,
} from "./product-carousel-form.helpers";
import {
  hasBlockingIssues,
  validateProductCarousel,
} from "./product-carousel-form.validation";

export function ProductCarouselCreateSummary() {
  return (
    <div>
      <p className="text-xs font-black text-primary">خلاصه ساخت</p>

      <h2 className="mt-1 text-lg font-black text-foreground">کروسل جدید</h2>

      <p className="mt-2 text-xs leading-6 text-muted-foreground">
        هنوز رکورد واقعی ساخته نشده است. با زدن دکمه «ایجاد پیش‌نویس»، کروسل در
        store ساخته می‌شود و وارد صفحه ویرایش همان کروسل می‌شوی.
      </p>

      <div className="mt-5 grid gap-3">
        <SummaryRow label="وضعیت اولیه" value="پیش‌نویس" />
        <SummaryRow label="فعال بودن" value="غیرفعال" />
        <SummaryRow label="تعداد پیش‌فرض" value="۱۲ محصول" />
        <SummaryRow label="منبع پیش‌فرض" value="بیشترین درصد تخفیف" />
      </div>
    </div>
  );
}

export function ProductCarouselEditSummary({
  carousel,
}: {
  carousel: ProductCarousel;
}) {
  const issues = validateProductCarousel(carousel);
  const errorsCount = issues.filter((issue) => issue.severity === "error").length;
  const warningsCount = issues.filter(
    (issue) => issue.severity === "warning"
  ).length;
  const hasErrors = hasBlockingIssues(issues);

  return (
    <div>
      <p className="text-xs font-black text-primary">وضعیت فعلی</p>

      <h2 className="mt-1 line-clamp-2 text-lg font-black text-foreground">
        {carousel.title || "کروسل بدون عنوان"}
      </h2>

      <p className="mt-2 text-xs leading-6 text-muted-foreground">
        این پنل فقط برای چک سریع وضعیت است. تنظیمات اصلی داخل فرم سمت چپ انجام
        می‌شود.
      </p>

      <div className="mt-5">
        <HealthCard
          hasErrors={hasErrors}
          errorsCount={errorsCount}
          warningsCount={warningsCount}
        />
      </div>

      <div className="mt-5 grid gap-3">
        <SummaryGroup title="وضعیت انتشار" icon={<Eye className="h-4 w-4" />}>
          <SummaryRow
            label="انتشار"
            value={carousel.status === "published" ? "منتشر شده" : "پیش‌نویس"}
          />
          <SummaryRow
            label="فعال بودن"
            value={carousel.isActive ? "فعال" : "غیرفعال"}
          />
          <SummaryRow label="زمان" value={getRuntimeStatusLabel(carousel)} />
        </SummaryGroup>

        <SummaryGroup
          title="محصولات"
          icon={<PackageSearch className="h-4 w-4" />}
        >
          <SummaryRow
            label="منبع"
            value={getProductCarouselSourceTypeLabel(carousel.source.type)}
          />
          <SummaryRow
            label="تعداد"
            value={`${carousel.productLimit || 0} محصول`}
          />
          <SummaryRow
            label="دسته‌ها"
            value={`${carousel.source.selectedCategories.length} مورد`}
          />
          <SummaryRow
            label="دستی"
            value={`${carousel.source.manualProducts.length} محصول`}
          />
        </SummaryGroup>

        <SummaryGroup
          title="ظاهر و نمایش"
          icon={<Layers3 className="h-4 w-4" />}
        >
          <SummaryRow
            label="استایل"
            value={getProductCarouselThemeLabel(carousel.theme)}
          />
          <SummaryRow
            label="مشاهده همه"
            value={carousel.seeAll.enabled ? "فعال" : "غیرفعال"}
          />
          <SummaryRow label="لینک" value={getSeeAllSummary(carousel)} />
        </SummaryGroup>

        <SummaryGroup
          title="تخفیف و تایمر"
          icon={<BadgePercent className="h-4 w-4" />}
        >
          <SummaryRow label="تخفیف" value={getDiscountSummary(carousel)} />
          <SummaryRow
            label="تایمر"
            value={carousel.timer.enabled ? "فعال" : "غیرفعال"}
          />
          <SummaryRow label="هدف تایمر" value={getTimerTargetLabel(carousel)} />
        </SummaryGroup>

        <SummaryGroup title="بنرها" icon={<ImagePlus className="h-4 w-4" />}>
          <SummaryRow label="دسکتاپ" value={getBannerLabel(carousel, "desktop")} />
          <SummaryRow label="موبایل" value={getBannerLabel(carousel, "mobile")} />
        </SummaryGroup>
      </div>
    </div>
  );
}

function HealthCard({
  hasErrors,
  errorsCount,
  warningsCount,
}: {
  hasErrors: boolean;
  errorsCount: number;
  warningsCount: number;
}) {
  return (
    <div
      className={[
        "rounded-2xl border p-4",
        hasErrors
          ? "border-destructive/20 bg-destructive/10"
          : warningsCount > 0
            ? "border-amber-500/20 bg-amber-500/10"
            : "border-emerald-500/20 bg-emerald-500/10",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            "mt-0.5",
            hasErrors
              ? "text-destructive"
              : warningsCount > 0
                ? "text-amber-600 dark:text-amber-300"
                : "text-emerald-600 dark:text-emerald-300",
          ].join(" ")}
        >
          {hasErrors ? (
            <CircleAlert className="h-5 w-5" />
          ) : warningsCount > 0 ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
        </div>

        <div>
          <p className="text-sm font-black text-foreground">
            {hasErrors
              ? "نیاز به اصلاح"
              : warningsCount > 0
                ? "قابل انتشار با هشدار"
                : "آماده انتشار"}
          </p>

          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            {errorsCount} خطا، {warningsCount} هشدار
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryGroup({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-background/35 p-3">
      <div className="mb-3 flex items-center gap-2 text-primary">
        {icon}
        <h3 className="text-xs font-black text-primary">{title}</h3>
      </div>

      <div className="grid gap-2">{children}</div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-background/35 px-3 py-2">
      <span className="text-[11px] font-black text-muted-foreground">
        {label}
      </span>
      <span className="max-w-[150px] truncate text-left text-[11px] font-black text-foreground">
        {value}
      </span>
    </div>
  );
}

function getRuntimeStatusLabel(carousel: ProductCarousel) {
  const startTime = new Date(carousel.startsAt).getTime();
  const endTime = new Date(carousel.endsAt).getTime();

  if (Number.isNaN(startTime) || Number.isNaN(endTime) || endTime <= startTime) {
    return "نامعتبر";
  }

  const now = Date.now();

  if (now < startTime) return "شروع نشده";
  if (now > endTime) return "منقضی شده";

  return "در بازه نمایش";
}

function getDiscountSummary(carousel: ProductCarousel) {
  if (!carousel.discount.enabled) return "غیرفعال";

  return `${carousel.discount.minPercent ?? 0}٪ تا ${
    carousel.discount.maxPercent ?? 100
  }٪`;
}

function getTimerTargetLabel(carousel: ProductCarousel) {
  if (!carousel.timer.enabled) return "ندارد";

  switch (carousel.timer.target) {
    case "carousel_end":
      return "پایان کروسل";
    case "discount_end":
      return "پایان تخفیف";
    case "custom":
      return "زمان دلخواه";
    default:
      return "نامشخص";
  }
}

function getSeeAllSummary(carousel: ProductCarousel) {
  if (!carousel.seeAll.enabled) return "ندارد";

  if (carousel.seeAll.autoGenerateHref) return "خودکار";

  return carousel.seeAll.href || "تنظیم نشده";
}

function getBannerLabel(
  carousel: ProductCarousel,
  target: "desktop" | "mobile"
) {
  const banner = carousel.banners[target];

  if (!banner?.url?.trim()) return "ندارد";

  return banner.url.startsWith("blob:") ? "آپلود محلی" : "URL";
}