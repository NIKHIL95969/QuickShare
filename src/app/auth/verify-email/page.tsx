"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const email = searchParams.get("email")
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else {
      setVerificationStatus('error')
      setMessage('No verification token provided')
    }
  }, [token])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setVerificationStatus('success')
        setMessage(data.message)
        // Redirect to sign in after 3 seconds
        setTimeout(() => {
          router.push('/auth/signin')
        }, 3000)
      } else {
        setVerificationStatus('error')
        setMessage(data.error || 'Verification failed')
      }
    } catch (error) {
      setVerificationStatus('error')
      setMessage('An error occurred during verification')
    }
  }

  const resendVerification = async () => {
    // This would need to be implemented with a resend API
    setMessage('Resend functionality not yet implemented')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {verificationStatus === 'loading' && 'Verifying Email...'}
            {verificationStatus === 'success' && 'Email Verified!'}
            {verificationStatus === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription className="text-center">
            {verificationStatus === 'loading' && 'Please wait while we verify your email address'}
            {verificationStatus === 'success' && 'Your email has been successfully verified'}
            {verificationStatus === 'error' && 'There was an issue verifying your email'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {verificationStatus === 'loading' && (
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Verifying your email address...</p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-sm text-green-600 mb-4">{message}</p>
              <p className="text-xs text-muted-foreground">Redirecting to sign in...</p>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <Alert variant="destructive">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            </div>
          )}

          {email && verificationStatus === 'loading' && (
            <div className="text-center text-sm text-muted-foreground">
              Verifying email for <strong>{email}</strong>
            </div>
          )}
          
          {verificationStatus === 'error' && (
            <div className="text-center text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or{" "}
              <Button variant="link" className="p-0 h-auto" onClick={resendVerification}>
                resend verification email
              </Button>
            </div>
          )}
          
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
