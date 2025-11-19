"use client"

import { useState } from "react"
import QRCode from "react-qr-code"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, Printer, QrCode } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QRCodeGeneratorProps {
  productId: string
  productName: string
  sku: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QRCodeGenerator({ productId, productName, sku, open, onOpenChange }: QRCodeGeneratorProps) {
  const { toast } = useToast()
  const [isDownloading, setIsDownloading] = useState(false)

  // QR Code data includes product ID and SKU for warehouse scanning
  const qrData = JSON.stringify({
    id: productId,
    sku: sku,
    name: productName,
    type: "inventory-item",
  })

  const downloadQRCode = async () => {
    try {
      setIsDownloading(true)
      const svg = document.getElementById(`qr-code-${productId}`)
      if (!svg) return

      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        canvas.width = 512
        canvas.height = 512
        ctx?.drawImage(img, 0, 0, 512, 512)
        const pngFile = canvas.toDataURL("image/png")

        const downloadLink = document.createElement("a")
        downloadLink.download = `qr-${sku}.png`
        downloadLink.href = pngFile
        downloadLink.click()

        toast({
          title: "QR Code Downloaded",
          description: `QR code for ${productName} has been saved.`,
        })
      }

      img.src = "data:image/svg+xml;base64," + btoa(svgData)
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download QR code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const printQRCode = () => {
    const printWindow = window.open("", "", "width=600,height=600")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${productName}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .qr-container {
              text-align: center;
              padding: 20px;
              border: 2px solid #000;
            }
            .product-info {
              margin-top: 20px;
              font-size: 14px;
            }
            .product-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div id="qr-code"></div>
            <div class="product-info">
              <div class="product-name">${productName}</div>
              <div>SKU: ${sku}</div>
              <div>ID: ${productId}</div>
            </div>
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 250);
          </script>
        </body>
      </html>
    `)

    const svg = document.getElementById(`qr-code-${productId}`)
    if (svg) {
      const qrElement = printWindow.document.getElementById("qr-code")
      if (qrElement) {
        qrElement.innerHTML = svg.outerHTML
      }
    }

    printWindow.document.close()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Product QR Code
          </DialogTitle>
          <DialogDescription>
            Scan this QR code to quickly access product information and create stock requests.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          <div className="bg-white p-4 rounded-lg">
            <QRCode
              id={`qr-code-${productId}`}
              value={qrData}
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
            />
          </div>

          <div className="text-center space-y-1">
            <h3 className="font-semibold text-lg">{productName}</h3>
            <p className="text-sm text-muted-foreground">SKU: {sku}</p>
            <p className="text-xs text-muted-foreground">ID: {productId}</p>
          </div>

          <div className="flex gap-2 w-full">
            <Button onClick={downloadQRCode} disabled={isDownloading} className="flex-1" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={printQRCode} className="flex-1" variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print Label
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
