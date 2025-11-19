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
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-blue-50 text-lg">
              Welcome back, {user.name}. Here's what's happening with your inventory.
            </p>
          </div>
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
