// app/(dashboard)/dashboard/page.tsx

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { FileText, Link2, Upload, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  // Get user stats
  const itemCount = await db.knowledgeItem.count({
    where: { userId: session?.user?.id },
  })

  const recentItems = await db.knowledgeItem.findMany({
    where: { userId: session?.user?.id },
    take: 5,
    orderBy: { createdAt: "desc" },
  })

  const stats = [
    {
      title: "Total Items",
      value: itemCount,
      icon: FileText,
      description: "Knowledge entries created",
    },
    {
      title: "This Week",
      value: 0,
      icon: TrendingUp,
      description: "New items added",
    },
    {
      title: "Links Saved",
      value: 0,
      icon: Link2,
      description: "Bookmarked URLs",
    },
    {
      title: "Files Uploaded",
      value: 0,
      icon: Upload,
      description: "Documents and PDFs",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your knowledge base today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Items */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Items</CardTitle>
        </CardHeader>
        <CardContent>
          {recentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No items yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Start by creating your first knowledge entry
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{item.title}</h4>
                    {item.content && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.content}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}