"use client"

import React from "react"
import Link from "next/link"
import { Permission } from "@/auth/auth.types"
import { hasPermission } from "@/auth/permission"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import * as Tooltip from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "@/config/navigation"
import { useUIStore } from "@/store/ui-store"

export function Sidebar() {
  const pathname = usePathname()
  const { activeTab, setActiveTab, isSubmenuOpen, toggleSubmenu } = useUIStore()
  const filteredNavItems = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission)
  )

  const currentTab = filteredNavItems.find((item) => item.id === activeTab)


  return (
    <div className="flex h-screen">

      {/* Icon bar */}
      <aside className="z-50 flex w-20 flex-col items-center border-l border-border bg-card py-4 gap-4">

        <div className="mb-4 font-bold text-primary">Nex</div>

        <Tooltip.Provider delayDuration={0}>
          {filteredNavItems.map((item) => (
            <Tooltip.Root key={item.id}>
              <Tooltip.Trigger asChild>

                <button
                  onClick={() => {
                    if (activeTab === item.id) {
                      toggleSubmenu()
                    } else {
                      setActiveTab(item.id)
                      toggleSubmenu(true)
                    }
                  }}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon size={24} />
                </button>

              </Tooltip.Trigger>

              <Tooltip.Portal>
                <Tooltip.Content
                  side="left"
                  sideOffset={10}
                  className="z-[100] rounded-md border border-border bg-card px-3 py-1.5 text-sm shadow-md text-foreground"
                >
                  {item.title}
                  <Tooltip.Arrow className="fill-card" />
                </Tooltip.Content>
              </Tooltip.Portal>

            </Tooltip.Root>
          ))}
        </Tooltip.Provider>

      </aside>


      {/* Submenu */}
      <AnimatePresence>
        {isSubmenuOpen && currentTab && (

          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="overflow-hidden border-l border-border bg-background"
          >

            <div className="w-[260px] p-6">

              <h2 className="mb-6 text-lg font-semibold text-foreground">
                {currentTab.title}
              </h2>

              <nav className="space-y-2 flex flex-col">
                {currentTab.children ? (
                  currentTab.children
                    .filter((sub) => !sub.permission || hasPermission(sub.permission))
                    .map((sub) => (
                      <Link key={sub.href} href={sub.href}>
                        {sub.title}
                      </Link>
                    ))
                ) : (
                  currentTab.href && (
                    <Link href={currentTab.href}>
                      {currentTab.title}
                    </Link>
                  )
                )}
              </nav>

            </div>

          </motion.aside>

        )}
      </AnimatePresence>

    </div>
  )
}
