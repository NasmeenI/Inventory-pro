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
  status: "pending" | "approved" | "rejected"
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
        // Map product_id to productName and productSku for easier display
        const mappedRequests = requestsData.map((req: any) => ({
          ...req,
          productName: req.product_id?.name || req.productName,
          productSku: req.product_id?.sku || req.productSku,
        }))
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

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.productSku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request._id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesType = typeFilter === "all" || request.transactionType === typeFilter

    return matchesSearch && matchesStatus && matchesType
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transaction Requests</h1>
            <p className="text-muted-foreground">
              {user?.role === "admin"
                ? "Manage all inventory transaction requests"
                : "Create and manage your transaction requests"}
            </p>
          </div>

          <Button onClick={handleAddRequest}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
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
            <SelectTrigger className="w-[150px]">
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
