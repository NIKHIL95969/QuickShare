"use client"

import { usePathname } from "next/navigation"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === "/login" || pathname === "/register"

  return (
    <div className="bg-background relative z-10 flex min-h-svh flex-col">
      {!isAuthPage && <SiteHeader />}
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </div>
  )
}
