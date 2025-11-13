import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "InventoryPro - Professional Inventory Management",
  description: "Complete inventory management system with role-based access control",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} h-full`}>
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </div>
            }
          >
            <AuthProvider>
              <div className="h-full">{children}</div>
              <Toaster />
            </AuthProvider>
          </Suspense>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
