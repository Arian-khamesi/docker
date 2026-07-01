"use client";

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IconButtonProps extends ButtonProps {
  badge?: boolean;
  badgeTone?: "primary" | "success" | "warning" | "danger";
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      children,
      badge,
      badgeTone = "primary",
      variant = "ghost",
      size = "icon",
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative inline-flex">
        <Button
          ref={ref}
          variant={variant}
          size={size}
          className={cn(
            "group relative h-11 w-11 overflow-hidden rounded-2xl border border-border/45 bg-background/35 text-muted-foreground shadow-[inset_0_1px_0_hsl(var(--glass-border)/0.12)] backdrop-blur-xl transition-all duration-200",
            "hover:-translate-y-0.5 hover:border-border/70 hover:bg-muted/70 hover:text-foreground hover:shadow-[0_12px_28px_hsl(var(--glass-shadow)/0.10),inset_0_1px_0_hsl(var(--glass-border)/0.16)]",
            "active:translate-y-0 active:scale-[0.98]",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            className
          )}
          {...props}
        >
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/12 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          <span className="relative z-10 flex items-center justify-center">
            {children}
          </span>
        </Button>

        {badge && (
          <span
            className={cn(
              "absolute -left-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-background shadow-[0_0_0_3px_hsl(var(--background)/0.55)]",
              badgeTone === "primary" && "bg-primary",
              badgeTone === "success" && "bg-success",
              badgeTone === "warning" && "bg-warning",
              badgeTone === "danger" && "bg-destructive"
            )}
          />
        )}
      </div>
    );
  }
);

IconButton.displayName = "IconButton";