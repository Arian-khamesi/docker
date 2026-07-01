"use client";

import { useEffect, useRef, useState } from "react";
import type { ElementType } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ListTodo,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/auth/auth.store";

interface UserProfileSummaryProps {
  name: string;
  role: string;
  team?: string;
  avatarUrl?: string;
  className?: string;
}

export function UserProfileSummary({
  name,
  role,
  team,
  avatarUrl,
  className,
}: UserProfileSummaryProps) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const navigateTo = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "group flex items-center gap-3 rounded-2xl bg-background/35 px-2.5 py-2 backdrop-blur-xl transition-all duration-200",
          "shadow-[inset_0_1px_0_hsl(var(--glass-border)/0.14)]",
          "hover:-translate-y-0.5 hover:bg-muted/55 hover:shadow-[0_14px_34px_hsl(var(--glass-shadow)/0.10),inset_0_1px_0_hsl(var(--glass-border)/0.18)]",
          open && "bg-primary/10 shadow-[0_14px_34px_hsl(var(--primary)/0.10),inset_0_1px_0_hsl(var(--glass-border)/0.18)]"
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={name} avatarUrl={avatarUrl} />

        <div className="hidden min-w-0 flex-col items-start gap-0.5 md:flex">
          <div className="max-w-32 truncate text-sm font-black leading-tight text-foreground">
            {name}
          </div>

          <div className="max-w-40 truncate text-xs text-muted-foreground">
            {role}
            {team ? ` • ${team}` : null}
          </div>
        </div>

        <ChevronDown
          className={cn(
            "hidden h-4 w-4 text-muted-foreground transition-transform md:block",
            open && "rotate-180 text-primary"
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-[9999] mt-3 w-[21rem] overflow-hidden rounded-[2.25rem] bg-card/82 p-2.5 text-foreground shadow-[0_32px_100px_hsl(var(--glass-shadow)/0.26),inset_0_1px_0_hsl(var(--glass-border)/0.18),inset_0_-1px_0_hsl(var(--glass-border)/0.08)] backdrop-blur-[30px]">
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-primary/16 blur-3xl" />
          <div className="pointer-events-none absolute bottom-10 right-0 h-40 w-40 rounded-full bg-info/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-background/20" />

          <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-primary/14 via-background/38 to-background/16 p-4 shadow-[inset_0_1px_0_hsl(var(--glass-border)/0.16)]">
            <div className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-primary/18 blur-2xl" />

            <div className="relative flex items-center gap-3">
              <Avatar name={name} avatarUrl={avatarUrl} large />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-foreground">
                  {name}
                </p>

                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {role}
                  {team ? ` • ${team}` : null}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-bold text-success shadow-[inset_0_1px_0_hsl(var(--glass-border)/0.12)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    آنلاین
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary shadow-[inset_0_1px_0_hsl(var(--glass-border)/0.12)]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    امن
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-2 grid gap-1.5">
            <ProfileMenuItem
              icon={User}
              label="مشاهده نمایه"
              description="اطلاعات حساب کاربری"
              onClick={() => navigateTo("/profile")}
            />

            <ProfileMenuItem
              icon={ListTodo}
              label="وظایف من"
              description="پیگیری کارهای در انتظار"
              onClick={() => navigateTo("/tasks")}
            />

            <ProfileMenuItem
              icon={Settings}
              label="تنظیمات حساب"
              description="امنیت، رمز عبور و تنظیمات شخصی"
              onClick={() => navigateTo("/account/settings")}
            />

            <ProfileMenuItem
              icon={Sparkles}
              label="طرح ارتقا"
              description="مدیریت امکانات و سطح دسترسی"
              onClick={() => navigateTo("/pricing")}
              featured
            />
          </div>

          <div className="relative my-2 h-px bg-gradient-to-l from-transparent via-foreground/10 to-transparent" />

          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await logout();
              router.replace("/login");
            }}
            className="relative flex w-full items-center justify-between overflow-hidden rounded-[1.5rem] bg-destructive/10 px-3 py-3 text-sm font-black text-destructive shadow-[inset_0_1px_0_hsl(var(--glass-border)/0.10)] transition-all hover:bg-destructive/15"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-destructive/10 shadow-[inset_0_1px_0_hsl(var(--glass-border)/0.10)]">
                <LogOut className="h-4 w-4" />
              </span>

              از سیستم خارج شوید
            </span>

            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function Avatar({
  name,
  avatarUrl,
  large = false,
}: {
  name: string;
  avatarUrl?: string;
  large?: boolean;
}) {
  const initials = getInitials(name);

  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          "overflow-hidden rounded-2xl bg-muted shadow-[inset_0_1px_0_hsl(var(--glass-border)/0.16),0_10px_24px_hsl(var(--glass-shadow)/0.08)]",
          large ? "h-14 w-14" : "h-10 w-10"
        )}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-black text-primary">
            {initials}
          </div>
        )}
      </div>

      <span
        className={cn(
          "absolute -bottom-0.5 -left-0.5 rounded-full bg-success shadow-[0_0_0_3px_hsl(var(--background)/0.70)]",
          large ? "h-3.5 w-3.5" : "h-3 w-3"
        )}
      />
    </div>
  );
}

function ProfileMenuItem({
  icon: Icon,
  label,
  description,
  onClick,
  featured = false,
}: {
  icon: ElementType;
  label: string;
  description: string;
  onClick: () => void;
  featured?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex w-full items-center justify-between overflow-hidden rounded-[1.5rem] px-3 py-3 text-right transition-all duration-200",
        "shadow-[inset_0_1px_0_hsl(var(--glass-border)/0.10)]",
        "hover:-translate-y-0.5 hover:shadow-[0_14px_34px_hsl(var(--glass-shadow)/0.10),inset_0_1px_0_hsl(var(--glass-border)/0.14)]",
        featured
          ? "bg-primary/10"
          : "bg-background/26 hover:bg-muted/55"
      )}
    >
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <span className="relative flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all shadow-[inset_0_1px_0_hsl(var(--glass-border)/0.10)]",
            featured
              ? "bg-primary text-primary-foreground shadow-[0_12px_28px_hsl(var(--primary)/0.20)]"
              : "bg-background/38 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
          )}
        >
          <Icon className="h-4 w-4" />
        </span>

        <span className="min-w-0">
          <span className="block truncate text-sm font-black text-foreground">
            {label}
          </span>

          <span className="mt-0.5 block truncate text-[11px] leading-5 text-muted-foreground">
            {description}
          </span>
        </span>
      </span>

      <ChevronLeft
        className={cn(
          "relative h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-1",
          featured && "text-primary"
        )}
      />
    </button>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "؟";
  if (parts.length === 1) return parts[0].slice(0, 2);

  return `${parts[0][0]}${parts[parts.length - 1][0]}`;
}