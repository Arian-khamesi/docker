"use client";

import { AlignCenter, AlignLeft, AlignRight, Layers3, Move } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { Slide } from "@/types/slider";

import { CONTENT_POSITIONS } from "../constants/positions";

interface SettingsSectionProps {
  slide: Slide;
  onChange: (updates: Partial<Slide>) => void;
}

export function SettingsSection({ slide, onChange }: SettingsSectionProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="glass-card rounded-3xl p-4">
          <FieldHeader
            icon={<Move size={18} />}
            title="محل نمایش محتوا"
            description="جایگاه متن و دکمه‌ها روی تصویر اسلاید."
          />

          <div className="mt-4">
            <Select
              value={slide.contentPosition}
              onValueChange={(value) =>
                onChange({
                  contentPosition: value as Slide["contentPosition"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {CONTENT_POSITIONS.map((position) => (
                  <SelectItem key={position.value} value={position.value}>
                    {position.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-4">
          <FieldHeader
            icon={<AlignRight size={18} />}
            title="تراز متن"
            description="نحوه چینش متن داخل محدوده محتوای اسلاید."
          />

          <div className="mt-4 grid grid-cols-3 gap-2">
            <AlignButton
              active={slide.textAlign === "right"}
              label="راست"
              icon={<AlignRight size={16} />}
              onClick={() => onChange({ textAlign: "right" })}
            />

            <AlignButton
              active={slide.textAlign === "center"}
              label="وسط"
              icon={<AlignCenter size={16} />}
              onClick={() => onChange({ textAlign: "center" })}
            />

            <AlignButton
              active={slide.textAlign === "left"}
              label="چپ"
              icon={<AlignLeft size={16} />}
              onClick={() => onChange({ textAlign: "left" })}
            />
          </div>
        </div>
      </div>

      <div className="glass-card-strong rounded-3xl p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <FieldHeader
            icon={<Layers3 size={18} />}
            title="شدت پوشش تیره تصویر"
            description="برای خواناتر شدن متن روی تصویر، مقدار پوشش را تنظیم کنید."
          />

          <span className="status-badge status-badge-info">
            {slide.overlayOpacity}%
          </span>
        </div>

        <div className="mt-5 space-y-3">
          <input
            type="range"
            min={0}
            max={80}
            step={5}
            value={slide.overlayOpacity}
            onChange={(event) =>
              onChange({
                overlayOpacity: Number(event.target.value),
              })
            }
            className="w-full accent-[hsl(var(--primary))]"
          />

          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>شفاف</span>
            <span>متعادل</span>
            <span>تیره</span>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-4">
        <p className="text-sm font-semibold text-foreground">
          وضعیت عملیاتی اسلاید
        </p>

        <p className="mt-2 text-xs leading-6 text-muted-foreground">
          انتشار، لغو انتشار، فعال‌سازی و مخفی‌سازی از لیست اسلایدها انجام
          می‌شود تا اپراتور قبل از اعمال تغییر، تأیید نهایی بدهد.
        </p>
      </div>
    </div>
  );
}

function FieldHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>

      <div>
        <Label className="text-sm font-semibold text-foreground">{title}</Label>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function AlignButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex h-20 flex-col items-center justify-center gap-2 rounded-2xl border text-xs font-semibold transition-all
        ${
          active
            ? "border-primary/40 bg-primary/10 text-primary shadow-sm"
            : "border-border bg-background/35 text-muted-foreground hover:bg-muted"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}