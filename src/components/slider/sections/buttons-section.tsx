"use client";

import { ExternalLink, Link2, MousePointerClick } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Slide, SlideButton } from "@/types/slider";

interface ButtonsSectionProps {
  slide: Slide;
  onChange: (updates: Partial<Slide>) => void;
}

export function ButtonsSection({ slide, onChange }: ButtonsSectionProps) {
  const updatePrimaryButton = (updates: Partial<SlideButton>) => {
    onChange({
      primaryButton: {
        ...slide.primaryButton,
        ...updates,
      },
    });
  };

  const updateSecondaryButton = (updates: Partial<SlideButton>) => {
    onChange({
      secondaryButton: {
        ...slide.secondaryButton,
        ...updates,
      },
    });
  };

  return (
    <div className="space-y-5">
      <ButtonFields
        title="دکمه اصلی"
        description="برای اقدام اصلی کاربر؛ مثل خرید، مشاهده محصول یا ورود به کمپین."
        tone="primary"
        button={slide.primaryButton}
        onChange={updatePrimaryButton}
      />

      <ButtonFields
        title="دکمه دوم"
        description="برای اقدام مکمل؛ مثل مشاهده جزئیات یا رفتن به صفحه اطلاعات."
        tone="secondary"
        button={slide.secondaryButton}
        onChange={updateSecondaryButton}
      />
    </div>
  );
}

interface ButtonFieldsProps {
  title: string;
  description: string;
  tone: "primary" | "secondary";
  button: SlideButton;
  onChange: (updates: Partial<SlideButton>) => void;
}

function ButtonFields({
  title,
  description,
  tone,
  button,
  onChange,
}: ButtonFieldsProps) {
  const isExternal = button.target === "_blank";

  return (
    <div
      className={`
        overflow-hidden rounded-3xl transition
        ${button.isActive ? "glass-card-strong" : "glass-card"}
      `}
    >
      <div className="flex flex-col gap-4 border-b glass-divider p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`
              flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl
              ${
                tone === "primary"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }
            `}
          >
            <MousePointerClick size={20} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">{title}</h4>

              <span
                className={
                  button.isActive
                    ? "status-badge status-badge-success"
                    : "status-badge status-badge-muted"
                }
              >
                {button.isActive ? "فعال" : "غیرفعال"}
              </span>
            </div>

            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            onChange({
              isActive: !button.isActive,
            })
          }
          className={`
            relative h-8 w-14 rounded-full border transition-all
            ${
              button.isActive
                ? "border-primary/30 bg-primary/90"
                : "border-border bg-muted"
            }
          `}
          aria-label={button.isActive ? "غیرفعال کردن دکمه" : "فعال کردن دکمه"}
        >
          <span
            className={`
              absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all
              ${button.isActive ? "right-7" : "right-1"}
            `}
          />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <LabelText label="متن دکمه" icon={<MousePointerClick size={14} />} />

            <Input
              value={button.text}
              disabled={!button.isActive}
              onChange={(event) =>
                onChange({
                  text: event.target.value,
                })
              }
              placeholder="مثلاً: مشاهده محصولات"
            />
          </div>

          <div className="space-y-2">
            <LabelText label="لینک مقصد" icon={<Link2 size={14} />} />

            <Input
              value={button.url}
              disabled={!button.isActive}
              onChange={(event) =>
                onChange({
                  url: event.target.value,
                })
              }
              placeholder="/products یا https://example.com"
              dir="ltr"
            />
          </div>
        </div>

        <div className="space-y-2">
          <LabelText
            label="نحوه باز شدن لینک"
            icon={isExternal ? <ExternalLink size={14} /> : <Link2 size={14} />}
          />

          <Select
            value={button.target}
            disabled={!button.isActive}
            onValueChange={(value) =>
              onChange({
                target: value as SlideButton["target"],
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="_self">در همین صفحه</SelectItem>
              <SelectItem value="_blank">در تب جدید</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {button.isActive && !button.text.trim() && (
          <p className="rounded-2xl bg-warning/10 px-4 py-3 text-xs leading-6 text-muted-foreground">
            دکمه فعال است، اما متن ندارد. در پیش‌نمایش تا زمان وارد کردن متن
            نمایش داده نمی‌شود.
          </p>
        )}
      </div>
    </div>
  );
}

function LabelText({
  label,
  icon,
}: {
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
      {icon && <span className="text-muted-foreground">{icon}</span>}
      {label}
    </div>
  );
}