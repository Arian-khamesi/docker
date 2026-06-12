"use client";

import { ReactNode } from "react";

interface SectionTitleProps {
  title: string;

  description?: string;

  action?: ReactNode;
}

export function SectionTitle({
  title,
  description,
  action,
}: SectionTitleProps) {
  return (
    <div
      className="
      flex
      items-start
      justify-between
      gap-4
      p-5
      border-b
    "
    >
      <div>
        <h3
          className="
          text-sm
          font-semibold
        "
        >
          {title}
        </h3>

        {description && (
          <p
            className="
            text-xs
            text-muted-foreground
            mt-1
          "
          >
            {description}
          </p>
        )}
      </div>

      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
}