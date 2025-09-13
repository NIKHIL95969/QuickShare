import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connect } from "@/dbConfig/dbConfig"
import ContentPost from "@/models/contentModel"
import bcrypt from "bcryptjs"
import { authOptions } from "../../../auth/[...nextauth]/route"

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

    const content = await ContentPost.findById(params.id)

    if (!content) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      )
    }

    // Check if user owns this content
    if (content.userId?.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    return NextResponse.json({ content })

  } catch (error) {
    console.error("Get content error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

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

    await connect()

    const content = await ContentPost.findById(params.id)

    if (!content) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      )
    }

    // Check if user owns this content
    if (content.userId?.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      content: newContent,
      tags,
      isPrivate,
      isPasswordProtected,
      password
    } = body

    // Update fields
    if (title !== undefined) content.title = title
    if (description !== undefined) content.description = description
    if (newContent !== undefined) content.content = newContent
    if (tags !== undefined) content.tags = tags
    if (isPrivate !== undefined) content.isPrivate = isPrivate
    if (isPasswordProtected !== undefined) content.isPasswordProtected = isPasswordProtected

    // Handle password
    if (isPasswordProtected && password) {
      content.password = await bcrypt.hash(password, 12)
    } else if (!isPasswordProtected) {
      content.password = undefined
    }

    await content.save()

    return NextResponse.json({
      message: "Content updated successfully",
      content
    })

  } catch (error) {
    console.error("Update content error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

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

    const content = await ContentPost.findById(params.id)

    if (!content) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      )
    }

    // Check if user owns this content
    if (content.userId?.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    await ContentPost.findByIdAndDelete(params.id)

    return NextResponse.json({
      message: "Content deleted successfully"
    })

  } catch (error) {
    console.error("Delete content error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
