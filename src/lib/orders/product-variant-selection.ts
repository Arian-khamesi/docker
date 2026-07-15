import type {
  ProductParentItem,
  ProductVariantAvailabilityStatus,
  ProductVariantItem,
  ProductVariantSelection,
} from "@/types/product-variant";

export function searchProductParents(
  products: ProductParentItem[],
  keyword: string
) {
  const normalizedKeyword = normalizeSearchText(keyword);

  if (!normalizedKeyword) return products;

  return products.filter((product) => {
    const searchable = normalizeSearchText(
      [
        product.title,
        product.parentProductCode,
        product.categoryTitle,
        product.brandTitle,
        ...product.variants.map((variant) => variant.variantBarcode),
      ]
        .filter(Boolean)
        .join(" ")
    );

    return searchable.includes(normalizedKeyword);
  });
}

export function getAvailableColorsForProduct(product?: ProductParentItem) {
  if (!product) return [];

  return product.colors.filter((color) =>
    product.variants.some((variant) => variant.colorId === color.id)
  );
}

export function getAvailableSizesForColor(
  product: ProductParentItem | undefined,
  colorId: string
) {
  if (!product || !colorId) return [];

  return product.sizes.filter((size) =>
    product.variants.some(
      (variant) => variant.colorId === colorId && variant.sizeId === size.id
    )
  );
}

export function findVariantByColorAndSize(
  product: ProductParentItem | undefined,
  colorId: string,
  sizeId: string
) {
  if (!product || !colorId || !sizeId) return undefined;

  return product.variants.find(
    (variant) => variant.colorId === colorId && variant.sizeId === sizeId
  );
}

export function findVariantByBarcode(
  products: ProductParentItem[],
  barcode: string
) {
  const normalizedBarcode = barcode.trim();

  if (!normalizedBarcode) return undefined;

  for (const product of products) {
    const variant = product.variants.find(
      (item) => item.variantBarcode === normalizedBarcode
    );

    if (variant) {
      return {
        product,
        variant,
      };
    }
  }

  return undefined;
}

export function createProductVariantSelection(
  product: ProductParentItem,
  variant: ProductVariantItem
): ProductVariantSelection {
  return {
    parentProductId: product.id,
    parentProductCode: product.parentProductCode,
    parentProductTitle: product.title,
    colorId: variant.colorId,
    colorTitle: variant.colorTitle,
    sizeId: variant.sizeId,
    sizeTitle: variant.sizeTitle,
    variantId: variant.id,
    variantBarcode: variant.variantBarcode,
    priceToman: variant.priceToman,
    stockQuantity: variant.stockQuantity,
    availabilityStatus: variant.availabilityStatus,
    categoryTitle: product.categoryTitle,
    imageUrl: variant.imageUrl ?? product.imageUrl,
  };
}

export function getVariantAvailabilityLabel(
  status: ProductVariantAvailabilityStatus,
  stockQuantity?: number
) {
  if (status === "available") {
    return stockQuantity === undefined
      ? "موجود"
      : `موجودی: ${stockQuantity.toLocaleString("fa-IR")}`;
  }

  if (status === "low_stock") {
    return stockQuantity === undefined
      ? "موجودی کم"
      : `موجودی کم: ${stockQuantity.toLocaleString("fa-IR")}`;
  }

  if (status === "out_of_stock") return "ناموجود";

  return "غیرفعال";
}

export function isVariantSelectable(variant?: ProductVariantItem) {
  if (!variant) return false;

  return (
    variant.availabilityStatus === "available" ||
    variant.availabilityStatus === "low_stock"
  );
}

export function getProductVariantDisplayLabel(
  selection: ProductVariantSelection
) {
  return `${selection.parentProductTitle} / ${selection.colorTitle} / ${selection.sizeTitle}`;
}

export function normalizeSearchText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, " ");
}