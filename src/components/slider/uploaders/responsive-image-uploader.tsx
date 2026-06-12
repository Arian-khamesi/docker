"use client";

import Image from "next/image";
import { ChangeEvent, ReactNode, useRef, useState } from "react";
import { ImageIcon, Loader2, Trash2, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { SlideImage } from "@/types/slider";

interface ResponsiveImageUploaderProps {
  label: string;
  recommendedSize: string;
  value: SlideImage;
  onChange: (image: SlideImage) => void;
  onRemove: () => void;
  icon?: ReactNode;
  required?: boolean;
}

export function ResponsiveImageUploader({
  label,
  recommendedSize,
  value,
  onChange,
  onRemove,
  icon,
  required = false,
}: ResponsiveImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setError("فایل انتخاب‌شده تصویر نیست.");
      event.target.value = "";
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setStatus("error");
      setError("حجم تصویر نباید بیشتر از ۴ مگابایت باشد.");
      event.target.value = "";
      return;
    }

    setStatus("uploading");

    window.setTimeout(() => {
      const url = URL.createObjectURL(file);

      onChange({
        url,
        alt: value.alt || label,
      });

      setStatus("idle");
      event.target.value = "";
    }, 450);
  };

  const handleRemove = () => {
    setError("");
    setStatus("idle");
    onRemove();
  };

  const handleAltChange = (alt: string) => {
    onChange({
      ...value,
      alt,
    });
  };

  const hasImage = Boolean(value.url);
  const isUploading = status === "uploading";

  return (
    <div
      className={`
        overflow-hidden rounded-3xl transition
        ${hasImage ? "glass-card-strong" : "glass-card"}
      `}
    >
      <div className="flex items-center justify-between gap-3 border-b glass-divider p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {icon ?? <ImageIcon size={19} />}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">{label}</h4>

              {required && (
                <span className="status-badge status-badge-warning">
                  ضروری
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              سایز پیشنهادی: {recommendedSize}
            </p>
          </div>
        </div>

        {hasImage && (
          <Button
            type="button"
            variant="dangerGhost"
            size="sm"
            onClick={handleRemove}
            className="rounded-xl"
          >
            <Trash2 size={15} />
            حذف
          </Button>
        )}
      </div>

      <div className="space-y-4 p-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={`
            group relative flex aspect-[16/9] w-full overflow-hidden rounded-3xl border border-dashed
            transition-all duration-200
            ${
              hasImage
                ? "border-transparent bg-muted"
                : "border-border bg-background/35 hover:border-primary/50 hover:bg-primary/5"
            }
          `}
        >
          {hasImage ? (
            <>
              <Image
                src={value.url}
                alt={value.alt || label}
                fill
                unoptimized={value.url.startsWith("blob:")}
                className="object-cover transition duration-300 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-80" />

              <div className="absolute bottom-3 right-3 rounded-2xl bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                کلیک برای جایگزینی تصویر
              </div>
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl glass-card text-primary">
                {isUploading ? (
                  <Loader2 size={23} className="animate-spin" />
                ) : (
                  <UploadCloud size={24} />
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isUploading ? "در حال آماده‌سازی تصویر..." : "انتخاب تصویر"}
                </p>

                <p className="mt-1 text-xs">
                  JPG, PNG, WEBP تا حجم ۴ مگابایت
                </p>
              </div>
            </div>
          )}
        </button>

        {error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs leading-6 text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">
            متن جایگزین تصویر
          </label>

          <Input
            value={value.alt}
            onChange={(event) => handleAltChange(event.target.value)}
            placeholder="مثلاً: بنر تخفیف تابستانه"
          />
        </div>
      </div>
    </div>
  );
}