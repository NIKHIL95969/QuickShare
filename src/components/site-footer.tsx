"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { siteConfig } from "@/lib/config"
import { cn } from "@/lib/utils"
import { Home, Code, Plus, User } from "lucide-react"
import { useEffect, useState } from "react"
import { isAuthenticatedClient } from "@/lib/auth"

const icons = {
  home: Home,
  code: Code,
  upload: Plus,
  profile: User,
}


export function SiteFooter() {
  const pathname = usePathname()
  const navItems = siteConfig.navItems


  const [login, setLogin] = useState(false);

  useEffect(() => {
    const isLoggedIn = isAuthenticatedClient()
    setLogin(isLoggedIn)
  }, [])

  // React to auth changes without refresh
  useEffect(() => {
    const handler = () => setLogin(isAuthenticatedClient())
    window.addEventListener('auth-changed', handler)
    return () => window.removeEventListener('auth-changed', handler)
  }, [])


  return (
    <footer className="group-has-[.section-soft]/body:bg-surface/40 dark:bg-transparent">
      {/* Static footer info */}
      <div className="container-wrapper px-4 xl:px-6">
        <div className="flex h-(--footer-height) mb-16 items-center justify-between">
          <div className="text-muted-foreground w-full px-1 text-center text-xs leading-loose sm:text-sm">
            Build with ❤️{" "} by <span className="relative inline-block italic group cursor-pointer text-blue-600 font-semibold">
              <a href="/">QuikShare</a>
            </span>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}


      {login && (
        <div className="docs-nav bg-background/80 border-border/50 fixed inset-x-0 bottom-0 isolate z-50 flex items-center justify-around border-t px-6 py-4 backdrop-blur-sm sm:hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = icons[item.icon as keyof typeof icons]

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center text-xs p-2 rounded-lg transition-colors",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {Icon && <Icon className="h-5 w-5" />}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </footer>
  )
}
