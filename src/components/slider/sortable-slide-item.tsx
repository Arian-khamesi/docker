"use client";

import Image from "next/image";
import { useState } from "react";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import {
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Send,
  Trash2,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSliderStore } from "@/store/slider.store";
import { SlideStatus } from "@/types/slider";

interface SortableSlideItemProps {
  id: string;
  index: number;
  title: string;
  isActive: boolean;
  status: SlideStatus;
  thumbnail?: string;
  canActivate: boolean;
}

type ConfirmAction =
  | "publish"
  | "unpublish"
  | "activate"
  | "deactivate"
  | "delete";

export function SortableSlideItem({
  id,
  index,
  title,
  isActive,
  status,
  thumbnail,
  canActivate,
}: SortableSlideItemProps) {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const {
    selectedSlideId,
    selectSlide,
    deleteSlide,
    duplicateSlide,
    publishSlide,
    unpublishSlide,
    activateSlide,
    deactivateSlide,
  } = useSliderStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });

  const isSelected = selectedSlideId === id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isPublished = status === "published";
  const isVisibleOnSite = isPublished && isActive;

  const runConfirmedAction = () => {
    if (confirmAction === "publish") publishSlide(id);
    if (confirmAction === "unpublish") unpublishSlide(id);
    if (confirmAction === "activate") activateSlide(id);
    if (confirmAction === "deactivate") deactivateSlide(id);
    if (confirmAction === "delete") deleteSlide(id);

    setConfirmAction(null);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group overflow-hidden rounded-3xl transition-all duration-200
        ${isSelected ? "glass-card-strong ring-1 ring-primary/30" : "glass-card"}
        ${isDragging ? "scale-[0.99] opacity-70 shadow-2xl" : ""}
      `}
    >
      <div className="flex flex-col gap-4 p-4 xl:flex-row xl:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="flex h-12 w-10 shrink-0 cursor-grab items-center justify-center rounded-2xl border border-border/70 bg-background/40 text-muted-foreground transition hover:bg-muted active:cursor-grabbing"
            aria-label="جابجایی اسلاید"
          >
            <GripVertical size={18} />
          </button>

          <button
            type="button"
            onClick={() => selectSlide(id)}
            className="flex min-w-0 flex-1 items-center gap-4 text-right"
          >
            <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-2xl bg-muted">
              {thumbnail ? (
                <Image
                  src={thumbnail}
                  alt={title}
                  fill
                  unoptimized={thumbnail.startsWith("blob:")}
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[11px] text-muted-foreground">
                  بدون تصویر
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

              <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">
                #{index + 1}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-bold text-foreground">
                {title}
              </h4>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={status} />

                <span
                  className={
                    isVisibleOnSite
                      ? "status-badge status-badge-success"
                      : "status-badge status-badge-muted"
                  }
                >
                  <span
                    className={
                      isVisibleOnSite
                        ? "status-dot bg-success"
                        : "status-dot bg-muted-foreground"
                    }
                  />
                  {isVisibleOnSite ? "روی سایت" : "عدم نمایش"}
                </span>
              </div>
            </div>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {isPublished ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmAction("unpublish")}
              className="rounded-xl"
            >
              <Undo2 size={15} />
              لغو انتشار
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={() => setConfirmAction("publish")}
              className="rounded-xl"
            >
              <Send size={15} />
              انتشار
            </Button>
          )}

          {isActive ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmAction("deactivate")}
              className="rounded-xl"
            >
              <EyeOff size={15} />
              مخفی
            </Button>
          ) : (
            <Button
              type="button"
              variant="glass"
              size="sm"
              disabled={!canActivate}
              onClick={() => setConfirmAction("activate")}
              className="rounded-xl"
              title={!canActivate ? "برای فعال‌سازی، ابتدا اسلاید را منتشر کنید" : undefined}
            >
              <Eye size={15} />
              فعال
            </Button>
          )}

          <Button
            type="button"
            variant="glass"
            size="sm"
            onClick={() => duplicateSlide(id)}
            className="rounded-xl"
          >
            <Copy size={15} />
            کپی
          </Button>

          <Button
            type="button"
            variant="dangerGhost"
            size="sm"
            onClick={() => setConfirmAction("delete")}
            className="rounded-xl"
          >
            <Trash2 size={15} />
            حذف
          </Button>
        </div>
      </div>

      {confirmAction && (
        <div className="border-t glass-divider bg-background/30 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {getConfirmTitle(confirmAction)}
              </p>

              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                {getConfirmDescription(confirmAction)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction(null)}
                className="rounded-xl"
              >
                انصراف
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={runConfirmedAction}
                className="rounded-xl"
              >
                تایید عملیات
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: SlideStatus }) {
  if (status === "published") {
    return (
      <span className="status-badge status-badge-info">
        <span className="status-dot bg-info" />
        منتشرشده
      </span>
    );
  }

  if (status === "scheduled") {
    return (
      <span className="status-badge status-badge-warning">
        <span className="status-dot bg-warning" />
        زمان‌بندی‌شده
      </span>
    );
  }

  if (status === "expired") {
    return (
      <span className="status-badge status-badge-danger">
        <span className="status-dot bg-destructive" />
        منقضی‌شده
      </span>
    );
  }

  return (
    <span className="status-badge status-badge-muted">
      <span className="status-dot bg-muted-foreground" />
      پیش‌نویس
    </span>
  );
}

function getConfirmTitle(action: ConfirmAction) {
  switch (action) {
    case "publish":
      return "انتشار اسلاید";
    case "unpublish":
      return "لغو انتشار اسلاید";
    case "activate":
      return "فعال‌سازی نمایش در سایت";
    case "deactivate":
      return "مخفی کردن از سایت";
    case "delete":
      return "حذف اسلاید";
  }
}

function getConfirmDescription(action: ConfirmAction) {
  switch (action) {
    case "publish":
      return "بعد از انتشار، اسلاید آماده نمایش است؛ اما برای نمایش واقعی در سایت باید فعال هم باشد.";
    case "unpublish":
      return "اسلاید به پیش‌نویس برمی‌گردد و از سایت مخفی می‌شود.";
    case "activate":
      return "بعد از فعال‌سازی، اگر اسلاید منتشر شده باشد، روی سایت نمایش داده می‌شود.";
    case "deactivate":
      return "اسلاید منتشر می‌ماند، اما در سایت نمایش داده نمی‌شود.";
    case "delete":
      return "این عملیات اسلاید را از لیست حذف می‌کند.";
  }
}