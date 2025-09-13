"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Calendar, Tag, Lock, Eye, EyeOff } from "lucide-react"
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
  userId: {
    _id: string
    username: string
    email: string
  }
  sharedWithGroups: Array<{
    groupId: string
    sharedAt: string
    sharedBy: {
      _id: string
      username: string
    }
  }>
  sharingType: string
}

export default function GroupContentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [groupName, setGroupName] = useState("")

  // Get group ID from URL
  const groupId = typeof window !== 'undefined' ? window.location.pathname.split('/')[2] : ''

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && groupId) {
      fetchGroupContent()
    }
  }, [status, router, groupId])

  const fetchGroupContent = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/content`)
      if (response.ok) {
        const data = await response.json()
        setContent(data.content)
      } else {
        setError("Failed to fetch group content")
      }
    } catch (error) {
      setError("An error occurred while fetching group content")
    } finally {
      setLoading(false)
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
              Group Content
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Content shared with this group
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/groups/${groupId}`}>
                ← Back to Group
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">
                Create Content
              </Link>
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
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No content shared with this group yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Group members can share content by selecting this group when creating content.
                </p>
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
                      {item.isPrivate && (
                        <Badge variant="secondary">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Private
                        </Badge>
                      )}
                      {item.isPasswordProtected && (
                        <Badge variant="secondary">
                          <Lock className="w-3 h-3 mr-1" />
                          Protected
                        </Badge>
                      )}
                      {item.temp && (
                        <Badge variant="outline">Temporary</Badge>
                      )}
                      <Badge variant="outline">
                        {item.sharingType}
                      </Badge>
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
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          Shared by {item.userId.username}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        {item.isPasswordProtected ? (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/access/${item._id}`}>
                              View with Password
                            </Link>
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/access/${item._id}`}>
                              View Content
                            </Link>
                          </Button>
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
