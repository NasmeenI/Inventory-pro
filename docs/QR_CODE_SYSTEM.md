# QR Code System for Warehouse Operations

## Overview
The QR Code system streamlines inventory management by allowing quick scanning of products for stock in/out operations.

## Features

### 1. QR Code Generation
- **Location**: Products Table → QR button on each product
- **Functionality**: 
  - Generates unique QR codes for each product
  - Includes product ID, SKU, and name
  - Download as PNG image
  - Print QR code labels with product information

### 2. QR Code Scanning
- **Location**: 
  - Warehouse Scanner page (`/dashboard/scanner`)
  - Request Dialog → "Scan QR" button
- **Functionality**:
  - Camera-based QR code scanning
  - Automatic product selection
  - Quick stock in/out processing

### 3. Warehouse Scanner Page
- **Features**:
  - Dedicated scanning interface
  - Recent scans history
  - Quick action buttons for stock in/out
  - Session statistics

## Usage Instructions

### Generating QR Codes

1. Navigate to the Products page
2. Find the product you want to generate a QR code for
3. Click the "QR" button
4. In the dialog, you can:
   - Download the QR code as PNG
   - Print a label with product info

### Scanning QR Codes

#### Method 1: Warehouse Scanner Page
1. Navigate to "Warehouse Scanner" from the sidebar
2. Click "Start Scanning"
3. Allow camera permissions
4. Point camera at QR code
5. Once scanned:
   - Product appears in "Last Scanned Product"
   - Click "Stock In" or "Stock Out" buttons
   - Fill in quantity and submit

#### Method 2: From Request Dialog
1. Go to Requests page
2. Click "New Request"
3. Click "Scan QR" button next to Product field
4. Scan the QR code
5. Product will be automatically selected
6. Complete the rest of the form

## QR Code Data Format

```json
{
  "id": "product_mongodb_id",
  "sku": "PROD-SKU",
  "name": "Product Name",
  "type": "inventory-item"
}
```

## Browser Compatibility

- **Desktop**: Chrome, Edge, Firefox (requires HTTPS or localhost)
- **Mobile**: Chrome, Safari (iOS 11+), Samsung Internet
- **Camera Permission**: Required for scanning functionality

## Workflow Example

### Receiving New Stock (Stock In)

1. Print QR codes for your products
2. Attach labels to physical inventory
3. When receiving new stock:
   - Open Warehouse Scanner page
   - Scan the product QR code
   - Click "Stock In"
   - Enter quantity received
   - Submit request

### Picking Items (Stock Out)

1. Scan product QR code
2. Click "Stock Out"
3. Enter quantity to pick
4. Submit request
5. Admin approves the request

## Tips for Best Results

1. **Printing QR Codes**:
   - Use high-quality printer for clarity
   - Recommended size: 2x2 inches minimum
   - Include product name and SKU on label

2. **Scanning**:
   - Ensure good lighting
   - Hold camera steady
   - Position QR code within the frame
   - Keep camera 4-8 inches from code

3. **Warehouse Setup**:
   - Attach QR codes to prominent locations
   - Protect labels with clear tape or laminate
   - Keep backup digital copies of QR codes

## Permissions

- **All Users**: Can scan QR codes and create requests
- **Admin**: Can generate and print QR codes
- **Staff**: Can scan QR codes for stock requests

## Troubleshooting

### Camera Not Working
- Check browser permissions
- Ensure HTTPS connection (or localhost)
- Try different browser
- Check if another app is using camera

### QR Code Not Scanning
- Ensure good lighting
- Clean camera lens
- Verify QR code is not damaged
- Try adjusting distance

### Product Not Found After Scan
- Verify product exists in database
- Check QR code was generated from this system
- Ensure QR code hasn't been modified

## Future Enhancements

Potential improvements:
- Batch scanning support
- Offline scanning capability
- QR code history tracking
- Analytics on scan frequency
- Integration with mobile apps
