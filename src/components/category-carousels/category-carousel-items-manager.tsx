"use client";

import { useRef } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ImagePlus,
  Link2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import type {
  CategoryCarousel,
  CategoryCarouselImage,
  CategoryCarouselItem,
} from "@/types/category-carousel";
import { useCategoryCarouselStore } from "@/store/category-carousel.store";
import {
  categoryCarouselDangerButtonClass,
  categoryCarouselInputClass,
  categoryCarouselPanelClass,
  categoryCarouselPrimaryButtonClass,
  categoryCarouselSecondaryButtonClass,
} from "./category-carousel.constants";

interface CategoryCarouselItemsManagerProps {
  carousel: CategoryCarousel;
}

export function CategoryCarouselItemsManager({
  carousel,
}: CategoryCarouselItemsManagerProps) {
  const {
    addItem,
    updateItem,
    removeItem,
    toggleItemActive,
    moveItem,
  } = useCategoryCarouselStore();

  const sortedItems = [...carousel.items].sort((a, b) => a.order - b.order);

  const handleAddItem = () => {
    addItem(carousel.id, {
      title: "دسته‌بندی جدید",
      href: "",
      badge: "",
      description: "",
      image: {
        url: "",
        alt: "دسته‌بندی جدید",
      },
      isActive: true,
    });
  };

  const handleRemoveItem = (item: CategoryCarouselItem) => {
    const confirmed = window.confirm(`آیتم «${item.title}» حذف شود؟`);

    if (!confirmed) return;

    removeItem(carousel.id, item.id);
  };

  const handleUpdateItem = (
    itemId: string,
    updates: Partial<CategoryCarouselItem>
  ) => {
    updateItem(carousel.id, itemId, updates);
  };

  const handleUpdateImage = (
    item: CategoryCarouselItem,
    image?: CategoryCarouselImage
  ) => {
    handleUpdateItem(item.id, {
      image,
    });
  };

  const handleMoveItem = (itemId: string, direction: "up" | "down") => {
    const currentIndex = sortedItems.findIndex((item) => item.id === itemId);

    if (currentIndex === -1) return;

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    moveItem(carousel.id, currentIndex, targetIndex);
  };

  return (
    <section className={`${categoryCarouselPanelClass} mt-6`}>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black text-primary">آیتم‌ها</p>

          <h2 className="mt-1 text-xl font-black text-foreground">
            مدیریت آیتم‌های دسته‌بندی
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            هر آیتم یک کارت داخل کروسل است و شامل عنوان، لینک صفحه دسته‌بندی و
            تصویر اختصاصی می‌شود. ترتیب آیتم‌ها همین‌جا مشخص می‌شود.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className={categoryCarouselPrimaryButtonClass}
        >
          <Plus className="h-4 w-4" />
          افزودن آیتم
        </button>
      </div>

      {sortedItems.length ? (
        <div className="grid gap-4">
          {sortedItems.map((item, index) => (
            <CategoryCarouselItemEditor
              key={item.id}
              item={item}
              index={index}
              totalCount={sortedItems.length}
              onUpdate={(updates) => handleUpdateItem(item.id, updates)}
              onUpdateImage={(image) => handleUpdateImage(item, image)}
              onRemove={() => handleRemoveItem(item)}
              onToggleActive={() => toggleItemActive(carousel.id, item.id)}
              onMoveUp={() => handleMoveItem(item.id, "up")}
              onMoveDown={() => handleMoveItem(item.id, "down")}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-border bg-background/25 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <ImagePlus className="h-6 w-6" />
          </div>

          <h3 className="mt-4 text-base font-black text-foreground">
            هنوز آیتمی ساخته نشده است
          </h3>

          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            برای شروع، یک آیتم دسته‌بندی بساز و عنوان، لینک و تصویر آن را وارد
            کن.
          </p>

          <button
            type="button"
            onClick={handleAddItem}
            className={`${categoryCarouselPrimaryButtonClass} mt-5`}
          >
            <Plus className="h-4 w-4" />
            ساخت اولین آیتم
          </button>
        </div>
      )}
    </section>
  );
}

function CategoryCarouselItemEditor({
  item,
  index,
  totalCount,
  onUpdate,
  onUpdateImage,
  onRemove,
  onToggleActive,
  onMoveUp,
  onMoveDown,
}: {
  item: CategoryCarouselItem;
  index: number;
  totalCount: number;
  onUpdate: (updates: Partial<CategoryCarouselItem>) => void;
  onUpdateImage: (image?: CategoryCarouselImage) => void;
  onRemove: () => void;
  onToggleActive: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <article className="rounded-[1.75rem] border border-border bg-background/35 p-4 backdrop-blur-xl transition hover:border-primary/25 hover:bg-primary/5">
      <div className="grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)]">
        <CategoryItemImageField
          image={item.image}
          fallbackAlt={item.title}
          onChange={onUpdateImage}
        />

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-black text-primary">
              آیتم {item.order.toLocaleString("fa-IR")}
            </span>

            <span
              className={[
                "rounded-full px-3 py-1 text-[11px] font-black",
                item.isActive
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive",
              ].join(" ")}
            >
              {item.isActive ? "فعال" : "غیرفعال"}
            </span>

            {item.badge?.trim() ? (
              <span className="rounded-full bg-background/55 px-3 py-1 text-[11px] font-black text-muted-foreground">
                {item.badge}
              </span>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs font-black text-foreground">
                عنوان آیتم
              </span>

              <input
                value={item.title}
                onChange={(event) => onUpdate({ title: event.target.value })}
                className={categoryCarouselInputClass}
                placeholder="مثلاً تیشرت مردانه"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-black text-foreground">
                لینک صفحه دسته‌بندی
              </span>

              <div className="relative">
                <Link2 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  value={item.href}
                  onChange={(event) => onUpdate({ href: event.target.value })}
                  className={`${categoryCarouselInputClass} pr-11 text-left direction-ltr`}
                  placeholder="/men/t-shirts"
                  dir="ltr"
                />
              </div>
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs font-black text-foreground">
                نشان / Badge
              </span>

              <input
                value={item.badge ?? ""}
                onChange={(event) => onUpdate({ badge: event.target.value })}
                className={categoryCarouselInputClass}
                placeholder="مثلاً جدید، پرفروش، ویژه"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-black text-foreground">
                Alt تصویر
              </span>

              <input
                value={item.image?.alt ?? ""}
                onChange={(event) =>
                  onUpdateImage({
                    url: item.image?.url ?? "",
                    alt: event.target.value,
                  })
                }
                className={categoryCarouselInputClass}
                placeholder="توضیح کوتاه تصویر برای SEO"
              />
            </label>
          </div>

          <label className="mt-4 grid gap-2">
            <span className="text-xs font-black text-foreground">
              توضیح کوتاه
            </span>

            <textarea
              value={item.description ?? ""}
              onChange={(event) =>
                onUpdate({ description: event.target.value })
              }
              className={`${categoryCarouselInputClass} min-h-24 py-3 leading-7`}
              placeholder="اختیاری؛ برای توضیح داخلی یا نمایش احتمالی در سایت"
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={index <= 0}
              className={categoryCarouselSecondaryButtonClass}
            >
              <ArrowUp className="h-4 w-4" />
              بالا
            </button>

            <button
              type="button"
              onClick={onMoveDown}
              disabled={index >= totalCount - 1}
              className={categoryCarouselSecondaryButtonClass}
            >
              <ArrowDown className="h-4 w-4" />
              پایین
            </button>

            <button
              type="button"
              onClick={onToggleActive}
              className={categoryCarouselSecondaryButtonClass}
            >
              {item.isActive ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {item.isActive ? "غیرفعال کردن" : "فعال کردن"}
            </button>

            <button
              type="button"
              onClick={onRemove}
              className={categoryCarouselDangerButtonClass}
            >
              <Trash2 className="h-4 w-4" />
              حذف آیتم
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function CategoryItemImageField({
  image,
  fallbackAlt,
  onChange,
}: {
  image?: CategoryCarouselImage;
  fallbackAlt: string;
  onChange: (image?: CategoryCarouselImage) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const hasImage = Boolean(image?.url?.trim());

  const handleFileChange = (file?: File) => {
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);

    onChange({
      url: objectUrl,
      alt: image?.alt?.trim() || fallbackAlt || file.name,
    });
  };

  return (
    <div className="rounded-[1.5rem] border border-border bg-background/35 p-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] border border-border bg-background/45">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image?.url}
            alt={image?.alt || fallbackAlt}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-5 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <ImagePlus className="h-6 w-6" />
            </div>

            <p className="mt-4 text-sm font-black text-foreground">
              تصویر آیتم
            </p>

            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              تصویر دسته‌بندی را آپلود کن یا لینک تصویر را وارد کن.
            </p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleFileChange(event.target.files?.[0])}
      />

      <div className="mt-3 grid gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={categoryCarouselSecondaryButtonClass}
        >
          <Upload className="h-4 w-4" />
          انتخاب تصویر
        </button>

        <input
          value={image?.url ?? ""}
          onChange={(event) =>
            onChange({
              url: event.target.value,
              alt: image?.alt ?? fallbackAlt,
            })
          }
          className={categoryCarouselInputClass}
          placeholder="یا URL تصویر"
          dir="ltr"
        />

        {hasImage ? (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className={categoryCarouselDangerButtonClass}
          >
            <X className="h-4 w-4" />
            حذف تصویر
          </button>
        ) : null}
      </div>
    </div>
  );
}