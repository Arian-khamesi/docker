"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import {
  FormProvider,
  useFormContext,
  Controller,
} from "react-hook-form"
import { cn } from "@/lib/utils"

const Form = FormProvider

function FormField({ ...props }) {
  return <Controller {...props} />
}

function FormItem({ className, ...props }) {
  return (
    <div className={cn("space-y-2", className)} {...props} />
  )
}

function FormLabel({ className, ...props }) {
  return (
    <label
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function FormControl({ ...props }) {
  return <Slot {...props} />
}

function FormDescription({ className, ...props }) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function FormMessage({ className, children, ...props }) {
  const { formState } = useFormContext()
  const error = formState.errors?.[props.name]

  return (
    <p
      className={cn(
        "text-sm font-medium text-destructive",
        !error && "hidden",
        className
      )}
      {...props}
    >
      {error ? String(error.message) : children}
    </p>
  )
}

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
}
