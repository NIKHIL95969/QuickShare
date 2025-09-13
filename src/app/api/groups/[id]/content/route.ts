import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connect } from "@/dbConfig/dbConfig"
import Group from "@/models/groupModel"
import ContentPost from "@/models/contentModel"
import { authOptions } from "../../../auth/[...nextauth]/route"

// Get content shared with a specific group
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    await connect()

    // Verify user has access to this group
    const group = await Group.findById(params.id)
    
    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      )
    }

    const hasAccess = group.ownerId.toString() === session.user.id ||
      group.members.some(member => member.userId.toString() === session.user.id)

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Get content shared with this group
    const content = await ContentPost.find({
      "sharedWithGroups.groupId": params.id,
      sharingType: "group"
    })
    .populate("userId", "username email")
    .populate("sharedWithGroups.sharedBy", "username email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

    const total = await ContentPost.countDocuments({
      "sharedWithGroups.groupId": params.id,
      sharingType: "group"
    })

    return NextResponse.json({
      content,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    console.error("Get group content error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
