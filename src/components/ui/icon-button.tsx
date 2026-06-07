"use client"

import * as React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface IconButtonProps extends ButtonProps {
  badge?: boolean
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, children, badge, ...props }, ref) => {
    return (
      <div className="relative">
        <Button
          ref={ref}
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 rounded-full border border-transparent hover:border-border",
            className
          )}
          {...props}
        >
          {children}
        </Button>
        {badge && (
          <span className="absolute -top-0.5 -left-0.5 h-2.5 w-2.5 rounded-full border border-background bg-primary" />
        )}
      </div>
    )
  }
)

IconButton.displayName = "IconButton"
