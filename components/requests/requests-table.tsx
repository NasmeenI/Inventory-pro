"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Edit, Trash2, FileText, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

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

interface RequestsTableProps {
  requests: Request[]
  onEditRequest: (request: Request) => void
  onRefresh: () => void
  isLoading: boolean
}

export function RequestsTable({ requests, onEditRequest, onRefresh, isLoading }: RequestsTableProps) {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [actioningId, setActioningId] = useState<string | null>(null)

  const handleDelete = async (requestId: string) => {
    if (!token) return

    setActioningId(requestId)
    try {
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Request deleted successfully",
        })
        onRefresh()
      } else {
        throw new Error("Failed to delete request")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete request",
        variant: "destructive",
      })
    } finally {
      setActioningId(null)
    }
  }

  const handleStatusUpdate = async (requestId: string, status: "approved" | "rejected") => {
    if (!token) return

    setActioningId(requestId)
    try {
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Request ${status} successfully`,
        })
        onRefresh()
      } else {
        throw new Error(`Failed to ${status} request`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${status} request`,
        variant: "destructive",
      })
    } finally {
      setActioningId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "approved":
        return (
          <Badge variant="default" className="bg-green-600">
            Approved
          </Badge>
        )
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant={type === "stockIn" ? "default" : "secondary"}>
        {type === "stockIn" ? "Stock In" : "Stock Out"}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading requests...</p>
        </div>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No requests found</h3>
          <p className="text-muted-foreground">Create your first transaction request to get started.</p>
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
              <TableHead>Request ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Transaction Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request._id}>
                <TableCell className="font-mono text-sm">{request._id.slice(-8)}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-foreground">{request.productName || "Unknown Product"}</div>
                    <div className="text-sm text-muted-foreground">{request.productSku}</div>
                  </div>
                </TableCell>
                <TableCell>{getTypeBadge(request.transactionType)}</TableCell>
                <TableCell className="font-medium">{request.itemAmount}</TableCell>
                <TableCell>{format(new Date(request.transactionDate), "MMM dd, yyyy")}</TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(request.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" disabled={actioningId === request._id}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {(user?.role === "admin" || request.createdBy === user?._id) && request.status === "pending" && (
                        <DropdownMenuItem onClick={() => onEditRequest(request)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}

                      {user?.role === "admin" && request.status === "pending" && (
                        <>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(request._id, "approved")}>
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(request._id, "rejected")}>
                            <X className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}

                      {(user?.role === "admin" || request.createdBy === user?._id) && (
                        <DropdownMenuItem onClick={() => handleDelete(request._id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="lg:hidden space-y-4">
        {requests.map((request) => (
          <Card key={request._id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{request.productName || "Unknown Product"}</CardTitle>
                  <p className="text-sm text-muted-foreground font-mono">#{request._id.slice(-8)}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={actioningId === request._id}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(user?.role === "admin" || request.createdBy === user?._id) && request.status === "pending" && (
                      <DropdownMenuItem onClick={() => onEditRequest(request)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}

                    {user?.role === "admin" && request.status === "pending" && (
                      <>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(request._id, "approved")}>
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(request._id, "rejected")}>
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </DropdownMenuItem>
                      </>
                    )}

                    {(user?.role === "admin" || request.createdBy === user?._id) && (
                      <DropdownMenuItem onClick={() => handleDelete(request._id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2 mb-3">
                {getTypeBadge(request.transactionType)}
                {getStatusBadge(request.status)}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">SKU:</span>
                  <p className="font-medium font-mono">{request.productSku}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount:</span>
                  <p className="font-medium">{request.itemAmount}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Transaction Date:</span>
                  <p className="font-medium">{format(new Date(request.transactionDate), "MMM dd, yyyy")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p className="font-medium">{format(new Date(request.createdAt), "MMM dd, yyyy")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
