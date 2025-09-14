import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface CreateGroupDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onGroupsUpdate: () => void
  setError: (error: string) => void
  children: React.ReactNode
}

export default function CreateGroupDialog({
  isOpen,
  onOpenChange,
  onGroupsUpdate,
  setError,
  children
}: CreateGroupDialogProps) {
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    memberEmails: ""
  })

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
        onOpenChange(false)
        onGroupsUpdate()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create group")
      }
    } catch (error) {
      setError("An error occurred while creating group")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Group</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}