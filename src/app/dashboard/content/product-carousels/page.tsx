"use client";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
    ArrowDown,
    ArrowUp,
    CalendarClock,
    CheckCircle2,
    Clock3,
    Copy,
    Eye,
    Layers3,
    PackageSearch,
    PauseCircle,
    Pencil,
    Plus,
    Power,
    Trash2,
} from "lucide-react";

import type {
    ProductCarousel,
    ProductCarouselRuntimeStatus,
    ProductCarouselSourceType,
    ProductCarouselStatus,
    ProductCarouselTheme,
} from "@/types/product-carousel";
import { useProductCarouselStore } from "@/store/product-carousel.store";

const pageClass = "mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6";
const heroClass =
    "glass-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-6";
const panelClass = "glass-card rounded-[2rem] p-4 sm:p-5";
const sidePanelClass = "glass-context-panel rounded-[2rem] p-4 sm:p-5";
const rowCardClass =
    "rounded-[1.5rem] border border-border bg-background/40 p-4 backdrop-blur-xl transition hover:border-primary/25 hover:bg-primary/5";
const primaryButtonClass =
    "inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground transition hover:bg-primary/90";
const secondaryButtonClass =
    "inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background/45 px-4 py-2.5 text-sm font-black text-foreground backdrop-blur-xl transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary";
const iconButtonClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/45 text-muted-foreground backdrop-blur-xl transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary";
const dangerIconButtonClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-destructive/15 bg-destructive/10 text-destructive transition hover:bg-destructive/15";



const PRODUCT_CAROUSELS_BASE_PATH = "/dashboard/content/product-carousels";
const PRODUCT_CAROUSEL_NEW_PATH = `${PRODUCT_CAROUSELS_BASE_PATH}/new`;

function getProductCarouselEditPath(id: string) {
    return `${PRODUCT_CAROUSELS_BASE_PATH}/${id}/edit`;
}

export default function ProductCarouselsPage() {

    const router = useRouter();

    const {
        carousels,
        selectedCarouselId,
        selectCarousel,
        addCarousel,
        duplicateCarousel,
        removeCarousel,
        setCarouselStatus,
        toggleCarouselActive,
        moveCarousel,
        openEditor,
    } = useProductCarouselStore();

    const sortedCarousels = useMemo(
        () => [...carousels].sort((a, b) => a.order - b.order),
        [carousels]
    );

    const selectedCarousel =
        sortedCarousels.find((carousel) => carousel.id === selectedCarouselId) ??
        sortedCarousels[0] ??
        null;

    const stats = useMemo(() => {
        const running = sortedCarousels.filter(
            (carousel) => getRuntimeStatus(carousel) === "running"
        ).length;

        const scheduled = sortedCarousels.filter(
            (carousel) => getRuntimeStatus(carousel) === "not_started"
        ).length;

        const expired = sortedCarousels.filter(
            (carousel) => getRuntimeStatus(carousel) === "expired"
        ).length;

        const active = sortedCarousels.filter((carousel) => carousel.isActive).length;

        return {
            total: sortedCarousels.length,
            active,
            running,
            scheduled,
            expired,
        };
    }, [sortedCarousels]);

    const handleAddCarousel = () => {
        router.push(PRODUCT_CAROUSEL_NEW_PATH);
    };

    const handleEditCarousel = (id: string) => {
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
                            مدیریت کروسل‌های محصولات
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                            این بخش برای ساخت، زمان‌بندی و مدیریت کروسل‌های محصولات صفحه اصلی
                            استفاده می‌شود. در این فاز، لیست، وضعیت‌ها و عملیات اصلی آماده شده‌اند.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={handleAddCarousel}
                            className={primaryButtonClass}
                        >
                            <Plus className="h-4 w-4" />
                            ساخت کروسل جدید
                        </button>
                    </div>
                </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard title="کل کروسل‌ها" value={stats.total} icon={<Layers3 />} />
                <StatCard title="فعال‌ها" value={stats.active} icon={<Power />} />
                <StatCard title="در حال نمایش" value={stats.running} icon={<CheckCircle2 />} />
                <StatCard title="زمان‌بندی‌شده" value={stats.scheduled} icon={<Clock3 />} />
                <StatCard title="منقضی‌شده" value={stats.expired} icon={<PauseCircle />} />
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
                <main className="min-w-0">
                    <section className={panelClass}>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <SectionHeader
                                eyebrow="لیست کروسل‌ها"
                                title="کروسل‌های صفحه اصلی"
                                description="ترتیب، وضعیت، زمان‌بندی و تنظیمات کلی کروسل‌ها را از اینجا کنترل کن."
                            />

                            <button
                                type="button"
                                onClick={handleAddCarousel}
                                className={secondaryButtonClass}
                            >
                                <Plus className="h-4 w-4" />
                                کروسل جدید
                            </button>
                        </div>

                        <InfoStrip
                            title="راهنما"
                            text="برای شروع، روی یک کروسل کلیک کن. سمت راست خلاصه تنظیمات آن را می‌بینی. فرم کامل ویرایش در فاز بعدی اضافه می‌شود."
                        />

                        <div className="mt-5 grid gap-4">
                            {sortedCarousels.length > 0 ? (
                                sortedCarousels.map((carousel) => (
                                    <ProductCarouselListItem
                                        key={carousel.id}
                                        carousel={carousel}
                                        selected={carousel.id === selectedCarousel?.id}
                                        onSelect={() => selectCarousel(carousel.id)}
                                        onMoveUp={() => moveCarousel(carousel.id, "up")}
                                        onMoveDown={() => moveCarousel(carousel.id, "down")}
                                        onToggleActive={() => toggleCarouselActive(carousel.id)}
                                        onToggleStatus={() =>
                                            setCarouselStatus(
                                                carousel.id,
                                                carousel.status === "published" ? "draft" : "published"
                                            )
                                        }
                                        onDuplicate={() => duplicateCarousel(carousel.id)}
                                        onRemove={() => removeCarousel(carousel.id)}
                                        onEdit={() => handleEditCarousel(carousel.id)}
                                        canRemove={sortedCarousels.length > 1}
                                    />
                                ))
                            ) : (
                                <EmptyState onAdd={handleAddCarousel} />
                            )}
                        </div>
                    </section>
                </main>

                <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start">
                    <section className={sidePanelClass}>
                        {selectedCarousel ? (
                            <CarouselDetailsPanel
                                carousel={selectedCarousel}
                                onEdit={() => handleEditCarousel(selectedCarousel.id)}
                                onDuplicate={() => duplicateCarousel(selectedCarousel.id)}
                                onToggleActive={() => toggleCarouselActive(selectedCarousel.id)}
                            />
                        ) : (
                            <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                                <p className="text-sm font-black text-foreground">
                                    کروسل انتخاب نشده
                                </p>
                                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                                    یک کروسل بساز یا از لیست انتخاب کن.
                                </p>
                            </div>
                        )}
                    </section>
                </aside>
            </div>
        </div>
    );
}

function ProductCarouselListItem({
    carousel,
    selected,
    onSelect,
    onMoveUp,
    onMoveDown,
    onToggleActive,
    onToggleStatus,
    onDuplicate,
    onRemove,
    onEdit,
    canRemove,
}: {
    carousel: ProductCarousel;
    selected: boolean;
    onSelect: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onToggleActive: () => void;
    onToggleStatus: () => void;
    onDuplicate: () => void;
    onRemove: () => void;
    onEdit: () => void;
    canRemove: boolean;
}) {
    const runtimeStatus = getRuntimeStatus(carousel);

    return (
        <article
            className={[
                rowCardClass,
                selected ? "border-primary/35 bg-primary/5" : "",
            ].join(" ")}
            onClick={onSelect}
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <RuntimeStatusBadge status={runtimeStatus} />
                        <PublishStatusBadge status={carousel.status} />
                        <ActiveBadge active={carousel.isActive} />
                    </div>

                    <h3 className="truncate text-base font-black text-foreground">
                        {carousel.title || "کروسل بدون عنوان"}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>نوع: {getSourceTypeLabel(carousel.source.type)}</span>
                        <span>•</span>
                        <span>استایل: {getThemeLabel(carousel.theme)}</span>
                        <span>•</span>
                        <span>{carousel.productLimit} محصول</span>
                    </div>

                    <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                        <MiniInfo
                            label="شروع"
                            value={formatDateTime(carousel.startsAt)}
                        />
                        <MiniInfo label="پایان" value={formatDateTime(carousel.endsAt)} />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onToggleActive();
                        }}
                        className={[
                            "rounded-xl px-3 py-2 text-xs font-black transition",
                            carousel.isActive
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                                : "bg-muted text-muted-foreground",
                        ].join(" ")}
                    >
                        {carousel.isActive ? "فعال" : "غیرفعال"}
                    </button>

                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onToggleStatus();
                        }}
                        className="rounded-xl bg-primary/10 px-3 py-2 text-xs font-black text-primary transition hover:bg-primary/15"
                    >
                        {carousel.status === "published" ? "پیش‌نویس کن" : "انتشار"}
                    </button>

                    <IconAction
                        label="ویرایش"
                        onClick={onEdit}
                        icon={<Pencil className="h-4 w-4" />}
                    />

                    <IconAction
                        label="کپی"
                        onClick={onDuplicate}
                        icon={<Copy className="h-4 w-4" />}
                    />

                    <IconAction
                        label="بالا"
                        onClick={onMoveUp}
                        icon={<ArrowUp className="h-4 w-4" />}
                    />

                    <IconAction
                        label="پایین"
                        onClick={onMoveDown}
                        icon={<ArrowDown className="h-4 w-4" />}
                    />

                    <button
                        type="button"
                        disabled={!canRemove}
                        onClick={(event) => {
                            event.stopPropagation();
                            onRemove();
                        }}
                        className={dangerIconButtonClass}
                        title="حذف"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </article>
    );
}

function CarouselDetailsPanel({
    carousel,
    onEdit,
    onDuplicate,
    onToggleActive,
}: {
    carousel: ProductCarousel;
    onEdit: () => void;
    onDuplicate: () => void;
    onToggleActive: () => void;
}) {
    const runtimeStatus = getRuntimeStatus(carousel);

    return (
        <div>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-black text-primary">جزئیات کروسل</p>

                    <h2 className="mt-1 text-lg font-black text-foreground">
                        {carousel.title}
                    </h2>

                    <p className="mt-2 text-xs leading-6 text-muted-foreground">
                        این پنل خلاصه تنظیمات کروسل انتخاب‌شده را نشان می‌دهد. ویرایش کامل در
                        فاز بعدی اضافه می‌شود.
                    </p>
                </div>

                <RuntimeStatusBadge status={runtimeStatus} />
            </div>

            <div className="mt-5 grid gap-3">
                <DetailRow label="وضعیت انتشار" value={getPublishStatusLabel(carousel.status)} />
                <DetailRow label="فعال بودن" value={carousel.isActive ? "فعال" : "غیرفعال"} />
                <DetailRow label="استایل" value={getThemeLabel(carousel.theme)} />
                <DetailRow label="منبع محصولات" value={getSourceTypeLabel(carousel.source.type)} />
                <DetailRow label="تعداد محصولات" value={`${carousel.productLimit} محصول`} />
                <DetailRow
                    label="دسته‌بندی‌ها"
                    value={
                        carousel.source.selectedCategories.length > 0
                            ? `${carousel.source.selectedCategories.length} دسته‌بندی`
                            : "انتخاب نشده"
                    }
                />
                <DetailRow
                    label="تخفیف"
                    value={
                        carousel.discount.enabled
                            ? `${carousel.discount.minPercent ?? 0}% تا ${carousel.discount.maxPercent ?? 100
                            }%`
                            : "غیرفعال"
                    }
                />
                <DetailRow
                    label="تایمر"
                    value={carousel.timer.enabled ? carousel.timer.label : "ندارد"}
                />
                <DetailRow
                    label="مشاهده همه"
                    value={carousel.seeAll.enabled ? carousel.seeAll.label : "ندارد"}
                />
            </div>

            <div className="mt-5 grid gap-2">
                <button type="button" onClick={onEdit} className={primaryButtonClass}>
                    <Pencil className="h-4 w-4" />
                    ویرایش کروسل
                </button>

                <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={onDuplicate} className={secondaryButtonClass}>
                        <Copy className="h-4 w-4" />
                        کپی
                    </button>

                    <button type="button" onClick={onToggleActive} className={secondaryButtonClass}>
                        <Power className="h-4 w-4" />
                        {carousel.isActive ? "غیرفعال" : "فعال"}
                    </button>
                </div>
            </div>

            <div className="mt-5 rounded-2xl border border-primary/10 bg-primary/5 p-4">
                <p className="text-sm font-black text-primary">قدم بعدی</p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                    در فاز بعدی همین دکمه ویرایش، پنل فرم مرحله‌ای را باز می‌کند: اطلاعات
                    اصلی، زمان‌بندی، منبع محصولات، تخفیف و تنظیمات نمایش.
                </p>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <div className="glass-card rounded-[1.5rem] p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-black text-muted-foreground">{title}</p>
                    <p className="mt-2 text-2xl font-black text-foreground">{value}</p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function SectionHeader({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description: string;
}) {
    return (
        <div>
            <p className="text-xs font-black text-primary">{eyebrow}</p>
            <h2 className="mt-1 text-lg font-black text-foreground">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

function InfoStrip({ title, text }: { title: string; text: string }) {
    return (
        <div className="mt-5 rounded-2xl border border-primary/10 bg-primary/5 p-4 backdrop-blur-xl">
            <p className="text-sm font-black text-primary">{title}</p>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">{text}</p>
        </div>
    );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-border bg-background/35 px-3 py-2">
            <p className="text-[10px] font-black text-muted-foreground">{label}</p>
            <p className="mt-1 text-xs font-bold text-foreground">{value}</p>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/35 px-4 py-3">
            <span className="text-xs font-black text-muted-foreground">{label}</span>
            <span className="text-xs font-black text-foreground">{value}</span>
        </div>
    );
}

function IconAction({
    label,
    icon,
    onClick,
}: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            title={label}
            onClick={(event) => {
                event.stopPropagation();
                onClick();
            }}
            className={iconButtonClass}
        >
            {icon}
        </button>
    );
}

function RuntimeStatusBadge({
    status,
}: {
    status: ProductCarouselRuntimeStatus;
}) {
    const config = {
        running: {
            label: "در حال نمایش",
            className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
        },
        not_started: {
            label: "شروع‌نشده",
            className: "bg-blue-500/15 text-blue-600 dark:text-blue-300",
        },
        expired: {
            label: "منقضی‌شده",
            className: "bg-muted text-muted-foreground",
        },
    } satisfies Record<
        ProductCarouselRuntimeStatus,
        { label: string; className: string }
    >;

    return (
        <span
            className={[
                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black",
                config[status].className,
            ].join(" ")}
        >
            <CalendarClock className="h-3.5 w-3.5" />
            {config[status].label}
        </span>
    );
}

function PublishStatusBadge({ status }: { status: ProductCarouselStatus }) {
    return (
        <span
            className={[
                "rounded-full px-3 py-1 text-xs font-black",
                status === "published"
                    ? "bg-primary/10 text-primary"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-300",
            ].join(" ")}
        >
            {getPublishStatusLabel(status)}
        </span>
    );
}

function ActiveBadge({ active }: { active: boolean }) {
    return (
        <span
            className={[
                "rounded-full px-3 py-1 text-xs font-black",
                active
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                    : "bg-muted text-muted-foreground",
            ].join(" ")}
        >
            {active ? "فعال" : "غیرفعال"}
        </span>
    );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="rounded-[1.5rem] border border-dashed border-border p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <PackageSearch className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-base font-black text-foreground">
                هنوز کروسل محصولی ساخته نشده
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">
                اولین کروسل را بساز تا بعداً بتوانیم فرم تنظیمات و پریویو آن را کامل کنیم.
            </p>

            <button type="button" onClick={onAdd} className={`${primaryButtonClass} mt-5`}>
                <Plus className="h-4 w-4" />
                ساخت اولین کروسل
            </button>
        </div>
    );
}

function getRuntimeStatus(
    carousel: ProductCarousel
): ProductCarouselRuntimeStatus {
    const nowTime = Date.now();
    const startTime = new Date(carousel.startsAt).getTime();
    const endTime = new Date(carousel.endsAt).getTime();

    if (Number.isFinite(startTime) && nowTime < startTime) {
        return "not_started";
    }

    if (Number.isFinite(endTime) && nowTime > endTime) {
        return "expired";
    }

    return "running";
}

function formatDateTime(value: string) {
    if (!value) return "تنظیم نشده";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "نامعتبر";

    return new Intl.DateTimeFormat("fa-IR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function getPublishStatusLabel(status: ProductCarouselStatus) {
    switch (status) {
        case "published":
            return "منتشر شده";
        case "draft":
            return "پیش‌نویس";
        default:
            return status;
    }
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