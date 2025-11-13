"use client"

import { useState, useEffect } from "react"
import { api, ApiError } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

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

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const data = await api.products.getAll()
      setProducts(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createProduct = async (productData: Omit<Product, "_id">) => {
    try {
      const newProduct = await api.products.create(productData)
      setProducts((prev) => [...prev, newProduct])
      toast({
        title: "Success",
        description: "Product created successfully",
      })
      return newProduct
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to create product"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const updatedProduct = await api.products.update(id, productData)
      setProducts((prev) => prev.map((p) => (p._id === id ? updatedProduct : p)))
      toast({
        title: "Success",
        description: "Product updated successfully",
      })
      return updatedProduct
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to update product"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      await api.products.delete(id)
      setProducts((prev) => prev.filter((p) => p._id !== id))
      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to delete product"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  const updateStock = async (id: string, stockQuantity: number) => {
    try {
      const updatedProduct = await api.products.updateStock(id, stockQuantity)
      setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, stockQuantity } : p)))
      toast({
        title: "Success",
        description: "Stock updated successfully",
      })
      return updatedProduct
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to update stock"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return {
    products,
    isLoading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
  }
}
