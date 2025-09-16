"use client"

import { MainNav } from "./main-nav";

interface ResponsiveNavProps {
  items: { href: string; label: string }[]
}

export function ResponsiveNav({ items }: ResponsiveNavProps) {
  return (
    <>
      {/* Desktop (top header nav) */}
      <div className="hidden sm:flex">
        <MainNav items={items} />
      </div>

      {/* Mobile (bottom fixed nav) */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center border-t bg-background/80 px-4 py-2 backdrop-blur-sm sm:hidden">
        <MainNav items={items} className="justify-around w-full max-w-md" />
      </div>
    </>
  )
}
