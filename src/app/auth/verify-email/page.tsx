"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent a verification link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {email && (
            <div className="text-center text-sm text-muted-foreground">
              Check your inbox at <strong>{email}</strong>
            </div>
          )}
          
          <div className="text-center text-sm text-muted-foreground">
            Click the verification link in the email to activate your account.
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or{" "}
            <Button variant="link" className="p-0 h-auto">
              resend verification email
            </Button>
          </div>
          
          <div className="text-center">
            <Link href="/auth/signin">
              <Button variant="outline">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
