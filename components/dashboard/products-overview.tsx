"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"

const recentProducts = [
  { name: "Wireless Headphones", sku: "WH-001", stock: 45, status: "In Stock" },
  { name: "Bluetooth Speaker", sku: "BS-002", stock: 8, status: "Low Stock" },
  { name: "USB Cable", sku: "UC-003", stock: 0, status: "Out of Stock" },
  { name: "Phone Case", sku: "PC-004", stock: 23, status: "In Stock" },
  { name: "Screen Protector", sku: "SP-005", stock: 156, status: "In Stock" },
]

export function ProductsOverview() {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Products</CardTitle>
        <CardDescription>Latest inventory items and their stock status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{product.stock}</span>
                {getStatusBadge(product.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
