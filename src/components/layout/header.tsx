"use client";

import { useState } from "react";
import { useAuthStore } from "@/auth/auth.store";
import {
  Bell,
  CalendarDays,
  PanelRightClose,
  Search,
  Sparkles,
  Ticket,
} from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/ui/icon-button";
import { ThemeToggle } from "./theme-toggle";
import { UserProfileSummary } from "./user-profile-summary";

export function Header() {
  const { toggleSubmenu } = useUIStore();
  const [search, setSearch] = useState("");
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <header className="relative z-40 px-5 pt-4">
      <div className="glass-panel flex items-center justify-between rounded-[2rem] px-4 py-3">
        <div className="pointer-events-none absolute right-20 top-0 h-24 w-52 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex min-w-0 flex-1 items-center gap-3">
          <IconButton
            aria-label="بستن/باز کردن منوی کناری"
            onClick={() => toggleSubmenu()}
            className="h-11 w-11 rounded-2xl bg-background/35 hover:bg-muted"
          >
            <PanelRightClose className="h-4 w-4" />
          </IconButton>

          <div className="relative hidden min-w-[14rem] flex-1 md:block">
            <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجو در داشبورد..."
              className="h-11 w-full max-w-[26rem] rounded-2xl pr-10 text-sm"
            />
          </div>

          <div className="hidden shrink-0 items-center gap-2 rounded-2xl border border-primary/10 bg-primary/10 px-2.5 py-2 text-xs font-bold text-primary md:flex">
            <span className="flex h-6 w-6 items-center justify-center rounded-xl bg-primary text-[11px] text-primary-foreground">
              ۲۷
            </span>

            <span className="hidden whitespace-nowrap 2xl:inline">
              لیدهای جدید امروز
            </span>
          </div>
          <div className="relative flex items-center gap-2">
            <div className="hidden shrink-0 items-center gap-2 rounded-2xl bg-background/30 px-3 py-2 text-xs font-semibold text-muted-foreground lg:flex">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />

              <span className="hidden whitespace-nowrap 2xl:inline">
                سیستم پایدار است
              </span>
            </div>

            <ThemeToggle />

            <IconButton
              aria-label="تیکت‌ها"
              className="h-11 w-11 rounded-2xl bg-background/35 hover:bg-muted"
            >
              <Ticket className="h-4 w-4" />
            </IconButton>

            <IconButton
              aria-label="اعلان‌ها"
              badge
              className="h-11 w-11 rounded-2xl bg-background/35 hover:bg-muted"
            >
              <Bell className="h-4 w-4" />
            </IconButton>

            <IconButton
              aria-label="تقویم"
              className="h-11 w-11 rounded-2xl bg-background/35 hover:bg-muted"
            >
              <CalendarDays className="h-4 w-4" />
            </IconButton>

            <div className="mx-2 h-7 w-px bg-border/70" />

            <UserProfileSummary
              name={user.fullName}
              role={mapRoleToTitle(user.role)}
              team={user.team}
              avatarUrl={user.avatar ?? "/assets/avatars/default.png"}
            />
          </div>
        </div>
         </div>
    </header>
  );
}

function mapRoleToTitle(role: string) {
  switch (role) {
    case "admin":
      return "مدیر کل";
    case "manager":
      return "مدیر";
    case "support":
      return "پشتیبانی";
    case "viewer":
      return "مشاهده‌گر";
    default:
      return "کاربر";
  }
}