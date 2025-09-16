"use client";

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

import { getColors } from "@/lib/colors"
import { siteConfig } from "@/lib/config"
// import { source } from "@/lib/source"
// import { CommandMenu } from "@/components/command-menu"
import { GitHubLink } from "@/components/github-link"
import { Icons } from "@/components/icons"
import { MainNav } from "@/components/main-nav"
// import { MobileNav } from "@/components/mobile-nav"
import { ModeSwitcher } from "@/components/mode-switcher"
import { SiteConfig } from "@/components/site-config"
import { ShareContentDialog } from "@/components/share-content-dialog"
// import blocks from "@/registry/__blocks__.json"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, Clock, LogOut, User } from "lucide-react"
import { isAuthenticatedClient } from "@/lib/auth";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const colors = getColors()
  const router = useRouter()
  const pathname = usePathname()
  //   const pageTree = source.pageTree

  // Handle refresh functionality
  const handleRefresh = () => {
    // Trigger a page refresh for content pages
    if (pathname === '/code') {
      window.location.reload()
    }
  }

  const [login, setLogin] = useState(false)
  const [tempEnable, setTempEnable] = useState(false)


  useEffect(() => {
    if (pathname === '/temp' || pathname ==='/code') {
      setTempEnable(true)
    }
    else{
      setTempEnable(false)
    }
  },[pathname])

  useEffect(() => {
    const isLogin = isAuthenticatedClient()
    setLogin(isLogin)
  },[])



  return (
    <header className="bg-background sticky top-0 z-50 w-full py-4">
      <div className="container-wrapper 3xl:fixed:px-0 px-6">
        <div className="3xl:fixed:container flex h-(--header-height) items-center gap-2 **:data-[slot=separator]:!h-4">
          {/* <MobileNav
            tree={pageTree}
            items={siteConfig.navItems}
            className="flex lg:hidden"
          /> */}
          <Link href="/" className="flex items-center space-x-4 text-2xl font-bold">
            {/* <Icons.logo className="size-5" /> */}
            <span className="inline-block text-transparent bg-clip-text animate-gradient-flow"  
              style={{
                background: 'linear-gradient(90deg, hsl(var(--primary)), #3b82f6, #8b5cf6, #06b6d4, hsl(var(--primary)))',
                backgroundSize: '200% 100%',
                animation: 'gradient-flow 3s ease-in-out infinite',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>{siteConfig.name}</span>
          </Link>
          {/* <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden size-8 lg:flex"
          >
            <Link href="/">
              <Icons.logo className="size-5" />
              <span className="sr-only">{siteConfig.name}</span>
            </Link>
          </Button> */}
          {login && (
            <MainNav items={siteConfig.navItems} className="hidden sm:flex" />)}

          <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
              <div className="hidden w-full flex-1 md:flex md:w-auto md:flex-none">
                {/* <CommandMenu
                tree={pageTree}
                colors={colors}
                navItems={siteConfig.navItems}
                /> */}
              </div>
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
            {tempEnable && (
            <ShareContentDialog />
            )}
           {/* {tempEnable && (
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="px-3 py-4 hover:bg-muted/50 transition-all duration-200 flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 sm:mr-2" />
                <span className="sm:flex hidden"> Refresh</span>
              </Button>
            )} */}
            {!tempEnable && (
              <Button
                onClick={() => router.push('/temp')}
                variant="outline"
                size="sm"
                className="px-3 py-2 transition-all duration-200"
              >
                <Clock className="mr-2 h-4 w-4" />
                View Temporary
              </Button>
                 )}
            </div>
            <Separator
              orientation="vertical"
              className="ml-2 hidden lg:block"
              />
            {/* <GitHubLink /> */}
            {/* <Separator orientation="vertical" className="3xl:flex h-4" /> */}
            <SiteConfig className="3xl:flex hidden" />
            <Separator orientation="vertical" />
            <ModeSwitcher />
            </div>
        </div>
      </div>
    </header>
    
  )
}
