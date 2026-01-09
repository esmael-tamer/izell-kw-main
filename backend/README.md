# IZELL KW Backend API

Production-ready backend API for IZELL Kuwait e-commerce store.

## Features

- ✅ Order tracking (public, status only)
- ✅ Products listing with search, pagination, sorting
- ✅ Coupon validation
- ✅ Store settings
- ✅ Rate limiting
- ✅ Security (Helmet, CORS)
- ✅ Zod validation
- ✅ Admin status update (protected)

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=3001
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:8081
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_SECRET=your-secure-admin-secret-min-16-chars
```

### 3. Run Database Migration

Run the SQL in `migrations/001_order_tracking.sql` in Supabase SQL Editor.

### 4. Start Development Server

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Health Check
```bash
GET /health
```

### Store Settings
```bash
GET /store-settings
```

### Products
```bash
# List products
GET /products
GET /products?search=velvet&page=1&limit=20&sort=created_at&order=desc

# Get single product
GET /products/:id
```

### Coupons
```bash
# Validate coupon
POST /coupons/validate
Content-Type: application/json

{
  "code": "SAVE10",
  "cartSubtotal": 50.000
}
```

### Orders
```bash
# Create order
POST /orders
Content-Type: application/json

{
  "customerName": "أحمد محمد",
  "customerEmail": "ahmed@example.com"
}

# Track order (public)
GET /orders/track?orderNumber=IZ-20260107-1234&token=uuid-token-here

# Alternative tracking endpoint
GET /track?orderNumber=IZ-20260107-1234&token=uuid-token-here

# Update status (admin)
PATCH /orders/admin/IZ-20260107-1234/status
X-Admin-Secret: your-admin-secret
Content-Type: application/json

{
  "status": "shipped"
}
```

## cURL Examples

### Create Order
```bash
curl -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "أحمد محمد",
    "customerEmail": "ahmed@example.com"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "orderNumber": "IZ-20260107-1234",
    "trackingToken": "550e8400-e29b-41d4-a716-446655440000",
    "status": "pending"
  }
}
```

### Track Order
```bash
curl "http://localhost:3001/orders/track?orderNumber=IZ-20260107-1234&token=550e8400-e29b-41d4-a716-446655440000"
```

Response:
```json
{
  "success": true,
  "data": {
    "orderNumber": "IZ-20260107-1234",
    "status": "pending",
    "updatedAt": "2026-01-07T12:00:00.000Z"
  }
}
```

### Validate Coupon
```bash
curl -X POST http://localhost:3001/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SAVE10",
    "cartSubtotal": 50.000
  }'
```

Response (valid):
```json
{
  "success": true,
  "data": {
    "valid": true,
    "discountType": "percentage",
    "discountValue": 10,
    "discountAmount": 5.000,
    "finalSubtotal": 45.000
  }
}
```

Response (invalid):
```json
{
  "success": true,
  "data": {
    "valid": false,
    "reason": "Invalid coupon code"
  }
}
```

### Update Order Status (Admin)
```bash
curl -X PATCH http://localhost:3001/orders/admin/IZ-20260107-1234/status \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: your-admin-secret" \
  -d '{"status": "shipped"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "orderNumber": "IZ-20260107-1234",
    "status": "shipped",
    "updatedAt": "2026-01-07T14:30:00.000Z"
  }
}
```

## Deployment

### Railway / Render / Replit

1. Set environment variables in the platform dashboard
2. Build command: `npm run build`
3. Start command: `npm start`

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

### VPS (PM2)

```bash
npm install -g pm2
npm run build
pm2 start dist/index.js --name izell-api
pm2 save
```

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| General | 100 req/15min |
| Coupon Validation | 20 req/min |
| Order Creation | 5 req/min |
| Order Tracking | 30 req/min |
| Admin Endpoints | 10 req/min |

## Security

- ✅ Helmet security headers
- ✅ CORS restricted to frontend origin
- ✅ Rate limiting
- ✅ Input validation (Zod)
- ✅ Service role key server-side only
- ✅ Admin endpoints protected by secret header
- ✅ No public SELECT on sensitive tables

## License

MIT
