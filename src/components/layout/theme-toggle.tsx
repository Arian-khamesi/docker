"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = window.localStorage.getItem("theme") as ThemeMode | null;
    const initialTheme: ThemeMode =
      savedTheme ?? (root.classList.contains("dark") ? "dark" : "light");

    applyTheme(initialTheme);
    setTheme(initialTheme);
    setMounted(true);
  }, []);

  const handleChange = (nextTheme: ThemeMode) => {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem("theme", nextTheme);
  };

  if (!mounted) {
    return (
      <div className="h-11 w-[5.75rem] rounded-2xl bg-background/35 backdrop-blur-xl" />
    );
  }

  return (
    <div className="glass-menu-item flex h-11 items-center gap-1 rounded-2xl p-1">
      <button
        type="button"
        aria-label="حالت تاریک"
        onClick={() => handleChange("dark")}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
          theme === "dark"
            ? "bg-primary text-primary-foreground shadow-[0_10px_24px_hsl(var(--primary)/0.22)]"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
        )}
      >
        <Moon className="h-4 w-4" />
      </button>

      <button
        type="button"
        aria-label="حالت روشن"
        onClick={() => handleChange("light")}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
          theme === "light"
            ? "bg-primary text-primary-foreground shadow-[0_10px_24px_hsl(var(--primary)/0.22)]"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
        )}
      >
        <Sun className="h-4 w-4" />
      </button>
    </div>
  );
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }
}