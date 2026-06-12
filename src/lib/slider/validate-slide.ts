import { Slide } from "@/types/slider";

export type SlideValidationSeverity = "error" | "warning";

export interface SlideValidationIssue {
  field: string;
  message: string;
  severity: SlideValidationSeverity;
}

export interface SlideValidationResult {
  canPublish: boolean;
  errors: SlideValidationIssue[];
  warnings: SlideValidationIssue[];
  issues: SlideValidationIssue[];
}

function isValidUrlOrPath(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return false;

  if (trimmed.startsWith("/")) return true;

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateSlideForPublish(slide: Slide): SlideValidationResult {
  const issues: SlideValidationIssue[] = [];

  if (!slide.images.desktop.url) {
    issues.push({
      field: "images.desktop",
      message: "برای انتشار، تصویر دسکتاپ الزامی است.",
      severity: "error",
    });
  }

  if (slide.schedule.startAt && slide.schedule.endAt) {
    if (slide.schedule.startAt >= slide.schedule.endAt) {
      issues.push({
        field: "schedule",
        message: "تاریخ پایان باید بعد از تاریخ شروع باشد.",
        severity: "error",
      });
    }
  }

  if (slide.primaryButton.isActive) {
    if (!slide.primaryButton.text.trim()) {
      issues.push({
        field: "primaryButton.text",
        message: "دکمه اصلی فعال است اما متن ندارد.",
        severity: "error",
      });
    }

    if (!isValidUrlOrPath(slide.primaryButton.url)) {
      issues.push({
        field: "primaryButton.url",
        message: "دکمه اصلی فعال است اما لینک معتبر ندارد.",
        severity: "error",
      });
    }
  }

  if (slide.secondaryButton.isActive) {
    if (!slide.secondaryButton.text.trim()) {
      issues.push({
        field: "secondaryButton.text",
        message: "دکمه دوم فعال است اما متن ندارد.",
        severity: "error",
      });
    }

    if (!isValidUrlOrPath(slide.secondaryButton.url)) {
      issues.push({
        field: "secondaryButton.url",
        message: "دکمه دوم فعال است اما لینک معتبر ندارد.",
        severity: "error",
      });
    }
  }

  if (!slide.title.trim()) {
    issues.push({
      field: "title",
      message: "عنوان خالی است. اگر اسلاید فقط تصویری است، این مورد قابل قبول است.",
      severity: "warning",
    });
  }

  if (!slide.images.desktop.alt.trim()) {
    issues.push({
      field: "images.desktop.alt",
      message: "متن جایگزین تصویر دسکتاپ خالی است.",
      severity: "warning",
    });
  }

  if (!slide.images.tablet.url) {
    issues.push({
      field: "images.tablet",
      message: "تصویر تبلت وارد نشده است؛ در صورت نیاز از تصویر دسکتاپ استفاده خواهد شد.",
      severity: "warning",
    });
  }

  if (!slide.images.mobile.url) {
    issues.push({
      field: "images.mobile",
      message: "تصویر موبایل وارد نشده است؛ ممکن است نمایش موبایل بهینه نباشد.",
      severity: "warning",
    });
  }

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  return {
    canPublish: errors.length === 0,
    errors,
    warnings,
    issues,
  };
}