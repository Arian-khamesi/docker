import type {
  ProductCarouselSourceType,
  ProductCarouselTheme,
} from "@/types/product-carousel";

export function getProductCarouselThemeLabel(theme: ProductCarouselTheme) {
  switch (theme) {
    case "classic":
      return "کلاسیک";
    case "modern":
      return "مدرن";
    case "minimal":
      return "مینیمال";
    case "deal":
      return "فروش ویژه";
    case "banner":
      return "بنردار";
    case "gray":
      return "خاکستری";
    default:
      return theme;
  }
}

export function getProductCarouselSourceTypeLabel(
  type: ProductCarouselSourceType
) {
  switch (type) {
    case "most_viewed":
      return "پربازدیدترین";
    case "highest_discount_percent":
      return "بیشترین درصد تخفیف";
    case "highest_discount_amount":
      return "بیشترین مبلغ تخفیف";
    case "newest":
      return "جدیدترین";
    case "best_sellers":
      return "پرفروش‌ترین";
    case "manual":
      return "انتخاب دستی";
    case "color":
      return "رنگ انتخابی";
    case "category_only":
      return "فقط دسته‌بندی";
    case "free_content":
      return "محتوای آزاد";
    default:
      return type;
  }
}