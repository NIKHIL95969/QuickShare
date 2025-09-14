import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Users, Clock } from "lucide-react"
import { ContentItem, Group } from "@/types/dashboard"
import { Session } from "next-auth"

interface OverviewProps {
  content: ContentItem[]
  groups: Group[]
  session: Session | null
}

export default function Overview({ content, groups, session }: OverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{content.length}</div>
            <p className="text-xs text-muted-foreground">Content items created</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groups.length}</div>
            <p className="text-xs text-muted-foreground">Groups joined</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{content.filter(c => new Date(c.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Content</CardTitle>
            <CardDescription>Your latest content items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {content.slice(0, 3).map((item) => (
                <div key={item._id} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{item.title || "Untitled"}</p>
                    <p className="text-sm text-muted-foreground">{item.content.substring(0, 50)}...</p>
                  </div>
                  <Badge variant="outline">{item.sharingType || "private"}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Groups</CardTitle>
            <CardDescription>Groups you're part of</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {groups.slice(0, 3).map((group) => (
                <div key={group._id} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{group.name}</p>
                    <p className="text-sm text-muted-foreground">{group.members.length} members</p>
                  </div>
                  <Badge variant="outline">
                    {group.members.find(m => m.userId === session?.user?.id)?.role || "member"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}