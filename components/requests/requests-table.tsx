"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Edit, Trash2, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { api } from "@/lib/api"


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

interface RequestsTableProps {
  requests: Request[]
  onEditRequest: (request: Request) => void
  onRefresh: () => void
  isLoading: boolean
}

export function RequestsTable({ requests, onEditRequest, onRefresh, isLoading }: RequestsTableProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [actioningId, setActioningId] = useState<string | null>(null)

  const handleDelete = async (requestId: string) => {
    setActioningId(requestId)
    try {
      await api.requests.delete(requestId)
      toast({
        title: "Success",
        description: "Request deleted successfully",
      })
      onRefresh()
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

  // Status updates (approve/reject) are omitted because backend schema may not have status

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="secondary">-</Badge>
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
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(request.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  {(() => {
                    const isAdmin = user?.role === "admin"
                    const isOwner = request.createdBy === user?._id
                    const canEdit = isAdmin || isOwner
                    const canDelete = isAdmin || isOwner

                    if (!canEdit && !canDelete) {
                      return (
                        <div className="flex items-center">
                          <Button variant="ghost" size="sm" disabled>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    }

                    return (
                      <div className="flex items-center gap-2">
                        {canEdit && (
                          <Button variant="outline" size="sm" onClick={() => onEditRequest(request)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(request._id)}
                            disabled={actioningId === request._id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        )}
                      </div>
                    )
                  })()}
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
                    {(user?.role === "admin" || request.createdBy === user?._id) && (
                      <DropdownMenuItem onClick={() => onEditRequest(request)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
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
