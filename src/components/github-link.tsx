import * as React from "react"
import Link from "next/link"

import { siteConfig } from "@/lib/config"
import { Icons } from "@/components/icons"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"


export function GitHubLink() {
  return (
    <Button asChild size="sm" variant="ghost" className="h-8 shadow-none">
      <Link href={siteConfig.links.github} target="_blank" rel="noreferrer">
        <Icons.gitHub className="h-5 pr-1"/>
        <React.Suspense fallback={<Skeleton className="h-4 w-8" />}>
          <StarsCount />
        </React.Suspense>
      </Link>
    </Button>
  )
}

export async function StarsCount() {
  // const data = await fetch("https://github.com/NIKHIL95969/QuickShare", {
  //   next: { revalidate: 86400 }, // Cache for 1 day (86400 seconds)
  // })

  // const json = await data.json();
  const json = { stargazers_count: 2000 }; // --- IGNORE ---

  return (
    <span className="text-muted-foreground w-8 text-xs tabular-nums">
      {json.stargazers_count >= 1000
        ? `${(json.stargazers_count / 1000).toFixed(1)}k`
        : json.stargazers_count.toLocaleString()}
    </span>
  )
}
