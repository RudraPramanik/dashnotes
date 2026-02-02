"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Settings,
  Search,
  Plus,
} from "lucide-react"
// import { Button } from "@/components/ui/button"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "All Items",
    icon: FileText,
    href: "/dashboard/items",
  },
  {
    label: "Projects",
    icon: FolderOpen,
    href: "/dashboard/projects",
  },
  {
    label: "Search",
    icon: Search,
    href: "/dashboard/search",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/10">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">KnowledgeBase</span>
        </Link>
      </div>

      {/* New Item Button */}
      <div className="p-4">
        {/* <Button className="w-full" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Item
        </Button> */}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === route.href
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            <route.icon className="h-5 w-5" />
            {route.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          <p className="font-medium">Free Plan</p>
          <p className="mt-1">50 items remaining</p>
        </div>
      </div>
    </div>
  )
}