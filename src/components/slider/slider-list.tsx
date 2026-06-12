"use client";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { Check, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSliderStore } from "@/store/slider.store";

import { EmptySliderState } from "./empty-slider-state";
import { SortableSlideItem } from "./sortable-slide-item";

export function SliderList() {
  const {
    slides,
    draftOrderIds,
    hasPendingOrderChanges,
    requestReorderSlides,
    commitOrderChanges,
    resetOrderChanges,
  } = useSliderStore();

  const persistedSlides = [...slides].sort((a, b) => a.order - b.order);

  const visibleSlides = draftOrderIds
    ? draftOrderIds
        .map((id) => slides.find((slide) => slide.id === id))
        .filter(Boolean)
    : persistedSlides;

  const orderedSlides = visibleSlides as typeof slides;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = orderedSlides.findIndex((slide) => slide.id === active.id);
    const newIndex = orderedSlides.findIndex((slide) => slide.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(orderedSlides, oldIndex, newIndex);

    requestReorderSlides(reordered.map((slide) => slide.id));
  };

  if (!orderedSlides.length) {
    return <EmptySliderState />;
  }

  return (
    <section className="glass-panel overflow-hidden rounded-3xl">
      <div className="flex flex-col gap-4 border-b glass-divider p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_6px_hsl(var(--primary)/0.12)]" />

            <h2 className="text-sm font-semibold">لیست اسلایدها</h2>
          </div>

          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            ترتیب، انتشار و نمایش هر اسلاید را با تایید نهایی مدیریت کنید.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="status-badge status-badge-muted">
            {orderedSlides.length} اسلاید
          </span>

          {hasPendingOrderChanges && (
            <span className="status-badge status-badge-warning">
              ترتیب ذخیره نشده
            </span>
          )}
        </div>
      </div>

      {hasPendingOrderChanges && (
        <div className="px-5 pt-5">
          <div className="glass-card-strong rounded-2xl border-warning/20 bg-warning/10 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  ترتیب اسلایدها تغییر کرده است
                </p>

                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  تا زمانی که ذخیره ترتیب را نزنید، این تغییرات قطعی محسوب نمی‌شود.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetOrderChanges}
                  className="rounded-xl"
                >
                  <RotateCcw size={15} />
                  لغو
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={commitOrderChanges}
                  className="rounded-xl"
                >
                  <Check size={15} />
                  ذخیره ترتیب
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedSlides.map((slide) => slide.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 p-5">
            {orderedSlides.map((slide, index) => (
              <SortableSlideItem
                key={slide.id}
                id={slide.id}
                index={index}
                title={slide.title}
                isActive={slide.isActive}
                status={slide.status}
                thumbnail={slide.images.desktop.url}
                canActivate={slide.status === "published"}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}