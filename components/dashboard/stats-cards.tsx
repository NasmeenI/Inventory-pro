"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, FileText, TrendingUp, AlertTriangle } from "lucide-react"
import { api } from "@/lib/api"

interface Stats {
  totalProducts: number
  totalRequests: number
  pendingRequests: number
  lowStockItems: number
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalRequests: 0,
    pendingRequests: 0,
    lowStockItems: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [productsRaw, requestsRaw] = await Promise.all([
          api.products.getAll(),
          api.requests.getAll(),
        ])

        const products = Array.isArray(productsRaw) ? productsRaw : (productsRaw as any)?.data || []
        const requests = Array.isArray(requestsRaw) ? requestsRaw : (requestsRaw as any)?.data || []

        const lowStockThreshold = 10
        const lowStockItems = products.filter((p: any) => typeof p.stockQuantity === "number" && p.stockQuantity <= lowStockThreshold).length
        const pendingRequests = requests.filter((r: any) => r.status === "pending").length

        if (!active) return
        setStats({
          totalProducts: products.length,
          totalRequests: requests.length,
          pendingRequests,
          lowStockItems,
        })
      } catch (e) {
        // Silently fail; keep zeros
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Total Products</CardTitle>
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
            <Package className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{loading ? "--" : stats.totalProducts}</div>
          <p className="text-xs text-muted-foreground mt-1">Active inventory items</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Total Requests</CardTitle>
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-md">
            <FileText className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{loading ? "--" : stats.totalRequests}</div>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Pending Requests</CardTitle>
          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-md">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{loading ? "--" : stats.pendingRequests}</div>
          <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Low Stock Items</CardTitle>
          <div className="p-2 bg-gradient-to-br from-rose-500 to-red-600 rounded-lg shadow-md">
            <AlertTriangle className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">{loading ? "--" : stats.lowStockItems}</div>
          <p className="text-xs text-muted-foreground mt-1">Need restocking</p>
        </CardContent>
      </Card>
    </div>
  )
}
