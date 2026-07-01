"use client";

import { useParams } from "next/navigation";

import { CategoryCarouselFormShell } from "@/components/category-carousels/category-carousel-form-shell";

export default function EditCategoryCarouselPage() {
  const params = useParams<{ id: string }>();

  return <CategoryCarouselFormShell mode="edit" carouselId={params.id} />;
}