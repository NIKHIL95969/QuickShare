import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ContentItem, Group } from "@/types/dashboard"

interface EditContentDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  item: ContentItem
  groups: Group[]
  onContentUpdate: () => void
  setError: (error: string) => void
}

export default function EditContentDialog({
  isOpen,
  onOpenChange,
  item,
  groups,
  onContentUpdate,
  setError
}: EditContentDialogProps) {
  const [newContent, setNewContent] = useState({
    content: item.content,
    title: item.title || "",
    description: item.description || "",
    tags: item.tags.join(", "),
    isPrivate: item.isPrivate,
    isPasswordProtected: item.isPasswordProtected,
    password: "",
    sharingType: item.sharingType || "public",
    sharedWithGroups: item.sharedWithGroups?.map((g: any) => g.groupId) || []
  })

  const handleUpdateContent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return

    try {
      const response = await fetch(`/api/user/content/${item._id}`, {
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
        onOpenChange(false)
        onContentUpdate()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update content")
      }
    } catch (error) {
      setError("An error occurred while updating content")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Content</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}