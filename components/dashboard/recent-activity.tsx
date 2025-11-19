"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Package, User } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

const recentActivity = [
  {
    type: "request",
    action: "Stock Out Request",
    item: "Wireless Headphones",
    user: "John Doe",
    time: "2 hours ago",
    status: "pending",
  },
  {
    type: "product",
    action: "Product Added",
    item: "Bluetooth Speaker",
    user: "Admin",
    time: "4 hours ago",
    status: "completed",
  },
  {
    type: "request",
    action: "Stock In Request",
    item: "USB Cable",
    user: "Jane Smith",
    time: "6 hours ago",
    status: "approved",
  },
  {
    type: "product",
    action: "Stock Updated",
    item: "Phone Case",
    user: "Admin",
    time: "1 day ago",
    status: "completed",
  },
]

export function RecentActivity() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const getIcon = (type: string) => {
    switch (type) {
      case "request":
        return <FileText className="h-4 w-4" />
      case "product":
        return <Package className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "approved":
        return (
          <Badge variant="default" className="bg-green-600">
            Approved
          </Badge>
        )
      case "completed":
        return <Badge variant="default">Completed</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  function relativeTime(from: string | Date) {
    const now = Date.now()
    const time = typeof from === "string" ? new Date(from).getTime() : (from as Date).getTime()
    const diff = Math.max(0, Math.floor((now - time) / 1000))
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const requestsRaw = await api.requests.getAll()
        const requests: any[] = Array.isArray(requestsRaw) ? requestsRaw : (requestsRaw as any)?.data || []

        const mapped = [...requests]
          .sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
            return bTime - aTime
          })
          .slice(0, 6)
          .map((r) => ({
            type: "request",
            action: r.transactionType === "stockOut" ? "Stock Out Request" : "Stock In Request",
            item: r.product_id?.name || r.productName || r.product_id || "Unknown Item",
            user: r.createdBy || "User",
            time: relativeTime(r.createdAt || new Date()),
            status: r.status || "pending",
          }))

        if (!active) return
        setItems(mapped)
      } catch (e) {
        if (active) setItems([])
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        <CardTitle className="text-xl">Recent Activity</CardTitle>
        <CardDescription>Latest actions and updates in your inventory</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex items-center space-x-3 w-full">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))
          ) : items.length ? (
            items.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md text-white">
                    {getIcon(activity.type)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.item} • by {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
                {getStatusBadge(activity.status)}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
