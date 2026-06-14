"use client";

import Link from "next/link"
import { siteConfig } from "@/lib/config"
import { ModeSwitcher } from "@/components/mode-switcher"

export function SiteHeader() {
  return (
    <header className="bg-background sticky top-0 z-50 w-full border-b border-border">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center text-xl font-bold tracking-tight text-foreground">
            <span>{siteConfig.name}</span>
          </Link>
          <div className="flex items-center gap-4">
            <ModeSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}
