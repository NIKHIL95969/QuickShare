import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Users, Mail, UserCheck, UserPlus, FolderOpen } from "lucide-react"
import CreateGroupDialog from "./CreateGroupDialog"
import AddMemberDialog from "./AddMemberDialog"
import { Group } from "@/types/dashboard"
import { useSession } from "next-auth/react"

interface GroupsManagerProps {
  groups: Group[]
  onGroupsUpdate: () => void
  error: string
  setError: (error: string) => void
}

export default function GroupsManager({ groups, onGroupsUpdate, error, setError }: GroupsManagerProps) {
  const { data: session } = useSession()
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false)
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Groups</h2>
          <p className="text-muted-foreground">Manage your groups and members</p>
        </div>
        <CreateGroupDialog
          isOpen={isCreateGroupDialogOpen}
          onOpenChange={setIsCreateGroupDialogOpen}
          onGroupsUpdate={onGroupsUpdate}
          setError={setError}
        >
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </CreateGroupDialog>
      </div>

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
            <GroupCard
              key={group._id}
              group={group}
              session={session}
              onAddMember={() => {
                setSelectedGroup(group)
                setIsAddMemberDialogOpen(true)
              }}
            />
          ))
        )}
      </div>

      <AddMemberDialog
        isOpen={isAddMemberDialogOpen}
        onOpenChange={setIsAddMemberDialogOpen}
        selectedGroup={selectedGroup}
        onGroupsUpdate={onGroupsUpdate}
        setError={setError}
      />
    </div>
  )
}

function GroupCard({ group, session, onAddMember }: { 
  group: Group; 
  session: any;
  onAddMember: () => void; 
}) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              {group.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {group.description || "No description provided"}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {group.members.length} members
            </Badge>
            <Badge variant="secondary">
              {group.members.find(m => m.userId === session?.user?.id)?.role || "member"}
            </Badge>
            {group.pendingInvitations.length > 0 && (
              <Badge variant="outline" className="text-orange-600">
                {group.pendingInvitations.length} pending
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Created {new Date(group.createdAt).toLocaleDateString()}
            </div>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={onAddMember}
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Add Members
              </Button>
              <Button 
                size="sm" 
                variant="outline"
              >
                <FolderOpen className="w-3 h-3 mr-1" />
                View Content
              </Button>
            </div>
          </div>
          
          {/* Members List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Members</h4>
            <div className="flex flex-wrap gap-2">
              {group.members.slice(0, 5).map((member, index) => (
                <div key={index} className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                  <UserCheck className="w-3 h-3" />
                  <span className="text-xs">{member.email}</span>
                  <Badge variant="outline" className="text-xs">{member.role}</Badge>
                </div>
              ))}
              {group.members.length > 5 && (
                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                  <span className="text-xs">+{group.members.length - 5} more</span>
                </div>
              )}
            </div>
          </div>

          {/* Pending Invitations */}
          {group.pendingInvitations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-orange-600">Pending Invitations</h4>
              <div className="flex flex-wrap gap-2">
                {group.pendingInvitations.map((invitation, index) => (
                  <div key={index} className="flex items-center space-x-1 bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded-full">
                    <Mail className="w-3 h-3" />
                    <span className="text-xs">{invitation.email}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}