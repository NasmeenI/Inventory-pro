"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

const recentProducts = [
  { name: "Wireless Headphones", sku: "WH-001", stock: 45, status: "In Stock" },
  { name: "Bluetooth Speaker", sku: "BS-002", stock: 8, status: "Low Stock" },
  { name: "USB Cable", sku: "UC-003", stock: 0, status: "Out of Stock" },
  { name: "Phone Case", sku: "PC-004", stock: 23, status: "In Stock" },
  { name: "Screen Protector", sku: "SP-005", stock: 156, status: "In Stock" },
]

export function ProductsOverview() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Stock":
        return <Badge variant="default">In Stock</Badge>
      case "Low Stock":
        return <Badge variant="secondary">Low Stock</Badge>
      case "Out of Stock":
        return <Badge variant="destructive">Out of Stock</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const productsRaw = await api.products.getAll()
        const products: any[] = Array.isArray(productsRaw) ? productsRaw : (productsRaw as any)?.data || []

        // Sort by createdAt desc if available, else leave as-is
        const sorted = [...products].sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return bTime - aTime
        })

        const mapped = sorted.slice(0, 5).map((p) => {
          const qty = typeof p.stockQuantity === "number" ? p.stockQuantity : 0
          let status = "In Stock"
          if (qty <= 0) status = "Out of Stock"
          else if (qty <= 10) status = "Low Stock"
          return {
            name: p.name || "Unnamed",
            sku: p.sku || p._id || "-",
            stock: qty,
            status,
          }
        })

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
        <CardTitle className="text-xl">Recent Products</CardTitle>
        <CardDescription>Latest inventory items and their stock status</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex items-center space-x-3 w-full">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))
          ) : items.length ? (
            items.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-muted-foreground">{product.stock} units</span>
                  {getStatusBadge(product.status)}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No products found.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
