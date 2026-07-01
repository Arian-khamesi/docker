import type { ProductCarouselFormStepId } from "./product-carousel-form.constants";

interface StepConfig {
  title: string;
  description: string;
  items: string[];
}

const stepConfig: Record<ProductCarouselFormStepId, StepConfig> = {
  basics: {
    title: "اطلاعات اصلی کروسل",
    description:
      "در این مرحله بعداً عنوان، وضعیت، استایل، تعداد محصول و توضیح کوتاه کروسل وارد می‌شود.",
    items: [
      "عنوان کروسل",
      "فعال / غیرفعال",
      "استایل نمایش",
      "تعداد محصولات",
    ],
  },
  schedule: {
    title: "زمان‌بندی نمایش",
    description:
      "اینجا تاریخ شروع و پایان نمایش مشخص می‌شود تا بک‌اند بتواند بعد از پایان، کروسل را حذف یا غیرفعال کند.",
    items: ["تاریخ شروع", "ساعت شروع", "تاریخ پایان", "ساعت پایان"],
  },
  source: {
    title: "منبع محصولات",
    description:
      "مهم‌ترین بخش کروسل. اینجا مشخص می‌شود محصولات دستی انتخاب شوند یا خودکار براساس تخفیف، بازدید، رنگ یا دسته‌بندی ساخته شوند.",
    items: [
      "پربازدیدترین",
      "بیشترین درصد تخفیف",
      "بیشترین مبلغ تخفیف",
      "انتخاب دستی محصول",
      "رنگ انتخابی",
      "فقط دسته‌بندی",
      "محتوای آزاد",
    ],
  },
  discount: {
    title: "تخفیف، تایمر و فروش ویژه",
    description:
      "در این مرحله بازه تخفیف محصولات، نمایش لیبل تخفیف و تایمر کروسل کنترل می‌شود.",
    items: [
      "حداقل درصد تخفیف",
      "حداکثر درصد تخفیف",
      "بازه زمانی تخفیف",
      "فعال بودن تایمر",
      "متن تایمر",
    ],
  },
  display: {
    title: "تنظیمات نمایش و بنرها",
    description:
      "اینجا دکمه مشاهده همه، لینک آن، بنر دسکتاپ و بنر موبایل تنظیم می‌شود.",
    items: [
      "دکمه مشاهده همه",
      "لینک مشاهده همه",
      "بنر دسکتاپ",
      "بنر موبایل",
    ],
  },
  review: {
    title: "بررسی نهایی",
    description:
      "قبل از انتشار، سیستم خطاها و هشدارها را نشان می‌دهد تا کروسل ناقص منتشر نشود.",
    items: [
      "چک عنوان و تاریخ",
      "چک منبع محصولات",
      "چک تعداد محصول",
      "چک بنرها",
      "آماده انتشار",
    ],
  },
};

export function ProductCarouselStepPlaceholder({
  step,
}: {
  step: ProductCarouselFormStepId;
}) {
  const selected = stepConfig[step];

  return (
    <div>
      <p className="text-xs font-black text-primary">فرم مرحله‌ای</p>

      <h2 className="mt-2 text-xl font-black text-foreground">
        {selected.title}
      </h2>

      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        {selected.description}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {selected.items.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-border bg-background/35 p-4 backdrop-blur-xl"
          >
            <p className="text-sm font-black text-foreground">{item}</p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              این فیلد در فاز بعدی فعال می‌شود.
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-primary/10 bg-primary/5 p-4">
        <p className="text-sm font-black text-primary">هدف این فاز</p>

        <p className="mt-1 text-xs leading-6 text-muted-foreground">
          فعلاً فقط اسکلت فرم، routeها و فلو رفت‌وبرگشت را تمیز نگه می‌داریم.
          بعد از تایید این مرحله، فیلدهای واقعی را مرحله به مرحله فعال می‌کنیم.
        </p>
      </div>
    </div>
  );
}