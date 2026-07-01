"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  ImagePlus,
  Monitor,
  Plus,
  Smartphone,
  Trash2,
} from "lucide-react";

import type {
  FeaturedCategoryCard,
  FeatureDisplayMode,
  HighlightImage,
  HomepageFeatureItem,
} from "@/types/homepage-highlights";
import { useHomepageHighlightsStore } from "@/store/homepage-highlights.store";

type PreviewMode = "desktop" | "mobile";

const pageClass = "mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6";

const heroClass =
  "glass-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-6";

const panelClass = "glass-card rounded-[2rem] p-4 sm:p-5";

const previewPanelClass = "glass-context-panel rounded-[2rem] p-4 sm:p-5";

const editorCardClass =
  "rounded-[1.5rem] border border-border/70 bg-background/45 p-4 shadow-sm backdrop-blur-xl";

const inputClass =
  "glass-input w-full text-foreground placeholder:text-muted-foreground/60";

const textareaClass =
  "glass-input min-h-24 w-full resize-none py-3 text-foreground placeholder:text-muted-foreground/60";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background/45 px-4 py-2.5 text-sm font-black text-foreground backdrop-blur-xl transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary";

const iconButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/45 text-muted-foreground backdrop-blur-xl transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary";

export default function HomepageHighlightsPage() {
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");

  const {
    sectionTitle,
    sectionDescription,
    featureDisplayMode,
    autoplay,
    autoplayDelayMs,
    features,
    featuredCategoriesTitle,
    featuredCategoriesDescription,
    featuredCategories,
    status,

    setSectionMeta,
    setFeaturedCategoriesMeta,
    setFeatureDisplayMode,
    setAutoplay,
    setStatus,

    addFeature,
    updateFeature,
    removeFeature,
    moveFeature,

    addFeaturedCategory,
    updateFeaturedCategory,
    removeFeaturedCategory,
    moveFeaturedCategory,
  } = useHomepageHighlightsStore();

  const sortedFeatures = useMemo(
    () => [...features].sort((a, b) => a.order - b.order),
    [features]
  );

  const sortedFeaturedCategories = useMemo(
    () => [...featuredCategories].sort((a, b) => a.order - b.order),
    [featuredCategories]
  );

  const activeFeatures = useMemo(
    () => sortedFeatures.filter((item) => item.isActive),
    [sortedFeatures]
  );

  const activeCategories = useMemo(
    () => sortedFeaturedCategories.filter((item) => item.isActive),
    [sortedFeaturedCategories]
  );

  return (
    <div className={pageClass}>
      <section className={heroClass}>
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-16 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-black text-primary">
              <Eye className="h-4 w-4" />
              Homepage Highlights
            </div>

            <h1 className="text-2xl font-black text-foreground">
              هایلایت‌های صفحه اصلی
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              این صفحه دو بخش جدا را مدیریت می‌کند: اول مزیت‌های زیر اسلایدر
              اصلی، دوم دسته‌بندی‌های منتخب. هر بخش جدا، واضح و قابل کنترل است.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a href="#features-section" className={secondaryButtonClass}>
              ۱. مزیت‌ها
            </a>

            <a href="#categories-section" className={secondaryButtonClass}>
              ۲. دسته‌بندی‌ها
            </a>

            <button
              type="button"
              onClick={() =>
                setStatus(status === "published" ? "draft" : "published")
              }
              className={[
                "rounded-2xl px-4 py-2.5 text-xs font-black transition",
                status === "published"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                  : "bg-amber-500/15 text-amber-700 dark:text-amber-300",
              ].join(" ")}
            >
              {status === "published" ? "منتشر شده" : "پیش‌نویس"}
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
        <main className="flex min-w-0 flex-col gap-6">
          <section className={panelClass}>
            <SectionHeader
              eyebrow="تنظیمات عمومی"
              title="ساختار کلی نمایش"
              description="اینجا فقط تنظیمات بخش مزیت‌ها را مشخص می‌کنی. این تنظیمات روی کارت‌های دسته‌بندی اثر ندارد."
            />

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="عنوان بخش مزیت‌ها">
                <input
                  value={sectionTitle}
                  onChange={(event) =>
                    setSectionMeta({ sectionTitle: event.target.value })
                  }
                  className={inputClass}
                  placeholder="مثلاً مزیت‌های خرید از ما"
                />
              </Field>

              <Field label="حالت نمایش مزیت‌ها">
                <div className="grid grid-cols-2 gap-2">
                  <ModeButton
                    active={featureDisplayMode === "carousel"}
                    onClick={() => setFeatureDisplayMode("carousel")}
                  >
                    کروسل
                  </ModeButton>

                  <ModeButton
                    active={featureDisplayMode === "static"}
                    onClick={() => setFeatureDisplayMode("static")}
                  >
                    ثابت
                  </ModeButton>
                </div>
              </Field>

              <Field label="توضیح کوتاه بخش مزیت‌ها">
                <textarea
                  value={sectionDescription}
                  onChange={(event) =>
                    setSectionMeta({ sectionDescription: event.target.value })
                  }
                  className={textareaClass}
                  placeholder="توضیح کوتاه برای مزیت‌های صفحه اصلی"
                />
              </Field>

              <div className="grid gap-4">
                <div className="rounded-2xl border border-border bg-background/40 p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-foreground">
                        پخش خودکار کروسل
                      </p>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        فقط وقتی حالت نمایش روی کروسل باشد استفاده می‌شود.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAutoplay({ autoplay: !autoplay })}
                      className={[
                        "rounded-full px-3 py-1.5 text-xs font-black transition",
                        autoplay
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                          : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      {autoplay ? "فعال" : "غیرفعال"}
                    </button>
                  </div>
                </div>

                <Field label="زمان تغییر اسلاید، میلی‌ثانیه">
                  <input
                    type="number"
                    min={2000}
                    step={500}
                    value={autoplayDelayMs}
                    onChange={(event) =>
                      setAutoplay({
                        autoplayDelayMs: Number(event.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          </section>

          <section id="features-section" className={panelClass}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <SectionHeader
                eyebrow="بخش اول"
                title="مزیت‌ها / ویژگی‌های کلیدی"
                description="این آیتم‌ها زیر اسلایدر اصلی نمایش داده می‌شوند. می‌توانند به صورت کروسل یا کانتینر ثابت باشند."
              />

              <button
                type="button"
                onClick={addFeature}
                className={primaryButtonClass}
              >
                <Plus className="h-4 w-4" />
                افزودن مزیت
              </button>
            </div>

            <InfoStrip
              title="راهنما"
              text="برای هر مزیت، عنوان واضح، توضیح کوتاه و تصویر مناسب وارد کن. اگر آیتمی آماده نیست، فقط غیرفعالش کن."
            />

            <div className="mt-5 grid gap-4">
              {sortedFeatures.map((feature) => (
                <FeatureEditor
                  key={feature.id}
                  feature={feature}
                  onChange={(payload) => updateFeature(feature.id, payload)}
                  onRemove={() => removeFeature(feature.id)}
                  onMoveUp={() => moveFeature(feature.id, "up")}
                  onMoveDown={() => moveFeature(feature.id, "down")}
                  canRemove={features.length > 1}
                />
              ))}
            </div>
          </section>

          <section id="categories-section" className={panelClass}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <SectionHeader
                eyebrow="بخش دوم"
                title="دسته‌بندی‌های منتخب"
                description="این کارت‌ها برای نمایش دسته‌بندی‌های اختصاصی در صفحه اصلی هستند. تعداد مجاز: ۱ تا ۳ کارت."
              />

              <button
                type="button"
                onClick={addFeaturedCategory}
                disabled={featuredCategories.length >= 3}
                className={primaryButtonClass}
              >
                <Plus className="h-4 w-4" />
                افزودن دسته‌بندی
              </button>
            </div>

            <InfoStrip
              title="قانون ساده"
              text={`الان ${featuredCategories.length} کارت داری. حداکثر می‌توانی ۳ کارت تعریف کنی.`}
            />

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="عنوان بخش دسته‌بندی‌ها">
                <input
                  value={featuredCategoriesTitle}
                  onChange={(event) =>
                    setFeaturedCategoriesMeta({
                      featuredCategoriesTitle: event.target.value,
                    })
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="توضیح بخش دسته‌بندی‌ها">
                <input
                  value={featuredCategoriesDescription}
                  onChange={(event) =>
                    setFeaturedCategoriesMeta({
                      featuredCategoriesDescription: event.target.value,
                    })
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="mt-5 grid gap-4">
              {sortedFeaturedCategories.map((category) => (
                <FeaturedCategoryEditor
                  key={category.id}
                  category={category}
                  onChange={(payload) =>
                    updateFeaturedCategory(category.id, payload)
                  }
                  onRemove={() => removeFeaturedCategory(category.id)}
                  onMoveUp={() => moveFeaturedCategory(category.id, "up")}
                  onMoveDown={() => moveFeaturedCategory(category.id, "down")}
                  canRemove={featuredCategories.length > 1}
                />
              ))}
            </div>
          </section>
        </main>

        <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start">
          <section className={previewPanelClass}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-foreground">
                  پریویو زنده
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  نمایش تقریبی برای کنترل سریع
                </p>
              </div>

              <div className="flex rounded-2xl border border-border bg-background/40 p-1 backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => setPreviewMode("desktop")}
                  className={[
                    "rounded-xl p-2 transition",
                    previewMode === "desktop"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  <Monitor className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewMode("mobile")}
                  className={[
                    "rounded-xl p-2 transition",
                    previewMode === "mobile"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
            </div>

            <HomepageHighlightsPreview
              mode={previewMode}
              sectionTitle={sectionTitle}
              sectionDescription={sectionDescription}
              featureDisplayMode={featureDisplayMode}
              features={activeFeatures}
              featuredCategoriesTitle={featuredCategoriesTitle}
              featuredCategoriesDescription={featuredCategoriesDescription}
              featuredCategories={activeCategories}
            />
          </section>
        </aside>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl border px-4 py-3 text-sm font-black transition",
        active
          ? "border-primary/25 bg-primary/10 text-primary"
          : "border-border bg-background/40 text-muted-foreground hover:border-primary/25 hover:bg-primary/5 hover:text-primary",
      ].join(" ")}
    >
      {children}
    </button>
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black text-foreground">{label}</span>
      {children}
    </label>
  );
}

function ImageField({
  image,
  onChange,
}: {
  image: HighlightImage;
  onChange: (image: HighlightImage) => void;
}) {
  const handleFile = (file?: File) => {
    if (!file) return;

    const url = URL.createObjectURL(file);

    onChange({
      ...image,
      url,
      alt: image.alt || file.name,
    });
  };

  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-background/40 sm:h-20 sm:w-20 sm:shrink-0">
          {image.url ? (
            <img
              src={image.url}
              alt={image.alt}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlus className="h-6 w-6 text-muted-foreground/45" />
          )}
        </div>

        <div className="grid flex-1 gap-2">
          <input
            value={image.url}
            onChange={(event) =>
              onChange({
                ...image,
                url: event.target.value,
              })
            }
            className={inputClass}
            placeholder="آدرس تصویر یا آپلود فایل"
          />

          <input
            value={image.alt}
            onChange={(event) =>
              onChange({
                ...image,
                alt: event.target.value,
              })
            }
            className={inputClass}
            placeholder="متن جایگزین تصویر"
          />
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={(event) => handleFile(event.target.files?.[0])}
        className="block w-full text-xs text-muted-foreground file:me-3 file:rounded-xl file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-xs file:font-black file:text-primary"
      />
    </div>
  );
}

function FeatureEditor({
  feature,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canRemove,
}: {
  feature: HomepageFeatureItem;
  onChange: (payload: Partial<HomepageFeatureItem>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canRemove: boolean;
}) {
  return (
    <div className={editorCardClass}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black text-primary">
            مزیت شماره {feature.order}
          </p>

          <h3 className="mt-1 text-base font-black text-foreground">
            {feature.title || "مزیت بدون عنوان"}
          </h3>
        </div>

        <EditorActions
          isActive={feature.isActive}
          onToggle={() => onChange({ isActive: !feature.isActive })}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onRemove={onRemove}
          canRemove={canRemove}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="عنوان مزیت">
          <input
            value={feature.title}
            onChange={(event) => onChange({ title: event.target.value })}
            className={inputClass}
            placeholder="مثلاً ارسال سریع"
          />
        </Field>

        <Field label="توضیح مزیت">
          <textarea
            value={feature.description}
            onChange={(event) => onChange({ description: event.target.value })}
            className={textareaClass}
            placeholder="توضیح کوتاه و واضح"
          />
        </Field>

        <div className="md:col-span-2">
          <Field label="تصویر مزیت">
            <ImageField
              image={feature.image}
              onChange={(image) => onChange({ image })}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function FeaturedCategoryEditor({
  category,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canRemove,
}: {
  category: FeaturedCategoryCard;
  onChange: (payload: Partial<FeaturedCategoryCard>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canRemove: boolean;
}) {
  return (
    <div className={editorCardClass}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black text-primary">
            دسته‌بندی شماره {category.order}
          </p>

          <h3 className="mt-1 text-base font-black text-foreground">
            {category.title || "دسته‌بندی بدون عنوان"}
          </h3>
        </div>

        <EditorActions
          isActive={category.isActive}
          onToggle={() => onChange({ isActive: !category.isActive })}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onRemove={onRemove}
          canRemove={canRemove}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="عنوان دسته‌بندی">
          <input
            value={category.title}
            onChange={(event) => onChange({ title: event.target.value })}
            className={inputClass}
            placeholder="مثلاً مانتو و رویه"
          />
        </Field>

        <Field label="لینک دسته‌بندی">
          <input
            value={category.href}
            onChange={(event) => onChange({ href: event.target.value })}
            className={inputClass}
            placeholder="/category/manto"
          />
        </Field>

        <Field label="توضیح کوتاه">
          <textarea
            value={category.description}
            onChange={(event) => onChange({ description: event.target.value })}
            className={textareaClass}
            placeholder="متن کوتاه برای کارت"
          />
        </Field>

        <Field label="تصویر دسته‌بندی">
          <ImageField
            image={category.image}
            onChange={(image) => onChange({ image })}
          />
        </Field>
      </div>
    </div>
  );
}

function EditorActions({
  isActive,
  onToggle,
  onMoveUp,
  onMoveDown,
  onRemove,
  canRemove,
}: {
  isActive: boolean;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        className={[
          "rounded-xl px-3 py-2 text-xs font-black transition",
          isActive
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
            : "bg-muted text-muted-foreground",
        ].join(" ")}
      >
        {isActive ? "فعال" : "غیرفعال"}
      </button>

      <button type="button" onClick={onMoveUp} className={iconButtonClass}>
        <ArrowUp className="h-4 w-4" />
      </button>

      <button type="button" onClick={onMoveDown} className={iconButtonClass}>
        <ArrowDown className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-destructive/15 bg-destructive/10 text-destructive transition hover:bg-destructive/15 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function HomepageHighlightsPreview({
  mode,
  sectionTitle,
  sectionDescription,
  featureDisplayMode,
  features,
  featuredCategoriesTitle,
  featuredCategoriesDescription,
  featuredCategories,
}: {
  mode: PreviewMode;
  sectionTitle: string;
  sectionDescription: string;
  featureDisplayMode: FeatureDisplayMode;
  features: HomepageFeatureItem[];
  featuredCategoriesTitle: string;
  featuredCategoriesDescription: string;
  featuredCategories: FeaturedCategoryCard[];
}) {
  const isMobile = mode === "mobile";
  const firstFeature = features[0];

  return (
    <div
      className={[
        "overflow-hidden rounded-[1.75rem] border border-border bg-background/35 p-4 backdrop-blur-xl",
        isMobile ? "mx-auto max-w-[320px]" : "",
      ].join(" ")}
    >
      <div className="rounded-[1.5rem] border border-border bg-card/45 p-4 backdrop-blur-xl">
        <p className="text-xs font-black text-primary">
          {featureDisplayMode === "carousel"
            ? "Feature Carousel"
            : "Static Feature"}
        </p>

        <h3 className="mt-2 text-lg font-black text-foreground">
          {sectionTitle}
        </h3>

        <p className="mt-2 text-xs leading-6 text-muted-foreground">
          {sectionDescription}
        </p>

        {firstFeature ? (
          <div
            className={[
              "mt-4 grid gap-4 rounded-[1.25rem] border border-border bg-background/40 p-4 backdrop-blur-xl",
              isMobile ? "grid-cols-1" : "grid-cols-[96px_1fr]",
            ].join(" ")}
          >
            <ImagePreview image={firstFeature.image} />

            <div>
              <h4 className="text-sm font-black text-foreground">
                {firstFeature.title}
              </h4>

              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                {firstFeature.description}
              </p>

              {features.length > 1 && featureDisplayMode === "carousel" && (
                <div className="mt-4 flex gap-1">
                  {features.slice(0, 5).map((feature, index) => (
                    <span
                      key={feature.id}
                      className={[
                        "h-1.5 rounded-full",
                        index === 0
                          ? "w-6 bg-primary"
                          : "w-2 bg-muted-foreground/25",
                      ].join(" ")}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <EmptyPreview text="هنوز مزیتی برای نمایش وجود ندارد." />
        )}
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-black text-foreground">
          {featuredCategoriesTitle}
        </h3>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {featuredCategoriesDescription}
        </p>

        {featuredCategories.length > 0 ? (
          <div
            className={[
              "mt-4 grid gap-3",
              isMobile ? "grid-cols-1" : "grid-cols-3",
            ].join(" ")}
          >
            {featuredCategories.map((category) => (
              <div
                key={category.id}
                className="rounded-[1.25rem] border border-border bg-card/45 p-3 backdrop-blur-xl"
              >
                <div className="mb-3">
                  <ImagePreview image={category.image} wide />
                </div>

                <h4 className="text-xs font-black text-foreground">
                  {category.title}
                </h4>

                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                  {category.description}
                </p>

                <p className="mt-2 truncate text-[10px] text-primary">
                  {category.href}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyPreview text="هنوز دسته‌بندی منتخبی تعریف نشده است." />
        )}
      </div>
    </div>
  );
}

function EmptyPreview({ text }: { text: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
      {text}
    </div>
  );
}

function ImagePreview({
  image,
  wide = false,
}: {
  image: HighlightImage;
  wide?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/45",
        wide ? "aspect-[4/3] w-full" : "aspect-square w-full",
      ].join(" ")}
    >
      {image.url ? (
        <img
          src={image.url}
          alt={image.alt}
          className="h-full w-full object-cover"
        />
      ) : (
        <ImagePlus className="h-7 w-7 text-muted-foreground/45" />
      )}
    </div>
  );
}