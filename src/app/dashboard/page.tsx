"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signOut } from "next-auth/react"
import { 
  Trash2, Edit, Eye, EyeOff, Lock, Unlock, Copy, Share2, 
  Users, Plus, Settings, Mail, UserPlus, MoreVertical,
  FolderOpen, FileText, Shield, Globe, UserCheck, Clock,
  ChevronRight, ChevronDown, Search, Filter
} from "lucide-react"
import Link from "next/link"

interface ContentItem {
  _id: string
  content: string
  title?: string
  description?: string
  tags: string[]
  isPrivate: boolean
  isPasswordProtected: boolean
  fileType: string
  fileName?: string
  temp: boolean
  createdAt: string
  shareableLink?: string
  sharingType?: string
  sharedWithGroups?: Array<{
    groupId: string
    sharedAt: string
    sharedBy: string
  }>
}

interface Group {
  _id: string
  name: string
  description?: string
  ownerId: string
  members: Array<{
    userId: string
    email: string
    role: 'owner' | 'admin' | 'member'
    invitedBy: string
  }>
  pendingInvitations: Array<{
    email: string
    invitedBy: string
    token: string
    expiresAt: Date
  }>
  createdAt: string
  updatedAt: string
}

type DashboardView = 'overview' | 'content' | 'groups' | 'settings'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [content, setContent] = useState<ContentItem[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentView, setCurrentView] = useState<DashboardView>('overview')
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [groupContent, setGroupContent] = useState<ContentItem[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false)
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null)
  const [newContent, setNewContent] = useState({
    content: "",
    title: "",
    description: "",
    tags: "",
    isPrivate: false,
    isPasswordProtected: false,
    password: "",
    sharingType: "public",
    sharedWithGroups: [] as string[]
  })
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    memberEmails: ""
  })
  const [newMemberEmails, setNewMemberEmails] = useState("")

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

  const fetchGroupContent = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/content`)
      if (response.ok) {
        const data = await response.json()
        setGroupContent(data.content)
      } else {
        setError("Failed to fetch group content")
      }
    } catch (error) {
      setError("An error occurred while fetching group content")
    }
  }

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group)
    fetchGroupContent(group._id)
  }

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/sharecontent/createcontent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newContent,
          tags: newContent.tags.split(",").map(tag => tag.trim()).filter(tag => tag)
        }),
      })

      if (response.ok) {
        setNewContent({
          content: "",
          title: "",
          description: "",
          tags: "",
          isPrivate: false,
          isPasswordProtected: false,
          password: "",
          sharingType: "public",
          sharedWithGroups: []
        })
        setIsCreateDialogOpen(false)
        fetchUserContent()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create content")
      }
    } catch (error) {
      setError("An error occurred while creating content")
    }
  }

  const handleDeleteContent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return

    try {
      const response = await fetch(`/api/user/content/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchUserContent()
      } else {
        setError("Failed to delete content")
      }
    } catch (error) {
      setError("An error occurred while deleting content")
    }
  }

  const copyShareableLink = async (content: ContentItem) => {
    const baseUrl = window.location.origin
    const shareableLink = `${baseUrl}/access/${content._id}`
    
    try {
      await navigator.clipboard.writeText(shareableLink)
      alert("Shareable link copied to clipboard!")
    } catch (error) {
      const textArea = document.createElement("textarea")
      textArea.value = shareableLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      alert("Shareable link copied to clipboard!")
    }
  }

  const handleEditContent = (content: ContentItem) => {
    setEditingContent(content)
    setNewContent({
      content: content.content,
      title: content.title || "",
      description: content.description || "",
      tags: content.tags.join(", "),
      isPrivate: content.isPrivate,
      isPasswordProtected: content.isPasswordProtected,
      password: "",
      sharingType: content.sharingType || "public",
      sharedWithGroups: content.sharedWithGroups?.map((g: any) => g.groupId) || []
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateContent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingContent) return

    try {
      const response = await fetch(`/api/user/content/${editingContent._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newContent,
          tags: newContent.tags.split(",").map(tag => tag.trim()).filter(tag => tag)
        }),
      })

      if (response.ok) {
        setEditingContent(null)
        setNewContent({
          content: "",
          title: "",
          description: "",
          tags: "",
          isPrivate: false,
          isPasswordProtected: false,
          password: "",
          sharingType: "public",
          sharedWithGroups: []
        })
        setIsEditDialogOpen(false)
        fetchUserContent()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update content")
      }
    } catch (error) {
      setError("An error occurred while updating content")
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const memberEmails = newGroup.memberEmails
        .split(",")
        .map(email => email.trim())
        .filter(email => email)

      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newGroup,
          memberEmails
        }),
      })

      if (response.ok) {
        setNewGroup({
          name: "",
          description: "",
          memberEmails: ""
        })
        setIsCreateGroupDialogOpen(false)
        fetchGroups()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create group")
      }
    } catch (error) {
      setError("An error occurred while creating group")
    }
  }

  const handleAddMembers = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGroup) return

    try {
      const emails = newMemberEmails
        .split(",")
        .map(email => email.trim())
        .filter(email => email)

      const response = await fetch(`/api/groups/${selectedGroup._id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emails }),
      })

      if (response.ok) {
        setNewMemberEmails("")
        setIsAddMemberDialogOpen(false)
        fetchGroups()
        if (selectedGroup) {
          handleGroupSelect(selectedGroup)
        }
      } else {
        const data = await response.json()
        setError(data.error || "Failed to add members")
      }
    } catch (error) {
      setError("An error occurred while adding members")
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

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: FolderOpen },
    { id: 'content', label: 'My Content', icon: FileText },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{content.length}</div>
            <p className="text-xs text-muted-foreground">Content items created</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groups.length}</div>
            <p className="text-xs text-muted-foreground">Groups joined</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{content.filter(c => new Date(c.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Content</CardTitle>
            <CardDescription>Your latest content items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {content.slice(0, 3).map((item) => (
                <div key={item._id} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{item.title || "Untitled"}</p>
                    <p className="text-sm text-muted-foreground">{item.content.substring(0, 50)}...</p>
                  </div>
                  <Badge variant="outline">{item.sharingType}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Groups</CardTitle>
            <CardDescription>Groups you're part of</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {groups.slice(0, 3).map((group) => (
                <div key={group._id} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{group.name}</p>
                    <p className="text-sm text-muted-foreground">{group.members.length} members</p>
                  </div>
                  <Badge variant="outline">{group.members.find(m => m.userId === session?.user?.id)?.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Content</h2>
          <p className="text-muted-foreground">Manage your shared content</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Content</DialogTitle>
              <DialogDescription>
                Share your content with the world or keep it private
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateContent} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newContent.title}
                  onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                  placeholder="Enter a title (optional)"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={newContent.content}
                  onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
                  placeholder="Enter your content"
                  rows={6}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={newContent.description}
                  onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                  placeholder="Enter a description (optional)"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  value={newContent.tags}
                  onChange={(e) => setNewContent({ ...newContent, tags: e.target.value })}
                  placeholder="Enter tags separated by commas"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Sharing Type</label>
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="sharingType"
                        value="public"
                        checked={newContent.sharingType === "public"}
                        onChange={(e) => setNewContent({ ...newContent, sharingType: e.target.value })}
                      />
                      <span className="text-sm">Public</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="sharingType"
                        value="private"
                        checked={newContent.sharingType === "private"}
                        onChange={(e) => setNewContent({ ...newContent, sharingType: e.target.value })}
                      />
                      <span className="text-sm">Private</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="sharingType"
                        value="password"
                        checked={newContent.sharingType === "password"}
                        onChange={(e) => setNewContent({ ...newContent, sharingType: e.target.value })}
                      />
                      <span className="text-sm">Password Protected</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="sharingType"
                        value="group"
                        checked={newContent.sharingType === "group"}
                        onChange={(e) => setNewContent({ ...newContent, sharingType: e.target.value })}
                      />
                      <span className="text-sm">Group Sharing</span>
                    </label>
                  </div>
                </div>

                {newContent.sharingType === "group" && (
                  <div>
                    <label className="text-sm font-medium">Select Groups</label>
                    <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                      {groups.map((group: any) => (
                        <label key={group._id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newContent.sharedWithGroups.includes(group._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewContent({
                                  ...newContent,
                                  sharedWithGroups: [...newContent.sharedWithGroups, group._id]
                                })
                              } else {
                                setNewContent({
                                  ...newContent,
                                  sharedWithGroups: newContent.sharedWithGroups.filter(id => id !== group._id)
                                })
                              }
                            }}
                          />
                          <span className="text-sm">{group.name}</span>
                          <span className="text-xs text-gray-500">({group.members.length} members)</span>
                        </label>
                      ))}
                    </div>
                    {groups.length === 0 && (
                      <p className="text-sm text-gray-500">
                        No groups available. <Link href="/groups" className="text-blue-500 hover:underline">Create a group</Link> first.
                      </p>
                    )}
                  </div>
                )}

                {newContent.sharingType === "password" && (
                  <div>
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      type="password"
                      value={newContent.password}
                      onChange={(e) => setNewContent({ ...newContent, password: e.target.value })}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Content</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {content.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No content yet. Create your first content!</p>
            </CardContent>
          </Card>
        ) : (
          content.map((item) => (
            <Card key={item._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {item.title || "Untitled"}
                    </CardTitle>
                    <CardDescription>
                      {item.description || item.content.substring(0, 100) + "..."}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.isPrivate && <Badge variant="secondary"><EyeOff className="w-3 h-3 mr-1" />Private</Badge>}
                    {item.isPasswordProtected && <Badge variant="secondary"><Lock className="w-3 h-3 mr-1" />Protected</Badge>}
                    {item.temp && <Badge variant="outline">Temporary</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.content.substring(0, 200)}
                    {item.content.length > 200 && "..."}
                  </p>
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditContent(item)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteContent(item._id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    
                    {/* Shareable Link Section */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-2">
                          <p className="text-xs text-gray-500 mb-1">Shareable Link:</p>
                          <p className="text-xs font-mono text-blue-600 dark:text-blue-400 break-all">
                            {`${window.location.origin}/access/${item._id}`}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyShareableLink(item)}
                          className="shrink-0"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      {item.isPasswordProtected && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          🔒 Recipients will need the password to access this content
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )

  const renderGroups = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Groups</h2>
          <p className="text-muted-foreground">Manage your groups and members</p>
        </div>
        <Dialog open={isCreateGroupDialogOpen} onOpenChange={setIsCreateGroupDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>
                Create a group to share content with specific people
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Group Name</label>
                <Input
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="Enter group name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Enter group description (optional)"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Member Emails (comma-separated)</label>
                <Textarea
                  value={newGroup.memberEmails}
                  onChange={(e) => setNewGroup({ ...newGroup, memberEmails: e.target.value })}
                  placeholder="Enter email addresses separated by commas"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateGroupDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Group</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {groups.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No groups yet. Create your first group!</p>
            </CardContent>
          </Card>
        ) : (
          groups.map((group) => (
            <Card key={group._id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader onClick={() => handleGroupSelect(group)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {group.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {group.description || "No description provided"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {group.members.length} members
                    </Badge>
                    <Badge variant="secondary">
                      {group.members.find(m => m.userId === session?.user?.id)?.role}
                    </Badge>
                    {group.pendingInvitations.length > 0 && (
                      <Badge variant="outline" className="text-orange-600">
                        {group.pendingInvitations.length} pending
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Created {new Date(group.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedGroup(group)
                          setIsAddMemberDialogOpen(true)
                        }}
                      >
                        <UserPlus className="w-3 h-3 mr-1" />
                        Add Members
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleGroupSelect(group)
                        }}
                      >
                        <FolderOpen className="w-3 h-3 mr-1" />
                        View Content
                      </Button>
                    </div>
                  </div>
                  
                  {/* Members List */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Members</h4>
                    <div className="flex flex-wrap gap-2">
                      {group.members.slice(0, 5).map((member, index) => (
                        <div key={index} className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                          <UserCheck className="w-3 h-3" />
                          <span className="text-xs">{member.email}</span>
                          <Badge variant="outline" className="text-xs">{member.role}</Badge>
                        </div>
                      ))}
                      {group.members.length > 5 && (
                        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                          <span className="text-xs">+{group.members.length - 5} more</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pending Invitations */}
                  {group.pendingInvitations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-orange-600">Pending Invitations</h4>
                      <div className="flex flex-wrap gap-2">
                        {group.pendingInvitations.map((invitation, index) => (
                          <div key={index} className="flex items-center space-x-1 bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded-full">
                            <Mail className="w-3 h-3" />
                            <span className="text-xs">{invitation.email}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Group Content View */}
      {selectedGroup && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  {selectedGroup.name} - Content
                </CardTitle>
                <CardDescription>
                  Content shared with this group
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setSelectedGroup(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {groupContent.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No content shared with this group yet.</p>
                </div>
              ) : (
                groupContent.map((item) => (
                  <div key={item._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{item.title || "Untitled"}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.description || item.content.substring(0, 100) + "..."}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.isPrivate && <Badge variant="secondary"><EyeOff className="w-3 h-3 mr-1" />Private</Badge>}
                        {item.isPasswordProtected && <Badge variant="secondary"><Lock className="w-3 h-3 mr-1" />Protected</Badge>}
                        <Badge variant="outline">{item.sharingType}</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/access/${item._id}`}>
                          View Content
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white h-[100vh] dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h1 className="text-xl font-bold">QuikShare</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back, {session?.user?.username}!
            </p>
          </div>
          <nav className="px-4 pb-4">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as DashboardView)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentView === item.id
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
          <div className="px-4 pb-4">
            <Button 
              variant="outline" 
              onClick={() => signOut()}
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-8">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {currentView === 'overview' && renderOverview()}
            {currentView === 'content' && renderContent()}
            {currentView === 'groups' && renderGroups()}
            {currentView === 'settings' && (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Settings coming soon!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Members to {selectedGroup?.name}</DialogTitle>
            <DialogDescription>
              Add new members to this group by entering their email addresses
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMembers} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email Addresses (comma-separated)</label>
              <Textarea
                value={newMemberEmails}
                onChange={(e) => setNewMemberEmails(e.target.value)}
                placeholder="Enter email addresses separated by commas"
                rows={3}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Members</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Content Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>
              Update your content settings
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateContent} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newContent.title}
                onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                placeholder="Enter a title (optional)"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={newContent.content}
                onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
                placeholder="Enter your content"
                rows={6}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={newContent.description}
                onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                placeholder="Enter a description (optional)"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                value={newContent.tags}
                onChange={(e) => setNewContent({ ...newContent, tags: e.target.value })}
                placeholder="Enter tags separated by commas"
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Sharing Type</label>
                <div className="flex space-x-4 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="sharingType"
                      value="public"
                      checked={newContent.sharingType === "public"}
                      onChange={(e) => setNewContent({ ...newContent, sharingType: e.target.value })}
                    />
                    <span className="text-sm">Public</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="sharingType"
                      value="private"
                      checked={newContent.sharingType === "private"}
                      onChange={(e) => setNewContent({ ...newContent, sharingType: e.target.value })}
                    />
                    <span className="text-sm">Private</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="sharingType"
                      value="password"
                      checked={newContent.sharingType === "password"}
                      onChange={(e) => setNewContent({ ...newContent, sharingType: e.target.value })}
                    />
                    <span className="text-sm">Password Protected</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="sharingType"
                      value="group"
                      checked={newContent.sharingType === "group"}
                      onChange={(e) => setNewContent({ ...newContent, sharingType: e.target.value })}
                    />
                    <span className="text-sm">Group Sharing</span>
                  </label>
                </div>
              </div>

              {newContent.sharingType === "group" && (
                <div>
                  <label className="text-sm font-medium">Select Groups</label>
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                    {groups.map((group: any) => (
                      <label key={group._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newContent.sharedWithGroups.includes(group._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewContent({
                                ...newContent,
                                sharedWithGroups: [...newContent.sharedWithGroups, group._id]
                              })
                            } else {
                              setNewContent({
                                ...newContent,
                                sharedWithGroups: newContent.sharedWithGroups.filter(id => id !== group._id)
                              })
                            }
                          }}
                        />
                        <span className="text-sm">{group.name}</span>
                        <span className="text-xs text-gray-500">({group.members.length} members)</span>
                      </label>
                    ))}
                  </div>
                  {groups.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No groups available. <Link href="/groups" className="text-blue-500 hover:underline">Create a group</Link> first.
                    </p>
                  )}
                </div>
              )}

              {newContent.sharingType === "password" && (
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    value={newContent.password}
                    onChange={(e) => setNewContent({ ...newContent, password: e.target.value })}
                    placeholder="Enter password"
                    required
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Content</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
