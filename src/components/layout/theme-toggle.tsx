"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { IconButton } from "@/components/ui/icon-button"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const root = document.documentElement
    const prefersDark = root.classList.contains("dark")
    setIsDark(prefersDark)
  }, [])

  const toggleTheme = () => {
    const root = document.documentElement
    const next = !isDark
    setIsDark(next)
    if (next) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }

  return (
    <div className="flex items-center gap-1 rounded-full bg-muted px-1 py-0.5">
      <IconButton
        onClick={toggleTheme}
        className={isDark ? "bg-background shadow-sm" : "opacity-60"}
      >
        <Moon className="h-4 w-4" />
      </IconButton>
      <IconButton
        onClick={toggleTheme}
        className={!isDark ? "bg-background shadow-sm" : "opacity-60"}
      >
        <Sun className="h-4 w-4" />
      </IconButton>
    </div>
  )
}
