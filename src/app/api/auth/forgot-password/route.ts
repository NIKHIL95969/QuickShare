import { NextRequest, NextResponse } from "next/server"
import { connect } from "@/dbConfig/dbConfig"
import User from "@/models/userModel"
import { sendPasswordResetEmail } from "@/lib/emailService"
import crypto from "crypto"
import { z } from "zod"

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address")
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = forgotPasswordSchema.parse(body)
    const { email } = validatedData

    await connect()

    // Find user by email
    const user = await User.findOne({ email })

    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { message: "If an account with that email exists, we've sent a password reset link." },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Save reset token to user
    user.forgotPasswordToken = resetToken
    user.forgotPasswordTokenExpiry = resetTokenExpiry
    await user.save()

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, user.username, resetToken)
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      { 
        message: "If an account with that email exists, we've sent a password reset link."
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Forgot password error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
