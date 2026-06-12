"use client";

import Image from "next/image";

interface ImagePreviewProps {
  src: string;
  alt?: string;
}

export function ImagePreview({
  src,
  alt,
}: ImagePreviewProps) {
  return (
    <div
      className="
      relative
      overflow-hidden
      rounded-xl
      border
      aspect-[16/9]
      bg-muted
    "
    >
      <Image
        src={src}
        alt={alt || "preview"}
        fill
        className="object-cover"
      />
    </div>
  );
}