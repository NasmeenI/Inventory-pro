"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Package, User } from "lucide-react"

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
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions and updates in your inventory</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                  {getIcon(activity.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.item} • by {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
              {getStatusBadge(activity.status)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
