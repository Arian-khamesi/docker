import { mockUsers } from "./auth.mock"

export async function login(username: string, password: string) {
  await new Promise((r) => setTimeout(r, 800)) // شبیه‌سازی تاخیر API

  // پیدا کردن کاربر
  const user = mockUsers.find(
    (u) => u.username === username && u.password === password
  )

  // اگر پیدا نشد، خطا بده
  if (!user) {
    throw new Error("نام کاربری یا رمز عبور اشتباه است.")
  }

  // اگر پیدا شد، کاربر را ذخیره کن
  localStorage.setItem("user", JSON.stringify(user))
  return user
}

export async function getSession() {
  await new Promise((r) => setTimeout(r, 400)) // شبیه‌سازی تاخیر API

  const stored = localStorage.getItem("user")
  if (!stored) return null

  return JSON.parse(stored)
}

export async function logout() {
  await new Promise((r) => setTimeout(r, 200)) // شبیه‌سازی تاخیر API

  localStorage.removeItem("user")
}
