"use client"

import Link from "next/link"
import { siteConfig } from "@/lib/config"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 py-6">
      <div className="container mx-auto px-6 max-w-4xl flex flex-col items-center justify-center">
        <p className="text-sm leading-loose text-muted-foreground text-center">
          Built with ❤️ by{" "}
          <Link
            href="/"
            className="font-medium underline underline-offset-4"
          >
            {siteConfig.name}
          </Link>
          .
        </p>
      </div>
    </footer>
  )
}
