"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { api, ApiError } from "@/lib/api"

interface User {
  _id: string
  name: string
  email: string
  role: "admin" | "staff"
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      // Optionally verify token with server
      verifyToken(storedToken)
    }
    setIsLoading(false)
  }, [])

  const verifyToken = async (token: string) => {
    try {
      const response = await api.auth.getMe()
      if (response.success && response.data) {
        const userData = response.data
        setUser({
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        })
      }
    } catch (error) {
      // Token is invalid, clear auth data
      logout()
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const data = await api.auth.login({ email, password })

      const userData = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role as "admin" | "staff",
      }

      setUser(userData)
      setToken(data.token)

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(userData))

      router.push("/dashboard")
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message)
      }
      throw new Error("Login failed")
    }
  }

  const register = async (userData: any) => {
    try {
      const data = await api.auth.register(userData)

      const user = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role as "admin" | "staff",
      }

      setUser(user)
      setToken(data.token)

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(user))

      router.push("/dashboard")
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message)
      }
      throw new Error("Registration failed")
    }
  }

  const logout = async () => {
    try {
      await api.auth.logout()
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API call failed:", error)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      router.push("/")
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
