// API configuration and utilities
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1"

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(errorData.message || `HTTP error! status: ${response.status}`, response.status, errorData)
    }

    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      return await response.json()
    }

    return response as unknown as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError("Network error occurred", 0)
  }
}

// API endpoints
export const api = {
  // Authentication
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiRequest<{ success: boolean; _id: string; name: string; email: string; role: string; token: string }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(credentials),
        },
      ),

    register: (userData: { name: string; email: string; tel: string; role: string; password: string }) =>
      apiRequest<{ success: boolean; _id: string; name: string; email: string; role: string; token: string }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify(userData),
        },
      ),

    logout: () => apiRequest<{ success: boolean }>("/auth/logout"),

    getMe: () => apiRequest<{ success: boolean; data: any }>("/auth/me"),
  },

  // Products
  products: {
    getAll: () => apiRequest<any[]>("/products"),

    getById: (id: string) => apiRequest<any>(`/products/${id}`),

    create: (productData: any) =>
      apiRequest<any>("/products", {
        method: "POST",
        body: JSON.stringify(productData),
      }),

    update: (id: string, productData: any) =>
      apiRequest<any>(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(productData),
      }),

    delete: (id: string) =>
      apiRequest<{ success: boolean }>(`/products/${id}`, {
        method: "DELETE",
      }),

    updateStock: (id: string, stockQuantity: number) =>
      apiRequest<any>(`/products/${id}/stock`, {
        method: "PUT",
        body: JSON.stringify({ stockQuantity }),
      }),
  },

  // Requests
  requests: {
    getAll: () => apiRequest<any[]>("/requests"),

    getById: (id: string) => apiRequest<any>(`/requests/${id}`),

    create: (requestData: any) =>
      apiRequest<any>("/requests", {
        method: "POST",
        body: JSON.stringify(requestData),
      }),

    update: (id: string, requestData: any) =>
      apiRequest<any>(`/requests/${id}`, {
        method: "PUT",
        body: JSON.stringify(requestData),
      }),

    delete: (id: string) =>
      apiRequest<{ success: boolean }>(`/requests/${id}`, {
        method: "DELETE",
      }),
  },
}
