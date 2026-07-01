"use client";

import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  FileJson,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type {
  CategoryCarousel,
  CategoryCarouselValidationIssue,
} from "@/types/category-carousel";
import { useCategoryCarouselStore } from "@/store/category-carousel.store";
import {
  buildCategoryCarouselSaveRequestPreview,
  stringifyCategoryCarouselPayload,
} from "@/lib/api/category-carousel.service";
import {
  hasBlockingCategoryCarouselIssues,
  validateCategoryCarousel,
} from "./category-carousel.validation";
import {
  categoryCarouselPanelClass,
  categoryCarouselPrimaryButtonClass,
  categoryCarouselSecondaryButtonClass,
} from "./category-carousel.constants";

interface CategoryCarouselReviewProps {
  carousel: CategoryCarousel;
}

export function CategoryCarouselReview({
  carousel,
}: CategoryCarouselReviewProps) {
  const { publishCarousel, saveCarouselAsDraft } = useCategoryCarouselStore();

  const issues = validateCategoryCarousel(carousel);
  const blockingIssues = issues.filter((issue) => issue.severity === "error");
  const warningIssues = issues.filter((issue) => issue.severity === "warning");
  const hasErrors = hasBlockingCategoryCarouselIssues(issues);

  const apiPayload = stringifyCategoryCarouselPayload(carousel);
  const apiRequestPreview = buildCategoryCarouselSaveRequestPreview(carousel);

  const activeItems = carousel.items.filter((item) => item.isActive).length;
  const itemsWithImage = carousel.items.filter((item) =>
    item.image?.url?.trim()
  ).length;

  return (
    <section className={`${categoryCarouselPanelClass} mt-6`}>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black text-primary">Review</p>

          <h2 className="mt-1 text-xl font-black text-foreground">
            بررسی نهایی کروسل دسته‌بندی
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            قبل از انتشار، خطاها و هشدارها را بررسی کن. Payload پایین فقط برای
            آماده‌سازی اتصال API است و هنوز ارسال واقعی انجام نمی‌شود.
          </p>
        </div>

        <div
          className={[
            "inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black",
            hasErrors
              ? "border-destructive/20 bg-destructive/10 text-destructive"
              : "border-primary/20 bg-primary/10 text-primary",
          ].join(" ")}
        >
          {hasErrors ? (
            <CircleAlert className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {hasErrors ? "نیاز به اصلاح" : "آماده انتشار"}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReviewStat label="کل آیتم‌ها" value={`${carousel.items.length} آیتم`} />
        <ReviewStat label="آیتم فعال" value={`${activeItems} آیتم`} />
        <ReviewStat label="دارای تصویر" value={`${itemsWithImage} آیتم`} />
        <ReviewStat
          label="وضعیت"
          value={carousel.status === "published" ? "منتشرشده" : "پیش‌نویس"}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <IssuePanel
          title="خطاها"
          emptyText="خطای الزامی وجود ندارد."
          issues={blockingIssues}
          tone="error"
        />

        <IssuePanel
          title="هشدارها"
          emptyText="هشداری وجود ندارد."
          issues={warningIssues}
          tone="warning"
        />
      </div>

      <section className="mt-5 rounded-[1.5rem] border border-border bg-background/35 p-4 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />

            <h3 className="text-sm font-black text-foreground">
              Payload آماده ارسال
            </h3>
          </div>

          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(apiPayload)}
            className="rounded-xl border border-border bg-background/45 px-3 py-2 text-xs font-black text-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            کپی JSON
          </button>
        </div>

        <p className="mb-3 text-xs leading-6 text-muted-foreground">
          این خروجی هنوز به API ارسال نمی‌شود؛ فقط ساختار نهایی داده‌ای است که
          بعداً برای create/update به بک‌اند می‌فرستیم.
        </p>

        <div className="mb-3 grid gap-2 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-background/45 p-3">
            <p className="text-[11px] font-black text-muted-foreground">
              Method
            </p>

            <p className="mt-1 text-sm font-black text-foreground">
              {apiRequestPreview.method}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background/45 p-3 md:col-span-2">
            <p className="text-[11px] font-black text-muted-foreground">
              Endpoint
            </p>

            <p className="mt-1 break-all text-sm font-black text-foreground">
              {apiRequestPreview.endpoint}
            </p>
          </div>
        </div>

        <pre className="max-h-80 overflow-auto rounded-2xl border border-border bg-background/50 p-4 text-left text-xs leading-6 text-foreground">
          <code>{apiPayload}</code>
        </pre>
      </section>

      <section className="mt-5 rounded-[1.5rem] border border-border bg-background/35 p-4 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-primary" />

          <h3 className="text-sm font-black text-foreground">
            عملیات نهایی
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => saveCarouselAsDraft(carousel.id)}
            className={categoryCarouselSecondaryButtonClass}
          >
            <Sparkles className="h-4 w-4" />
            ذخیره به عنوان پیش‌نویس
          </button>

          <button
            type="button"
            disabled={hasErrors}
            onClick={() => publishCarousel(carousel.id)}
            className={categoryCarouselPrimaryButtonClass}
          >
            <BadgeCheck className="h-4 w-4" />
            انتشار محلی
          </button>
        </div>

        {hasErrors ? (
          <p className="mt-3 text-xs leading-6 text-destructive">
            برای انتشار، اول خطاهای الزامی را برطرف کن.
          </p>
        ) : (
          <p className="mt-3 text-xs leading-6 text-muted-foreground">
            انتشار فعلاً فقط local است و تا آماده شدن endpoint، چیزی به سرور
            ارسال نمی‌شود.
          </p>
        )}
      </section>
    </section>
  );
}

function ReviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/35 p-4">
      <p className="text-[11px] font-black text-muted-foreground">{label}</p>

      <p className="mt-2 text-base font-black text-foreground">{value}</p>
    </div>
  );
}

function IssuePanel({
  title,
  emptyText,
  issues,
  tone,
}: {
  title: string;
  emptyText: string;
  issues: CategoryCarouselValidationIssue[];
  tone: "error" | "warning";
}) {
  const isError = tone === "error";

  return (
    <div className="rounded-[1.5rem] border border-border bg-background/35 p-4">
      <div className="mb-3 flex items-center gap-2">
        {isError ? (
          <CircleAlert className="h-4 w-4 text-destructive" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-primary" />
        )}

        <h3 className="text-sm font-black text-foreground">{title}</h3>
      </div>

      {issues.length ? (
        <div className="grid gap-2">
          {issues.map((issue) => (
            <div
              key={`${issue.field}-${issue.message}`}
              className={[
                "rounded-2xl border px-3 py-2 text-xs leading-6",
                isError
                  ? "border-destructive/20 bg-destructive/10 text-destructive"
                  : "border-primary/20 bg-primary/10 text-primary",
              ].join(" ")}
            >
              {issue.message}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-background/35 px-3 py-3 text-xs leading-6 text-muted-foreground">
          {emptyText}
        </div>
      )}
    </div>
  );
}