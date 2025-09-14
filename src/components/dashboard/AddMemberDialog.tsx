import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Group } from "@/types/dashboard"

interface AddMemberDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedGroup: Group | null
  onGroupsUpdate: () => void
  setError: (error: string) => void
}

export default function AddMemberDialog({
  isOpen,
  onOpenChange,
  selectedGroup,
  onGroupsUpdate,
  setError
}: AddMemberDialogProps) {
  const [newMemberEmails, setNewMemberEmails] = useState("")

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
        onOpenChange(false)
        onGroupsUpdate()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to add members")
      }
    } catch (error) {
      setError("An error occurred while adding members")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Members</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}