"use client"

import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProductsOverview } from "@/components/dashboard/products-overview"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return null // This will be handled by the auth provider redirect
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}. Here's what's happening with your inventory.
          </p>
        </div>

        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductsOverview />
          <RecentActivity />
        </div>
      </div>
    </DashboardLayout>
  )
}
