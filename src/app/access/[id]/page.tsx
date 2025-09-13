"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Lock, Eye, Calendar, Tag } from "lucide-react"

interface ContentData {
  id: string
  title?: string
  description?: string
  content: string
  fileType: string
  fileName?: string
  tags: string[]
  createdAt: string
  isPrivate: boolean
  isPasswordProtected: boolean
}

export default function AccessContentPage() {
  const params = useParams()
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [content, setContent] = useState<ContentData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isPasswordRequired, setIsPasswordRequired] = useState(false)

  const contentId = params.id as string

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/sharecontent/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentId,
          password: password || undefined
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setContent(data.content)
        setIsPasswordRequired(false)
      } else {
        if (response.status === 401 && data.error.includes("Password")) {
          setIsPasswordRequired(true)
          setError(data.error)
        } else {
          setError(data.error)
        }
      }
    } catch (error) {
      setError("An error occurred while accessing the content")
    } finally {
      setLoading(false)
    }
  }

  // Try to access content without password first
  useEffect(() => {
    if (contentId) {
      handleAccess(new Event('submit') as any)
    }
  }, [contentId])

  if (content) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {content.isPasswordProtected && <Lock className="w-6 h-6" />}
                    {content.title || "Shared Content"}
                  </CardTitle>
                  {content.description && (
                    <CardDescription className="mt-2">
                      {content.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  {content.isPrivate && (
                    <Badge variant="secondary">
                      <Eye className="w-3 h-3 mr-1" />
                      Private
                    </Badge>
                  )}
                  {content.isPasswordProtected && (
                    <Badge variant="secondary">
                      <Lock className="w-3 h-3 mr-1" />
                      Protected
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {content.content}
                  </pre>
                </div>
                
                {content.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <Tag className="w-4 h-4 mt-1" />
                    {content.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  Shared on {new Date(content.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Access Shared Content</CardTitle>
          <CardDescription className="text-center">
            {isPasswordRequired 
              ? "This content is password protected. Please enter the password to view it."
              : "Loading content..."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPasswordRequired && (
            <form onSubmit={handleAccess} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Accessing..." : "Access Content"}
              </Button>
            </form>
          )}
          
          {!isPasswordRequired && !error && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading content...</p>
            </div>
          )}
          
          {error && !isPasswordRequired && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
