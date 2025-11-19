"use client"

import { useState, useEffect } from "react"
import { ProductsTable } from "@/components/products/products-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { Search, Package, LogIn } from "lucide-react"
import Link from "next/link"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1"

interface Product {
  _id: string
  name: string
  sku: string
  description: string
  category: string
  price: number
  stockQuantity: number
  unit: string
  picture: string
  isActive: boolean
}

export default function PublicProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`)
      if (response.ok) {
        const data = await response.json()
        setProducts(Array.isArray(data) ? data : data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">InventoryPro</h1>
                <p className="text-sm text-muted-foreground">Browse Our Inventory</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <Link href="/dashboard">
                  <Button>
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Hero Section */}
          <Card className="p-8 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-0 shadow-lg">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-2">Product Catalog</h2>
              <p className="text-muted-foreground text-lg">
                Browse our complete inventory of products. {user ? "You can manage these products from the dashboard." : "Login to manage inventory and create requests."}
              </p>
            </div>
          </Card>

          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products by name, SKU, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} found
            </div>
          </div>

          {/* Products Table */}
          <Card className="p-6">
            <ProductsTable
              products={filteredProducts}
              onEditProduct={() => {}}
              onRefresh={fetchProducts}
              isLoading={isLoading}
            />
          </Card>

          {/* Info Footer */}
          {!user && (
            <Card className="p-6 bg-muted/50">
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Want to manage inventory, create requests, or access more features?
                </p>
                <Link href="/login">
                  <Button size="lg">
                    <LogIn className="mr-2 h-5 w-5" />
                    Login to Your Account
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
