"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, QrCode, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QRScannerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScanSuccess: (productData: { id: string; sku: string; name: string }) => void
}

export function QRScanner({ open, onOpenChange, onScanSuccess }: QRScannerProps) {
  const { toast } = useToast()
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  const startScanner = async () => {
    try {
      const scannerId = "qr-reader"
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerId)
      }

      const cameras = await Html5Qrcode.getCameras()
      if (cameras && cameras.length > 0) {
        setHasPermission(true)
        await scannerRef.current.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            handleScanSuccess(decodedText)
          },
          (errorMessage) => {
            // Ignore scan errors (camera is still working)
          }
        )
        setIsScanning(true)
      }
    } catch (error) {
      console.error("Scanner error:", error)
      setHasPermission(false)
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to scan QR codes.",
        variant: "destructive",
      })
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop()
        setIsScanning(false)
      } catch (error) {
        console.error("Error stopping scanner:", error)
      }
    }
  }

  const handleScanSuccess = async (decodedText: string) => {
    try {
      const productData = JSON.parse(decodedText)
      if (productData.type === "inventory-item") {
        await stopScanner()
        onScanSuccess({
          id: productData.id,
          sku: productData.sku,
          name: productData.name,
        })
        onOpenChange(false)
        toast({
          title: "QR Code Scanned",
          description: `Product: ${productData.name}`,
        })
      }
    } catch (error) {
      toast({
        title: "Invalid QR Code",
        description: "This QR code is not a valid inventory item.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (open) {
      startScanner()
    } else {
      stopScanner()
    }

    return () => {
      stopScanner()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Product QR Code
          </DialogTitle>
          <DialogDescription>
            Position the QR code within the frame to scan. This will automatically fill product details.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative w-full aspect-square max-w-sm rounded-lg overflow-hidden bg-black">
            <div id="qr-reader" className="w-full h-full" />
            {!isScanning && hasPermission === null && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                <div className="text-center text-white space-y-4">
                  <QrCode className="h-16 w-16 mx-auto animate-pulse" />
                  <p>Starting camera...</p>
                </div>
              </div>
            )}
            {hasPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                <div className="text-center text-white space-y-4 p-6">
                  <X className="h-16 w-16 mx-auto text-red-500" />
                  <p className="font-semibold">Camera Access Denied</p>
                  <p className="text-sm text-gray-300">Please enable camera permissions in your browser settings.</p>
                </div>
              </div>
            )}
          </div>

          <div className="text-center space-y-2 text-sm text-muted-foreground">
            <p>Align the QR code within the camera frame</p>
            <p>The scan will happen automatically</p>
          </div>

          <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
