"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  BadgePercent,
  Eye,
  Flame,
  Layers3,
  Package,
  Palette,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Tags,
  Trash2,
  TrendingUp,
} from "lucide-react";

import type {
  ProductCarousel,
  ProductCarouselCategoryRef,
  ProductCarouselColorRef,
  ProductCarouselProductRef,
  ProductCarouselSortBy,
  ProductCarouselSourceType,
} from "@/types/product-carousel";
import { useProductCarouselStore } from "@/store/product-carousel.store";
import {
  CarouselFormField,
  FormSectionNote,
  carouselInputClass,
} from "../ui/carousel-form-field";

const sourceTypeOptions: Array<{
  value: ProductCarouselSourceType;
  title: string;
  description: string;
  icon: ReactNode;
  recommendedFor: string;
}> = [
  {
    value: "highest_discount_percent",
    title: "بیشترین درصد تخفیف",
    description: "محصولات با بیشترین درصد تخفیف به صورت خودکار انتخاب می‌شوند.",
    icon: <BadgePercent className="h-5 w-5" />,
    recommendedFor: "فروش ویژه و کمپین‌های تخفیفی",
  },
  {
    value: "highest_discount_amount",
    title: "بیشترین مبلغ تخفیف",
    description: "محصولاتی که بیشترین مبلغ تخفیف را دارند انتخاب می‌شوند.",
    icon: <Flame className="h-5 w-5" />,
    recommendedFor: "کالاهای گران‌تر با تخفیف محسوس",
  },
  {
    value: "most_viewed",
    title: "پربازدیدترین",
    description: "محصولاتی که بیشترین بازدید را داشته‌اند نمایش داده می‌شوند.",
    icon: <Eye className="h-5 w-5" />,
    recommendedFor: "کروسل‌های عمومی صفحه اصلی",
  },
  {
    value: "best_sellers",
    title: "پرفروش‌ترین‌ها",
    description: "محصولات پرفروش‌تر به صورت خودکار وارد کروسل می‌شوند.",
    icon: <TrendingUp className="h-5 w-5" />,
    recommendedFor: "نمایش کالاهای محبوب",
  },
  {
    value: "newest",
    title: "جدیدترین محصولات",
    description: "جدیدترین کالاهای سایت براساس دسته‌بندی انتخاب می‌شوند.",
    icon: <Sparkles className="h-5 w-5" />,
    recommendedFor: "لانچ محصول جدید",
  },
  {
    value: "manual",
    title: "انتخاب دستی محصول",
    description: "اپراتور محصولات مشخص را با کد یا شناسه وارد می‌کند.",
    icon: <Package className="h-5 w-5" />,
    recommendedFor: "کمپین‌های دقیق و curated",
  },
  {
    value: "color",
    title: "رنگ انتخابی",
    description: "محصولات براساس رنگ انتخابی و دسته‌بندی فیلتر می‌شوند.",
    icon: <Palette className="h-5 w-5" />,
    recommendedFor: "کالکشن رنگی یا ترندی",
  },
  {
    value: "category_only",
    title: "فقط دسته‌بندی",
    description: "کروسل براساس گروه‌ها ساخته می‌شود و محصول مستقیم انتخاب نمی‌شود.",
    icon: <Tags className="h-5 w-5" />,
    recommendedFor: "نمایش دسته‌بندی یا گروه محصول",
  },
  {
    value: "free_content",
    title: "محتوای آزاد",
    description: "برای حالتی که سکشن بیشتر تبلیغاتی یا بنری است.",
    icon: <Layers3 className="h-5 w-5" />,
    recommendedFor: "بنر، محتوای آزاد یا سکشن خاص",
  },
];

const sortOptions: Array<{
  value: ProductCarouselSortBy;
  title: string;
}> = [
  { value: "default", title: "پیش‌فرض" },
  { value: "most_viewed", title: "پربازدیدترین" },
  { value: "newest", title: "جدیدترین" },
  { value: "best_sellers", title: "پرفروش‌ترین" },
  { value: "highest_discount_percent", title: "بیشترین درصد تخفیف" },
  { value: "highest_discount_amount", title: "بیشترین مبلغ تخفیف" },
  { value: "price_asc", title: "قیمت از کم به زیاد" },
  { value: "price_desc", title: "قیمت از زیاد به کم" },
];

const colorOptions: ProductCarouselColorRef[] = [
  { code: "black", title: "مشکی", hex: "#111111" },
  { code: "white", title: "سفید", hex: "#ffffff" },
  { code: "red", title: "قرمز", hex: "#dc2626" },
  { code: "blue", title: "آبی", hex: "#2563eb" },
  { code: "green", title: "سبز", hex: "#16a34a" },
  { code: "cream", title: "کرم", hex: "#f5e6ca" },
  { code: "gray", title: "طوسی", hex: "#71717a" },
  { code: "pink", title: "صورتی", hex: "#ec4899" },
];

export function ProductCarouselSourceStep({
  carousel,
}: {
  carousel: ProductCarousel;
}) {
  const {
    updateCarouselSource,
    addManualProduct,
    removeManualProduct,
    moveManualProduct,
  } = useProductCarouselStore();

  const [categoryDraft, setCategoryDraft] = useState({
    id: "",
    title: "",
    slug: "",
  });

  const [manualProductDraft, setManualProductDraft] = useState({
    id: "",
    jpaCode: "",
    title: "",
  });

  const source = carousel.source;

  const selectedSourceConfig = useMemo(
    () =>
      sourceTypeOptions.find((option) => option.value === source.type) ??
      sourceTypeOptions[0],
    [source.type]
  );

  const selectedCategories = source.selectedCategories ?? [];
  const manualProducts = source.manualProducts ?? [];

  const setSourceType = (type: ProductCarouselSourceType) => {
    updateCarouselSource(carousel.id, {
      type,
      sortBy: getDefaultSortByForSource(type),
    });
  };

  const addCategory = () => {
    const id = categoryDraft.id.trim();
    const title = categoryDraft.title.trim();

    if (!id || !title) return;

    const alreadyExists = selectedCategories.some(
      (category) => category.id === id
    );

    if (alreadyExists) return;

    const nextCategory: ProductCarouselCategoryRef = {
      id,
      title,
      slug: categoryDraft.slug.trim() || undefined,
    };

    updateCarouselSource(carousel.id, {
      selectedCategories: [...selectedCategories, nextCategory],
    });

    setCategoryDraft({
      id: "",
      title: "",
      slug: "",
    });
  };

  const removeCategory = (id: string) => {
    updateCarouselSource(carousel.id, {
      selectedCategories: selectedCategories.filter(
        (category) => category.id !== id
      ),
    });
  };

  const addProduct = () => {
    const id = manualProductDraft.id.trim();
    const jpaCode = manualProductDraft.jpaCode.trim();
    const title = manualProductDraft.title.trim();

    if (!id && !jpaCode) return;

    const productId = id || jpaCode;

    const nextProduct: ProductCarouselProductRef = {
      id: productId,
      jpaCode: jpaCode || undefined,
      title: title || `محصول ${productId}`,
    };

    addManualProduct(carousel.id, nextProduct);

    setManualProductDraft({
      id: "",
      jpaCode: "",
      title: "",
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-black text-primary">مرحله ۳</p>

        <h2 className="text-xl font-black text-foreground">منبع محصولات</h2>

        <p className="text-sm leading-7 text-muted-foreground">
          مشخص کن محصولات این کروسل چطور ساخته شوند؛ خودکار، دستی، براساس رنگ،
          براساس دسته‌بندی یا به صورت محتوای آزاد.
        </p>
      </div>

      <div className="mt-5">
        <FormSectionNote
          title="راهنمای انتخاب"
          text="برای بیشتر کروسل‌های صفحه اصلی، حالت خودکار بهتر است. فقط وقتی محصول مشخصی مدنظر داری از انتخاب دستی استفاده کن."
        />
      </div>

      <div className="mt-6 grid gap-5">
        <section className="rounded-[1.5rem] border border-border bg-background/35 p-4 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-black text-foreground">
              نوع انتخاب محصولات
            </h3>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sourceTypeOptions.map((option) => (
              <SourceTypeCard
                key={option.value}
                active={source.type === option.value}
                title={option.title}
                description={option.description}
                recommendedFor={option.recommendedFor}
                icon={option.icon}
                onClick={() => setSourceType(option.value)}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-border bg-background/35 p-4 backdrop-blur-xl">
          <div className="mb-4">
            <p className="text-xs font-black text-primary">تنظیمات حالت انتخابی</p>

            <h3 className="mt-1 text-base font-black text-foreground">
              {selectedSourceConfig.title}
            </h3>

            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              {selectedSourceConfig.description}
            </p>
          </div>

          {isAutomaticSource(source.type) ? (
            <AutomaticSourceSettings
              carousel={carousel}
              categoryDraft={categoryDraft}
              setCategoryDraft={setCategoryDraft}
              onAddCategory={addCategory}
              onRemoveCategory={removeCategory}
            />
          ) : null}

          {source.type === "manual" ? (
            <ManualSourceSettings
              products={manualProducts}
              productDraft={manualProductDraft}
              setProductDraft={setManualProductDraft}
              onAddProduct={addProduct}
              onRemoveProduct={(productId) =>
                removeManualProduct(carousel.id, productId)
              }
              onMoveProduct={(productId, direction) =>
                moveManualProduct(carousel.id, productId, direction)
              }
            />
          ) : null}

          {source.type === "color" ? (
            <ColorSourceSettings
              carousel={carousel}
              categoryDraft={categoryDraft}
              setCategoryDraft={setCategoryDraft}
              onAddCategory={addCategory}
              onRemoveCategory={removeCategory}
            />
          ) : null}

          {source.type === "category_only" ? (
            <CategoryOnlySettings
              carousel={carousel}
              categoryDraft={categoryDraft}
              setCategoryDraft={setCategoryDraft}
              onAddCategory={addCategory}
              onRemoveCategory={removeCategory}
            />
          ) : null}

          {source.type === "free_content" ? <FreeContentSettings /> : null}
        </section>

        <SourceSummary carousel={carousel} />
      </div>
    </div>
  );
}

function AutomaticSourceSettings({
  carousel,
  categoryDraft,
  setCategoryDraft,
  onAddCategory,
  onRemoveCategory,
}: {
  carousel: ProductCarousel;
  categoryDraft: { id: string; title: string; slug: string };
  setCategoryDraft: (value: { id: string; title: string; slug: string }) => void;
  onAddCategory: () => void;
  onRemoveCategory: (id: string) => void;
}) {
  const { updateCarouselSource } = useProductCarouselStore();

  return (
    <div className="grid gap-5">
      <FormSectionNote
        title="حالت خودکار"
        text="در این حالت بک‌اند براساس نوع انتخاب، دسته‌بندی‌ها، تعداد محصول و مرتب‌سازی، محصولات کروسل را می‌سازد."
      />

      <SortSelector
        value={carousel.source.sortBy}
        onChange={(sortBy) => updateCarouselSource(carousel.id, { sortBy })}
      />

      <CategoryManager
        categories={carousel.source.selectedCategories}
        draft={categoryDraft}
        setDraft={setCategoryDraft}
        onAdd={onAddCategory}
        onRemove={onRemoveCategory}
      />
    </div>
  );
}

function ManualSourceSettings({
  products,
  productDraft,
  setProductDraft,
  onAddProduct,
  onRemoveProduct,
  onMoveProduct,
}: {
  products: ProductCarouselProductRef[];
  productDraft: { id: string; jpaCode: string; title: string };
  setProductDraft: (value: { id: string; jpaCode: string; title: string }) => void;
  onAddProduct: () => void;
  onRemoveProduct: (productId: string) => void;
  onMoveProduct: (productId: string, direction: "up" | "down") => void;
}) {
  return (
    <div className="grid gap-5">
      <FormSectionNote
        title="انتخاب دستی"
        text="در این حالت اپراتور دقیقاً مشخص می‌کند چه محصولاتی داخل کروسل باشند. بعداً این بخش به سرچ محصول واقعی وصل می‌شود."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <CarouselFormField label="شناسه محصول" hint="اگر شناسه داخلی محصول را داری وارد کن.">
          <input
            value={productDraft.id}
            onChange={(event) =>
              setProductDraft({ ...productDraft, id: event.target.value })
            }
            className={carouselInputClass}
            placeholder="مثلاً 12345"
          />
        </CarouselFormField>

        <CarouselFormField label="کد JPA / کد پدر" hint="برای جستجو یا ثبت محصول دستی.">
          <input
            value={productDraft.jpaCode}
            onChange={(event) =>
              setProductDraft({ ...productDraft, jpaCode: event.target.value })
            }
            className={carouselInputClass}
            placeholder="مثلاً JPA-1002"
          />
        </CarouselFormField>

        <CarouselFormField label="عنوان محصول" hint="اختیاری، فقط برای نمایش مدیریتی.">
          <input
            value={productDraft.title}
            onChange={(event) =>
              setProductDraft({ ...productDraft, title: event.target.value })
            }
            className={carouselInputClass}
            placeholder="مثلاً مانتو لینن"
          />
        </CarouselFormField>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAddProduct}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          افزودن محصول
        </button>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background/45 px-4 py-2.5 text-sm font-black text-foreground backdrop-blur-xl transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
        >
          <Search className="h-4 w-4" />
          جستجوی محصول بعداً وصل می‌شود
        </button>
      </div>

      <div className="grid gap-3">
        {products.length > 0 ? (
          products.map((product, index) => (
            <div
              key={product.id}
              className="rounded-2xl border border-border bg-background/35 p-4 backdrop-blur-xl"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black text-primary">
                    محصول شماره {index + 1}
                  </p>

                  <h4 className="mt-1 text-sm font-black text-foreground">
                    {product.title || product.jpaCode || product.id}
                  </h4>

                  <p className="mt-1 text-xs text-muted-foreground">
                    شناسه: {product.id}
                    {product.jpaCode ? ` — کد: ${product.jpaCode}` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <SmallIconButton
                    title="بالا"
                    onClick={() => onMoveProduct(product.id, "up")}
                    icon={<ArrowUp className="h-4 w-4" />}
                  />

                  <SmallIconButton
                    title="پایین"
                    onClick={() => onMoveProduct(product.id, "down")}
                    icon={<ArrowDown className="h-4 w-4" />}
                  />

                  <button
                    type="button"
                    onClick={() => onRemoveProduct(product.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-destructive/15 bg-destructive/10 text-destructive transition hover:bg-destructive/15"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyBox text="هنوز محصولی به صورت دستی انتخاب نشده است." />
        )}
      </div>
    </div>
  );
}

function ColorSourceSettings({
  carousel,
  categoryDraft,
  setCategoryDraft,
  onAddCategory,
  onRemoveCategory,
}: {
  carousel: ProductCarousel;
  categoryDraft: { id: string; title: string; slug: string };
  setCategoryDraft: (value: { id: string; title: string; slug: string }) => void;
  onAddCategory: () => void;
  onRemoveCategory: (id: string) => void;
}) {
  const { updateCarouselSource } = useProductCarouselStore();

  return (
    <div className="grid gap-5">
      <FormSectionNote
        title="فیلتر رنگ"
        text="در این حالت محصولات براساس رنگ انتخابی و دسته‌بندی‌ها ساخته می‌شوند. انتخاب دسته‌بندی کمک می‌کند خروجی دقیق‌تر باشد."
      />

      <div>
        <p className="mb-3 text-xs font-black text-foreground">رنگ انتخابی</p>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {colorOptions.map((color) => (
            <button
              key={color.code}
              type="button"
              onClick={() =>
                updateCarouselSource(carousel.id, {
                  selectedColor: color,
                })
              }
              className={[
                "rounded-2xl border p-3 text-right transition",
                carousel.source.selectedColor?.code === color.code
                  ? "border-primary/30 bg-primary/10"
                  : "border-border bg-background/35 hover:border-primary/25 hover:bg-primary/5",
              ].join(" ")}
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-5 w-5 rounded-full border border-border"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-sm font-black text-foreground">
                  {color.title}
                </span>
              </span>

              <span className="mt-1 block text-xs text-muted-foreground">
                کد رنگ: {color.code}
              </span>
            </button>
          ))}
        </div>
      </div>

      <CategoryManager
        categories={carousel.source.selectedCategories}
        draft={categoryDraft}
        setDraft={setCategoryDraft}
        onAdd={onAddCategory}
        onRemove={onRemoveCategory}
      />
    </div>
  );
}

function CategoryOnlySettings({
  carousel,
  categoryDraft,
  setCategoryDraft,
  onAddCategory,
  onRemoveCategory,
}: {
  carousel: ProductCarousel;
  categoryDraft: { id: string; title: string; slug: string };
  setCategoryDraft: (value: { id: string; title: string; slug: string }) => void;
  onAddCategory: () => void;
  onRemoveCategory: (id: string) => void;
}) {
  return (
    <div className="grid gap-5">
      <FormSectionNote
        title="فقط دسته‌بندی"
        text="در این حالت انتخاب محصول مستقیم انجام نمی‌شود. این حالت برای نمایش گروه‌ها یا ساخت لینک مشاهده همه براساس دسته‌بندی مناسب است."
      />

      <CategoryManager
        categories={carousel.source.selectedCategories}
        draft={categoryDraft}
        setDraft={setCategoryDraft}
        onAdd={onAddCategory}
        onRemove={onRemoveCategory}
      />
    </div>
  );
}

function FreeContentSettings() {
  return (
    <div className="grid gap-5">
      <FormSectionNote
        title="محتوای آزاد"
        text="این حالت برای سناریوهایی است که کروسل الزاماً محصول‌محور نیست. تنظیمات بنر و نمایش آن در مرحله نمایش و بنرها کامل می‌شود."
      />

      <div className="rounded-[1.5rem] border border-border bg-background/35 p-5 text-center backdrop-blur-xl">
        <Layers3 className="mx-auto h-8 w-8 text-primary" />

        <h3 className="mt-3 text-base font-black text-foreground">
          تنظیمات محتوای آزاد در مرحله نمایش کامل می‌شود
        </h3>

        <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-muted-foreground">
          فعلاً فقط نوع منبع روی محتوای آزاد ذخیره می‌شود. در مرحله نمایش،
          بنرها و لینک‌ها مدیریت می‌شوند.
        </p>
      </div>
    </div>
  );
}

function SortSelector({
  value,
  onChange,
}: {
  value: ProductCarouselSortBy;
  onChange: (value: ProductCarouselSortBy) => void;
}) {
  return (
    <CarouselFormField
      label="مرتب‌سازی محصولات"
      hint="این گزینه مشخص می‌کند بک‌اند محصولات خودکار را با چه اولویتی برگرداند."
    >
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ProductCarouselSortBy)}
        className={carouselInputClass}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.title}
          </option>
        ))}
      </select>
    </CarouselFormField>
  );
}

function CategoryManager({
  categories,
  draft,
  setDraft,
  onAdd,
  onRemove,
}: {
  categories: ProductCarouselCategoryRef[];
  draft: { id: string; title: string; slug: string };
  setDraft: (value: { id: string; title: string; slug: string }) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm font-black text-foreground">دسته‌بندی‌های قابل نمایش</p>

        <p className="mt-1 text-xs leading-6 text-muted-foreground">
          فعلاً دسته‌بندی را دستی وارد می‌کنیم. بعداً این بخش به API دسته‌بندی‌ها
          و سرچ واقعی وصل می‌شود.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <CarouselFormField label="کد دسته‌بندی">
          <input
            value={draft.id}
            onChange={(event) => setDraft({ ...draft, id: event.target.value })}
            className={carouselInputClass}
            placeholder="مثلاً 12"
          />
        </CarouselFormField>

        <CarouselFormField label="عنوان دسته‌بندی">
          <input
            value={draft.title}
            onChange={(event) =>
              setDraft({ ...draft, title: event.target.value })
            }
            className={carouselInputClass}
            placeholder="مثلاً مانتو"
          />
        </CarouselFormField>

        <CarouselFormField label="اسلاگ / لینک">
          <input
            value={draft.slug}
            onChange={(event) =>
              setDraft({ ...draft, slug: event.target.value })
            }
            className={carouselInputClass}
            placeholder="manto"
          />
        </CarouselFormField>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl border border-border bg-background/45 px-4 py-2.5 text-sm font-black text-foreground backdrop-blur-xl transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
      >
        <Plus className="h-4 w-4" />
        افزودن دسته‌بندی
      </button>

      <div className="grid gap-3">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div
              key={category.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-background/35 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h4 className="text-sm font-black text-foreground">
                  {category.title}
                </h4>

                <p className="mt-1 text-xs text-muted-foreground">
                  کد: {category.id}
                  {category.slug ? ` — ${category.slug}` : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onRemove(category.id)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-destructive/15 bg-destructive/10 text-destructive transition hover:bg-destructive/15"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        ) : (
          <EmptyBox text="هنوز دسته‌بندی انتخاب نشده است." />
        )}
      </div>
    </div>
  );
}

function SourceSummary({ carousel }: { carousel: ProductCarousel }) {
  const source = carousel.source;
  const sourceTitle =
    sourceTypeOptions.find((option) => option.value === source.type)?.title ??
    source.type;

  return (
    <div className="rounded-[1.5rem] border border-border bg-background/35 p-4 backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Star className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-sm font-black text-foreground">خلاصه منبع محصولات</h3>

          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            منبع این کروسل روی «{sourceTitle}» تنظیم شده است. تعداد محصول از
            مرحله اطلاعات اصلی کنترل می‌شود و الان مقدار آن{" "}
            {carousel.productLimit} محصول است.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge label={`${source.selectedCategories.length} دسته‌بندی`} />
            <Badge label={`${source.manualProducts.length} محصول دستی`} />
            <Badge
              label={
                source.selectedColor
                  ? `رنگ: ${source.selectedColor.title}`
                  : "بدون رنگ"
              }
            />
            <Badge
              label={`مرتب‌سازی: ${
                sortOptions.find((item) => item.value === source.sortBy)?.title ??
                source.sortBy
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SourceTypeCard({
  active,
  title,
  description,
  recommendedFor,
  icon,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  recommendedFor: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl border p-4 text-right transition",
        active
          ? "border-primary/30 bg-primary/10"
          : "border-border bg-background/40 hover:border-primary/25 hover:bg-primary/5",
      ].join(" ")}
    >
      <span className="flex items-center gap-2 text-primary">{icon}</span>

      <span className="mt-3 block text-sm font-black text-foreground">
        {title}
      </span>

      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
        {description}
      </span>

      <span className="mt-3 block rounded-xl bg-background/50 px-3 py-2 text-[11px] leading-5 text-muted-foreground">
        مناسب برای: {recommendedFor}
      </span>
    </button>
  );
}

function SmallIconButton({
  title,
  icon,
  onClick,
}: {
  title: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/45 text-muted-foreground backdrop-blur-xl transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
    >
      {icon}
    </button>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
      {label}
    </span>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-5 text-center text-xs leading-6 text-muted-foreground">
      {text}
    </div>
  );
}

function isAutomaticSource(type: ProductCarouselSourceType) {
  return [
    "most_viewed",
    "highest_discount_percent",
    "highest_discount_amount",
    "newest",
    "best_sellers",
  ].includes(type);
}

function getDefaultSortByForSource(
  type: ProductCarouselSourceType
): ProductCarouselSortBy {
  switch (type) {
    case "most_viewed":
      return "most_viewed";
    case "highest_discount_percent":
      return "highest_discount_percent";
    case "highest_discount_amount":
      return "highest_discount_amount";
    case "newest":
      return "newest";
    case "best_sellers":
      return "best_sellers";
    default:
      return "default";
  }
}