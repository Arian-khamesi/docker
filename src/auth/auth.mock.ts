import { User } from "./auth.types"

export type MockUser = User & {
  password: string
}

export const mockUsers: MockUser[] = [
  {
    id: "1",
    username: "admin",
    fullName: "aryaun khamesi",
    team:"IT",
    avatar: "/assets/avatars/admin1.jpg",
    password: "123456",
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
      "workflows.view",
    ],
  },
  {
    id: "2",
    username: "manager",
    fullName: "علی رضایی",
    team:"marketing",
    avatar: "/assets/avatars/admin2.png",
    password: "12344321",
    role: "manager",
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
      "reports.view",
    ],
  },
  {
    id: "3",
    username: "viewer",
    fullName: "غزاله گنجی",
    team:"بیکاران",
    avatar: "/assets/avatars/admin3.jpg",
    password: "1234567890",
    role: "viewer",
    permissions: [
      "dashboard.view",
      "content.view",
      "products.view",
      "crm.view",
      "orders.view",
      "reports.view",
    ],
  },
]
