import type {
  ProductCarousel,
  ProductCarouselValidationIssue,
} from "@/types/product-carousel";

export function validateProductCarousel(
  carousel: ProductCarousel
): ProductCarouselValidationIssue[] {
  const issues: ProductCarouselValidationIssue[] = [];

  validateBasics(carousel, issues);
  validateSchedule(carousel, issues);
  validateSource(carousel, issues);
  validateDiscount(carousel, issues);
  validateTimer(carousel, issues);
  validateDisplay(carousel, issues);
  validateBanners(carousel, issues);
  validatePublishingState(carousel, issues);

  return issues;
}

export function hasBlockingIssues(issues: ProductCarouselValidationIssue[]) {
  return issues.some((issue) => issue.severity === "error");
}

function validateBasics(
  carousel: ProductCarousel,
  issues: ProductCarouselValidationIssue[]
) {
  if (!carousel.title.trim()) {
    issues.push({
      field: "title",
      message: "عنوان کروسل اجباری است.",
      severity: "error",
    });
  }

  if (carousel.title.trim().length > 80) {
    issues.push({
      field: "title",
      message: "عنوان کروسل بهتر است کوتاه‌تر از ۸۰ کاراکتر باشد.",
      severity: "warning",
    });
  }

  if (!Number.isFinite(carousel.productLimit)) {
    issues.push({
      field: "productLimit",
      message: "تعداد محصول باید عدد معتبر باشد.",
      severity: "error",
    });
  }

  if (carousel.productLimit < 1) {
    issues.push({
      field: "productLimit",
      message: "تعداد محصول باید حداقل ۱ باشد.",
      severity: "error",
    });
  }

  if (carousel.productLimit > 48) {
    issues.push({
      field: "productLimit",
      message: "تعداد محصول بیشتر از ۴۸ ممکن است صفحه را سنگین کند.",
      severity: "warning",
    });
  }
}

function validateSchedule(
  carousel: ProductCarousel,
  issues: ProductCarouselValidationIssue[]
) {
  const startTime = new Date(carousel.startsAt).getTime();
  const endTime = new Date(carousel.endsAt).getTime();

  if (Number.isNaN(startTime)) {
    issues.push({
      field: "startsAt",
      message: "تاریخ شروع نمایش معتبر نیست.",
      severity: "error",
    });
  }

  if (Number.isNaN(endTime)) {
    issues.push({
      field: "endsAt",
      message: "تاریخ پایان نمایش معتبر نیست.",
      severity: "error",
    });
  }

  if (!Number.isNaN(startTime) && !Number.isNaN(endTime)) {
    if (endTime <= startTime) {
      issues.push({
        field: "endsAt",
        message: "تاریخ پایان نمایش باید بعد از تاریخ شروع باشد.",
        severity: "error",
      });
    }

    if (Date.now() > endTime) {
      issues.push({
        field: "endsAt",
        message: "این کروسل منقضی شده است و نباید منتشر شود.",
        severity: "error",
      });
    }
  }
}

function validateSource(
  carousel: ProductCarousel,
  issues: ProductCarouselValidationIssue[]
) {
  const source = carousel.source;

  if (source.type === "manual" && source.manualProducts.length === 0) {
    issues.push({
      field: "source.manualProducts",
      message: "در حالت انتخاب دستی، حداقل یک محصول باید اضافه شود.",
      severity: "error",
    });
  }

  if (source.type === "manual" && source.manualProducts.length < carousel.productLimit) {
    issues.push({
      field: "source.manualProducts",
      message:
        "تعداد محصولات دستی کمتر از تعداد محصول تنظیم‌شده برای کروسل است.",
      severity: "warning",
    });
  }

  if (source.type === "color" && !source.selectedColor) {
    issues.push({
      field: "source.selectedColor",
      message: "در حالت رنگ انتخابی، باید یک رنگ انتخاب شود.",
      severity: "error",
    });
  }

  if (source.type === "color" && source.selectedCategories.length === 0) {
    issues.push({
      field: "source.selectedCategories",
      message:
        "برای خروجی دقیق‌تر در حالت رنگ، بهتر است حداقل یک دسته‌بندی انتخاب شود.",
      severity: "warning",
    });
  }

  if (source.type === "category_only" && source.selectedCategories.length === 0) {
    issues.push({
      field: "source.selectedCategories",
      message: "در حالت فقط دسته‌بندی، حداقل یک دسته‌بندی باید انتخاب شود.",
      severity: "error",
    });
  }

  if (isAutomaticProductSource(source.type) && source.selectedCategories.length === 0) {
    issues.push({
      field: "source.selectedCategories",
      message:
        "برای کروسل‌های خودکار، انتخاب دسته‌بندی باعث کنترل بهتر خروجی می‌شود.",
      severity: "warning",
    });
  }

  if (source.type === "free_content") {
    const hasAnyBanner =
      Boolean(carousel.banners.desktop?.url?.trim()) ||
      Boolean(carousel.banners.mobile?.url?.trim());

    if (!hasAnyBanner) {
      issues.push({
        field: "banners",
        message:
          "در حالت محتوای آزاد، بهتر است حداقل یک بنر دسکتاپ یا موبایل تنظیم شود.",
        severity: "warning",
      });
    }
  }
}

function validateDiscount(
  carousel: ProductCarousel,
  issues: ProductCarouselValidationIssue[]
) {
  const discount = carousel.discount;

  if (!discount.enabled) return;

  const minPercent = discount.minPercent ?? 0;
  const maxPercent = discount.maxPercent ?? 100;

  if (
    minPercent < 0 ||
    minPercent > 100 ||
    maxPercent < 0 ||
    maxPercent > 100
  ) {
    issues.push({
      field: "discount.percent",
      message: "درصد تخفیف باید بین ۰ تا ۱۰۰ باشد.",
      severity: "error",
    });
  }

  if (minPercent > maxPercent) {
    issues.push({
      field: "discount.percent",
      message: "حداقل درصد تخفیف نباید بیشتر از حداکثر باشد.",
      severity: "error",
    });
  }

  if (discount.startsAt && discount.endsAt) {
    const startTime = new Date(discount.startsAt).getTime();
    const endTime = new Date(discount.endsAt).getTime();

    if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
      issues.push({
        field: "discount.range",
        message: "بازه زمانی تخفیف معتبر نیست.",
        severity: "error",
      });
    } else if (endTime <= startTime) {
      issues.push({
        field: "discount.endsAt",
        message: "پایان تخفیف باید بعد از شروع تخفیف باشد.",
        severity: "error",
      });
    }
  }
}

function validateTimer(
  carousel: ProductCarousel,
  issues: ProductCarouselValidationIssue[]
) {
  const timer = carousel.timer;

  if (!timer.enabled) return;

  if (!timer.label.trim()) {
    issues.push({
      field: "timer.label",
      message: "وقتی تایمر فعال است، متن تایمر بهتر است خالی نباشد.",
      severity: "warning",
    });
  }

  if (timer.target === "discount_end") {
    if (!carousel.discount.enabled) {
      issues.push({
        field: "timer.target",
        message:
          "تایمر روی پایان تخفیف تنظیم شده، اما تخفیف غیرفعال است.",
        severity: "error",
      });
    }

    if (!carousel.discount.endsAt) {
      issues.push({
        field: "discount.endsAt",
        message:
          "برای تایمر پایان تخفیف، تاریخ پایان تخفیف باید تنظیم شود.",
        severity: "error",
      });
    }
  }

  if (timer.target === "custom") {
    if (!timer.customEndsAt) {
      issues.push({
        field: "timer.customEndsAt",
        message: "برای تایمر دلخواه، زمان پایان تایمر اجباری است.",
        severity: "error",
      });

      return;
    }

    const customTime = new Date(timer.customEndsAt).getTime();

    if (Number.isNaN(customTime)) {
      issues.push({
        field: "timer.customEndsAt",
        message: "زمان پایان تایمر معتبر نیست.",
        severity: "error",
      });
    }

    if (!Number.isNaN(customTime) && customTime <= Date.now()) {
      issues.push({
        field: "timer.customEndsAt",
        message: "زمان پایان تایمر باید در آینده باشد.",
        severity: "error",
      });
    }
  }
}

function validateDisplay(
  carousel: ProductCarousel,
  issues: ProductCarouselValidationIssue[]
) {
  const seeAll = carousel.seeAll;

  if (!seeAll.enabled) return;

  if (!seeAll.label.trim()) {
    issues.push({
      field: "seeAll.label",
      message: "وقتی مشاهده همه فعال است، متن دکمه بهتر است خالی نباشد.",
      severity: "warning",
    });
  }

  if (!seeAll.autoGenerateHref && !seeAll.href.trim()) {
    issues.push({
      field: "seeAll.href",
      message: "وقتی لینک دستی فعال است، لینک مشاهده همه اجباری است.",
      severity: "error",
    });
  }
}

function validateBanners(
  carousel: ProductCarousel,
  issues: ProductCarouselValidationIssue[]
) {
  const banners = [
    {
      field: "banners.desktop",
      title: "بنر دسکتاپ",
      image: carousel.banners.desktop,
    },
    {
      field: "banners.mobile",
      title: "بنر موبایل",
      image: carousel.banners.mobile,
    },
  ];

  banners.forEach((banner) => {
    if (!banner.image?.url?.trim()) return;

    if (!banner.image.alt.trim()) {
      issues.push({
        field: banner.field,
        message: `${banner.title} متن جایگزین ندارد.`,
        severity: "warning",
      });
    }
  });
}

function validatePublishingState(
  carousel: ProductCarousel,
  issues: ProductCarouselValidationIssue[]
) {
  if (carousel.status === "published" && !carousel.isActive) {
    issues.push({
      field: "isActive",
      message:
        "کروسل منتشر شده ولی غیرفعال است. اگر باید در سایت نمایش داده شود، آن را فعال کن.",
      severity: "warning",
    });
  }

  if (carousel.isActive && carousel.status === "draft") {
    issues.push({
      field: "status",
      message:
        "کروسل فعال است اما هنوز پیش‌نویس است. برای نمایش نهایی باید منتشر شود.",
      severity: "warning",
    });
  }
}

function isAutomaticProductSource(type: ProductCarousel["source"]["type"]) {
  return [
    "most_viewed",
    "highest_discount_percent",
    "highest_discount_amount",
    "newest",
    "best_sellers",
  ].includes(type);
}