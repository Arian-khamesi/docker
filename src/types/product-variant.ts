export type ProductVariantAvailabilityStatus =
  | "available"
  | "low_stock"
  | "out_of_stock"
  | "inactive";

export interface ProductVariantColorOption {
  id: string;
  title: string;
  hex?: string;
}

export interface ProductVariantSizeOption {
  id: string;
  title: string;
}

export interface ProductVariantItem {
  id: string;
  parentProductCode: string;
  variantBarcode: string;
  colorId: string;
  colorTitle: string;
  sizeId: string;
  sizeTitle: string;
  priceToman: number;
  stockQuantity?: number;
  availabilityStatus: ProductVariantAvailabilityStatus;
  imageUrl?: string;
}

export interface ProductParentItem {
  id: string;
  title: string;
  parentProductCode: string;
  categoryTitle?: string;
  brandTitle?: string;
  imageUrl?: string;
  colors: ProductVariantColorOption[];
  sizes: ProductVariantSizeOption[];
  variants: ProductVariantItem[];
}

export interface ProductVariantSelection {
  parentProductId: string;
  parentProductCode: string;
  parentProductTitle: string;
  colorId: string;
  colorTitle: string;
  sizeId: string;
  sizeTitle: string;
  variantId: string;
  variantBarcode: string;
  priceToman: number;
  stockQuantity?: number;
  availabilityStatus: ProductVariantAvailabilityStatus;
  categoryTitle?: string;
  imageUrl?: string;
}