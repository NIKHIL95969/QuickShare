"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { logoutClient } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedEmail = localStorage.getItem("auth_email")
    setEmail(storedEmail)
  }, [])

  const handleLogout = () => {
    logoutClient()
    router.replace("/")
  }

  return (
    <div className="container py-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-4 py-6">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{email || "Not available"}</span>
          </div>
          <div className="pt-2">
            <Button variant="destructive" onClick={handleLogout} className="w-full">
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


