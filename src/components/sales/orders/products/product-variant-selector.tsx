"use client";

import { useMemo, useState } from "react";
import {
  Barcode,
  CheckCircle2,
  ChevronDown,
  PackageSearch,
  Search,
} from "lucide-react";

import {
  createProductVariantSelection,
  findVariantByColorAndSize,
  getAvailableColorsForProduct,
  getAvailableSizesForColor,
  getProductVariantDisplayLabel,
  getVariantAvailabilityLabel,
  isVariantSelectable,
  searchProductParents,
} from "@/lib/orders/product-variant-selection";
import type {
  ProductParentItem,
  ProductVariantSelection,
} from "@/types/product-variant";

interface ProductVariantSelectorProps {
  products: ProductParentItem[];
  value?: ProductVariantSelection | null;
  onChange: (selection: ProductVariantSelection | null) => void;
  title?: string;
  description?: string;
  disabled?: boolean;
}

export function ProductVariantSelector({
  products,
  value,
  onChange,
  title = "انتخاب کالا و variant",
  description = "ابتدا محصول مادر را انتخاب کن، بعد رنگ و سایز را از گزینه‌های واقعی همان محصول انتخاب کن تا barcode یونیک کالا مشخص شود.",
  disabled,
}: ProductVariantSelectorProps) {
  const [keyword, setKeyword] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(
    value?.parentProductId ?? ""
  );
  const [selectedColorId, setSelectedColorId] = useState(value?.colorId ?? "");
  const [selectedSizeId, setSelectedSizeId] = useState(value?.sizeId ?? "");

  const filteredProducts = useMemo(
    () => searchProductParents(products, keyword),
    [keyword, products]
  );

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId),
    [products, selectedProductId]
  );

  const colorOptions = useMemo(
    () => getAvailableColorsForProduct(selectedProduct),
    [selectedProduct]
  );

  const sizeOptions = useMemo(
    () => getAvailableSizesForColor(selectedProduct, selectedColorId),
    [selectedColorId, selectedProduct]
  );

  const selectedVariant = useMemo(
    () =>
      findVariantByColorAndSize(
        selectedProduct,
        selectedColorId,
        selectedSizeId
      ),
    [selectedColorId, selectedProduct, selectedSizeId]
  );

  const canSelectVariant = isVariantSelectable(selectedVariant);

  function handleProductChange(productId: string) {
    setSelectedProductId(productId);
    setSelectedColorId("");
    setSelectedSizeId("");
    onChange(null);
  }

  function handleColorChange(colorId: string) {
    setSelectedColorId(colorId);
    setSelectedSizeId("");
    onChange(null);
  }

  function handleSizeChange(sizeId: string) {
    setSelectedSizeId(sizeId);

    if (!selectedProduct) {
      onChange(null);
      return;
    }

    const variant = findVariantByColorAndSize(
      selectedProduct,
      selectedColorId,
      sizeId
    );

    if (!variant || !isVariantSelectable(variant)) {
      onChange(null);
      return;
    }

    onChange(createProductVariantSelection(selectedProduct, variant));
  }

  function confirmCurrentVariant() {
    if (!selectedProduct || !selectedVariant || !canSelectVariant) return;

    onChange(createProductVariantSelection(selectedProduct, selectedVariant));
  }

  return (
    <section className="rounded-[2rem] bg-white/45 p-4 dark:bg-white/[0.04]">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
          <PackageSearch className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-base font-black text-foreground">{title}</h3>

          <p className="mt-1 text-xs font-bold leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <label className="text-[11px] font-black text-muted-foreground">
            جستجوی محصول مادر
          </label>

          <div className="mt-2 flex h-11 items-center gap-2 rounded-[1.25rem] bg-white/65 px-4 dark:bg-white/[0.05]">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />

            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              disabled={disabled}
              placeholder="نام محصول، کد پدر یا barcode variant..."
              className="h-full min-w-0 flex-1 bg-transparent text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        <SelectField
          label="محصول مادر"
          value={selectedProductId}
          disabled={disabled}
          onChange={handleProductChange}
          options={filteredProducts.map((product) => ({
            value: product.id,
            label: `${product.title} / ${product.parentProductCode}`,
          }))}
          placeholder="انتخاب محصول"
        />

        <SelectField
          label="رنگ"
          value={selectedColorId}
          disabled={disabled || !selectedProduct}
          onChange={handleColorChange}
          options={colorOptions.map((color) => ({
            value: color.id,
            label: color.title,
          }))}
          placeholder="انتخاب رنگ"
        />

        <SelectField
          label="سایز"
          value={selectedSizeId}
          disabled={disabled || !selectedProduct || !selectedColorId}
          onChange={handleSizeChange}
          options={sizeOptions.map((size) => ({
            value: size.id,
            label: size.title,
          }))}
          placeholder="انتخاب سایز"
        />

        <div className="xl:col-span-2">
          <VariantResultBox
            selectedProduct={selectedProduct}
            selectedVariant={selectedVariant}
            value={value}
            canSelectVariant={canSelectVariant}
            onConfirm={confirmCurrentVariant}
          />
        </div>
      </div>
    </section>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-black text-muted-foreground">
        {label}
      </span>

      <div className="relative mt-2">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full appearance-none rounded-[1.25rem] bg-white/65 px-4 pl-10 text-sm font-bold text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/[0.05]"
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </label>
  );
}

function VariantResultBox({
  selectedProduct,
  selectedVariant,
  value,
  canSelectVariant,
  onConfirm,
}: {
  selectedProduct?: ProductParentItem;
  selectedVariant?: ProductParentItem["variants"][number];
  value?: ProductVariantSelection | null;
  canSelectVariant: boolean;
  onConfirm: () => void;
}) {
  if (!selectedProduct) {
    return (
      <div className="rounded-[1.4rem] bg-slate-500/10 p-4 text-sm font-bold text-slate-700 dark:text-slate-300">
        ابتدا محصول مادر را انتخاب کن.
      </div>
    );
  }

  if (!selectedVariant) {
    return (
      <div className="rounded-[1.4rem] bg-amber-500/10 p-4 text-sm font-bold leading-7 text-amber-700 dark:text-amber-300">
        بعد از انتخاب رنگ و سایز، barcode یونیک variant اینجا نمایش داده
        می‌شود.
      </div>
    );
  }

  return (
    <div
      className={[
        "rounded-[1.4rem] p-4",
        canSelectVariant
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "bg-rose-500/10 text-rose-700 dark:text-rose-300",
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Barcode className="h-4 w-4" />

            <p className="text-sm font-black" dir="ltr">
              {selectedVariant.variantBarcode}
            </p>
          </div>

          <p className="mt-2 text-xs font-bold leading-6">
            {selectedProduct.title} / {selectedVariant.colorTitle} /{" "}
            {selectedVariant.sizeTitle}
          </p>

          <p className="mt-1 text-xs font-bold leading-6 opacity-80">
            کد پدر: {selectedProduct.parentProductCode} · قیمت:{" "}
            {selectedVariant.priceToman.toLocaleString("fa-IR")} تومان ·{" "}
            {getVariantAvailabilityLabel(
              selectedVariant.availabilityStatus,
              selectedVariant.stockQuantity
            )}
          </p>
        </div>

        <button
          type="button"
          disabled={!canSelectVariant}
          onClick={onConfirm}
          className={[
            "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[1.2rem] px-4 text-xs font-black text-white transition",
            canSelectVariant
              ? "bg-emerald-600 hover:-translate-y-0.5"
              : "cursor-not-allowed bg-slate-400",
          ].join(" ")}
        >
          <CheckCircle2 className="h-4 w-4" />
          انتخاب همین کالا
        </button>
      </div>

      {value ? (
        <div className="mt-3 rounded-[1.2rem] bg-white/45 p-3 text-xs font-black dark:bg-white/[0.05]">
          انتخاب فعلی: {getProductVariantDisplayLabel(value)}
        </div>
      ) : null}
    </div>
  );
}