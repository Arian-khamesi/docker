"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

// --- اصلاحات لازم ---
import { useAuthStore } from "@/auth/auth.store" // Import store
// import { login } from "@/auth/auth.service" // این دیگر لازم نیست چون از store کال می‌کنیم

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Eye, EyeOff } from "lucide-react"

// --- schema برای validation ---
const schema = z.object({
  username: z.string().min(3, "نام کاربری معتبر نیست"),
  password: z.string().min(6, "رمز عبور حداقل ۶ کاراکتر باشد"),
})

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  // --- استفاده از Zustand Store ---
  const { login, loading, error, user } = useAuthStore()

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  // اگر کاربر از قبل لاگین باشد، او را به داشبورد بفرست
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  // --- تابع onSubmit که login را از store صدا می‌زند ---
  async function onSubmit(values: z.infer<typeof schema>) {
    // setLoading و setError از state محلی حذف شده‌اند، چون از store می‌گیریم
    await login(values) // ← استفاده از تابع login از store
    // بعد از login، اگر موفق بود، redirect اتوماتیک انجام می‌شود (توسط store)
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-[#f7f9ff] to-[#eef1ff]">
      <div className="flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md border-border bg-card shadow-sm">
          <CardHeader className="text-center space-y-2">
            {/* Logo Placeholder */}
            <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
              N
            </div>
            <CardTitle>به NexLink خوش آمدید</CardTitle>
            <CardDescription>برای دسترسی به داشبورد وارد حساب خود شوید.</CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نام کاربری</FormLabel>
                      <FormControl>
                        <Input placeholder="user123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رمز عبور</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* --- نمایش خطا از store --- */}
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "در حال ورود..." : "ورود"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* --- بخش عکس سمت راست --- */}
      <div className="hidden lg:flex items-center justify-center p-10 bg-center bg-no-repeat bg-contain"
           style={{ backgroundImage: "url('/assets/login-illustration.png')" }}> {/* ← عکس را اینجا قرار بده */}
      </div>
    </div>
  )
}
