"use client"

import { useState, useEffect } from "react"
import { api, ApiError } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Request {
  _id: string
  transactionDate: string
  transactionType: "stockIn" | "stockOut"
  itemAmount: number
  product_id: string
  productName?: string
  productSku?: string
  status?: "pending" | "approved" | "rejected"
  createdBy?: string
  createdAt: string
}

export function useRequests() {
  const [requests, setRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const fetchRequests = async () => {
    setIsLoading(true)
    try {
      const data = await api.requests.getAll()
      setRequests(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch requests",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createRequest = async (requestData: Omit<Request, "_id" | "status" | "createdAt" | "createdBy">) => {
    try {
      const newRequest = await api.requests.create(requestData)
      setRequests((prev) => [...prev, newRequest])
      toast({
        title: "Success",
        description: "Request created successfully",
      })
      return newRequest
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to create request"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  const updateRequest = async (id: string, requestData: Partial<Request>) => {
    try {
      const updatedRequest = await api.requests.update(id, requestData)
      setRequests((prev) => prev.map((r) => (r._id === id ? updatedRequest : r)))
      toast({
        title: "Success",
        description: "Request updated successfully",
      })
      return updatedRequest
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to update request"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteRequest = async (id: string) => {
    try {
      await api.requests.delete(id)
      setRequests((prev) => prev.filter((r) => r._id !== id))
      toast({
        title: "Success",
        description: "Request deleted successfully",
      })
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to delete request"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  const approveRequest = async (id: string) => {
    return updateRequest(id, { status: "approved" })
  }

  const rejectRequest = async (id: string) => {
    return updateRequest(id, { status: "rejected" })
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  return {
    requests,
    isLoading,
    fetchRequests,
    createRequest,
    updateRequest,
    deleteRequest,
    approveRequest,
    rejectRequest,
  }
}
