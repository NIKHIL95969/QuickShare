"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Plus, Settings, Trash2, UserPlus } from "lucide-react"
import Link from "next/link"

interface Group {
  _id: string
  name: string
  description?: string
  ownerId: {
    _id: string
    username: string
    email: string
  }
  members: Array<{
    userId: {
      _id: string
      username: string
      email: string
    }
    email: string
    role: string
    joinedAt: string
  }>
  pendingInvitations: Array<{
    email: string
    invitedAt: string
  }>
  settings: {
    isPrivate: boolean
    allowMemberInvites: boolean
    requireApproval: boolean
  }
  createdAt: string
}

export default function GroupsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    memberEmails: ""
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchGroups()
    }
  }, [status, router])

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups")
      if (response.ok) {
        const data = await response.json()
        setGroups(data.groups)
      } else {
        setError("Failed to fetch groups")
      }
    } catch (error) {
      setError("An error occurred while fetching groups")
    } finally {
      setLoading(false)
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
        setIsCreateDialogOpen(false)
        fetchGroups()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create group")
      }
    } catch (error) {
      setError("An error occurred while creating group")
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("Are you sure you want to delete this group?")) return

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchGroups()
      } else {
        setError("Failed to delete group")
      }
    } catch (error) {
      setError("An error occurred while deleting group")
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="w-8 h-8" />
              Groups
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your groups and share content with team members
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>
                  Create a group to share content with multiple users
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
                  <Textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    placeholder="Enter group description (optional)"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Member Emails</label>
                  <Input
                    value={newGroup.memberEmails}
                    onChange={(e) => setNewGroup({ ...newGroup, memberEmails: e.target.value })}
                    placeholder="Enter email addresses separated by commas"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Users with these emails will be invited to join the group
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Group</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
              <Card key={group._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <CardDescription>
                        {group.description || "No description provided"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {group.members.length} members
                      </Badge>
                      {group.pendingInvitations.length > 0 && (
                        <Badge variant="secondary">
                          {group.pendingInvitations.length} pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Created by {group.ownerId.username}</span>
                      <span>{new Date(group.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {group.members.slice(0, 5).map((member, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {member.userId.username}
                        </Badge>
                      ))}
                      {group.members.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{group.members.length - 5} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/groups/${group._id}`}>
                            <Settings className="w-3 h-3 mr-1" />
                            Manage
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/groups/${group._id}/content`}>
                            <Users className="w-3 h-3 mr-1" />
                            Content
                          </Link>
                        </Button>
                      </div>
                      
                      {group.ownerId._id === session?.user?.id && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteGroup(group._id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
