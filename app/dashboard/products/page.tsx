"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProductsTable } from "@/components/products/products-table"
import { ProductDialog } from "@/components/products/product-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { Plus, Search } from "lucide-react"

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

export default function ProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`)
      if (response.ok) {
        const data = await response.json()
        // Handle both direct array and { data: [] } response formats
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

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setIsDialogOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsDialogOpen(true)
  }

  const handleProductSaved = () => {
    fetchProducts()
    setIsDialogOpen(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground">Manage your inventory products and stock levels</p>
          </div>

          {user?.role === "admin" && (
            <Button onClick={handleAddProduct}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ProductsTable
          products={filteredProducts}
          onEditProduct={handleEditProduct}
          onRefresh={fetchProducts}
          isLoading={isLoading}
        />

        <ProductDialog
          product={selectedProduct}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSaved={handleProductSaved}
        />
      </div>
    </DashboardLayout>
  )
}
