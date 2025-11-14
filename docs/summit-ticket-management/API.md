# Summit Ticket Management API Documentation

## Base URL
All API endpoints are prefixed with `/api/summit`

## Authentication
All endpoints require authentication via Supabase Auth. Include the session token in requests.

Admin-only endpoints also require the user to have the `admin` role in the `hr_users` table.

## Rate Limiting
- Default: 100 requests per minute per IP address
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets

## Response Format
All responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Purchases

### GET /api/summit/purchases
Fetch all ticket purchases with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50, max: 100)
- `status` (string): Filter by purchase status
- `payment_status` (string): Filter by payment status
- `search` (string): Search by purchaser name or email
- `start_date` (string): Filter by date range start
- `end_date` (string): Filter by date range end

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "total_amount": 500.00,
      "currency": "USD",
      "status": "confirmed",
      "payment_status": "completed",
      "purchaser": {
        "full_name": "John Doe",
        "email": "john@example.com"
      },
      "items": [...],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

### GET /api/summit/purchases/[id]
Fetch a single purchase with complete details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "purchaser": { ... },
    "items": [ ... ],
    "attendees": [ ... ],
    "transactions": [ ... ]
  }
}
```

### PATCH /api/summit/purchases/[id]/status
Update purchase status.

**Request Body:**
```json
{
  "status": "confirmed",
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

### POST /api/summit/purchases/[id]/refund
Process a refund for a purchase.

**Request Body:**
```json
{
  "amount": 500.00,
  "reason": "Customer request",
  "refund_method": "original_payment"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "refund_id": "uuid",
    "amount": 500.00,
    "status": "processed"
  }
}
```

### GET /api/summit/purchases/export
Export purchases to CSV or Excel.

**Query Parameters:**
- `format` (string): "csv" or "excel" (default: "csv")
- All filter parameters from GET /purchases

**Response:**
File download

---

## Ticket Types

### GET /api/summit/ticket-types
Fetch all ticket types.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "VIP Pass",
      "category": "Premium",
      "price": 500.00,
      "original_price": 600.00,
      "currency": "USD",
      "features": ["Feature 1", "Feature 2"],
      "is_active": true
    }
  ]
}
```

### POST /api/summit/ticket-types
Create a new ticket type.

**Request Body:**
```json
{
  "name": "VIP Pass",
  "category": "Premium",
  "price": 500.00,
  "original_price": 600.00,
  "currency": "USD",
  "features": ["Feature 1", "Feature 2"],
  "is_active": true
}
```

### PATCH /api/summit/ticket-types/[id]
Update a ticket type.

**Request Body:**
Same as POST, all fields optional.

### DELETE /api/summit/ticket-types/[id]
Soft delete a ticket type (sets is_active to false).

---

## Promo Codes

### GET /api/summit/promo-codes
Fetch all promo codes.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "EARLYBIRD",
      "discount_type": "percentage",
      "discount_value": 20,
      "usage_limit": 100,
      "used_count": 45,
      "valid_from": "2024-01-01",
      "valid_until": "2024-12-31",
      "is_active": true
    }
  ]
}
```

### POST /api/summit/promo-codes
Create a new promo code.

**Request Body:**
```json
{
  "code": "EARLYBIRD",
  "description": "Early bird discount",
  "discount_type": "percentage",
  "discount_value": 20,
  "usage_limit": 100,
  "valid_from": "2024-01-01",
  "valid_until": "2024-12-31",
  "applicable_ticket_types": ["uuid1", "uuid2"],
  "is_active": true
}
```

### PATCH /api/summit/promo-codes/[id]
Update a promo code.

### POST /api/summit/promo-codes/validate
Validate a promo code and calculate discount.

**Request Body:**
```json
{
  "code": "EARLYBIRD",
  "ticket_type_id": "uuid",
  "amount": 500.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "discount_amount": 100.00,
    "final_amount": 400.00
  }
}
```

### GET /api/summit/promo-codes/[id]/usage
Get usage statistics for a promo code.

---

## Attendees

### GET /api/summit/attendees
Fetch all attendees with filtering.

**Query Parameters:**
- `page`, `limit`: Pagination
- `ticket_type`: Filter by ticket type
- `visa_letter_needed`: Filter by visa letter requirement
- `search`: Search by name or email

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "full_name": "Jane Smith",
      "email": "jane@example.com",
      "ticket_type": "VIP Pass",
      "purchaser": { ... },
      "purchase": { ... }
    }
  ]
}
```

### GET /api/summit/attendees/export
Export attendees to CSV or Excel.

### PATCH /api/summit/attendees/[id]
Update attendee information.

---

## Payments

### GET /api/summit/payments
Fetch all payment transactions.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "purchase_id": "uuid",
      "amount": 500.00,
      "currency": "USD",
      "payment_method": "credit_card",
      "payment_gateway": "stripe",
      "status": "completed",
      "gateway_transaction_id": "txn_123",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /api/summit/payments/[id]
Fetch a single payment transaction.

### PATCH /api/summit/payments/[id]/reconcile
Manually reconcile a payment.

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Manually verified"
}
```

---

## Analytics

### GET /api/summit/analytics/revenue
Get revenue trends over time.

**Query Parameters:**
- `start_date`: Start date (ISO format)
- `end_date`: End date (ISO format)
- `interval`: "daily", "weekly", or "monthly"

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "revenue": 5000.00,
      "transactions": 10
    }
  ]
}
```

### GET /api/summit/analytics/tickets
Get ticket sales by type.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ticket_type": "VIP Pass",
      "quantity": 50,
      "revenue": 25000.00
    }
  ]
}
```

### GET /api/summit/analytics/summary
Get summary statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_revenue": 50000.00,
    "total_tickets": 100,
    "average_ticket_price": 500.00,
    "total_discount": 5000.00,
    "active_promo_codes": 5
  }
}
```

### GET /api/summit/analytics/promo-codes
Get promo code effectiveness.

---

## Bulk Email

### POST /api/summit/email/bulk
Send bulk emails to attendees.

**Request Body:**
```json
{
  "subject": "Summit Update",
  "body": "Email content",
  "filters": {
    "ticket_types": ["uuid1"],
    "payment_status": "completed"
  }
}
```

### GET /api/summit/email/templates
Get available email templates.

### POST /api/summit/email/templates
Create a new email template.

---

## Audit Logs

### GET /api/summit/audit-logs
Fetch audit logs.

**Query Parameters:**
- `page`, `limit`: Pagination
- `action`: Filter by action type
- `entity_type`: Filter by entity type
- `user_id`: Filter by user
- `start_date`, `end_date`: Date range

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "action": "refund",
      "entity_type": "purchase",
      "entity_id": "uuid",
      "changes": { ... },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## Error Codes

- `400` - Bad Request: Invalid input
- `401` - Unauthorized: Authentication required
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource not found
- `409` - Conflict: Resource conflict
- `422` - Unprocessable Entity: Validation failed
- `429` - Too Many Requests: Rate limit exceeded
- `500` - Internal Server Error: Server error
- `503` - Service Unavailable: Service temporarily unavailable
