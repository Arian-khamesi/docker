import type {
  CategoryCarousel,
  CategoryCarouselValidationIssue,
} from "@/types/category-carousel";

export function validateCategoryCarousel(
  carousel: CategoryCarousel
): CategoryCarouselValidationIssue[] {
  const issues: CategoryCarouselValidationIssue[] = [];

  if (!carousel.title.trim()) {
    issues.push({
      field: "title",
      message: "عنوان کروسل الزامی است.",
      severity: "error",
    });
  }

  if (carousel.audience === "custom" && !carousel.customAudienceTitle?.trim()) {
    issues.push({
      field: "customAudienceTitle",
      message: "برای گروه سفارشی، عنوان گروه باید وارد شود.",
      severity: "error",
    });
  }

  if (carousel.seeAll.enabled) {
    if (!carousel.seeAll.label.trim()) {
      issues.push({
        field: "seeAll.label",
        message: "متن دکمه مشاهده همه الزامی است.",
        severity: "error",
      });
    }

    if (!carousel.seeAll.href.trim()) {
      issues.push({
        field: "seeAll.href",
        message: "لینک مشاهده همه الزامی است.",
        severity: "error",
      });
    }
  }

  if (!carousel.items.length) {
    issues.push({
      field: "items",
      message: "برای این کروسل حداقل یک آیتم دسته‌بندی بساز.",
      severity: "error",
    });
  }

  const activeItems = carousel.items.filter((item) => item.isActive);

  if (carousel.items.length && !activeItems.length) {
    issues.push({
      field: "items.active",
      message: "هیچ آیتم فعالی در این کروسل وجود ندارد.",
      severity: "error",
    });
  }

  carousel.items.forEach((item, index) => {
    const itemLabel = `آیتم ${index + 1}`;

    if (!item.title.trim()) {
      issues.push({
        field: `items.${item.id}.title`,
        message: `${itemLabel}: عنوان آیتم الزامی است.`,
        severity: "error",
      });
    }

    if (!item.href.trim()) {
      issues.push({
        field: `items.${item.id}.href`,
        message: `${itemLabel}: لینک صفحه دسته‌بندی الزامی است.`,
        severity: "error",
      });
    }

    if (!item.image?.url?.trim()) {
      issues.push({
        field: `items.${item.id}.image`,
        message: `${itemLabel}: تصویر آیتم هنوز انتخاب نشده است.`,
        severity: carousel.status === "published" ? "error" : "warning",
      });
    }

    if (item.image?.url?.trim() && !item.image.alt.trim()) {
      issues.push({
        field: `items.${item.id}.image.alt`,
        message: `${itemLabel}: برای تصویر alt وارد کن تا از نظر SEO کامل‌تر باشد.`,
        severity: "warning",
      });
    }

    if (!item.isActive) {
      issues.push({
        field: `items.${item.id}.isActive`,
        message: `${itemLabel}: این آیتم غیرفعال است و در سایت نمایش داده نمی‌شود.`,
        severity: "warning",
      });
    }
  });

  if (carousel.status === "published" && !carousel.isActive) {
    issues.push({
      field: "isActive",
      message: "کروسل منتشر شده ولی غیرفعال است.",
      severity: "warning",
    });
  }

  if (carousel.status === "draft" && carousel.isActive) {
    issues.push({
      field: "status",
      message: "کروسل فعال است ولی هنوز در وضعیت پیش‌نویس قرار دارد.",
      severity: "warning",
    });
  }

  return issues;
}

export function hasBlockingCategoryCarouselIssues(
  issues: CategoryCarouselValidationIssue[]
) {
  return issues.some((issue) => issue.severity === "error");
}