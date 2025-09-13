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
import { Trash2, Edit, Eye, EyeOff, Lock, Unlock, Copy, Share2 } from "lucide-react"

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
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newContent, setNewContent] = useState({
    content: "",
    title: "",
    description: "",
    tags: "",
    isPrivate: false,
    isPasswordProtected: false,
    password: ""
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchUserContent()
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
          password: ""
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
      // You could add a toast notification here
      alert("Shareable link copied to clipboard!")
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = shareableLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      alert("Shareable link copied to clipboard!")
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
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {session?.user?.username}!
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>Create Content</Button>
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
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newContent.isPrivate}
                        onChange={(e) => setNewContent({ ...newContent, isPrivate: e.target.checked })}
                      />
                      <span className="text-sm">Private</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newContent.isPasswordProtected}
                        onChange={(e) => setNewContent({ ...newContent, isPasswordProtected: e.target.checked })}
                      />
                      <span className="text-sm">Password Protected</span>
                    </label>
                  </div>
                  {newContent.isPasswordProtected && (
                    <div>
                      <label className="text-sm font-medium">Password</label>
                      <Input
                        type="password"
                        value={newContent.password}
                        onChange={(e) => setNewContent({ ...newContent, password: e.target.value })}
                        placeholder="Enter password"
                        required={newContent.isPasswordProtected}
                      />
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Content</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
                          <Button size="sm" variant="outline">
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
    </div>
  )
}
