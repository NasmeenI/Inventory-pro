"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, FileText, Users, Settings, LogOut, X, ScanLine } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "staff"] },
  { name: "Products", href: "/dashboard/products", icon: Package, roles: ["admin", "staff"] },
  { name: "Requests", href: "/dashboard/requests", icon: FileText, roles: ["admin", "staff"] },
  { name: "Warehouse Scanner", href: "/dashboard/scanner", icon: ScanLine, roles: ["admin", "staff"] },
  { name: "Users", href: "/dashboard/users", icon: Users, roles: ["admin"] },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["admin", "staff"] },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const filteredNavigation = navigation.filter((item) => item.roles.includes(user?.role || "staff"))

  return (
    <div className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="flex items-center justify-between p-6 lg:block">
        <div>
          <h2 className="text-xl font-bold text-sidebar-foreground">InventoryPro</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.role === "admin" ? "Administrator" : "Staff Member"}
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href} onClick={onClose}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start", isActive && "bg-sidebar-accent text-sidebar-accent-foreground")}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">{user?.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
