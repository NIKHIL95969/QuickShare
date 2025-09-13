import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connect } from "@/dbConfig/dbConfig"
import Group from "@/models/groupModel"
import { authOptions } from "../../../auth/[...nextauth]/route"

// Accept group invitation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required" },
        { status: 400 }
      )
    }

    await connect()

    // Find group with this invitation token
    const group = await Group.findOne({
      "pendingInvitations.token": token,
      "pendingInvitations.email": session.user.email
    })

    if (!group) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 404 }
      )
    }

    // Check if invitation is expired
    const invitation = group.pendingInvitations.find(inv => inv.token === token)
    if (invitation && new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      )
    }

    // Check if user is already a member
    const isAlreadyMember = group.members.some(
      member => member.userId.toString() === session.user.id
    )

    if (isAlreadyMember) {
      return NextResponse.json(
        { error: "You are already a member of this group" },
        { status: 400 }
      )
    }

    // Add user to group members
    group.members.push({
      userId: session.user.id,
      email: session.user.email,
      role: "member",
      invitedBy: invitation.invitedBy
    })

    // Remove the invitation
    group.pendingInvitations = group.pendingInvitations.filter(
      inv => inv.token !== token
    )

    await group.save()

    await group.populate("ownerId", "username email")
    await group.populate("members.userId", "username email")

    return NextResponse.json({
      message: "Successfully joined the group",
      group
    })

  } catch (error) {
    console.error("Accept invitation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
