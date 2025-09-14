import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"

export function Announcement() {
  return (
    <Badge variant="secondary" className="rounded-full">
      <Link href="/login" className="flex items-center gap-2">
        Now available for free: Try now <span><ArrowRightIcon /></span>
      </Link>
    </Badge>
  )
}