"use client";

import {
    AlertTriangle,
    CheckCircle2,
    CircleAlert,
    Clock3,
    Eye,
    Layers3,
    PackageCheck,
    Power,
    ShieldCheck,
} from "lucide-react";

import type {
    ProductCarousel,
    ProductCarouselValidationIssue,
} from "@/types/product-carousel";
import { useProductCarouselStore } from "@/store/product-carousel.store";
import {
    hasBlockingIssues,
    validateProductCarousel,
} from "../product-carousel-form.validation";
import {
    getProductCarouselSourceTypeLabel,
    getProductCarouselThemeLabel,
} from "../product-carousel-form.helpers";
import { FormSectionNote } from "../ui/carousel-form-field";
import {
    buildProductCarouselSaveRequestPreview,
    stringifyProductCarouselPayload,
} from "@/lib/api/product-carousel.service";

export function ProductCarouselReviewStep({
    carousel,
}: {
    carousel: ProductCarousel;
}) {
    const { updateCarousel } = useProductCarouselStore();

    const issues = validateProductCarousel(carousel);
    const errors = issues.filter((issue) => issue.severity === "error");
    const warnings = issues.filter((issue) => issue.severity === "warning");
    const hasErrors = hasBlockingIssues(issues);

    const apiPayload = stringifyProductCarouselPayload(carousel);
    const apiRequestPreview = buildProductCarouselSaveRequestPreview(carousel);

    const publishCarousel = () => {
        if (hasErrors) return;

        updateCarousel(carousel.id, {
            status: "published",
            isActive: true,
        });
    };

    const saveAsDraft = () => {
        updateCarousel(carousel.id, {
            status: "draft",
            isActive: false,
        });
    };

    return (
        <div>
            <div className="flex flex-col gap-2">
                <p className="text-xs font-black text-primary">مرحله ۶</p>

                <h2 className="text-xl font-black text-foreground">
                    بررسی نهایی کروسل
                </h2>

                <p className="text-sm leading-7 text-muted-foreground">
                    قبل از انتشار، وضعیت کلی کروسل، خطاها و هشدارها را بررسی کن. اگر خطای
                    جدی وجود داشته باشد، انتشار غیرفعال می‌شود.
                </p>
            </div>

            <div className="mt-5">
                <FormSectionNote
                    title="راهنمای انتشار"
                    text="خطاهای قرمز باید حتماً اصلاح شوند. هشدارها جلوی انتشار را نمی‌گیرند، ولی بهتر است قبل از فعال‌سازی بررسی شوند."
                />
            </div>

            <div className="mt-6 grid gap-5">
                <ReviewStatusCard
                    errorsCount={errors.length}
                    warningsCount={warnings.length}
                    hasErrors={hasErrors}
                />

                <section className="rounded-[1.5rem] border border-border bg-background/35 p-4 backdrop-blur-xl">
                    <div className="mb-4 flex items-center gap-2">
                        <Layers3 className="h-4 w-4 text-primary" />

                        <h3 className="text-sm font-black text-foreground">
                            خلاصه تنظیمات کروسل
                        </h3>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <ReviewInfo label="عنوان" value={carousel.title || "بدون عنوان"} />
                        <ReviewInfo
                            label="وضعیت"
                            value={carousel.status === "published" ? "منتشر شده" : "پیش‌نویس"}
                        />
                        <ReviewInfo
                            label="فعال بودن"
                            value={carousel.isActive ? "فعال" : "غیرفعال"}
                        />
                        <ReviewInfo
                            label="استایل"
                            value={getProductCarouselThemeLabel(carousel.theme)}
                        />
                        <ReviewInfo
                            label="منبع محصولات"
                            value={getProductCarouselSourceTypeLabel(carousel.source.type)}
                        />
                        <ReviewInfo
                            label="تعداد محصولات"
                            value={`${carousel.productLimit} محصول`}
                        />
                        <ReviewInfo
                            label="دسته‌بندی‌ها"
                            value={`${carousel.source.selectedCategories.length} دسته‌بندی`}
                        />
                        <ReviewInfo
                            label="محصولات دستی"
                            value={`${carousel.source.manualProducts.length} محصول`}
                        />
                        <ReviewInfo
                            label="تخفیف"
                            value={carousel.discount.enabled ? "فعال" : "غیرفعال"}
                        />
                        <ReviewInfo
                            label="تایمر"
                            value={carousel.timer.enabled ? "فعال" : "غیرفعال"}
                        />
                        <ReviewInfo
                            label="مشاهده همه"
                            value={carousel.seeAll.enabled ? "فعال" : "غیرفعال"}
                        />
                        <ReviewInfo
                            label="بنرها"
                            value={getBannerSummary(carousel)}
                        />
                    </div>
                </section>

                <IssuesPanel
                    title="خطاهای ضروری"
                    emptyText="خطای ضروری وجود ندارد."
                    issues={errors}
                    variant="error"
                />

                <IssuesPanel
                    title="هشدارها"
                    emptyText="هشداری وجود ندارد."
                    issues={warnings}
                    variant="warning"
                />
                <section className="rounded-[1.5rem] border border-border bg-background/35 p-4 backdrop-blur-xl">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" />

                            <h3 className="text-sm font-black text-foreground">
                                Payload آماده ارسال
                            </h3>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(apiPayload)}
                            className="rounded-xl border border-border bg-background/45 px-3 py-2 text-xs font-black text-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                        >
                            کپی JSON
                        </button>
                    </div>

                    <p className="mb-3 text-xs leading-6 text-muted-foreground">
                        این خروجی هنوز به API ارسال نمی‌شود؛ فقط ساختار نهایی داده‌ای است که بعداً
                        برای create/update به بک‌اند می‌فرستیم.
                    </p>
                    <div className="mb-3 grid gap-2 md:grid-cols-3">
                        <div className="rounded-2xl border border-border bg-background/45 p-3">
                            <p className="text-[11px] font-black text-muted-foreground">Method</p>
                            <p className="mt-1 text-sm font-black text-foreground">
                                {apiRequestPreview.method}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-border bg-background/45 p-3 md:col-span-2">
                            <p className="text-[11px] font-black text-muted-foreground">Endpoint</p>
                            <p className="mt-1 break-all text-sm font-black text-foreground">
                                {apiRequestPreview.endpoint}
                            </p>
                        </div>
                    </div>

                    <pre className="max-h-80 overflow-auto rounded-2xl border border-border bg-background/50 p-4 text-left text-xs leading-6 text-foreground">
                        <code>{apiPayload}</code>
                    </pre>
                </section>

                <section className="rounded-[1.5rem] border border-border bg-background/35 p-4 backdrop-blur-xl">
                    <div className="mb-4 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />

                        <h3 className="text-sm font-black text-foreground">
                            عملیات نهایی
                        </h3>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <button
                            type="button"
                            onClick={saveAsDraft}
                            className="rounded-2xl border border-border bg-background/45 p-4 text-right transition hover:border-primary/30 hover:bg-primary/5"
                        >
                            <span className="flex items-center gap-2 text-primary">
                                <Clock3 className="h-4 w-4" />
                                <span className="text-sm font-black text-foreground">
                                    ذخیره به عنوان پیش‌نویس
                                </span>
                            </span>

                            <span className="mt-2 block text-xs leading-6 text-muted-foreground">
                                کروسل غیرفعال و پیش‌نویس می‌شود تا بعداً کامل شود.
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={publishCarousel}
                            disabled={hasErrors}
                            className={[
                                "rounded-2xl border p-4 text-right transition",
                                hasErrors
                                    ? "cursor-not-allowed border-border bg-muted/40 opacity-60"
                                    : "border-primary/25 bg-primary/10 hover:bg-primary/15",
                            ].join(" ")}
                        >
                            <span className="flex items-center gap-2 text-primary">
                                <PackageCheck className="h-4 w-4" />
                                <span className="text-sm font-black text-foreground">
                                    انتشار و فعال‌سازی
                                </span>
                            </span>

                            <span className="mt-2 block text-xs leading-6 text-muted-foreground">
                                اگر خطای ضروری وجود نداشته باشد، کروسل منتشر و فعال می‌شود.
                            </span>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}

function ReviewStatusCard({
    errorsCount,
    warningsCount,
    hasErrors,
}: {
    errorsCount: number;
    warningsCount: number;
    hasErrors: boolean;
}) {
    return (
        <div
            className={[
                "rounded-[1.5rem] border p-4 backdrop-blur-xl",
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
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                        hasErrors
                            ? "bg-destructive/10 text-destructive"
                            : warningsCount > 0
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-300"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
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
                    <h3 className="text-sm font-black text-foreground">
                        {hasErrors
                            ? "کروسل هنوز آماده انتشار نیست"
                            : warningsCount > 0
                                ? "کروسل قابل انتشار است، اما هشدار دارد"
                                : "کروسل آماده انتشار است"}
                    </h3>

                    <p className="mt-1 text-xs leading-6 text-muted-foreground">
                        {errorsCount} خطای ضروری و {warningsCount} هشدار پیدا شد.
                    </p>
                </div>
            </div>
        </div>
    );
}

function IssuesPanel({
    title,
    emptyText,
    issues,
    variant,
}: {
    title: string;
    emptyText: string;
    issues: ProductCarouselValidationIssue[];
    variant: "error" | "warning";
}) {
    const isError = variant === "error";

    return (
        <section className="rounded-[1.5rem] border border-border bg-background/35 p-4 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
                {isError ? (
                    <CircleAlert className="h-4 w-4 text-destructive" />
                ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                )}

                <h3 className="text-sm font-black text-foreground">{title}</h3>
            </div>

            {issues.length > 0 ? (
                <div className="grid gap-3">
                    {issues.map((issue, index) => (
                        <div
                            key={`${issue.field}-${index}`}
                            className={[
                                "rounded-2xl border px-4 py-3",
                                isError
                                    ? "border-destructive/15 bg-destructive/10 text-destructive"
                                    : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-200",
                            ].join(" ")}
                        >
                            <p className="text-xs font-black">{issue.message}</p>

                            <p className="mt-1 text-[11px] opacity-70">
                                فیلد: {issue.field}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-border p-5 text-center text-xs leading-6 text-muted-foreground">
                    {emptyText}
                </div>
            )}
        </section>
    );
}

function ReviewInfo({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-border bg-background/35 px-4 py-3">
            <p className="text-xs font-black text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-black text-foreground">{value}</p>
        </div>
    );
}

function getBannerSummary(carousel: ProductCarousel) {
    const hasDesktop = Boolean(carousel.banners.desktop?.url?.trim());
    const hasMobile = Boolean(carousel.banners.mobile?.url?.trim());

    if (hasDesktop && hasMobile) return "دسکتاپ و موبایل";
    if (hasDesktop) return "فقط دسکتاپ";
    if (hasMobile) return "فقط موبایل";

    return "بدون بنر";
}