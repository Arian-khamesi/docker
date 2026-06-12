"use client";

import { CalendarClock, Clock, Info } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Slide } from "@/types/slider";

interface ScheduleSectionProps {
  slide: Slide;
  onChange: (updates: Partial<Slide>) => void;
}

export function ScheduleSection({ slide, onChange }: ScheduleSectionProps) {
  const updateSchedule = (updates: Partial<Slide["schedule"]>) => {
    onChange({
      schedule: {
        ...slide.schedule,
        ...updates,
      },
    });
  };

  const hasStart = Boolean(slide.schedule.startAt);
  const hasEnd = Boolean(slide.schedule.endAt);
  const hasSchedule = hasStart || hasEnd;

  const hasInvalidRange =
    Boolean(slide.schedule.startAt && slide.schedule.endAt) &&
    slide.schedule.startAt >= slide.schedule.endAt;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <DateField
          title="شروع نمایش"
          description="از این تاریخ به بعد اسلاید مجاز به نمایش است."
          icon={<CalendarClock size={18} />}
          value={slide.schedule.startAt}
          onChange={(value) =>
            updateSchedule({
              startAt: value,
            })
          }
        />

        <DateField
          title="پایان نمایش"
          description="بعد از این تاریخ اسلاید دیگر نمایش داده نمی‌شود."
          icon={<Clock size={18} />}
          value={slide.schedule.endAt}
          onChange={(value) =>
            updateSchedule({
              endAt: value,
            })
          }
        />
      </div>

      {hasInvalidRange && (
        <div className="rounded-3xl border border-destructive/20 bg-destructive/10 p-4 text-xs leading-6 text-destructive">
          تاریخ پایان باید بعد از تاریخ شروع باشد.
        </div>
      )}

      <div
        className={`
          rounded-3xl p-4
          ${hasSchedule ? "glass-card-strong" : "glass-card"}
        `}
      >
        <div className="flex items-start gap-3">
          <div
            className={`
              flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl
              ${
                hasSchedule
                  ? "bg-info/10 text-info"
                  : "bg-muted text-muted-foreground"
              }
            `}
          >
            <Info size={18} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground">
                زمان‌بندی نمایش
              </p>

              <span
                className={
                  hasSchedule
                    ? "status-badge status-badge-info"
                    : "status-badge status-badge-muted"
                }
              >
                {hasSchedule ? "فعال" : "بدون زمان‌بندی"}
              </span>
            </div>

            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              اگر بازه زمانی مشخص شود، این اسلاید فقط در همان بازه مجاز به
              نمایش خواهد بود. برای نمایش واقعی، اسلاید باید منتشر و فعال هم
              باشد.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DateField({
  title,
  description,
  icon,
  value,
  onChange,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="glass-card rounded-3xl p-4">
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

      <div className="mt-4">
        <Input
          type="datetime-local"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}