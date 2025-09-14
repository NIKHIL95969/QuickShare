import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Copy, EyeOff, Lock } from "lucide-react"
import EditContentDialog from "./EditContentDialog"
import { ContentItem, Group } from "@/types/dashboard"

interface ContentCardProps {
  item: ContentItem
  groups: Group[]
  onEdit: () => void
  onDelete: (id: string) => void
  setError: (error: string) => void
}

export default function ContentCard({ item, groups, onEdit, onDelete, setError }: ContentCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

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

  return (
    <>
      <Card>
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
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onDelete(item._id)}
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

      <EditContentDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        item={item}
        groups={groups}
        onContentUpdate={onEdit}
        setError={setError}
      />
    </>
  )
}