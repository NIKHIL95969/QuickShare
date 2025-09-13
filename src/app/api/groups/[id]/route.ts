import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connect } from "@/dbConfig/dbConfig"
import Group from "@/models/groupModel"
import User from "@/models/userModel"
import { authOptions } from "../../auth/[...nextauth]/route"
import crypto from "crypto"

// Get specific group details
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

    const group = await Group.findById(params.id)
      .populate("ownerId", "username email")
      .populate("members.userId", "username email")
      .populate("members.invitedBy", "username email")

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      )
    }

    // Check if user has access to this group
    const hasAccess = group.ownerId._id.toString() === session.user.id ||
      group.members.some(member => member.userId._id.toString() === session.user.id)

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    return NextResponse.json({ group })

  } catch (error) {
    console.error("Get group error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Update group
export async function PUT(
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

    const { name, description, settings } = await request.json()

    await connect()

    const group = await Group.findById(params.id)

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      )
    }

    // Check if user is the owner
    if (group.ownerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Only group owner can update group" },
        { status: 403 }
      )
    }

    // Update group
    if (name) group.name = name
    if (description !== undefined) group.description = description
    if (settings) group.settings = { ...group.settings, ...settings }

    await group.save()

    await group.populate("ownerId", "username email")
    await group.populate("members.userId", "username email")

    return NextResponse.json({
      message: "Group updated successfully",
      group
    })

  } catch (error) {
    console.error("Update group error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Delete group
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

    await connect()

    const group = await Group.findById(params.id)

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      )
    }

    // Check if user is the owner
    if (group.ownerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Only group owner can delete group" },
        { status: 403 }
      )
    }

    await Group.findByIdAndDelete(params.id)

    return NextResponse.json({
      message: "Group deleted successfully"
    })

  } catch (error) {
    console.error("Delete group error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
