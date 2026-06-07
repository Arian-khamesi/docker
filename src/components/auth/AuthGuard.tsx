"use client"

import { useAuthStore } from "@/auth/auth.store"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { getRoutePermission } from "@/config/route-permissions"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const { user, loading } = useAuthStore()

  useEffect(() => {
    if (loading) return

    // مسیرهای عمومی
    if (pathname === "/login" || pathname === "/403") return

    // کاربر لاگین نکرده
    if (!user) {
      router.replace("/login")
      return
    }

    // چک permission
    const requiredPermission = getRoutePermission(pathname)

    if (requiredPermission && !user.permissions.includes(requiredPermission)) {
      router.replace("/403")
    }
  }, [loading, user, pathname, router])

  if (loading) return null

  return <>{children}</>
}
