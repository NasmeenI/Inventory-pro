"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Edit, Trash2, Package, QrCode } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { QRCodeGenerator } from "@/components/qr/qr-code-generator"


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

interface ProductsTableProps {
  products: Product[]
  onEditProduct: (product: Product) => void
  onRefresh: () => void
  isLoading: boolean
}

export function ProductsTable({ products, onEditProduct, onRefresh, isLoading }: ProductsTableProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [qrProduct, setQrProduct] = useState<Product | null>(null)

  const handleDelete = async (productId: string) => {
    setDeletingId(productId)
    try {
      await api.products.delete(productId)
      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
      onRefresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Out of Stock", variant: "destructive" as const }
    if (quantity < 10) return { label: "Low Stock", variant: "secondary" as const }
    return { label: "In Stock", variant: "default" as const }
  }

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
          <p className="text-muted-foreground">
            {user?.role === "admin"
              ? "Get started by adding your first product."
              : "No products available at the moment."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="hidden lg:block border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stockQuantity)
              return (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{product.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">{product.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    {product.stockQuantity} {product.unit}
                  </TableCell>
                  <TableCell>
                    <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {user ? (
                      user.role === "admin" ? (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setQrProduct(product)}>
                            <QrCode className="mr-2 h-4 w-4" />
                            QR
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => onEditProduct(product)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(product._id)}
                            disabled={deletingId === product._id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => setQrProduct(product)}>
                          <QrCode className="mr-2 h-4 w-4" />
                          QR Code
                        </Button>
                      )
                    ) : (
                      <span className="text-sm text-muted-foreground">View only</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="lg:hidden space-y-4">
        {products.map((product) => {
          const stockStatus = getStockStatus(product.stockQuantity)
          return (
            <Card key={product._id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{product.name}</CardTitle>
                      <p className="text-sm text-muted-foreground font-mono">{product.sku}</p>
                    </div>
                  </div>
                  {user?.role === "admin" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setQrProduct(product)}>
                          <QrCode className="mr-2 h-4 w-4" />
                          QR Code
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditProduct(product)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(product._id)}
                          disabled={deletingId === product._id}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p className="font-medium">{product.category}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price:</span>
                    <p className="font-medium">${product.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stock:</span>
                    <p className="font-medium">
                      {product.stockQuantity} {product.unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={stockStatus.variant} className="mt-1">
                      {stockStatus.label}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {qrProduct && (
        <QRCodeGenerator
          productId={qrProduct._id}
          productName={qrProduct.name}
          sku={qrProduct.sku}
          open={!!qrProduct}
          onOpenChange={(open) => !open && setQrProduct(null)}
        />
      )}
    </>
  )
}
