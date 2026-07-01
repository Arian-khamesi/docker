"use client";

import { useParams } from "next/navigation";

import { ProductCarouselFormShell } from "@/components/product-carousels/product-carousel-form-shell";

export default function EditProductCarouselPage() {
  const params = useParams<{ id: string }>();

  return <ProductCarouselFormShell mode="edit" carouselId={params.id} />;
}