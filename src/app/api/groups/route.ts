import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connect } from "@/dbConfig/dbConfig"
import Group from "@/models/groupModel"
import User from "@/models/userModel"
import { authOptions } from "../auth/[...nextauth]/route"
import { sendGroupInviteEmail } from "@/lib/emailService"
import crypto from "crypto"

// Get user's groups
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    await connect()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Get groups where user is owner or member
    const groups = await Group.find({
      $or: [
        { ownerId: session.user.id },
        { "members.userId": session.user.id }
      ]
    })
    .populate("ownerId", "username email")
    .populate("members.userId", "username email")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)

    const total = await Group.countDocuments({
      $or: [
        { ownerId: session.user.id },
        { "members.userId": session.user.id }
      ]
    })

    return NextResponse.json({
      groups,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    console.error("Get groups error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Create a new group
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { name, description, memberEmails = [] } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      )
    }

    await connect()

    // Check if group name already exists for this user
    const existingGroup = await Group.findOne({
      name,
      ownerId: session.user.id
    })

    if (existingGroup) {
      return NextResponse.json(
        { error: "Group with this name already exists" },
        { status: 400 }
      )
    }

    // Find existing users by email
    const existingUsers = await User.find({
      email: { $in: memberEmails }
    })

    // Create group with existing users as members
    const group = new Group({
      name,
      description,
      ownerId: session.user.id,
      members: existingUsers.map(user => ({
        userId: user._id,
        email: user.email,
        role: "member",
        invitedBy: session.user.id
      })),
      pendingInvitations: memberEmails
        .filter(email => !existingUsers.some(user => user.email === email))
        .map(email => ({
          email,
          invitedBy: session.user.id,
          token: crypto.randomBytes(32).toString('hex')
        }))
    })

    await group.save()

    // Send invitation emails to pending invitations
    const inviter = await User.findById(session.user.id)
    if (inviter) {
      for (const invitation of group.pendingInvitations) {
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

    // Populate the response
    await group.populate("ownerId", "username email")
    await group.populate("members.userId", "username email")

    return NextResponse.json({
      message: "Group created successfully",
      group
    }, { status: 201 })

  } catch (error) {
    console.error("Create group error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
