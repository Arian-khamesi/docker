"use client";

import { AlertTriangle, CalendarClock, CheckCircle2, Clock3, PauseCircle } from "lucide-react";

import type { ProductCarousel } from "@/types/product-carousel";
import { useProductCarouselStore } from "@/store/product-carousel.store";
import {
  CarouselFormField,
  FormSectionNote,
  carouselInputClass,
} from "../ui/carousel-form-field";

type ScheduleStatus = "not_started" | "running" | "expired" | "invalid";

export function ProductCarouselScheduleStep({
  carousel,
}: {
  carousel: ProductCarousel;
}) {
  const { updateCarousel } = useProductCarouselStore();

  const startsAtLocal = toDatetimeLocal(carousel.startsAt);
  const endsAtLocal = toDatetimeLocal(carousel.endsAt);

  const scheduleStatus = getScheduleStatus(carousel.startsAt, carousel.endsAt);
  const scheduleError = getScheduleError(carousel.startsAt, carousel.endsAt);

  return (
    <div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-black text-primary">مرحله ۲</p>

        <h2 className="text-xl font-black text-foreground">
          زمان‌بندی نمایش
        </h2>

        <p className="text-sm leading-7 text-muted-foreground">
          این بخش مشخص می‌کند کروسل از چه زمانی در سایت قابل نمایش باشد و چه
          زمانی نمایش آن تمام شود.
        </p>
      </div>

      <div className="mt-5">
        <FormSectionNote
          title="رفتار بک‌اند"
          text="بعد از پایان بازه نمایش، بک‌اند می‌تواند کروسل را حذف یا از لیست فعال‌ها خارج کند. پس تاریخ پایان باید دقیق تنظیم شود."
        />
      </div>

      <div className="mt-6 grid gap-5">
        <ScheduleStatusCard status={scheduleStatus} />

        <div className="grid gap-4 md:grid-cols-2">
          <CarouselFormField
            label="تاریخ و ساعت شروع"
            hint="از این زمان به بعد کروسل اجازه نمایش دارد."
          >
            <input
              type="datetime-local"
              value={startsAtLocal}
              onChange={(event) =>
                updateCarousel(carousel.id, {
                  startsAt: fromDatetimeLocal(event.target.value),
                })
              }
              className={carouselInputClass}
            />
          </CarouselFormField>

          <CarouselFormField
            label="تاریخ و ساعت پایان"
            hint="بعد از این زمان کروسل منقضی می‌شود."
            error={scheduleError}
          >
            <input
              type="datetime-local"
              value={endsAtLocal}
              onChange={(event) =>
                updateCarousel(carousel.id, {
                  endsAt: fromDatetimeLocal(event.target.value),
                })
              }
              className={carouselInputClass}
            />
          </CarouselFormField>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <DateSummaryCard label="شروع نمایش" value={carousel.startsAt} />
          <DateSummaryCard label="پایان نمایش" value={carousel.endsAt} />
        </div>

        <div className="rounded-[1.5rem] border border-border bg-background/35 p-4 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CalendarClock className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-sm font-black text-foreground">
                خلاصه زمان‌بندی
              </h3>

              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                {getScheduleSummaryText(carousel.startsAt, carousel.endsAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleStatusCard({ status }: { status: ScheduleStatus }) {
  const config = {
    running: {
      icon: <CheckCircle2 className="h-5 w-5" />,
      title: "در حال نمایش",
      text: "بازه زمانی این کروسل فعال است. اگر وضعیت انتشار و فعال بودن هم درست باشد، کروسل اجازه نمایش دارد.",
      className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    },
    not_started: {
      icon: <Clock3 className="h-5 w-5" />,
      title: "شروع نشده",
      text: "زمان شروع هنوز نرسیده است. کروسل فعلاً نباید در سایت نمایش داده شود.",
      className: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300",
    },
    expired: {
      icon: <PauseCircle className="h-5 w-5" />,
      title: "منقضی شده",
      text: "تاریخ پایان گذشته است. این کروسل باید توسط بک‌اند حذف یا غیرفعال شود.",
      className: "border-muted bg-muted/40 text-muted-foreground",
    },
    invalid: {
      icon: <AlertTriangle className="h-5 w-5" />,
      title: "زمان‌بندی نامعتبر",
      text: "تاریخ شروع یا پایان درست نیست، یا پایان قبل از شروع تنظیم شده است.",
      className: "border-destructive/20 bg-destructive/10 text-destructive",
    },
  } satisfies Record<
    ScheduleStatus,
    {
      icon: React.ReactNode;
      title: string;
      text: string;
      className: string;
    }
  >;

  const selected = config[status];

  return (
    <div className={`rounded-[1.5rem] border p-4 ${selected.className}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{selected.icon}</div>

        <div>
          <h3 className="text-sm font-black">{selected.title}</h3>
          <p className="mt-1 text-xs leading-6 opacity-80">{selected.text}</p>
        </div>
      </div>
    </div>
  );
}

function DateSummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/35 p-4 backdrop-blur-xl">
      <p className="text-xs font-black text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-black text-foreground">
        {formatDateTime(value)}
      </p>
    </div>
  );
}

function toDatetimeLocal(value: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  const localDate = new Date(date.getTime() - timezoneOffset);

  return localDate.toISOString().slice(0, 16);
}

function fromDatetimeLocal(value: string) {
  if (!value) return "";

  return new Date(value).toISOString();
}

function getScheduleStatus(startsAt: string, endsAt: string): ScheduleStatus {
  const startTime = new Date(startsAt).getTime();
  const endTime = new Date(endsAt).getTime();

  if (
    Number.isNaN(startTime) ||
    Number.isNaN(endTime) ||
    endTime <= startTime
  ) {
    return "invalid";
  }

  const currentTime = Date.now();

  if (currentTime < startTime) return "not_started";
  if (currentTime > endTime) return "expired";

  return "running";
}

function getScheduleError(startsAt: string, endsAt: string) {
  const startTime = new Date(startsAt).getTime();
  const endTime = new Date(endsAt).getTime();

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    return "تاریخ شروع و پایان باید معتبر باشد.";
  }

  if (endTime <= startTime) {
    return "تاریخ پایان باید بعد از تاریخ شروع باشد.";
  }

  return undefined;
}

function getScheduleSummaryText(startsAt: string, endsAt: string) {
  const status = getScheduleStatus(startsAt, endsAt);

  if (status === "invalid") {
    return "زمان‌بندی این کروسل هنوز معتبر نیست. قبل از انتشار باید اصلاح شود.";
  }

  if (status === "not_started") {
    return `این کروسل از ${formatDateTime(startsAt)} قابل نمایش می‌شود.`;
  }

  if (status === "expired") {
    return `این کروسل در ${formatDateTime(endsAt)} منقضی شده است.`;
  }

  return `این کروسل از ${formatDateTime(startsAt)} تا ${formatDateTime(
    endsAt
  )} در بازه نمایش قرار دارد.`;
}

function formatDateTime(value: string) {
  if (!value) return "تنظیم نشده";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "نامعتبر";

  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}