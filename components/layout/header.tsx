"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Bell, Search, Menu } from "lucide-react"

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth()

  return (
    <header className="h-16 flex-shrink-0 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center space-x-4">
        {onMenuClick && (
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="h-4 w-4" />
          </Button>
        )}
        <h1 className="text-base lg:text-lg font-semibold text-card-foreground truncate">Inventory Management</h1>
      </div>

      <div className="flex items-center space-x-2 lg:space-x-4">
        <Button variant="ghost" size="sm" className="hidden sm:flex">
          <Search className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm">
          <Bell className="h-4 w-4" />
        </Button>

        <div className="text-sm text-muted-foreground hidden sm:block">Welcome, {user?.name}</div>
        <div className="text-xs text-muted-foreground sm:hidden">{user?.name?.split(" ")[0]}</div>
      </div>
    </header>
  )
}
