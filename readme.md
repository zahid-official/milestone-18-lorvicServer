<div align="center">
  <img
    src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6&height=200&section=header&text=Lorvic%20API&fontSize=50&fontAlignY=35&animation=fadeIn&desc=Production-Ready%20E-Commerce%20Platform&descAlignY=55&descSize=18"
    alt="Header"
  />
</div>

<div align="center">
  <h2>
    <img
      src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Rocket.png"
      width="28px"
      alt="Fast"
    />
    Enterprise Grade Multi Vendor E-Commerce Backend
  </h2>
  <p><strong>Built with precision, designed for growth</strong></p>
  <p><strong>Lorvic</strong> is a production-ready, scalable backend API for modern multi-vendor e-commerce platforms. Built with cutting-edge technologies and industry best practices, it provides a robust foundation for marketplace applications with secure payment processing, role-based access control, and comprehensive vendor management.</p>
</div>

<div align="center">
    
  [![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge)](https://github.com/zahid-official/milestone-18-server)
  [![Node.js](https://img.shields.io/badge/Node.js-18.x-3C873A.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Express](https://img.shields.io/badge/Express.js-5.0-aa8800.svg?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
</div>

<div align="center">
    
  [![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black.svg?style=for-the-badge&logo=vercel)](https://vercel.com)
  [![Stripe](https://img.shields.io/badge/Stripe-008CDD.svg?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
  [![License](https://img.shields.io/badge/license-MIT-22333b.svg?style=for-the-badge)](LICENSE)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-0081a7.svg?style=for-the-badge)](https://github.com/zahid-official/milestone-18-server/pulls)
</div>

## ✨ Features

<table align="center">
  <tr>
    <td width="50%">
      
### 🔐 Authentication & Security
- **JWT-based Authentication** with httpOnly cookies
- **Role-based Access Control** (Admin, Vendor, Customer)
- **Passport.js Integration** with local strategy
- **Password Security** using bcrypt encryption
- **Automatic Admin Bootstrap** on deployment
      
### 🏪 Vendor Management
- **Multi-vendor Marketplace** architecture
- **Product Catalog Management** with image uploads
- **Inventory Tracking** with real-time updates
- **Order Processing** with status tracking
- **Vendor Analytics** and reporting
      
    </td>
    <td width="50%">
      
### 👨‍💼 Administrative Control
- **User Management** dashboard
- **Vendor Account Management** with approval workflows
- **Customer Account Oversight** and support
- **Platform Analytics** with detailed insights
- **Soft Delete Patterns** for data retention
      
### 💰 Payment & Orders
- **Stripe Checkout Integration** for secure payments
- **Payment Webhooks** for real-time updates
- **Order Lifecycle Management** (Pending → Delivered)
- **Automatic Stock Management** with restock on cancel
- **Transaction History** and financial tracking
      
    </td>
  </tr>
</table>

</br>

## 🗺️ System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Application]
        B[Mobile Application]
        C[Admin Dashboard]
    end

    subgraph "API Gateway"
        D[Load Balancer]
        E[API Router /api/v1]
    end

    subgraph "Service Layer"
        F[Auth Service]
        G[User Service]
        H[Admin Service]
        I[Vendor Service]
        J[Product Service]
        K[Order Service]
        L[Payment Service]
    end

    subgraph "Data Layer"
        M[(MongoDB)]
        N[Cloudinary CDN]
        O[Stripe Gateway]
    end

    A & B & C --> D
    D --> E
    E --> F & G & H & I & J & K & L
    F & G & H & I & J & K & L --> M
    J --> N
    L --> O
```

<div align="center">
    
| Design Principle              | Description                                                           |
| ----------------------------- | --------------------------------------------------------------------- |
| **🎯 Modular Architecture**    | Clear module boundaries for maintainability and scalability           |
| **📈 Horizontal Scalability**  | Built to scale out with increased load                               |
| **🔒 Security-First**          | Security considerations at every architectural layer                  |
| **☁️ Cloud-Native**            | Designed for cloud deployment with CDN and payment integration       |
| **📊 Type-Safe**               | Full TypeScript coverage with Zod runtime validation                 |
</div>

## 🛠️ **Tech Stack**

<div align="center">
    
### **Core Technologies**

<table>
  <tr>
    <td align="center" width="120">
      <img
        src="https://skillicons.dev/icons?i=typescript"
        width="48"
        height="48"
        alt="TypeScript"
      />
      <br />TypeScript
    </td>
    <td align="center" width="100">
      <img
        src="https://skillicons.dev/icons?i=nodejs"
        width="50"
        height="50"
        alt="Node.js"
      />
      <br />Node.js
    </td>
    <td align="center" width="100">
      <img
        src="https://skillicons.dev/icons?i=express"
        width="50"
        height="50"
        alt="Express"
      />
      <br />Express 5
    </td>
    <td align="center" width="100">
      <img
        src="https://skillicons.dev/icons?i=mongodb"
        width="50"
        height="50"
        alt="MongoDB"
      />
      <br />MongoDB
    </td>
    <td align="center" width="100">
      <img
        src="https://skillicons.dev/icons?i=cloudflare"
        width="50"
        height="50"
        alt="Cloudinary"
      />
      <br />Cloudinary
    </td>
    <td align="center" width="120">
      <img
        src="https://skillicons.dev/icons?i=vercel"
        width="48"
        height="48"
        alt="Vercel"
      />
      <br />Vercel
    </td>
  </tr>
</table>

### **Additional Stack**

| Category          | Technologies                 | Purpose                     |
| :---------------- | :--------------------------- | :-------------------------- |
| 🔒 **Security**   | `JWT` `Passport.js` `Bcrypt` | Authentication & protection |
| ✅ **Validation** | `Zod` `Mongoose`             | Schema validation & ODM     |
| 💳 **Payment**    | `Stripe`                     | Payment processing          |
| ☁️ **Storage**    | `Multer` `Cloudinary`        | File upload & CDN           |
| 🚀 **Deployment** | `Vercel`                     | Cloud deployment            |

</div>

</br>

## 🚀 **Getting Started**

### **⚡ Quick Installation**

```bash
# 1. Clone the repository
git clone https://github.com/zahid-official/milestone-18-server.git
cd milestone-18-server

# 2. Install dependencies (pnpm recommended)
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Start development server
pnpm dev

# 5. Access the API
# http://localhost:5000/api/v1
```

### **📦 Using MongoDB Atlas (Recommended)**

For easier setup without local MongoDB installation:

1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get connection string
3. Update `.env` with your connection string:

   ```env
   DB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/lorvicDB
   ```

### **🔧 Environment Configuration**

<details>
<summary><b>Click to view essential .env variables</b></summary>

```env
# ================================
# Core Configuration
# ================================
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# ================================
# Database
# ================================
DB_URL=mongodb+srv://username:password@cluster.mongodb.net/lorvicDB?retryWrites=true&w=majority

# OR Local MongoDB
# DB_URL=mongodb://localhost:27017/lorvicDB

# ================================
# JWT Configuration
# ================================
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_ACCESS_EXPIRESIN=1h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_REFRESH_EXPIRESIN=7d

# ================================
# Session Configuration
# ================================
EXPRESS_SESSION_SECRET=your-session-secret-min-32-chars

# ================================
# Password Security
# ================================
BCRYPT_SALT_ROUNDS=12

# ================================
# Default Admin (Auto-created on startup)
# ================================
DEFAULT_ADMIN_EMAIL=admin@lorvic.com
DEFAULT_ADMIN_PASSWORD=ChangeMe123!

# ================================
# Cloudinary Configuration
# ================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-cloudinary-secret

# ================================
# Stripe Configuration
# ================================
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET_KEY=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SUCCESS_FRONTEND_URL=http://localhost:3000/payment/success
STRIPE_CANCELED_FRONTEND_URL=http://localhost:3000/payment/cancel
```

</details>

---

## 📚 **API Documentation**

### **🔗 Base URLs**

```yaml
Development: http://localhost:5000/api/v1
Production: https://lorvic-api.vercel.app/api/v1
```

### **📋 API Endpoints**

<details>
<summary><b>🔐 Click to view Authentication Routes</b></summary>

| HTTP Method | Endpoint               | Description               | Authentication Required |
| ----------- | ---------------------- | ------------------------- | ----------------------- |
| `POST`      | `/auth/login`          | User authentication       | No                      |
| `POST`      | `/auth/logout`         | Clear session and cookies | Authenticated           |
| `PATCH`     | `/auth/changePassword` | Update user password      | Authenticated           |

</details>

<details>
<summary><b>👤 Click to view User Management Routes</b></summary>

| HTTP Method | Endpoint               | Description                      | Authentication Required |
| ----------- | ---------------------- | -------------------------------- | ----------------------- |
| `GET`       | `/user`                | List all active users            | Admin Only              |
| `GET`       | `/user/deletedUsers`   | List soft-deleted users          | Admin Only              |
| `GET`       | `/user/singleUser/:id` | Get user by ID                   | Admin Only              |
| `GET`       | `/user/profile`        | Get current user profile         | Authenticated           |
| `PATCH`     | `/user/profile`        | Update profile (supports upload) | Authenticated           |

</details>

<details>
<summary><b>👨‍💼 Click to view Admin Management Routes</b></summary>

| HTTP Method | Endpoint        | Description       | Authentication Required |
| ----------- | --------------- | ----------------- | ----------------------- |
| `GET`       | `/admin`        | List all admins   | Admin Only              |
| `POST`      | `/admin/create` | Create new admin  | Admin Only              |
| `DELETE`    | `/admin/:id`    | Soft delete admin | Admin Only              |

</details>

<details>
<summary><b>🏪 Click to view Vendor Management Routes</b></summary>

| HTTP Method | Endpoint         | Description           | Authentication Required |
| ----------- | ---------------- | --------------------- | ----------------------- |
| `GET`       | `/vendor`        | List all vendors      | Admin Only              |
| `POST`      | `/vendor/create` | Create vendor account | Admin Only              |
| `DELETE`    | `/vendor/:id`    | Soft delete vendor    | Admin Only              |

</details>

<details>
<summary><b>👥 Click to view Customer Management Routes</b></summary>

| HTTP Method | Endpoint           | Description           | Authentication Required |
| ----------- | ------------------ | --------------------- | ----------------------- |
| `GET`       | `/customer`        | List all customers    | Admin Only              |
| `POST`      | `/customer/create` | Customer registration | Public                  |
| `DELETE`    | `/customer/:id`    | Soft delete customer  | Admin Only              |

</details>

<details>
<summary><b>📦 Click to view Product Catalog Routes</b></summary>

| HTTP Method | Endpoint                     | Description                  | Authentication Required |
| ----------- | ---------------------------- | ---------------------------- | ----------------------- |
| `GET`       | `/product`                   | List products (with filters) | Vendor/Admin            |
| `GET`       | `/product/singleProduct/:id` | Get product details          | Vendor/Admin            |
| `POST`      | `/product/create`            | Create product (with image)  | Vendor Only             |
| `PATCH`     | `/product/:id`               | Update product               | Vendor Only (Owner)     |
| `DELETE`    | `/product/:id`               | Delete product               | Vendor Only (Owner)     |

</details>

<details>
<summary><b>🛍️ Click to view Order Management Routes</b></summary>

| HTTP Method | Endpoint                 | Description                  | Authentication Required |
| ----------- | ------------------------ | ---------------------------- | ----------------------- |
| `GET`       | `/order`                 | List vendor orders           | Vendor Only             |
| `GET`       | `/order/userOrders`      | List customer orders         | Customer Only           |
| `GET`       | `/order/singleOrder/:id` | Get order details (vendor)   | Vendor Only             |
| `GET`       | `/order/userOrder/:id`   | Get order details (customer) | Customer Only           |
| `POST`      | `/order/create`          | Create order & checkout      | Customer Only           |
| `PATCH`     | `/order/:id/in-progress` | Mark order processing        | Vendor Only             |
| `PATCH`     | `/order/:id/delivered`   | Mark order delivered         | Vendor Only             |
| `PATCH`     | `/order/:id/cancel`      | Cancel unpaid order          | Customer Only           |

</details>

<details>
<summary><b>💳 Click to view Payment Webhooks</b></summary>

| HTTP Method | Endpoint   | Description            | Authentication Required |
| ----------- | ---------- | ---------------------- | ----------------------- |
| `POST`      | `/webhook` | Stripe payment updates | Stripe Signature        |

</details>

### API Response Format

All API responses follow this consistent structure:

#### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": {
    "Response payload"
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "totalPage": 5,
    "totalDoc": 48
  }
}
```

#### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation error",
  "error": {
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## 👥 User Roles & Permissions

### Role Hierarchy

```mermaid
graph TD
    A[Administrator] --> B[Full System Access]
    C[Vendor] --> D[Product Management]
    E[Customer] --> F[Shopping & Orders]

    B --> G[User Management]
    B --> H[Vendor Management]
    B --> I[Platform Oversight]

    D --> J[Create/Update Products]
    D --> K[Manage Orders]
    D --> L[View Analytics]

    F --> M[Browse Products]
    F --> N[Place Orders]
    F --> O[Order History]
```

### Administrator Role

Administrators have comprehensive platform oversight with full system access. Key responsibilities include:

- **User Management**: Complete control over user accounts including creation, modification, and soft deletion
- **Vendor Operations**: Review vendor accounts, manage vendor status and permissions
- **Customer Support**: Access to all customer data, orders, and support operations
- **Platform Oversight**: Access to all products, transactions, and system analytics
- **System Administration**: Configuration management and default admin bootstrap

### Vendor Role

Vendors are marketplace sellers with specialized tools for product and order management:

- **Product Catalog**: Create, update, and delete products with image uploads
- **Inventory Management**: Track stock levels with automatic updates on orders
- **Order Processing**: View and manage orders for owned products
- **Order Lifecycle**: Move orders through stages (Confirmed → Processing → Delivered)
- **Analytics Access**: View sales performance and product metrics

### Customer Role

Customers represent the buyer base with access to shopping and order functionality:

- **Account Management**: Profile creation, modification, and maintenance
- **Product Browsing**: Search, filter, and view product catalogs
- **Shopping Cart**: Create orders with multiple products
- **Checkout Process**: Secure payment via Stripe Checkout
- **Order Management**: View order history and cancel unpaid orders
- **Order Tracking**: Monitor order status from confirmation to delivery

---

## 🔒 Security

### Authentication Framework

**JWT Implementation**

- Stateless authentication using JSON Web Tokens
- Dual-token system with access and refresh tokens
- httpOnly cookies for XSS protection
- Secure cookie flags in production (HTTPS, sameSite: none)
- Automatic token validation on protected routes

**Password Security**

- bcrypt hashing with configurable salt rounds (default: 12)
- Password complexity requirements enforced
- Secure password change process with old password verification
- Protection against common password attacks

### Authorization System

**Role-Based Access Control**

- Granular permission system based on user roles (Admin, Vendor, Customer)
- Resource-level access control for sensitive operations
- Ownership validation (vendors can only modify their own products)
- Dynamic permission validation for all protected endpoints

### Data Protection

**Encryption Standards**

- Data encryption at rest and in transit
- Secure communication protocols (HTTPS in production)
- Database connection encryption
- API endpoint security headers with CORS configuration

**Privacy Controls**

- Soft delete patterns for data retention
- User data protection with role-based access
- Secure file uploads with Cloudinary integration
- Payment data never stored (handled by Stripe)

---

## 💳 Payment Integration

### Stripe Checkout Flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant A as Lorvic API
    participant S as Stripe
    participant W as Webhook

    C->>A: POST /order/create
    A->>A: Validate & Reduce Stock
    A->>S: Create Checkout Session
    S-->>A: Return Session URL
    A-->>C: Return Checkout URL
    C->>S: Complete Payment
    S->>W: Send Webhook Event
    W->>A: POST /webhook
    A->>A: Update Payment & Order Status
    A->>A: Confirm Order
```

### Order Status Lifecycle

```
PENDING → CONFIRMED → IN_PROCESSING → DELIVERED
   ↓
CANCELLED (if payment fails or customer cancels)
```

### Payment Status States

```
UNPAID    → Initial state after order creation
PAID      → Payment successful (Stripe webhook)
FAILED    → Payment declined or session expired
```

### Webhook Events Handled

| Event                                   | Action                             |
| --------------------------------------- | ---------------------------------- |
| `checkout.session.completed`            | Mark payment PAID, order CONFIRMED |
| `checkout.session.expired`              | Mark payment FAILED, restore stock |
| `checkout.session.async_payment_failed` | Mark payment FAILED, restore stock |

### Local Webhook Testing

```bash
# Install Stripe CLI
stripe listen --forward-to http://localhost:5000/webhook

# Use the webhook signing secret in .env
STRIPE_WEBHOOK_SECRET_KEY=whsec_xxxxxxxxxxxxx
```

---

## 📤 File Upload System

### Supported Upload Types

- **Product Thumbnails**: JPEG, PNG, WebP (max 5MB)
- **Profile Photos**: JPEG, PNG (max 2MB)

### Upload Flow

```typescript
// 1. Client sends multipart/form-data
const formData = new FormData();
formData.append("file", imageFile);
formData.append(
  "data",
  JSON.stringify({
    name: "Product Name",
    price: 99.99,
  }),
);

// 2. Multer processes upload
// 3. Cloudinary stores file
// 4. Server receives secure URL
// 5. URL saved in database
```

### Cloudinary Configuration

```typescript
Folder Structure:
  /lorvic/products/    → Product images
  /lorvic/profiles/    → User avatars

Transformations:
  - Auto format (WebP when supported)
  - Quality optimization
  - Lazy loading ready
```

### Error Handling

If a database operation fails after upload, the middleware automatically deletes the Cloudinary asset to prevent orphaned files.

---

## 💻 Development & Deployment

<details>
<summary><h3>📂 Project Structure</h3></summary>

```
lorvic-backend/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 config/                    # Application configuration
│   │   │   ├── 📄 index.ts                # Environment variables
│   │   │   ├── 📄 multer.config.ts        # File upload config
│   │   │   ├── 📄 cloudinary.config.ts    # Cloud storage
│   │   │   ├── 📄 stripe.config.ts        # Payment gateway
│   │   │   └── 📄 passport.config.ts      # Auth strategy
│   │   │
│   │   ├── 📁 middlewares/                # Express middlewares
│   │   │   ├── 📄 auth.middleware.ts       # JWT validation
│   │   │   ├── 📄 validateSchema.ts        # Zod validation
│   │   │   ├── 📄 errorHandler.ts          # Global errors
│   │   │   └── 📄 notFound.ts              # 404 handler
│   │   │
│   │   ├── 📁 modules/                    # Feature modules
│   │   │   ├── 📁 auth/                   # Authentication
│   │   │   │   ├── 📄 auth.controller.ts
│   │   │   │   ├── 📄 auth.service.ts
│   │   │   │   ├── 📄 auth.validation.ts
│   │   │   │   └── 📄 auth.route.ts
│   │   │   │
│   │   │   ├── 📁 user/                   # User management
│   │   │   │   ├── 📄 user.controller.ts
│   │   │   │   ├── 📄 user.interface.ts
│   │   │   │   ├── 📄 user.model.ts
│   │   │   │   ├── 📄 user.service.ts
│   │   │   │   ├── 📄 user.validation.ts
│   │   │   │   └── 📄 user.route.ts
│   │   │   │
│   │   │   ├── 📁 admin/                  # Admin operations
│   │   │   ├── 📁 vendor/                 # Vendor management
│   │   │   ├── 📁 customer/               # Customer operations
│   │   │   ├── 📁 product/                # Product catalog
│   │   │   ├── 📁 order/                  # Order processing
│   │   │   └── 📁 payment/                # Payment webhooks
│   │   │
│   │   ├── 📁 routes/                     # Route aggregation
│   │   │   └── 📄 index.ts                # Main routes (/api/v1)
│   │   │
│   │   └── 📁 utils/                      # Utility functions
│   │       ├── 📄 jwtHelper.ts            # JWT utilities
│   │       ├── 📄 cookieHelper.ts         # Cookie management
│   │       ├── 📄 queryBuilder.ts         # Query construction
│   │       └── 📄 responseHelper.ts       # Response formatting
│   │
│   ├── 📄 app.ts                          # Express app setup
│   └── 📄 server.ts                       # Server bootstrap
│
├── 📁 dist/                               # Compiled output
├── 📄 .env.example                        # Environment template
├── 📄 .gitignore                          # Git ignore rules
├── 📄 package.json                        # Dependencies
├── 📄 tsconfig.json                       # TypeScript config
├── 📄 vercel.json                         # Vercel config
└── 📄 README.md                           # This file
```

</details>

### **Available Scripts**

| Script       | Description                              |
| ------------ | ---------------------------------------- |
| `pnpm dev`   | Start development server with hot reload |
| `pnpm build` | Compile TypeScript to JavaScript         |
| `pnpm start` | Run production server (requires build)   |
| `pnpm lint`  | Run ESLint on source files               |

### **Deploy to Vercel**

<div>

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/zahid-official/milestone-18-server)

</div>

#### **Manual Deployment**

```bash
# Install Vercel CLI
npm i -g vercel

# Build the project
pnpm build

# Deploy
vercel

# Set environment variables
vercel env add DB_URL
vercel env add JWT_ACCESS_SECRET
vercel env add STRIPE_SECRET_KEY

# Deploy to production
vercel --prod
```

#### **Vercel Configuration**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ]
}
```

### **Production Checklist**

- [ ] Set `NODE_ENV=production`
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Enable Stripe live mode keys
- [ ] Set up Stripe webhook endpoint in dashboard
- [ ] Enable Cloudinary auto-optimization
- [ ] Configure CORS for production domain
- [ ] Set secure cookie flags (`secure: true`, `sameSite: 'none'`)
- [ ] Change default admin password after first login
- [ ] Test payment flows end-to-end
- [ ] Set up error monitoring (optional)

---

## 🌟 **Author**

<div align="center">
  <a href="https://github.com/zahid-official">
    <img src="https://github.com/zahid-official.png" width="150" height="150" style="border-radius: 50%;" alt="Zahid Official" />
  </a>
  
  <h3>Zahid Official</h3>
  <p><b>Full Stack Developer | Tech Enthusiast</b></p>
  
  [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/zahid-official)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/zahid-web)
  [![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:zahid.official8@gmail.com)
  
  <p>Built with passion and dedication to create scalable e-commerce solutions</p>
</div>

---

## 🔗 **Project Links**

<div align="center">

| Resource           | URL                                                                      |
| ------------------ | ------------------------------------------------------------------------ |
| 🌐 **Live API**    | [lorvic-api.vercel.app](https://lorvic-api.vercel.app/)                  |
| 💻 **Client App**  | [lorvic-official.vercel.app](https://lorvic-official.vercel.app/)        |
| 🗄️ **Server Repo** | [GitHub - Server](https://github.com/zahid-official/milestone-18-server) |
| 📱 **Client Repo** | [GitHub - Client](https://github.com/zahid-official/milestone-18-client) |

</div>

---

## 🤝 **Contributing**

Contributions make the open source community amazing! Any contributions you make are **greatly appreciated**.

```bash
1. Fork the Project
2. Create your Feature Branch (git checkout -b feature/AmazingFeature)
3. Commit your Changes (git commit -m 'Add some AmazingFeature')
4. Push to the Branch (git push origin feature/AmazingFeature)
5. Open a Pull Request
```

### Code Standards

- Follow existing TypeScript conventions
- Write meaningful commit messages
- Add comments for complex logic
- Ensure all scripts pass before submitting
- Update documentation for API changes

</br>

<div align="center">
Lorvic API - A enterprise-grade multi-vendor e-commerce platform backend built with edge technologies and best practices
</div>
