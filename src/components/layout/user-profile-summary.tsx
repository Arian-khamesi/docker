"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/auth/auth.store"   // ← این بخش تو پروژه تو هست یا بعدا میسازیم
import { LogOut, Settings, User, ListTodo, Sparkles } from "lucide-react"

interface UserProfileSummaryProps {
  name: string
  role: string
  team?: string
  avatarUrl?: string
  className?: string
}

export function UserProfileSummary({
  name,
  role,
  team,
  avatarUrl,
  className,
}: UserProfileSummaryProps) {
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)  // ← اتصال به سیستم لاگ اوت واقعی

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // بستن dropdown با کلیک خارج
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <div
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-md px-2 py-1 transition hover:bg-muted",
          className
        )}
        onClick={() => setOpen((v) => !v)}
      >
        {/* Avatar */}
        <div className="relative">
          <div className="h-10 w-10 overflow-hidden rounded-full border border-border bg-muted">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                {name}
              </div>
            )}
          </div>

          {/* status dot */}
          <span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 rounded-full border border-background bg-emerald-500" />
        </div>

        {/* text */}
        <div className="hidden flex-col gap-0.5 md:flex">
          <div className="flex items-center gap-1 text-sm font-semibold leading-tight">
            <span className="text-foreground">{name}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {role}
            {team ? ` • ${team}` : null}
          </div>
        </div>
      </div>

      {/* Dropdown menu */}
      {open && (
        <div
          className="absolute left-0 z-50 mt-2 w-56 rounded-xl border border-border bg-popover shadow-lg transition-all bg-red-50"
        >
          {/* header */}
          <div className="flex flex-col gap-1 px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold">{name}</span>
            <span className="text-xs text-muted-foreground">{role}</span>
          </div>

          {/* items */}
          <ul className="flex flex-col py-1">

            <li
              onClick={() => router.push("/profile")}
              className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
            >
              <User className="h-4 w-4" />
              مشاهده نمایه
            </li>

            <li
              onClick={() => router.push("/tasks")}
              className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
            >
              <ListTodo className="h-4 w-4" />
              وظایف من
            </li>

            <li
              onClick={() => router.push("/account/settings")}
              className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
            >
              <Settings className="h-4 w-4" />
              تنظیمات حساب
            </li>

            <li
              onClick={() => router.push("/pricing")}
              className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
            >
              <Sparkles className="h-4 w-4" />
              طرح ارتقا
            </li>

            {/* divider */}
            <div className="my-1 h-px bg-border"></div>

            <li
              onClick={async () => {
                await logout()        // ← پاک شدن session سمت سرور + پاک state
                router.replace("/login")
              }}
              className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              از سیستم خارج شوید
            </li>

          </ul>
        </div>
      )}
    </div>
  )
}

