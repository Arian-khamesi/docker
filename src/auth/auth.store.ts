import { create } from "zustand"
import { persist } from "zustand/middleware"
import { User } from "./auth.types"

// فرض می‌کنیم user.permissions یک آرایه از رشته‌هاست
// و auth.service.ts تابع login رو داره که ممکنه خطا بده

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null // ← برای نمایش خطا به کاربر
  isAuthenticated: boolean

  // اکشن‌ها
  setUser: (user: User | null) => void
  login: (credentials: any) => Promise<void> // ← تابع login اضافه شد
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          loading: false,
          isAuthenticated: !!user,
          error: null, // ← وقتی کاربر ست می‌شود، خطا پاک شود
        }),



      login: async (credentials) => {
        console.log("Input received:", credentials);
        console.log("Mock user data:", { username: "your_expected_user", password: "your_expected_password" });
        set({ loading: true, error: null }) // ← ریست کردن خطا و شروع لودینگ
        try {
          // فرض کنید اینجا تابع login از auth.service.ts کال می‌شود
          // const response = await authService.login(credentials)
          // const loggedInUser = response.user

          // --- Mock Login (برای تست) ---
          await new Promise((resolve) => setTimeout(resolve, 1000)) // شبیه سازی تاخیر شبکه

          if (credentials.username === "admin" && credentials.password === "123456") {
            const loggedInUser: User = {
              id: "1",
              username: "admin",
              fullName: "aryaun khamesi",
              avatar: "/assets/avatars/admin1.jpg",
              displayName: "مدیر سیستم",
              team:"IT",
              role: "admin",
              permissions: [
                "dashboard.view",
                "content.view",
                "content.manage",
                "products.view",
                "products.create",
                "products.manage",
                "crm.view",
                "crm.manage",
                "orders.view",
                "orders.manage",
                "inventory.view",
                "inventory.manage",
                "sales_channels.view",
                "campaigns.view",
                "reports.view",
                "analytics.view",
                "workflows.view",],
            }
            set({ user: loggedInUser, loading: false, isAuthenticated: true, error: null })
          } else if (credentials.username === "manager" && credentials.password === "12344321") {
            const loggedInUser: User = {
              id: "2",
              username: "user",
              displayName: "کاربر معمولی",
              role: "user",
              fullName: "aryaun khamesi",
              team:"IT",
              avatar: "/assets/avatars/admin1.jpg",
              permissions: [
                "dashboard.view",
                "content.view",
                "products.view",
                "products.create",
                "crm.view",
                "orders.view",
                "inventory.view",
                "sales_channels.view",
                "campaigns.view",
                "reports.view",],
            }
            set({ user: loggedInUser, loading: false, isAuthenticated: true, error: null })
          } else if (credentials.username === "viewer" && credentials.password === "1234567890") {
            const loggedInUser: User = {
              id: "3",
              username: "viewer",
              displayName: "تماشاگر",
              role: "user",
              fullName: "aryaun khamesi",
              team:"IT",
              avatar: "/assets/avatars/admin1.jpg",
              permissions: [
                "dashboard.view",
                "content.view",
                "products.view",
                "crm.view",
                "orders.view",
                "reports.view",],
            }
            set({ user: loggedInUser, loading: false, isAuthenticated: true, error: null })
          }
          else {
            throw new Error("نام کاربری یا رمز عبور اشتباه است.")
          }
          // --- پایان Mock ---

        } catch (err: any) {
          console.error("Login failed:", err)
          set({
            user: null,
            loading: false,
            isAuthenticated: false,
            error: err.message || "خطایی در ورود رخ داد.", // ← گرفتن پیام خطا
          })
        }
      },

      logout: async () => {
        set({ loading: true })
        try {
          // await authService.logout() // در آینده اینجا API logout را صدا می‌زنیم
          await new Promise((r) => setTimeout(r, 300))
          set({ user: null, loading: false, isAuthenticated: false, error: null }) // ← خطا را هم ریست کن
        } catch (error: any) {
          console.error("Logout failed:", error)
          set({
            user: null,
            loading: false,
            isAuthenticated: false,
            error: error.message || "خطایی در خروج رخ داد.", // ← خطای logout هم ست شود
          })
        }
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: (state) => {
        // وقتی state از localStorage خوانده شد، loading را false کن
        return (state) => {
          if (state) state.loading = false
        }
      },
    }
  )
)
