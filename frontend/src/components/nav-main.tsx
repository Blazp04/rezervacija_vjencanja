import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { LucideIcon } from "lucide-react"
import { useWorkspaceNavigate } from "@/workspace/use-workspace-navigate"
import { useWorkspaceStore, useActiveTab } from "@/workspace/store"

interface NavItem {
  title: string
  path: string
  icon: LucideIcon
  closeable?: boolean
}

export function NavMain({ items }: { items: NavItem[] }) {
  const navigate = useWorkspaceNavigate()
  const focusedPanel = useWorkspaceStore((s) => s.focusedPanel)
  const activeTab = useActiveTab(focusedPanel)

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Aplikacija</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon
          const iconName = item.icon.displayName ?? ""
          const isActive = activeTab?.path === item.path
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={isActive}
                size="lg"
                className="h-11 text-[0.95rem] font-medium"
                onClick={() =>
                  navigate({
                    path: item.path,
                    title: item.title,
                    icon: iconName.replace(/Icon$/, ""),
                    closeable: item.closeable,
                  })
                }
              >
                <Icon className="!size-5" />
                <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
