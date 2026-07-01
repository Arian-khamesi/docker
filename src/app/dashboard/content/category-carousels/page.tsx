"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowDown,
    ArrowUp,
    BadgeCheck,
    Boxes,
    Copy,
    Eye,
    EyeOff,
    FolderTree,
    LayoutGrid,
    Plus,
    RotateCcw,
    Search,
    Sparkles,
    Trash2,
} from "lucide-react";

import type {
    CategoryCarousel,
    CategoryCarouselAudience,
    CategoryCarouselStatus,
    CategoryCarouselTheme,
} from "@/types/category-carousel";
import { useCategoryCarouselStore } from "@/store/category-carousel.store";
import {
    categoryCarouselDangerButtonClass,
    categoryCarouselHeroClass,
    categoryCarouselInputClass,
    categoryCarouselPageClass,
    categoryCarouselPanelClass,
    categoryCarouselPrimaryButtonClass,
    categoryCarouselSecondaryButtonClass,
    getCategoryCarouselEditPath,
} from "@/components/category-carousels/category-carousel.constants";

type AudienceFilter = CategoryCarouselAudience | "all";
type StatusFilter = CategoryCarouselStatus | "active" | "inactive" | "all";

export default function CategoryCarouselsPage() {
    const {
        carousels,
        addCarousel,
        duplicateCarousel,
        removeCarousel,
        toggleCarouselActive,
        publishCarousel,
        saveCarouselAsDraft,
        moveCarousel,
        resetCarousels,
    } = useCategoryCarouselStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>("all");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    const sortedCarousels = useMemo(
        () => [...carousels].sort((a, b) => a.order - b.order),
        [carousels]
    );

    const filteredCarousels = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return sortedCarousels.filter((carousel) => {
            const matchesSearch =
                !normalizedSearch ||
                carousel.title.toLowerCase().includes(normalizedSearch) ||
                carousel.description?.toLowerCase().includes(normalizedSearch) ||
                getAudienceLabel(carousel.audience)
                    .toLowerCase()
                    .includes(normalizedSearch);

            const matchesAudience =
                audienceFilter === "all" || carousel.audience === audienceFilter;

            const matchesStatus =
                statusFilter === "all" ||
                carousel.status === statusFilter ||
                (statusFilter === "active" && carousel.isActive) ||
                (statusFilter === "inactive" && !carousel.isActive);

            return matchesSearch && matchesAudience && matchesStatus;
        });
    }, [sortedCarousels, searchTerm, audienceFilter, statusFilter]);

    const stats = useMemo(() => {
        const totalItems = carousels.reduce(
            (sum, carousel) => sum + carousel.items.length,
            0
        );

        return {
            total: carousels.length,
            published: carousels.filter((carousel) => carousel.status === "published")
                .length,
            active: carousels.filter((carousel) => carousel.isActive).length,
            totalItems,
        };
    }, [carousels]);

    const handleCreateDraft = () => {
        addCarousel();
    };

    const handleDuplicate = (id: string) => {
        duplicateCarousel(id);
    };

    const handleRemove = (carousel: CategoryCarousel) => {
        const confirmed = window.confirm(
            `کروسل «${carousel.title}» حذف شود؟ این عملیات فعلاً فقط از local store حذف می‌کند.`
        );

        if (!confirmed) return;

        removeCarousel(carousel.id);
    };

    const handleMove = (carouselId: string, direction: "up" | "down") => {
        const currentIndex = carousels.findIndex(
            (carousel) => carousel.id === carouselId
        );

        if (currentIndex === -1) return;

        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

        moveCarousel(currentIndex, targetIndex);
    };

    const handleReset = () => {
        const confirmed = window.confirm(
            "لیست کروسل‌های دسته‌بندی به داده‌های اولیه برگردد؟"
        );

        if (!confirmed) return;

        resetCarousels();
    };

    return (
        <div className={categoryCarouselPageClass}>
            <section className={categoryCarouselHeroClass}>
                <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-28 right-16 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                            <FolderTree className="h-4 w-4" />
                            Category Carousel Studio
                        </div>

                        <h1 className="text-2xl font-black text-foreground">
                            مدیریت کروسل‌های دسته‌بندی
                        </h1>

                        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                            این بخش برای مدیریت کروسل‌های دسته‌بندی صفحه اصلی است؛ مثل
                            دسته‌بندی‌های مردانه، زنانه یا هر گروه سفارشی دیگر. هر کروسل شامل
                            چند آیتم با عنوان، لینک و تصویر اختصاصی می‌شود.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={handleReset}
                            className={categoryCarouselSecondaryButtonClass}
                        >
                            <RotateCcw className="h-4 w-4" />
                            بازنشانی
                        </button>

                        <button
                            type="button"
                            onClick={handleCreateDraft}
                            className={categoryCarouselPrimaryButtonClass}
                        >
                            <Plus className="h-4 w-4" />
                            ساخت پیش‌نویس سریع
                        </button>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={<LayoutGrid className="h-5 w-5" />}
                    label="کل کروسل‌ها"
                    value={stats.total.toLocaleString("fa-IR")}
                />

                <StatCard
                    icon={<BadgeCheck className="h-5 w-5" />}
                    label="منتشرشده"
                    value={stats.published.toLocaleString("fa-IR")}
                />

                <StatCard
                    icon={<Eye className="h-5 w-5" />}
                    label="فعال"
                    value={stats.active.toLocaleString("fa-IR")}
                />

                <StatCard
                    icon={<Boxes className="h-5 w-5" />}
                    label="کل آیتم‌ها"
                    value={stats.totalItems.toLocaleString("fa-IR")}
                />
            </section>

            <section className={categoryCarouselPanelClass}>
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <p className="text-xs font-black text-primary">لیست مدیریتی</p>

                        <h2 className="mt-1 text-xl font-black text-foreground">
                            کروسل‌های ساخته‌شده
                        </h2>

                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                            ترتیب نمایش همین لیست، ترتیب نمایش کروسل‌ها در صفحه اصلی است.
                        </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3 xl:w-[720px]">
                        <label className="relative">
                            <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className={`${categoryCarouselInputClass} pr-11`}
                                placeholder="جستجو..."
                            />
                        </label>

                        <select
                            value={audienceFilter}
                            onChange={(event) =>
                                setAudienceFilter(event.target.value as AudienceFilter)
                            }
                            className={categoryCarouselInputClass}
                        >
                            <option value="all">همه مخاطب‌ها</option>
                            <option value="men">مردانه</option>
                            <option value="women">زنانه</option>
                            <option value="unisex">مشترک</option>
                            <option value="kids">کودک</option>
                            <option value="custom">سفارشی</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value as StatusFilter)
                            }
                            className={categoryCarouselInputClass}
                        >
                            <option value="all">همه وضعیت‌ها</option>
                            <option value="published">منتشرشده</option>
                            <option value="draft">پیش‌نویس</option>
                            <option value="active">فعال</option>
                            <option value="inactive">غیرفعال</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6 grid gap-4">
                    {filteredCarousels.length ? (
                        filteredCarousels.map((carousel) => (
                            <CategoryCarouselCard
                                key={carousel.id}
                                carousel={carousel}
                                totalCount={carousels.length}
                                actualIndex={carousels.findIndex(
                                    (item) => item.id === carousel.id
                                )}
                                onMoveUp={() => handleMove(carousel.id, "up")}
                                onMoveDown={() => handleMove(carousel.id, "down")}
                                onToggleActive={() => toggleCarouselActive(carousel.id)}
                                onPublish={() => publishCarousel(carousel.id)}
                                onDraft={() => saveCarouselAsDraft(carousel.id)}
                                onDuplicate={() => handleDuplicate(carousel.id)}
                                onRemove={() => handleRemove(carousel)}
                            />
                        ))
                    ) : (
                        <div className="rounded-[1.5rem] border border-border bg-background/35 p-8 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                                <Search className="h-6 w-6" />
                            </div>

                            <h3 className="mt-4 text-base font-black text-foreground">
                                نتیجه‌ای پیدا نشد
                            </h3>

                            <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                فیلترها یا عبارت جستجو را تغییر بده.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function CategoryCarouselCard({
    carousel,
    totalCount,
    actualIndex,
    onMoveUp,
    onMoveDown,
    onToggleActive,
    onPublish,
    onDraft,
    onDuplicate,
    onRemove,
}: {
    carousel: CategoryCarousel;
    totalCount: number;
    actualIndex: number;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onToggleActive: () => void;
    onPublish: () => void;
    onDraft: () => void;
    onDuplicate: () => void;
    onRemove: () => void;
}) {
    const activeItems = carousel.items.filter((item) => item.isActive).length;

    return (
        <article className="rounded-[1.75rem] border border-border bg-background/35 p-4 backdrop-blur-xl transition hover:border-primary/25 hover:bg-primary/5">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-black text-primary">
                            ترتیب {carousel.order.toLocaleString("fa-IR")}
                        </span>

                        <span className="rounded-full bg-background/55 px-3 py-1 text-[11px] font-black text-muted-foreground">
                            {getAudienceLabel(carousel.audience)}
                        </span>

                        <span className="rounded-full bg-background/55 px-3 py-1 text-[11px] font-black text-muted-foreground">
                            {getThemeLabel(carousel.theme)}
                        </span>

                        <span
                            className={[
                                "rounded-full px-3 py-1 text-[11px] font-black",
                                carousel.status === "published"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground",
                            ].join(" ")}
                        >
                            {carousel.status === "published" ? "منتشرشده" : "پیش‌نویس"}
                        </span>

                        <span
                            className={[
                                "rounded-full px-3 py-1 text-[11px] font-black",
                                carousel.isActive
                                    ? "bg-primary/10 text-primary"
                                    : "bg-destructive/10 text-destructive",
                            ].join(" ")}
                        >
                            {carousel.isActive ? "فعال" : "غیرفعال"}
                        </span>
                    </div>

                    <h3 className="mt-4 truncate text-lg font-black text-foreground">
                        {carousel.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">
                        {carousel.description || "توضیحی برای این کروسل ثبت نشده است."}
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <InfoBox label="تعداد آیتم" value={`${carousel.items.length} آیتم`} />
                        <InfoBox label="آیتم فعال" value={`${activeItems} آیتم`} />
                        <InfoBox
                            label="لینک مشاهده همه"
                            value={carousel.seeAll.enabled ? carousel.seeAll.href : "ندارد"}
                        />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {carousel.items.slice(0, 5).map((item) => (
                            <span
                                key={item.id}
                                className="rounded-full border border-border bg-background/45 px-3 py-1 text-[11px] font-black text-muted-foreground"
                            >
                                {item.title}
                            </span>
                        ))}

                        {carousel.items.length > 5 ? (
                            <span className="rounded-full border border-border bg-background/45 px-3 py-1 text-[11px] font-black text-muted-foreground">
                                +{carousel.items.length - 5} آیتم دیگر
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={onMoveUp}
                            disabled={actualIndex <= 0}
                            className={categoryCarouselSecondaryButtonClass}
                        >
                            <ArrowUp className="h-4 w-4" />
                            بالا
                        </button>

                        <button
                            type="button"
                            onClick={onMoveDown}
                            disabled={actualIndex >= totalCount - 1}
                            className={categoryCarouselSecondaryButtonClass}
                        >
                            <ArrowDown className="h-4 w-4" />
                            پایین
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={onToggleActive}
                        className={categoryCarouselSecondaryButtonClass}
                    >
                        {carousel.isActive ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                        {carousel.isActive ? "غیرفعال کردن" : "فعال کردن"}
                    </button>

                    {carousel.status === "published" ? (
                        <button
                            type="button"
                            onClick={onDraft}
                            className={categoryCarouselSecondaryButtonClass}
                        >
                            <Sparkles className="h-4 w-4" />
                            تبدیل به پیش‌نویس
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onPublish}
                            className={categoryCarouselPrimaryButtonClass}
                        >
                            <BadgeCheck className="h-4 w-4" />
                            انتشار سریع
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onDuplicate}
                        className={categoryCarouselSecondaryButtonClass}
                    >
                        <Copy className="h-4 w-4" />
                        کپی
                    </button>

                    <Link
                        href={getCategoryCarouselEditPath(carousel.id)}
                        className={categoryCarouselSecondaryButtonClass}
                    >
                        ویرایش
                    </Link>

                    <button
                        type="button"
                        onClick={onRemove}
                        className={categoryCarouselDangerButtonClass}
                    >
                        <Trash2 className="h-4 w-4" />
                        حذف
                    </button>
                </div>
            </div>
        </article>
    );
}

function StatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="glass-card rounded-[1.75rem] p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-black text-muted-foreground">{label}</p>
                    <p className="mt-2 text-2xl font-black text-foreground">{value}</p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function InfoBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0 rounded-2xl border border-border bg-background/35 p-3">
            <p className="text-[11px] font-black text-muted-foreground">{label}</p>
            <p className="mt-1 truncate text-xs font-black text-foreground">
                {value}
            </p>
        </div>
    );
}

function getAudienceLabel(audience: CategoryCarouselAudience) {
    switch (audience) {
        case "men":
            return "مردانه";
        case "women":
            return "زنانه";
        case "unisex":
            return "مشترک";
        case "kids":
            return "کودک";
        case "custom":
            return "سفارشی";
        default:
            return audience;
    }
}

function getThemeLabel(theme: CategoryCarouselTheme) {
    switch (theme) {
        case "classic":
            return "کلاسیک";
        case "modern":
            return "مدرن";
        case "minimal":
            return "مینیمال";
        case "glass":
            return "گلس";
        case "gray":
            return "خاکستری";
        default:
            return theme;
    }
}