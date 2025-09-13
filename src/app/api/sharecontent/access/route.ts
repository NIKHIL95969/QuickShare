import { NextRequest, NextResponse } from "next/server"
import { connect } from "@/dbConfig/dbConfig"
import ContentPost from "@/models/contentModel"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { contentId, password } = await request.json()

    if (!contentId) {
      return NextResponse.json(
        { error: "Content ID is required" },
        { status: 400 }
      )
    }

    await connect()

    const content = await ContentPost.findById(contentId)

    if (!content) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      )
    }

    // Check if content is password protected
    if (!content.isPasswordProtected) {
      return NextResponse.json({
        message: "Content accessed successfully",
        content: {
          id: content._id,
          title: content.title,
          description: content.description,
          content: content.content,
          fileType: content.fileType,
          fileName: content.fileName,
          tags: content.tags,
          createdAt: content.createdAt,
          isPrivate: content.isPrivate,
          isPasswordProtected: content.isPasswordProtected
        }
      })
    }

    // Verify password
    if (!password) {
      return NextResponse.json(
        { error: "Password is required for this content" },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, content.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      )
    }

    // Return content if password is correct
    return NextResponse.json({
      message: "Content accessed successfully",
      content: {
        id: content._id,
        title: content.title,
        description: content.description,
        content: content.content,
        fileType: content.fileType,
        fileName: content.fileName,
        tags: content.tags,
        createdAt: content.createdAt,
        isPrivate: content.isPrivate,
        isPasswordProtected: content.isPasswordProtected
      }
    })

  } catch (error) {
    console.error("Access content error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
