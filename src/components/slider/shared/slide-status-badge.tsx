interface Props {
  status: "draft" | "published";
}

export function SlideStatusBadge({
  status,
}: Props) {
  if (status === "published") {
    return (
      <span
        className="
        text-xs
        px-2
        py-1
        rounded-full
        bg-green-100
        text-green-700
      "
      >
        منتشر شده
      </span>
    );
  }

  return (
    <span
      className="
      text-xs
      px-2
      py-1
      rounded-full
      bg-yellow-100
      text-yellow-700
    "
    >
      پیش نویس
    </span>
  );
}