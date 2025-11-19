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
  const [isInitializing, setIsInitializing] = useState(false)

  const requestCameraPermission = async () => {
    try {
      setIsInitializing(true)
      // Request camera permission through getUserMedia first
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      // Stop the stream immediately, we just needed permission
      stream.getTracks().forEach(track => track.stop())
      // Now start the QR scanner
      await startScanner()
    } catch (error: any) {
      console.error("Permission request error:", error)
      setHasPermission(false)
      setIsInitializing(false)
      
      let errorMessage = "Camera access denied."
      if (error?.name === "NotAllowedError") {
        errorMessage = "Camera access was denied. Please click 'Allow' when your browser asks for camera permission."
      } else if (error?.name === "NotFoundError") {
        errorMessage = "No camera found. Please connect a camera device."
      } else if (error?.name === "NotReadableError") {
        errorMessage = "Camera is in use by another app. Please close it and try again."
      }
      
      toast({
        title: "Camera Permission Required",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

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
        setIsInitializing(false)
      } else {
        setHasPermission(false)
        setIsInitializing(false)
        toast({
          title: "No Camera Found",
          description: "Please connect a camera device.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Scanner error:", error)
      setHasPermission(false)
      setIsInitializing(false)
      
      let errorMessage = "Failed to start camera."
      if (error?.name === "NotAllowedError" || error?.message?.includes("Permission")) {
        errorMessage = "Camera permission denied. Please allow camera access and try again."
      } else if (error?.name === "NotReadableError") {
        errorMessage = "Camera is in use. Close other apps using the camera."
      }
      
      toast({
        title: "Camera Error",
        description: errorMessage,
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
      // Don't auto-start, wait for user to click button
      setHasPermission(null)
      setIsInitializing(false)
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
            {!isScanning && hasPermission === null && !isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90">
                <div className="text-center text-white space-y-4 p-6">
                  <Camera className="h-20 w-20 mx-auto text-blue-400" />
                  <div>
                    <p className="font-semibold text-lg mb-2">Ready to Scan</p>
                    <p className="text-sm text-gray-300">Click below to activate camera</p>
                  </div>
                  <Button 
                    onClick={requestCameraPermission}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Activate Camera
                  </Button>
                </div>
              </div>
            )}
            {isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                <div className="text-center text-white space-y-4">
                  <QrCode className="h-16 w-16 mx-auto animate-pulse" />
                  <p>Requesting camera permission...</p>
                  <p className="text-xs text-gray-400">Please allow camera access in the browser popup</p>
                </div>
              </div>
            )}
            {hasPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90">
                <div className="text-center text-white space-y-4 p-6 max-w-sm">
                  <X className="h-16 w-16 mx-auto text-red-500" />
                  <p className="font-semibold text-lg">Camera Access Required</p>
                  <div className="text-sm text-gray-200 space-y-2 text-left">
                    <p className="font-medium">To enable camera access:</p>
                    <ol className="list-decimal list-inside space-y-1 text-gray-300">
                      <li>Click the camera icon in your browser's address bar</li>
                      <li>Select "Allow" for camera permissions</li>
                      <li>Refresh the page and try again</li>
                    </ol>
                    <p className="text-xs text-gray-400 mt-3">Note: HTTPS or localhost is required for camera access</p>
                  </div>
                  <Button 
                    onClick={() => onOpenChange(false)} 
                    variant="outline" 
                    className="mt-4 bg-white text-black hover:bg-gray-100"
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={requestCameraPermission}
                    variant="default" 
                    className="mt-2 w-full"
                  >
                    Try Again
                  </Button>
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
