import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connect } from "@/dbConfig/dbConfig"
import Group from "@/models/groupModel"
import User from "@/models/userModel"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { sendGroupInviteEmail } from "@/lib/emailService"
import crypto from "crypto"

// Add members to group
export async function POST(
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

    const { emails } = await request.json()

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "Email list is required" },
        { status: 400 }
      )
    }

    await connect()

    const group = await Group.findById(params.id)

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      )
    }

    // Check if user has permission to add members
    const isOwner = group.ownerId.toString() === session.user.id
    const isAdmin = group.members.some(member => 
      member.userId.toString() === session.user.id && member.role === "admin"
    )

    if (!isOwner && !isAdmin && !group.settings.allowMemberInvites) {
      return NextResponse.json(
        { error: "You don't have permission to add members" },
        { status: 403 }
      )
    }

    // Find existing users by email
    const existingUsers = await User.find({
      email: { $in: emails }
    })

    // Filter out users who are already members
    const newMembers = existingUsers.filter(user => 
      !group.members.some(member => member.userId.toString() === user._id.toString())
    )

    // Add new members
    const membersToAdd = newMembers.map(user => ({
      userId: user._id,
      email: user.email,
      role: "member",
      invitedBy: session.user.id
    }))

    group.members.push(...membersToAdd)

    // Create pending invitations for non-existing users
    const emailsToInvite = emails.filter(email => 
      !existingUsers.some(user => user.email === email) &&
      !group.pendingInvitations.some(invite => invite.email === email)
    )

    const pendingInvitations = emailsToInvite.map(email => ({
      email,
      invitedBy: session.user.id,
      token: crypto.randomBytes(32).toString('hex')
    }))

    group.pendingInvitations.push(...pendingInvitations)

    await group.save()

    // Send invitation emails to pending invitations
    const inviter = await User.findById(session.user.id)
    if (inviter) {
      for (const invitation of pendingInvitations) {
        try {
          await sendGroupInviteEmail(
            invitation.email,
            group.name,
            inviter.username,
            invitation.token
          )
        } catch (emailError) {
          console.error(`Failed to send invitation email to ${invitation.email}:`, emailError)
          // Continue with other invitations even if one fails
        }
      }
    }

    await group.populate("ownerId", "username email")
    await group.populate("members.userId", "username email")
    await group.populate("members.invitedBy", "username email")

    return NextResponse.json({
      message: "Members added successfully",
      group,
      addedMembers: membersToAdd.length,
      pendingInvitations: pendingInvitations.length
    })

  } catch (error) {
    console.error("Add members error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Remove member from group
export async function DELETE(
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

    const { memberId } = await request.json()

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      )
    }

    await connect()

    const group = await Group.findById(params.id)

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      )
    }

    // Check if user has permission to remove members
    const isOwner = group.ownerId.toString() === session.user.id
    const isAdmin = group.members.some(member => 
      member.userId.toString() === session.user.id && member.role === "admin"
    )

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to remove members" },
        { status: 403 }
      )
    }

    // Don't allow removing the owner
    if (memberId === group.ownerId.toString()) {
      return NextResponse.json(
        { error: "Cannot remove group owner" },
        { status: 400 }
      )
    }

    // Remove member
    group.members = group.members.filter(
      member => member.userId.toString() !== memberId
    )

    await group.save()

    await group.populate("ownerId", "username email")
    await group.populate("members.userId", "username email")

    return NextResponse.json({
      message: "Member removed successfully",
      group
    })

  } catch (error) {
    console.error("Remove member error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
