"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { Slide } from "@/types/slider";

interface ContentSectionProps {
  slide: Slide;
  onChange: (updates: Partial<Slide>) => void;
}

export function ContentSection({ slide, onChange }: ContentSectionProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <FieldShell
          label="عنوان اصلی"
          description="متن اصلی که بیشترین توجه کاربر را می‌گیرد."
          counter={`${slide.title.length}/80`}
        >
          <Input
            value={slide.title}
            maxLength={80}
            onChange={(event) =>
              onChange({
                title: event.target.value,
              })
            }
            placeholder="مثلاً: جشنواره فروش محصولات جدید"
          />
        </FieldShell>

        <FieldShell
          label="زیرعنوان"
          description="یک جمله کوتاه برای تکمیل پیام اصلی."
          counter={`${slide.subtitle.length}/100`}
        >
          <Input
            value={slide.subtitle}
            maxLength={100}
            onChange={(event) =>
              onChange({
                subtitle: event.target.value,
              })
            }
            placeholder="مثلاً: تخفیف محدود برای خرید آنلاین"
          />
        </FieldShell>
      </div>

      <FieldShell
        label="توضیحات"
        description="متن توضیحی بهتر است کوتاه، مستقیم و قابل خواندن روی تصویر باشد."
        counter={`${slide.description.length}/240`}
      >
        <Textarea
          rows={5}
          maxLength={240}
          value={slide.description}
          onChange={(event) =>
            onChange({
              description: event.target.value,
            })
          }
          placeholder="توضیح کوتاهی درباره پیشنهاد، کمپین یا محتوای اسلاید بنویسید."
          className="min-h-32 resize-none rounded-2xl"
        />
      </FieldShell>

      <div className="glass-card rounded-2xl p-4">
        <p className="text-xs font-semibold text-foreground">قاعده محتوایی</p>

        <p className="mt-2 text-xs leading-6 text-muted-foreground">
          عنوان را کوتاه نگه دارید. اگر متن طولانی شود، روی موبایل یا روی تصویر
          شلوغ خوانایی پایین می‌آید.
        </p>
      </div>
    </div>
  );
}

function FieldShell({
  label,
  description,
  counter,
  children,
}: {
  label: string;
  description?: string;
  counter?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Label className="text-sm font-semibold text-foreground">{label}</Label>

          {description && (
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {counter && (
          <span className="rounded-full bg-muted/70 px-2.5 py-1 text-[11px] text-muted-foreground">
            {counter}
          </span>
        )}
      </div>

      {children}
    </div>
  );
}