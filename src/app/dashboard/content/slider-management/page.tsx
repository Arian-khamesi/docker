"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSliderStore } from "@/store/slider.store";

import { SliderList } from "@/components/slider/slider-list";
import { SliderLayout } from "@/components/slider/slider-layout";

export default function SliderManagementPage() {
  const { addSlide, slides } = useSliderStore();

  const publishedCount = slides.filter((slide) => slide.status === "published").length;
  const visibleCount = slides.filter(
    (slide) => slide.status === "published" && slide.isActive
  ).length;

  return (
    <div className="glass-page -m-6 min-h-[calc(100vh-0px)] p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <header className="glass-panel overflow-hidden rounded-3xl p-6">
          <div className="relative">
            <div className="pointer-events-none absolute -left-16 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 right-20 h-56 w-56 rounded-full bg-info/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  مدیریت محتوای صفحه اصلی
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  مدیریت اسلایدر
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                  ساخت، ویرایش، مرتب‌سازی و کنترل انتشار اسلایدهای صفحه اصلی با
                  پیش‌نمایش زنده و وضعیت عملیاتی شفاف.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="grid grid-cols-3 gap-2">
                  <Metric label="کل" value={slides.length} />
                  <Metric label="منتشر" value={publishedCount} />
                  <Metric label="نمایش" value={visibleCount} />
                </div>

                <Button onClick={addSlide} size="lg" className="rounded-2xl">
                  <Plus size={18} />
                  افزودن اسلاید
                </Button>
              </div>
            </div>
          </div>
        </header>

        <SliderList />

        <SliderLayout />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card min-w-20 rounded-2xl px-4 py-3 text-center">
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}