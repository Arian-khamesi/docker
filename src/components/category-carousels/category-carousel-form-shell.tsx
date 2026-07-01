"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    FolderTree,
    ImagePlus,
    Layers3,
    Plus,
    Save,
    Settings2,
} from "lucide-react";

import type {
    CategoryCarousel,
    CategoryCarouselAudience,
    CategoryCarouselPlacement,
    CategoryCarouselStatus,
    CategoryCarouselTheme,
} from "@/types/category-carousel";

import { useCategoryCarouselStore } from "@/store/category-carousel.store";
import { CategoryCarouselItemsManager } from "./category-carousel-items-manager";
import { CategoryCarouselReview } from "./category-carousel-review";
import {
    CATEGORY_CAROUSELS_BASE_PATH,
    categoryCarouselHeroClass,
    categoryCarouselInputClass,
    categoryCarouselPageClass,
    categoryCarouselPanelClass,
    categoryCarouselPrimaryButtonClass,
    categoryCarouselSecondaryButtonClass,
    getCategoryCarouselEditPath,
} from "./category-carousel.constants";

interface CategoryCarouselFormShellProps {
    mode: "create" | "edit";
    carouselId?: string;
}

const audienceOptions: Array<{
    value: CategoryCarouselAudience;
    label: string;
    title: string;
    description: string;
    defaultTitle: string;
    defaultHref: string;
}> = [
        {
            value: "men",
            label: "مردانه",
            title: "کروسل دسته‌بندی مردانه",
            description: "برای نمایش دسته‌بندی‌های مرتبط با محصولات مردانه.",
            defaultTitle: "دسته‌بندی‌های مردانه",
            defaultHref: "/men",
        },
        {
            value: "women",
            label: "زنانه",
            title: "کروسل دسته‌بندی زنانه",
            description: "برای نمایش دسته‌بندی‌های مرتبط با محصولات زنانه.",
            defaultTitle: "دسته‌بندی‌های زنانه",
            defaultHref: "/women",
        },
        {
            value: "unisex",
            label: "مشترک",
            title: "کروسل دسته‌بندی مشترک",
            description: "برای دسته‌بندی‌هایی که جنسیت مشخص ندارند.",
            defaultTitle: "دسته‌بندی‌های منتخب",
            defaultHref: "/categories",
        },
        {
            value: "kids",
            label: "کودک",
            title: "کروسل دسته‌بندی کودک",
            description: "برای دسته‌بندی‌های مرتبط با کودک.",
            defaultTitle: "دسته‌بندی‌های کودک",
            defaultHref: "/kids",
        },
        {
            value: "custom",
            label: "سفارشی",
            title: "کروسل سفارشی",
            description: "برای هر گروه نمایشی خاص در صفحه اصلی.",
            defaultTitle: "دسته‌بندی‌های ویژه",
            defaultHref: "/categories",
        },
    ];

export function CategoryCarouselFormShell({
    mode,
    carouselId,
}: CategoryCarouselFormShellProps) {
    const router = useRouter();

    const { carousels, addCarousel, updateCarousel } =
        useCategoryCarouselStore();

    const carousel = useMemo(
        () => carousels.find((item) => item.id === carouselId) ?? null,
        [carousels, carouselId]
    );

    if (mode === "create") {
        return <CategoryCarouselCreateStart onCreate={addCarousel} />;
    }

    if (!carousel) {
        return (
            <div className={categoryCarouselPageClass}>
                <section className={categoryCarouselPanelClass}>
                    <div className="mx-auto max-w-xl py-10 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-destructive/10 text-destructive">
                            <FolderTree className="h-7 w-7" />
                        </div>

                        <h1 className="mt-5 text-xl font-black text-foreground">
                            کروسل پیدا نشد
                        </h1>

                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                            ممکن است این کروسل حذف شده باشد یا آدرس صفحه اشتباه باشد.
                        </p>

                        <Link
                            href={CATEGORY_CAROUSELS_BASE_PATH}
                            className={`${categoryCarouselPrimaryButtonClass} mt-6`}
                        >
                            بازگشت به لیست
                        </Link>
                    </div>
                </section>
            </div>
        );
    }

    const handleUpdate = (updates: Partial<CategoryCarousel>) => {
        updateCarousel(carousel.id, updates);
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
                            Category Carousel Editor
                        </div>

                        <h1 className="text-2xl font-black text-foreground">
                            ویرایش کروسل دسته‌بندی
                        </h1>

                        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                            در این صفحه تنظیمات کلی کروسل را مدیریت می‌کنیم. مدیریت کامل
                            آیتم‌ها، تصویرها و payload در فازهای بعدی اضافه می‌شود.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={CATEGORY_CAROUSELS_BASE_PATH}
                            className={categoryCarouselSecondaryButtonClass}
                        >
                            <ArrowRight className="h-4 w-4" />
                            بازگشت به لیست
                        </Link>

                        <button type="button" className={categoryCarouselPrimaryButtonClass}>
                            <Save className="h-4 w-4" />
                            ذخیره محلی
                        </button>
                    </div>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <main className="min-w-0">
                    <section className={categoryCarouselPanelClass}>
                        <div className="mb-5">
                            <p className="text-xs font-black text-primary">تنظیمات اصلی</p>

                            <h2 className="mt-1 text-xl font-black text-foreground">
                                اطلاعات کروسل
                            </h2>

                            <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                این اطلاعات برای نمایش و مدیریت کروسل دسته‌بندی استفاده می‌شود.
                            </p>
                        </div>

                        <div className="grid gap-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="grid gap-2">
                                    <span className="text-xs font-black text-foreground">
                                        عنوان کروسل
                                    </span>

                                    <input
                                        value={carousel.title}
                                        onChange={(event) =>
                                            handleUpdate({ title: event.target.value })
                                        }
                                        className={categoryCarouselInputClass}
                                        placeholder="مثلاً دسته‌بندی‌های مردانه"
                                    />
                                </label>

                                <label className="grid gap-2">
                                    <span className="text-xs font-black text-foreground">
                                        مخاطب / گروه
                                    </span>

                                    <select
                                        value={carousel.audience}
                                        onChange={(event) =>
                                            handleUpdate({
                                                audience: event.target.value as CategoryCarouselAudience,
                                            })
                                        }
                                        className={categoryCarouselInputClass}
                                    >
                                        {audienceOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            {carousel.audience === "custom" ? (
                                <label className="grid gap-2">
                                    <span className="text-xs font-black text-foreground">
                                        عنوان گروه سفارشی
                                    </span>

                                    <input
                                        value={carousel.customAudienceTitle ?? ""}
                                        onChange={(event) =>
                                            handleUpdate({
                                                customAudienceTitle: event.target.value,
                                            })
                                        }
                                        className={categoryCarouselInputClass}
                                        placeholder="مثلاً کمپین نوروزی"
                                    />
                                </label>
                            ) : null}

                            <div className="grid gap-4 md:grid-cols-3">
                                <label className="grid gap-2">
                                    <span className="text-xs font-black text-foreground">
                                        استایل نمایش
                                    </span>

                                    <select
                                        value={carousel.theme}
                                        onChange={(event) =>
                                            handleUpdate({
                                                theme: event.target.value as CategoryCarouselTheme,
                                            })
                                        }
                                        className={categoryCarouselInputClass}
                                    >
                                        <option value="classic">کلاسیک</option>
                                        <option value="modern">مدرن</option>
                                        <option value="minimal">مینیمال</option>
                                        <option value="glass">گلس</option>
                                        <option value="gray">خاکستری</option>
                                    </select>
                                </label>

                                <label className="grid gap-2">
                                    <span className="text-xs font-black text-foreground">
                                        جایگاه نمایش
                                    </span>

                                    <select
                                        value={carousel.placement}
                                        onChange={(event) =>
                                            handleUpdate({
                                                placement: event.target.value as CategoryCarouselPlacement,
                                            })
                                        }
                                        className={categoryCarouselInputClass}
                                    >
                                        <option value="home_after_product_carousels">
                                            صفحه اصلی / بعد از کروسل محصولات
                                        </option>
                                        <option value="home_before_product_carousels">
                                            صفحه اصلی / قبل از کروسل محصولات
                                        </option>
                                        <option value="custom">جایگاه سفارشی</option>
                                    </select>
                                </label>

                                <label className="grid gap-2">
                                    <span className="text-xs font-black text-foreground">
                                        وضعیت محلی
                                    </span>

                                    <select
                                        value={carousel.status}
                                        onChange={(event) =>
                                            handleUpdate({
                                                status: event.target.value as CategoryCarouselStatus,
                                            })
                                        }
                                        className={categoryCarouselInputClass}
                                    >
                                        <option value="draft">پیش‌نویس</option>
                                        <option value="published">منتشرشده</option>
                                    </select>
                                </label>
                            </div>

                            <label className="grid gap-2">
                                <span className="text-xs font-black text-foreground">
                                    توضیحات داخلی
                                </span>

                                <textarea
                                    value={carousel.description ?? ""}
                                    onChange={(event) =>
                                        handleUpdate({ description: event.target.value })
                                    }
                                    className={`${categoryCarouselInputClass} min-h-28 py-3 leading-7`}
                                    placeholder="توضیح کوتاه برای اپراتور یا تیم محتوا"
                                />
                            </label>

                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="grid gap-2">
                                    <span className="text-xs font-black text-foreground">
                                        لینک مشاهده همه
                                    </span>

                                    <input
                                        value={carousel.seeAll.href}
                                        onChange={(event) =>
                                            handleUpdate({
                                                seeAll: {
                                                    ...carousel.seeAll,
                                                    href: event.target.value,
                                                },
                                            })
                                        }
                                        className={categoryCarouselInputClass}
                                        placeholder="/men"
                                    />
                                </label>

                                <label className="grid gap-2">
                                    <span className="text-xs font-black text-foreground">
                                        متن دکمه مشاهده همه
                                    </span>

                                    <input
                                        value={carousel.seeAll.label}
                                        onChange={(event) =>
                                            handleUpdate({
                                                seeAll: {
                                                    ...carousel.seeAll,
                                                    label: event.target.value,
                                                },
                                            })
                                        }
                                        className={categoryCarouselInputClass}
                                        placeholder="مشاهده همه"
                                    />
                                </label>
                            </div>

                            <div className="grid gap-3 md:grid-cols-3">
                                <ToggleCard
                                    title="نمایش عنوان"
                                    description="عنوان کروسل در سایت نمایش داده شود."
                                    checked={carousel.showTitle}
                                    onClick={() => handleUpdate({ showTitle: !carousel.showTitle })}
                                />

                                <ToggleCard
                                    title="مشاهده همه"
                                    description="دکمه لینک به صفحه دسته‌بندی نمایش داده شود."
                                    checked={carousel.seeAll.enabled}
                                    onClick={() =>
                                        handleUpdate({
                                            seeAll: {
                                                ...carousel.seeAll,
                                                enabled: !carousel.seeAll.enabled,
                                            },
                                        })
                                    }
                                />

                                <ToggleCard
                                    title="فعال در سایت"
                                    description="اگر منتشر شود، امکان نمایش در صفحه اصلی دارد."
                                    checked={carousel.isActive}
                                    onClick={() => handleUpdate({ isActive: !carousel.isActive })}
                                />
                            </div>
                        </div>
                    </section>

                    <CategoryCarouselItemsManager carousel={carousel} />
                    <CategoryCarouselReview carousel={carousel} />
                </main>

                <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start">
                    <section className="glass-context-panel rounded-[2rem] p-4 sm:p-5">
                        <p className="text-xs font-black text-primary">خلاصه</p>

                        <h2 className="mt-1 text-lg font-black text-foreground">
                            {carousel.title}
                        </h2>

                        <p className="mt-2 text-xs leading-6 text-muted-foreground">
                            این کروسل در جایگاه زیر کروسل‌های محصول در صفحه اصلی استفاده
                            می‌شود.
                        </p>

                        <div className="mt-5 grid gap-3">
                            <SummaryRow label="گروه" value={getAudienceLabel(carousel)} />
                            <SummaryRow label="استایل" value={getThemeLabel(carousel.theme)} />
                            <SummaryRow label="جایگاه" value={getPlacementLabel(carousel.placement)} />
                            <SummaryRow
                                label="وضعیت"
                                value={carousel.status === "published" ? "منتشرشده" : "پیش‌نویس"}
                            />
                            <SummaryRow label="فعال" value={carousel.isActive ? "بله" : "خیر"} />
                            <SummaryRow label="تعداد آیتم" value={`${carousel.items.length} آیتم`} />
                            <SummaryRow label="نمایش عنوان" value={carousel.showTitle ? "بله" : "خیر"} />
                            <SummaryRow
                                label="مشاهده همه"
                                value={carousel.seeAll.enabled ? "فعال" : "غیرفعال"}
                            />
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}

function CategoryCarouselCreateStart({
  onCreate,
}: {
  onCreate: (payload?: Partial<CategoryCarousel>) => string;
}) {
  const router = useRouter();

  const [selectedAudience, setSelectedAudience] =
    useState<CategoryCarouselAudience>("men");

  const selectedOption =
    audienceOptions.find((option) => option.value === selectedAudience) ??
    audienceOptions[0]!;

  const [title, setTitle] = useState(selectedOption.defaultTitle);
  const [description, setDescription] = useState(selectedOption.description);
  const [seeAllLabel, setSeeAllLabel] = useState(
    `مشاهده همه ${selectedOption.label}`
  );
  const [seeAllHref, setSeeAllHref] = useState(selectedOption.defaultHref);
  const [theme, setTheme] = useState<CategoryCarouselTheme>("modern");

  const handleSelectAudience = (
    audience: CategoryCarouselAudience
  ) => {
    const option =
      audienceOptions.find((item) => item.value === audience) ??
      audienceOptions[0]!;

    setSelectedAudience(option.value);
    setTitle(option.defaultTitle);
    setDescription(option.description);
    setSeeAllLabel(`مشاهده همه ${option.label}`);
    setSeeAllHref(option.defaultHref);
  };

  const handleCreate = () => {
    const id = onCreate({
      title: title.trim() || selectedOption.defaultTitle,
      description: description.trim() || selectedOption.description,
      audience: selectedOption.value,
      customAudienceTitle: undefined,
      theme,
      placement: "home_after_product_carousels",
      showTitle: true,
      seeAll: {
        enabled: true,
        label: seeAllLabel.trim() || `مشاهده همه ${selectedOption.label}`,
        href: seeAllHref.trim() || selectedOption.defaultHref,
      },
      items: [],
      status: "draft",
      isActive: false,
    });

    router.push(getCategoryCarouselEditPath(id));
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
              New Category Carousel
            </div>

            <h1 className="text-2xl font-black text-foreground">
              ساخت کروسل دسته‌بندی جدید
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
              گروه اولیه، عنوان، لینک مشاهده همه و استایل کروسل را مشخص کن.
              بعد از ساخت، وارد صفحه ویرایش می‌شوی و آیتم‌ها را اضافه می‌کنی.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={CATEGORY_CAROUSELS_BASE_PATH}
              className={categoryCarouselSecondaryButtonClass}
            >
              <ArrowRight className="h-4 w-4" />
              بازگشت به لیست
            </Link>

            <button
              type="button"
              onClick={handleCreate}
              className={categoryCarouselPrimaryButtonClass}
            >
              ساخت و ادامه ویرایش
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0">
          <section className={categoryCarouselPanelClass}>
            <div className="mb-5">
              <p className="text-xs font-black text-primary">انتخاب گروه</p>

              <h2 className="mt-1 text-xl font-black text-foreground">
                این کروسل برای کدام دسته است؟
              </h2>

              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                پیشنهاد بهتر این است که کروسل مردانه و زنانه جدا باشند تا ترتیب
                نمایش در صفحه اصلی هم واضح و قابل کنترل بماند.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {audienceOptions.map((option) => {
                const isSelected = option.value === selectedAudience;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelectAudience(option.value)}
                    className={[
                      "rounded-[1.5rem] border p-4 text-right transition",
                      isSelected
                        ? "border-primary/30 bg-primary/10"
                        : "border-border bg-background/35 hover:border-primary/25 hover:bg-primary/5",
                    ].join(" ")}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Layers3 className="h-5 w-5" />
                    </div>

                    <h3 className="mt-4 text-sm font-black text-foreground">
                      {option.title}
                    </h3>

                    <p className="mt-2 text-xs leading-6 text-muted-foreground">
                      {option.description}
                    </p>

                    {isSelected ? (
                      <span className="mt-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-[11px] font-black text-primary">
                        انتخاب شده
                      </span>
                    ) : null}
                  </button>
                );
              })}
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
                  این موارد بعداً در صفحه ویرایش هم قابل تغییر هستند.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs font-black text-foreground">
                    عنوان کروسل
                  </span>

                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className={categoryCarouselInputClass}
                    placeholder="مثلاً دسته‌بندی‌های مردانه"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-black text-foreground">
                    استایل اولیه
                  </span>

                  <select
                    value={theme}
                    onChange={(event) =>
                      setTheme(event.target.value as CategoryCarouselTheme)
                    }
                    className={categoryCarouselInputClass}
                  >
                    <option value="classic">کلاسیک</option>
                    <option value="modern">مدرن</option>
                    <option value="minimal">مینیمال</option>
                    <option value="glass">گلس</option>
                    <option value="gray">خاکستری</option>
                  </select>
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-xs font-black text-foreground">
                  توضیح داخلی
                </span>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className={`${categoryCarouselInputClass} min-h-28 py-3 leading-7`}
                  placeholder="توضیح کوتاه برای شناخت بهتر این کروسل"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs font-black text-foreground">
                    متن مشاهده همه
                  </span>

                  <input
                    value={seeAllLabel}
                    onChange={(event) => setSeeAllLabel(event.target.value)}
                    className={categoryCarouselInputClass}
                    placeholder="مشاهده همه مردانه"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-black text-foreground">
                    لینک مشاهده همه
                  </span>

                  <input
                    value={seeAllHref}
                    onChange={(event) => setSeeAllHref(event.target.value)}
                    className={`${categoryCarouselInputClass} text-left`}
                    placeholder="/men"
                    dir="ltr"
                  />
                </label>
              </div>
            </div>
          </section>
        </main>

        <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start">
          <section className="glass-context-panel rounded-[2rem] p-4 sm:p-5">
            <p className="text-xs font-black text-primary">خلاصه ساخت</p>

            <h2 className="mt-1 text-lg font-black text-foreground">
              {title.trim() || selectedOption.defaultTitle}
            </h2>

            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              این کروسل به صورت پیش‌نویس و غیرفعال ساخته می‌شود. آیتم‌های داخل
              آن را در صفحه ویرایش اضافه می‌کنی.
            </p>

            <div className="mt-5 grid gap-3">
              <SummaryRow label="گروه" value={selectedOption.label} />
              <SummaryRow label="استایل" value={getThemeLabel(theme)} />
              <SummaryRow label="جایگاه" value="بعد از کروسل محصولات" />
              <SummaryRow label="وضعیت" value="پیش‌نویس / غیرفعال" />
              <SummaryRow label="آیتم اولیه" value="بدون آیتم" />
              <SummaryRow
                label="مشاهده همه"
                value={seeAllHref.trim() || selectedOption.defaultHref}
              />
            </div>

            <button
              type="button"
              onClick={handleCreate}
              className={`${categoryCarouselPrimaryButtonClass} mt-5 w-full`}
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

function ToggleCard({
    title,
    description,
    checked,
    onClick,
}: {
    title: string;
    description: string;
    checked: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "rounded-[1.5rem] border p-4 text-right transition",
                checked
                    ? "border-primary/30 bg-primary/10"
                    : "border-border bg-background/35 hover:border-primary/25 hover:bg-primary/5",
            ].join(" ")}
        >
            <p className="text-sm font-black text-foreground">{title}</p>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
                {description}
            </p>
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

function getAudienceLabel(carousel: CategoryCarousel) {
    if (carousel.audience === "custom") {
        return carousel.customAudienceTitle || "سفارشی";
    }

    switch (carousel.audience) {
        case "men":
            return "مردانه";
        case "women":
            return "زنانه";
        case "unisex":
            return "مشترک";
        case "kids":
            return "کودک";
        default:
            return carousel.audience;
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

function getPlacementLabel(placement: CategoryCarouselPlacement) {
  switch (placement) {
    case "home_after_product_carousels":
      return "بعد از کروسل محصولات";
    case "home_before_product_carousels":
      return "قبل از کروسل محصولات";
    case "custom":
      return "سفارشی";
    default:
      return placement;
  }
}
