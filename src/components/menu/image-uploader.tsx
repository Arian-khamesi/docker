// src/components/menu/image-uploader.tsx

"use client";

import { useRef } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

interface ImageUploaderProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
}

export function ImageUploader({
  label,
  value,
  onChange,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectFile = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    onChange(previewUrl);
  };

  const handleRemoveImage = () => {
    onChange("");
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-foreground">
        {label}
      </label>

      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        {/* Preview */}
        <div className="relative aspect-[16/9] bg-muted overflow-hidden">
          {value ? (
            <>
              <img
                src={value}
                alt={label}
                className="w-full h-full object-cover"
              />

              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 left-2 flex items-center justify-center w-8 h-8 rounded-lg bg-background/90 border border-border hover:bg-destructive hover:text-white transition-all"
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <ImagePlus
                size={32}
                className="text-muted-foreground/50 mb-2"
              />

              <p className="text-xs font-medium text-muted-foreground">
                تصویری انتخاب نشده است
              </p>

              <p className="text-[10px] text-muted-foreground/70 mt-1">
                JPG ، PNG ، WEBP
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-3 border-t border-border">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSelectFile}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all"
          >
            {value ? "تغییر تصویر" : "انتخاب تصویر"}
          </button>
        </div>
      </div>
    </div>
  );
}