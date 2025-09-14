import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import CreateContentDialog from "./CreateContentDialog"
import ContentCard from "./ContentCard"
import { ContentItem, Group } from "@/types/dashboard"

interface ContentManagerProps {
  content: ContentItem[]
  groups: Group[]
  onContentUpdate: () => void
  error: string
  setError: (error: string) => void
}

export default function ContentManager({ 
  content, 
  groups, 
  onContentUpdate, 
  error, 
  setError 
}: ContentManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const handleDeleteContent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return

    try {
      const response = await fetch(`/api/user/content/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onContentUpdate()
      } else {
        setError("Failed to delete content")
      }
    } catch (error) {
      setError("An error occurred while deleting content")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Content</h2>
          <p className="text-muted-foreground">Manage your shared content</p>
        </div>
        <CreateContentDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          groups={groups}
          onContentUpdate={onContentUpdate}
          setError={setError}
        >
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Content
          </Button>
        </CreateContentDialog>
      </div>

      <div className="grid gap-4">
        {content.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No content yet. Create your first content!</p>
          </div>
        ) : (
          content.map((item) => (
            <ContentCard
              key={item._id}
              item={item}
              groups={groups}
              onEdit={onContentUpdate}
              onDelete={handleDeleteContent}
              setError={setError}
            />
          ))
        )}
      </div>
    </div>
  )
}