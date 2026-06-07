export type Role = "admin" | "manager" | "support" | "viewer"

export type Module =
  | "dashboard"
  | "content"
  | "products"
  | "crm"
  | "orders"
  | "inventory"
  | "sales_channels"
  | "campaigns"
  | "reports"
  | "analytics"
  | "workflows"
  | "settings"
  | "security"        // ← اضافه شد مطابق navigation جدید

export type Action =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "manage"
  | "settings"
  | "export"
  | "advanced"

export type Permission = `${Module}.${Action}`

export interface User {
  id: string
  username: string
  fullName: string
  team:string
  avatar?: string
  role: Role
  permissions: Permission[]
}

export interface AuthSession {
  user: User | null
  isAuthenticated: boolean
}
