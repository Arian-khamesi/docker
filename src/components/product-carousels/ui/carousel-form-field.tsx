import type { ReactNode } from "react";

export const carouselInputClass =
  "glass-input w-full text-foreground placeholder:text-muted-foreground/60";

export const carouselTextareaClass =
  "glass-input min-h-24 w-full resize-none py-3 text-foreground placeholder:text-muted-foreground/60";

export function CarouselFormField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black text-foreground">{label}</span>

      {children}

      {hint && !error ? (
        <span className="text-xs leading-5 text-muted-foreground">{hint}</span>
      ) : null}

      {error ? (
        <span className="rounded-xl border border-destructive/15 bg-destructive/10 px-3 py-2 text-xs font-bold leading-5 text-destructive">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function FormSectionNote({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 backdrop-blur-xl">
      <p className="text-sm font-black text-primary">{title}</p>
      <p className="mt-1 text-xs leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}