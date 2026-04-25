import {
  LayoutDashboardIcon,
  HeartIcon,
  UsersIcon,
  CalendarIcon,
  FileTextIcon,
  SettingsIcon,
  type LucideIcon,
} from "lucide-react"
import type { ComponentType } from "react"
import DashboardScreen from "./screens/dashboard-screen"
import WeddingsListScreen from "./screens/weddings-list-screen"
import WeddingDetailScreen from "./screens/wedding-detail-screen"
import PartnersListScreen from "./screens/partners-list-screen"
import CalendarScreen from "./screens/calendar-screen"
import ReportsScreen from "./screens/reports-screen"
import SettingsScreen from "./screens/settings-screen"
import NotFoundScreen from "./screens/not-found-screen"

export interface ScreenRoute {
  pattern: RegExp
  title: string | ((params: Record<string, string>) => string)
  icon: LucideIcon
  Component: ComponentType<{ params: Record<string, string> }>
}

// Static routes
export const screens: ScreenRoute[] = [
  {
    pattern: /^\/dashboard$/,
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    Component: DashboardScreen,
  },
  {
    pattern: /^\/weddings$/,
    title: "Vjenčanja",
    icon: HeartIcon,
    Component: WeddingsListScreen,
  },
  {
    pattern: /^\/weddings\/(?<id>[^/]+)$/,
    title: (p) => `Vjenčanje #${p.id}`,
    icon: HeartIcon,
    Component: WeddingDetailScreen,
  },
  {
    pattern: /^\/partners$/,
    title: "Partneri",
    icon: UsersIcon,
    Component: PartnersListScreen,
  },
  {
    pattern: /^\/calendar$/,
    title: "Kalendar",
    icon: CalendarIcon,
    Component: CalendarScreen,
  },
  {
    pattern: /^\/reports$/,
    title: "Izvještaji",
    icon: FileTextIcon,
    Component: ReportsScreen,
  },
  {
    pattern: /^\/settings$/,
    title: "Postavke",
    icon: SettingsIcon,
    Component: SettingsScreen,
  },
]

export interface ResolvedScreen {
  Component: ComponentType<{ params: Record<string, string> }>
  params: Record<string, string>
  title: string
  icon: LucideIcon
}

export function resolveScreen(path: string): ResolvedScreen | null {
  for (const route of screens) {
    const match = path.match(route.pattern)
    if (match) {
      const params = (match.groups ?? {}) as Record<string, string>
      const title = typeof route.title === "function" ? route.title(params) : route.title
      return { Component: route.Component, params, title, icon: route.icon }
    }
  }
  return null
}

export function NotFoundFallback() {
  return <NotFoundScreen />
}

// Sidebar nav items (paths must match a screen pattern)
export const navItems: Array<{
  title: string
  path: string
  icon: LucideIcon
  closeable?: boolean
}> = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Vjenčanja", path: "/weddings", icon: HeartIcon },
  { title: "Partneri", path: "/partners", icon: UsersIcon },
  { title: "Kalendar", path: "/calendar", icon: CalendarIcon },
  { title: "Izvještaji", path: "/reports", icon: FileTextIcon },
  { title: "Postavke", path: "/settings", icon: SettingsIcon },
]
