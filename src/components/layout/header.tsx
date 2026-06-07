"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/auth/auth.store"
import { Search, Bell, CalendarDays, Ticket, PanelRightClose } from "lucide-react"

import { cn } from "@/lib/utils"
import { useUIStore } from "@/store/ui-store"
import { Input } from "@/components/ui/input"
import { IconButton } from "@/components/ui/icon-button"
import { ThemeToggle } from "./theme-toggle"
import { UserProfileSummary } from "./user-profile-summary"

export function Header() {
  const pathname = usePathname()
  const { toggleSubmenu } = useUIStore()
  const [search, setSearch] = useState("")
  const { user } = useAuthStore()

  if (!user) return null
console.log(user)
  

  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-6 py-3">

      {/* Right section */}
      <div className="flex items-center gap-3">

        {/* Toggle sidebar */}
        <IconButton
          aria-label="بستن/باز کردن منوی کناری"
          onClick={() => toggleSubmenu()}
          className="bg-muted hover:bg-accent"
        >
          <PanelRightClose className="h-4 w-4" />
        </IconButton>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="هر چیزی را جستجو کنید"
            className="w-72 pr-9 text-sm"
          />
        </div>

        {/* Small badge */}
        <div className="hidden items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground md:flex">

          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
            ۲۷
          </span>

          <span className="text-muted-foreground">
            لیدهای جدید امروز
          </span>

        </div>

      </div>


      {/* Left section */}
      <div className="flex items-center gap-3">

        <ThemeToggle />

        <IconButton aria-label="تیکت‌ها">
          <Ticket className="h-4 w-4" />
        </IconButton>

        <IconButton aria-label="اعلان‌ها" badge>
          <Bell className="h-4 w-4" />
        </IconButton>

        <IconButton aria-label="تقویم">
          <CalendarDays className="h-4 w-4" />
        </IconButton>

        {/* divider */}
        <div className="mx-1 h-6 w-px bg-border" />

        <UserProfileSummary
          name={user.fullName}
          role={mapRoleToTitle(user.role)}
          team={user.team}
          avatarUrl={user.avatar ?? "/assets/avatars/default.png"}
        />

      </div>

    </header>
  )

function mapRoleToTitle(role: string) {
  switch (role) {
    case "admin":
      return "مدیر کل"
    case "manager":
      return "مدیر"
    case "support":
      return "پشتیبانی"
    case "viewer":
      return "مشاهده‌گر"
    default:
      return "کاربر"
  }
}
  
}
