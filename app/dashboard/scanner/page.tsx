"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QRScanner } from "@/components/qr/qr-scanner"
import { RequestDialog } from "@/components/requests/request-dialog"
import { Package, ScanLine, ArrowDownToLine, ArrowUpFromLine, History } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface ScannedProduct {
  id: string
  sku: string
  name: string
  timestamp: Date
}

export default function WarehouseScanner() {
  const { user } = useAuth()
  const [showScanner, setShowScanner] = useState(false)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ScannedProduct | null>(null)
  const [recentScans, setRecentScans] = useState<ScannedProduct[]>([])
  const [transactionType, setTransactionType] = useState<"stockIn" | "stockOut">("stockIn")

  const handleScanSuccess = (productData: { id: string; sku: string; name: string }) => {
    const scannedProduct: ScannedProduct = {
      ...productData,
      timestamp: new Date(),
    }
    
    setSelectedProduct(scannedProduct)
    setRecentScans((prev) => [scannedProduct, ...prev.slice(0, 9)]) // Keep last 10 scans
  }

  const handleQuickStockIn = () => {
    if (selectedProduct) {
      setTransactionType("stockIn")
      setShowRequestDialog(true)
    }
  }

  const handleQuickStockOut = () => {
    if (selectedProduct) {
      setTransactionType("stockOut")
      setShowRequestDialog(true)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-green-500 via-emerald-600 to-teal-600 p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <ScanLine className="h-10 w-10" />
              <h1 className="text-4xl font-bold">Warehouse Scanner</h1>
            </div>
            <p className="text-green-50 text-lg">
              Streamline your inventory operations with QR code scanning
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanner Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Scan</CardTitle>
              <CardDescription>
                Scan product QR codes to quickly process stock movements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                onClick={() => setShowScanner(true)}
                size="lg"
                className="w-full h-24 text-lg bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                <ScanLine className="mr-3 h-8 w-8" />
                Start Scanning
              </Button>

              {selectedProduct && (
                <div className="space-y-4 p-6 rounded-lg border-2 border-primary bg-primary/5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Last Scanned Product</h3>
                    <Badge variant="default">Active</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Package className="h-10 w-10 text-primary" />
                      <div>
                        <h4 className="text-xl font-bold">{selectedProduct.name}</h4>
                        <p className="text-sm text-muted-foreground">SKU: {selectedProduct.sku}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <Button
                      onClick={handleQuickStockIn}
                      variant="default"
                      className="h-14 bg-green-600 hover:bg-green-700"
                    >
                      <ArrowDownToLine className="mr-2 h-5 w-5" />
                      Stock In
                    </Button>
                    <Button
                      onClick={handleQuickStockOut}
                      variant="default"
                      className="h-14 bg-orange-600 hover:bg-orange-700"
                    >
                      <ArrowUpFromLine className="mr-2 h-5 w-5" />
                      Stock Out
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Scans Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Scans
              </CardTitle>
              <CardDescription>
                Your scanning history from this session
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentScans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ScanLine className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No scans yet</p>
                  <p className="text-xs">Start scanning to see history</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentScans.map((scan, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedProduct(scan)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{scan.name}</p>
                          <p className="text-xs text-muted-foreground">{scan.sku}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(scan.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <ScanLine className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{recentScans.length}</p>
                  <p className="text-sm text-muted-foreground">Scans Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <ArrowDownToLine className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Fast</p>
                  <p className="text-sm text-muted-foreground">Stock In Process</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <ArrowUpFromLine className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Quick</p>
                  <p className="text-sm text-muted-foreground">Stock Out Process</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <QRScanner
        open={showScanner}
        onOpenChange={setShowScanner}
        onScanSuccess={handleScanSuccess}
      />

      {selectedProduct && (
        <RequestDialog
          request={null}
          open={showRequestDialog}
          onOpenChange={setShowRequestDialog}
          onSaved={() => {
            setShowRequestDialog(false)
            // Optional: Clear selected product after creating request
            // setSelectedProduct(null)
          }}
        />
      )}
    </DashboardLayout>
  )
}
