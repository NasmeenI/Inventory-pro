# InventoryPro - Professional Inventory Management System

A comprehensive inventory management system built with Next.js, featuring role-based access control, real-time updates, and a modern dark theme interface.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin/Staff)
- Protected routes and components
- Secure token management

### 📦 Product Management
- Complete CRUD operations for products
- Stock level tracking and alerts
- Product categorization and search
- Image support and metadata

### 📋 Request Management
- Stock in/out transaction requests
- Approval workflow for administrators
- Request history and status tracking
- Validation rules for stock operations

### 👥 User Management (Admin Only)
- User role management
- Account creation and deletion
- Activity monitoring
- System settings and configuration

### 🎨 Modern UI/UX
- Dark theme inspired by Vercel dashboard
- Responsive design for all devices
- Professional component library
- Intuitive navigation and workflows

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **State Management**: React Context, Custom hooks
- **Authentication**: JWT tokens, Local storage
- **API Integration**: Custom API layer with error handling
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Mono

## Getting Started

### Prerequisites
- Node.js 18+ 
- Backend API server running (see API documentation)

### Installation

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd inventory-management
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` with your configuration:
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

4. Run the development server
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Integration

The frontend integrates with the provided Express.js backend API:

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/logout` - User logout
- `GET /auth/me` - Get current user

### Products Endpoints
- `GET /products` - Get all products
- `POST /products` - Create product (Admin only)
- `GET /products/:id` - Get product by ID
- `PUT /products/:id` - Update product (Admin only)
- `DELETE /products/:id` - Delete product (Admin only)
- `PUT /products/:id/stock` - Update stock quantity (Admin only)

### Requests Endpoints
- `GET /requests` - Get requests (filtered by role)
- `POST /requests` - Create request
- `GET /requests/:id` - Get request by ID
- `PUT /requests/:id` - Update request
- `DELETE /requests/:id` - Delete request

## User Roles & Permissions

### Staff Users
- View all products
- Create stock in/out requests
- Edit/delete own requests
- View own request history
- Update profile settings

### Admin Users
- All staff permissions
- Create/edit/delete products
- Manage all user requests
- Approve/reject requests
- User management
- System settings

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── layout/           # Layout components
│   ├── products/         # Product components
│   ├── requests/         # Request components
│   ├── ui/               # UI components
│   └── users/            # User components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── README.md            # This file
\`\`\`

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Tailwind CSS for styling

## Deployment

The application can be deployed to Vercel, Netlify, or any platform supporting Next.js:

1. Build the application
\`\`\`bash
npm run build
\`\`\`

2. Deploy to your preferred platform
3. Set environment variables in your deployment platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
