"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { type NavItem } from "@/config/navigation";
import { useUIStore } from "@/store/ui-store";
import { useAuthStore } from "@/auth/auth.store";
import {
  filterNavItemsByPermissions,
  resolveActiveNavigation,
} from "@/auth/access-control";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const user = useAuthStore((state) => state.user);

  const { activeTab, setActiveTab, isSubmenuOpen, toggleSubmenu } =
    useUIStore();

  const filteredNavItems = useMemo(
    () => filterNavItemsByPermissions(user),
    [user]
  );

  const activeNavigation = useMemo(
    () => resolveActiveNavigation(pathname, filteredNavItems),
    [pathname, filteredNavItems]
  );

  /**
   * مهم:
   * فقط وقتی pathname تغییر می‌کند، active tab را از route sync می‌کنیم.
   * کلیک روی parent route را عوض نمی‌کند، پس نباید انتخاب کاربر را override کنیم.
   */
 useEffect(() => {
  if (activeNavigation.rootId) {
    setActiveTab(activeNavigation.rootId);
  }

  toggleSubmenu(false);
}, [pathname, activeNavigation.rootId, setActiveTab, toggleSubmenu]);

  const currentTab =
    filteredNavItems.find((item) => item.id === activeTab) ??
    activeNavigation.rootItem ??
    filteredNavItems[0];

  const currentChildren = currentTab?.children ?? [];

  const handleRootClick = (item: NavItem) => {
    setActiveTab(item.id);

    if (item.children?.length) {
      toggleSubmenu(true);
      return;
    }

    toggleSubmenu(false);

    if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <aside className="relative z-50 flex h-screen shrink-0 p-4 pl-0">
      <div className="glass-dock flex w-[5.25rem] flex-col items-center overflow-hidden rounded-[2.25rem] py-4">
        <BrandMark />

        <div className="mt-5 h-px w-10 bg-border/50" />

        <Tooltip.Provider delayDuration={80}>
          <nav className="mt-5 flex flex-1 flex-col items-center gap-2.5 overflow-y-auto px-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab?.id === item.id;

              return (
                <Tooltip.Root key={item.id}>
                  <Tooltip.Trigger asChild>
                    <button
                      type="button"
                      onClick={() => handleRootClick(item)}
                      className={cn(
                        "group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground glass-active-glow"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      )}
                      aria-label={item.title}
                    >
                      {isActive && (
                        <>
                          <span className="absolute -right-3 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-primary" />
                          <span className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 transition group-hover:opacity-100" />
                        </>
                      )}

                      {Icon && <Icon size={22} />}
                    </button>
                  </Tooltip.Trigger>

                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="left"
                      sideOffset={12}
                      className="glass-card-strong z-[100] rounded-xl px-3 py-2 text-xs font-medium text-foreground"
                    >
                      {item.title}
                      <Tooltip.Arrow className="fill-card" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              );
            })}
          </nav>
        </Tooltip.Provider>

        <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/55 text-[10px] font-bold text-muted-foreground">
          v1
        </div>
      </div>

      <AnimatePresence>
        {isSubmenuOpen && currentTab && (
          <motion.aside
            initial={{ width: 0, opacity: 0, x: 18 }}
            animate={{ width: 316, opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: 18 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="overflow-hidden py-0 pr-4"
          >
            <div className="glass-context-panel relative flex h-full w-[316px] flex-col overflow-hidden rounded-[2.25rem]">
              <div className="pointer-events-none absolute -left-14 -top-14 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
              <div className="pointer-events-none absolute bottom-20 right-0 h-32 w-32 rounded-full bg-info/10 blur-3xl" />

              <div className="relative p-5 pb-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                    منوی بخش
                  </span>

                  <span className="status-badge status-badge-muted">
                    {currentChildren.length || (currentTab.href ? 1 : 0)} آیتم
                  </span>
                </div>

                <h2 className="text-2xl font-black tracking-tight text-foreground">
                  {currentTab.title}
                </h2>

                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                  مسیرهای عملیاتی این بخش را از اینجا انتخاب کنید.
                </p>
              </div>

              <div className="relative px-4">
                <div className="h-px bg-gradient-to-l from-transparent via-border/70 to-transparent" />
              </div>

              <nav className="relative flex-1 space-y-2.5 overflow-y-auto p-4">
                {currentChildren.length ? (
                  currentChildren.map((sub) => (
                    <SubmenuLink
                      key={sub.id}
                      item={sub}
                      pathname={pathname}
                    />
                  ))
                ) : currentTab.href ? (
                  <SubmenuLink item={currentTab} pathname={pathname} />
                ) : (
                  <div className="rounded-2xl bg-muted/45 p-4 text-xs leading-6 text-muted-foreground">
                    آیتمی برای نمایش وجود ندارد.
                  </div>
                )}
              </nav>

              <div className="relative p-4 pt-0">
                <div className="rounded-3xl bg-background/28 p-4 shadow-[inset_0_1px_0_hsl(var(--glass-border)/0.10)]">
                  <p className="text-[11px] font-bold text-foreground">
                    ساختار ناوبری
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                    آیکون اصلی فقط منوی بخش را تغییر می‌دهد؛ محتوای صفحه با
                    انتخاب زیرمنو عوض می‌شود.
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </aside>
  );
}

function BrandMark() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-primary text-sm font-black text-primary-foreground shadow-[0_18px_40px_hsl(var(--primary)/0.30)]">
        <span className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        <span className="relative">Nex</span>
      </div>

      <span className="mt-2 text-[10px] font-black tracking-wide text-muted-foreground">
        CMS
      </span>
    </div>
  );
}

function SubmenuLink({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  if (!item.href) return null;

  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center justify-between gap-3 overflow-hidden rounded-3xl px-4 py-4 text-sm font-bold transition-all duration-200",
        isActive
          ? "glass-menu-item-active"
          : "glass-menu-item text-muted-foreground hover:text-foreground"
      )}
    >
      {isActive && (
        <>
          <span className="absolute right-3 top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-white/85" />
          <span className="absolute -left-10 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-white/10 blur-2xl" />
        </>
      )}

      <span className="relative pr-4">{item.title}</span>

      <span
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-2xl transition-all",
          isActive
            ? "bg-white/16 text-primary-foreground"
            : "bg-background/35 text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
        )}
      >
        <ChevronLeft
          size={15}
          className="transition-transform group-hover:-translate-x-0.5"
        />
      </span>
    </Link>
  );
}