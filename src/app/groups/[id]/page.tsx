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
import { Users, Plus, Trash2, UserPlus, Settings, Crown } from "lucide-react"
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
    invitedBy: {
      _id: string
      username: string
    }
  }>
  pendingInvitations: Array<{
    email: string
    invitedAt: string
    invitedBy: {
      _id: string
      username: string
    }
  }>
  settings: {
    isPrivate: boolean
    allowMemberInvites: boolean
    requireApproval: boolean
  }
  createdAt: string
}

export default function GroupManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)
  const [newMemberEmails, setNewMemberEmails] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: "",
    description: ""
  })

  // Get group ID from URL
  const groupId = typeof window !== 'undefined' ? window.location.pathname.split('/')[2] : ''

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && groupId) {
      fetchGroup()
    }
  }, [status, router, groupId])

  const fetchGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}`)
      if (response.ok) {
        const data = await response.json()
        setGroup(data.group)
        setEditData({
          name: data.group.name,
          description: data.group.description || ""
        })
      } else {
        setError("Failed to fetch group")
      }
    } catch (error) {
      setError("An error occurred while fetching group")
    } finally {
      setLoading(false)
    }
  }

  const handleAddMembers = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const emails = newMemberEmails
        .split(",")
        .map(email => email.trim())
        .filter(email => email)

      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emails }),
      })

      if (response.ok) {
        setNewMemberEmails("")
        setIsAddMemberDialogOpen(false)
        fetchGroup()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to add members")
      }
    } catch (error) {
      setError("An error occurred while adding members")
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return

    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId }),
      })

      if (response.ok) {
        fetchGroup()
      } else {
        setError("Failed to remove member")
      }
    } catch (error) {
      setError("An error occurred while removing member")
    }
  }

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      })

      if (response.ok) {
        setIsEditing(false)
        fetchGroup()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update group")
      }
    } catch (error) {
      setError("An error occurred while updating group")
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (status === "unauthenticated" || !group) {
    return null
  }

  const isOwner = group.ownerId._id === session?.user?.id

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="w-8 h-8" />
              {group.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {group.description || "No description provided"}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href="/groups">
                ← Back to Groups
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/groups/${groupId}/content`}>
                View Content
              </Link>
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          {/* Group Info */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Group Information</CardTitle>
                {isOwner && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleUpdateGroup} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Group Name</label>
                    <Input
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2">
                  <p><strong>Owner:</strong> {group.ownerId.username}</p>
                  <p><strong>Created:</strong> {new Date(group.createdAt).toLocaleDateString()}</p>
                  <p><strong>Members:</strong> {group.members.length}</p>
                  <p><strong>Pending Invitations:</strong> {group.pendingInvitations.length}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Members */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Members ({group.members.length})</CardTitle>
                <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Members
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Members</DialogTitle>
                      <DialogDescription>
                        Enter email addresses separated by commas
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddMembers} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Email Addresses</label>
                        <Input
                          value={newMemberEmails}
                          onChange={(e) => setNewMemberEmails(e.target.value)}
                          placeholder="user1@example.com, user2@example.com"
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
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {group.members.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        {member.userId.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{member.userId.username}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        <p className="text-xs text-gray-400">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {member.role === "admin" && (
                        <Badge variant="secondary">
                          <Crown className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      {isOwner && member.userId._id !== session?.user?.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveMember(member.userId._id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Invitations */}
          {group.pendingInvitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations ({group.pendingInvitations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {group.pendingInvitations.map((invitation, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-gray-500">
                          Invited by {invitation.invitedBy.username} on {new Date(invitation.invitedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
