"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Edit, Trash2, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface UserInterface {
  _id: string
  name: string
  email: string
  tel: string
  role: "admin" | "staff"
  createdAt: string
}

export function UsersTable() {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserInterface[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for demonstration
  useEffect(() => {
    const mockUsers: UserInterface[] = [
      {
        _id: "1",
        name: "John Doe",
        email: "john@example.com",
        tel: "+1234567890",
        role: "admin",
        createdAt: "2024-01-15T10:00:00Z",
      },
      {
        _id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        tel: "+1234567891",
        role: "staff",
        createdAt: "2024-01-20T14:30:00Z",
      },
      {
        _id: "3",
        name: "Mike Johnson",
        email: "mike@example.com",
        tel: "+1234567892",
        role: "staff",
        createdAt: "2024-02-01T09:15:00Z",
      },
      {
        _id: "4",
        name: "Sarah Wilson",
        email: "sarah@example.com",
        tel: "+1234567893",
        role: "admin",
        createdAt: "2024-02-10T16:45:00Z",
      },
    ]

    setTimeout(() => {
      setUsers(mockUsers)
      setIsLoading(false)
    }, 1000)
  }, [])

  const getRoleBadge = (role: string) => {
    return role === "admin" ? (
      <Badge variant="default" className="bg-purple-600">
        <Shield className="mr-1 h-3 w-3" />
        Admin
      </Badge>
    ) : (
      <Badge variant="secondary">
        <Shield className="mr-1 h-3 w-3" />
        Staff
      </Badge>
    )
  }

  const handleRoleChange = async (userId: string, newRole: "admin" | "staff") => {
    try {
      // In a real app, this would make an API call
      setUsers((prev) => prev.map((user) => (user._id === userId ? { ...user, role: newRole } : user)))

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      // In a real app, this would make an API call
      setUsers((prev) => prev.filter((user) => user._id !== userId))

      toast({
        title: "Success",
        description: "User deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
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
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="font-medium text-foreground">{user.name}</div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.tel}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(user.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(user._id, user.role === "admin" ? "staff" : "admin")}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Change to {user.role === "admin" ? "Staff" : "Admin"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteUser(user._id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="lg:hidden space-y-4">
        {users.map((user) => (
          <Card key={user._id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-base">{user.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleRoleChange(user._id, user.role === "admin" ? "staff" : "admin")}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Change to {user.role === "admin" ? "Staff" : "Admin"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteUser(user._id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p className="font-medium">{user.tel}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Role:</span>
                  <div className="mt-1">{getRoleBadge(user.role)}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Created:</span>
                  <p className="font-medium">{format(new Date(user.createdAt), "MMM dd, yyyy")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
