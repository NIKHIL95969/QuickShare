import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connect } from "@/dbConfig/dbConfig"
import User from "@/models/userModel"
import { z } from "zod"

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    const { username, email, password } = validatedData

    await connect()

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { message: "User with this email already exists" },
          { status: 400 }
        )
      } else {
        return NextResponse.json(
          { message: "Username is already taken" },
          { status: 400 }
        )
      }
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      isVerified: false
    })

    await user.save()

    // TODO: Send verification email here
    // For now, we'll just return success

    return NextResponse.json(
      { 
        message: "User created successfully. Please check your email for verification.",
        userId: user._id 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Registration error:", error)
    
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
