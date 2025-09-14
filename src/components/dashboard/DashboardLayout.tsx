"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { signOut } from "next-auth/react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import DashboardSidebarProvider from "./Sidebar"
import Overview from "./Overview"
import ContentManager from "./ContentManager"
import GroupsManager from "./GroupsManager"
import { DashboardView, ContentItem, Group } from "@/types/dashboard"
import { Settings } from "lucide-react"

export default function DashboardLayout() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [content, setContent] = useState<ContentItem[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentView, setCurrentView] = useState<DashboardView>('overview')

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchUserContent()
      fetchGroups()
    }
  }, [status, router])

  const fetchUserContent = async () => {
    try {
      const response = await fetch("/api/user/content")
      if (response.ok) {
        const data = await response.json()
        setContent(data.content)
      } else {
        setError("Failed to fetch content")
      }
    } catch (error) {
      setError("An error occurred while fetching content")
    } finally {
      setLoading(false)
    }
  }

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups")
      if (response.ok) {
        const data = await response.json()
        setGroups(data.groups)
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  const getBreadcrumbTitle = () => {
    switch (currentView) {
      case 'overview': return 'Dashboard Overview'
      case 'content': return 'My Content'
      case 'groups': return 'Groups'
      case 'settings': return 'Settings'
      default: return 'Dashboard'
    }
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return <Overview content={content} groups={groups} session={session} />
      case 'content':
        return (
          <ContentManager 
            content={content} 
            groups={groups}
            onContentUpdate={fetchUserContent}
            error={error}
            setError={setError}
          />
        )
      case 'groups':
        return (
          <GroupsManager 
            groups={groups}
            onGroupsUpdate={fetchGroups}
            error={error}
            setError={setError}
          />
        )
      case 'settings':
        return (
          <div className="text-center py-8">
            <Settings className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Settings coming soon!</p>
          </div>
        )
      default:
        return <Overview content={content} groups={groups} session={session} />
    }
  }

  return (
    <DashboardSidebarProvider
      currentView={currentView}
      setCurrentView={setCurrentView}
      username={session?.user?.username || ''}
      onSignOut={signOut}
    >
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{getBreadcrumbTitle()}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex-1 p-4 pt-0">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {renderCurrentView()}
        </div>
      </SidebarInset>
    </DashboardSidebarProvider>
  )
}