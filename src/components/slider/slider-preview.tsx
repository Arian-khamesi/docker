"use client";

import Image from "next/image";
import { useMemo } from "react";
import { Eye, EyeOff, ImageIcon } from "lucide-react";

import { useSliderStore } from "@/store/slider.store";
import { ContentPosition, TextAlign } from "@/types/slider";

export function SliderPreview() {
  const { slides, selectedSlideId } = useSliderStore();

  const slide = useMemo(
    () => slides.find((item) => item.id === selectedSlideId),
    [slides, selectedSlideId]
  );

  if (!slide) {
    return (
      <aside className="glass-panel flex h-[520px] items-center justify-center rounded-3xl text-sm text-muted-foreground">
        اسلایدی انتخاب نشده است
      </aside>
    );
  }

  const imageUrl =
    slide.images.desktop.url || slide.images.tablet.url || slide.images.mobile.url;

  const imageAlt =
    slide.images.desktop.alt ||
    slide.images.tablet.alt ||
    slide.images.mobile.alt ||
    slide.title;

  const showPrimaryButton =
    slide.primaryButton.isActive && slide.primaryButton.text.trim().length > 0;

  const isVisibleOnSite = slide.status === "published" && slide.isActive;

  return (
    <aside className="glass-panel sticky top-6 overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between gap-4 border-b glass-divider p-5">
        <div>
          <h3 className="font-semibold text-foreground">پیش‌نمایش زنده</h3>

          <p className="mt-1 text-xs text-muted-foreground">
            نمای تقریبی اسلاید در صفحه اصلی
          </p>
        </div>

        <span
          className={
            isVisibleOnSite
              ? "status-badge status-badge-success"
              : "status-badge status-badge-muted"
          }
        >
          {isVisibleOnSite ? <Eye size={13} /> : <EyeOff size={13} />}
          {isVisibleOnSite ? "روی سایت" : "مخفی"}
        </span>
      </div>

      <div className="p-4">
        <div className="relative overflow-hidden rounded-3xl bg-muted shadow-2xl">
          <div className="relative aspect-[16/7] overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                unoptimized={imageUrl.startsWith("blob:")}
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl glass-card">
                  <ImageIcon size={22} />
                </div>
                تصویر انتخاب نشده
              </div>
            )}

            <div
              className="absolute inset-0 bg-black"
              style={{
                opacity: slide.overlayOpacity / 100,
              }}
            />

            <div
              className={`
                absolute max-w-xl text-white drop-shadow
                ${getPositionClass(slide.contentPosition)}
                ${getTextAlignClass(slide.textAlign)}
              `}
            >
              {slide.subtitle && (
                <p className="mb-2 text-sm opacity-90">{slide.subtitle}</p>
              )}

              <h2 className="mb-4 text-3xl font-bold">{slide.title}</h2>

              {slide.description && (
                <p className="text-sm leading-7 opacity-90">
                  {slide.description}
                </p>
              )}

              {showPrimaryButton && (
                <button
                  type="button"
                  className="mt-6 h-11 rounded-2xl bg-white/90 px-5 text-sm font-semibold text-black shadow-lg backdrop-blur transition hover:bg-white"
                >
                  {slide.primaryButton.text}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t glass-divider p-5 text-xs">
        <InfoTile label="انتشار" value={getStatusLabel(slide.status)} />
        <InfoTile label="نمایش" value={slide.isActive ? "فعال" : "مخفی"} />
        <InfoTile label="تراز متن" value={getTextAlignLabel(slide.textAlign)} />
        <InfoTile label="پوشش" value={`${slide.overlayOpacity}%`} />
      </div>
    </aside>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-2xl p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}

function getTextAlignClass(align: TextAlign) {
  switch (align) {
    case "left":
      return "text-left";
    case "center":
      return "text-center";
    case "right":
    default:
      return "text-right";
  }
}

function getPositionClass(position: ContentPosition) {
  switch (position) {
    case "top-left":
      return "left-10 top-10";
    case "top-center":
      return "left-1/2 top-10 -translate-x-1/2";
    case "top-right":
      return "right-10 top-10";

    case "center-left":
      return "left-10 top-1/2 -translate-y-1/2";
    case "center":
      return "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";
    case "center-right":
      return "right-10 top-1/2 -translate-y-1/2";

    case "bottom-left":
      return "bottom-10 left-10";
    case "bottom-center":
      return "bottom-10 left-1/2 -translate-x-1/2";
    case "bottom-right":
      return "bottom-10 right-10";

    default:
      return "right-10 top-1/2 -translate-y-1/2";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "draft":
      return "پیش‌نویس";
    case "scheduled":
      return "زمان‌بندی‌شده";
    case "published":
      return "منتشرشده";
    case "expired":
      return "منقضی‌شده";
    default:
      return status;
  }
}

function getTextAlignLabel(align: TextAlign) {
  switch (align) {
    case "left":
      return "چپ‌چین";
    case "center":
      return "وسط‌چین";
    case "right":
    default:
      return "راست‌چین";
  }
}