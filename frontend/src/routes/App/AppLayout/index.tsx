import { useEffect } from "react"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { WorkspaceShell } from "@/routes/App/AppLayout/WorkspaceShell"
import { useWorkspaceStore } from "@/services/store"
import { useWorkspaceNavigate } from "@/routes/App/AppLayout/useWorkspaceNavigate"

// Auth disabled — mock user for sidebar
const MOCK_USER = { name: "Test korisnik", email: "test@rezervacija.local" }

export default function AdminLayout() {
  const tabsCount = useWorkspaceStore((s) => s.tabs.length)
  const navigate = useWorkspaceNavigate()

  // Auto-open Dashboard whenever the workspace becomes empty.
  // Dashboard is closeable by itself, but never disappears entirely —
  // the moment the last tab is gone, it pops back as the only tab.
  useEffect(() => {
    if (tabsCount === 0) {
      navigate({
        path: "/dashboard",
        title: "Dashboard",
        icon: "LayoutDashboard",
      })
    }
  }, [tabsCount, navigate])

  return (
    <SidebarProvider>
      <AppSidebar user={MOCK_USER} />
      <SidebarInset className="flex flex-col h-svh">
        <WorkspaceShell />
      </SidebarInset>
    </SidebarProvider>
  )
}
