"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { RequestsTable } from "@/components/requests/requests-table"
import { RequestDialog } from "@/components/requests/request-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { Plus, Search } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1"

interface Request {
  _id: string
  transactionDate: string
  transactionType: "stockIn" | "stockOut"
  itemAmount: number
  product_id: string
  productName?: string
  productSku?: string
  createdBy?: string
  createdAt: string
}

export default function RequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<Request[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/requests`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        // Handle both direct array and { data: [] } response formats
        const requestsData = Array.isArray(data) ? data : data.data || []
        // Normalize fields: product and createdBy shapes may vary by API
        const mappedRequests = requestsData.map((req: any) => {
          const product = req.product_id || req.product
          const productId = typeof req.product_id === "string" ? req.product_id : product?._id || ""
          const createdById = req.createdBy?._id
            ? req.createdBy._id
            : req.createdBy || req.user?._id || req.user || req.user_id || req.created_by || undefined

          return {
            ...req,
            product_id: productId,
            productName: product?.name || req.productName,
            productSku: product?.sku || req.productSku,
            createdBy: createdById,
          }
        })
        setRequests(mappedRequests)
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  // Apply role-based visibility: staff sees only their own requests; admin sees all.
  // If user context not ready yet, don't filter to avoid empty flashes.
  const visibleRequests = !user || user.role === "admin" ? requests : requests.filter((r) => r.createdBy === user._id)

  const filteredRequests = visibleRequests.filter((request) => {
    const matchesSearch =
      request.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.productSku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request._id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || request.transactionType === typeFilter

    return matchesSearch && matchesType
  })

  const handleAddRequest = () => {
    setSelectedRequest(null)
    setIsDialogOpen(true)
  }

  const handleEditRequest = (request: Request) => {
    setSelectedRequest(request)
    setIsDialogOpen(true)
  }

  const handleRequestSaved = () => {
    fetchRequests()
    setIsDialogOpen(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Transaction Requests</h1>
              <p className="text-emerald-50 text-lg">
                {user?.role === "admin"
                  ? "Manage all inventory transaction requests"
                  : "Create and manage your transaction requests"}
              </p>
            </div>

            <Button onClick={handleAddRequest} className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg font-semibold">
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 border-2 focus:border-emerald-500"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-11 border-2">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px] h-11 border-2">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="stockIn">Stock In</SelectItem>
              <SelectItem value="stockOut">Stock Out</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <RequestsTable
          requests={filteredRequests}
          onEditRequest={handleEditRequest}
          onRefresh={fetchRequests}
          isLoading={isLoading}
        />

        <RequestDialog
          request={selectedRequest}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSaved={handleRequestSaved}
        />
      </div>
    </DashboardLayout>
  )
}
