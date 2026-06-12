"use client";

import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionCardProps {
  children: ReactNode;

  className?: string;
}

export function SectionCard({
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        `
        rounded-2xl
        border
        bg-card
        shadow-sm
        overflow-hidden
      `,
        className
      )}
    >
      {children}
    </section>
  );
}