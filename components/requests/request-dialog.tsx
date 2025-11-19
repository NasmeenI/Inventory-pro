"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1"

interface Product {
  _id: string
  name: string
  sku: string
  stockQuantity: number
}

interface Request {
  _id: string
  transactionDate: string
  transactionType: "stockIn" | "stockOut"
  itemAmount: number
  product_id: string
}

interface RequestDialogProps {
  request: Request | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function RequestDialog({ request, open, onOpenChange, onSaved }: RequestDialogProps) {
  const { token } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState({
    transactionDate: new Date().toISOString().split("T")[0],
    transactionType: "stockIn" as "stockIn" | "stockOut",
    itemAmount: 1,
    product_id: "",
  })

  useEffect(() => {
    if (open) {
      fetchProducts()
    }
  }, [open])

  useEffect(() => {
    if (request) {
      const dateStr = typeof request.transactionDate === "string" ? request.transactionDate : new Date(request.transactionDate).toISOString()
      const productId = typeof request.product_id === "string" ? request.product_id : (request as any).product_id?._id || ""
      setFormData({
        transactionDate: dateStr.includes("T") ? dateStr.split("T")[0] : dateStr,
        transactionType: request.transactionType,
        itemAmount: request.itemAmount,
        product_id: productId,
      })
    } else {
      setFormData({
        transactionDate: new Date().toISOString().split("T")[0],
        transactionType: "stockIn",
        itemAmount: 1,
        product_id: "",
      })
    }
  }, [request])

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
    }
  }

  const selectedProduct = products.find((p) => p._id === formData.product_id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    if (!formData.product_id) {
      toast({
        title: "Error",
        description: "Please select a product",
        variant: "destructive",
      })
      return
    }

    // Validation for stockOut requests
    if (formData.transactionType === "stockOut") {
      if (!selectedProduct) {
        toast({
          title: "Error",
          description: "Please select a product",
          variant: "destructive",
        })
        return
      }

      if (formData.itemAmount > selectedProduct.stockQuantity) {
        toast({
          title: "Error",
          description: `Cannot request more than available stock (${selectedProduct.stockQuantity})`,
          variant: "destructive",
        })
        return
      }

      if (formData.itemAmount > 50) {
        toast({
          title: "Error",
          description: "Cannot request more than 50 items for stock out",
          variant: "destructive",
        })
        return
      }
    }

    setIsLoading(true)
    try {
      const url = request ? `${API_BASE_URL}/requests/${request._id}` : `${API_BASE_URL}/requests`
      const method = request ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Request ${request ? "updated" : "created"} successfully`,
        })
        onSaved()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to ${request ? "update" : "create"} request`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${request ? "update" : "create"} request`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{request ? "Edit Request" : "New Transaction Request"}</DialogTitle>
          <DialogDescription>
            {request ? "Update the transaction request details below." : "Create a new inventory transaction request."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product">Product</Label>
            <Select
              value={formData.product_id}
              onValueChange={(value) => setFormData({ ...formData, product_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product._id} value={product._id}>
                    {product.name} ({product.sku}) - Stock: {product.stockQuantity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionType">Transaction Type</Label>
            <Select
              value={formData.transactionType}
              onValueChange={(value: "stockIn" | "stockOut") => setFormData({ ...formData, transactionType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stockIn">Stock In</SelectItem>
                <SelectItem value="stockOut">Stock Out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemAmount">Item Amount</Label>
            <Input
              id="itemAmount"
              type="number"
              min="1"
              max={
                formData.transactionType === "stockOut" ? Math.min(selectedProduct?.stockQuantity || 0, 50) : undefined
              }
              value={formData.itemAmount}
              onChange={(e) => setFormData({ ...formData, itemAmount: Number.parseInt(e.target.value) || 1 })}
              required
            />
            {formData.transactionType === "stockOut" && selectedProduct && (
              <p className="text-sm text-muted-foreground">
                Available stock: {selectedProduct.stockQuantity} | Max request: 50
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionDate">Transaction Date</Label>
            <Input
              id="transactionDate"
              type="date"
              value={formData.transactionDate}
              onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.product_id}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {request ? "Update Request" : "Create Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
