"use client"

import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { 
  FolderOpen, 
  FileText, 
  Users, 
  Settings,
  LogOut
} from "lucide-react"
import { DashboardView } from "@/types/dashboard"

interface AppSidebarProps {
  currentView: DashboardView
  setCurrentView: (view: DashboardView) => void
  username: string
  onSignOut: () => void
}

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: FolderOpen },
  { id: 'content', label: 'My Content', icon: FileText },
  { id: 'groups', label: 'Groups', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function AppSidebar({ currentView, setCurrentView, username, onSignOut }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-6">
            <div>
              <h1 className="text-xl font-bold">QuikShare</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome back, {username}!
              </p>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={currentView === item.id}
                    onClick={() => setCurrentView(item.id as DashboardView)}
                    className="flex items-center"
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onSignOut}
                  className="flex items-center text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default function DashboardSidebarProvider({ 
  currentView, 
  setCurrentView, 
  username, 
  onSignOut,
  children 
}: { 
  currentView: DashboardView
  setCurrentView: (view: DashboardView) => void
  username: string
  onSignOut: () => void
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        username={username} 
        onSignOut={onSignOut} 
      />
      {children}
    </SidebarProvider>
  )
}