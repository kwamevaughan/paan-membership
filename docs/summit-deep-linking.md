# Summit Pages Deep Linking Guide

All summit management pages are now deeply interconnected with navigation links and query parameter support for filtering and direct access.

## Quick Navigation Bar

Every summit page now includes a **SummitNavigation** component at the top that provides quick links to all related pages:
- Purchases
- Ticket Types
- Promo Codes
- Attendees
- Payments
- Analytics

## Deep Linking Features

### 1. **Ticket Types Page** (`/admin/summit/ticket-types`)

**Navigation Actions:**
- **View Purchases** - Navigate to purchases page filtered by ticket type name
  - URL: `/admin/summit/purchases?ticketType={ticketTypeName}`

**Query Parameters:**
- None currently (can be extended for filtering)

### 2. **Promo Codes Page** (`/admin/summit/promo-codes`)

**Navigation Actions:**
- **View Purchases** - Navigate to purchases page filtered by promo code
  - URL: `/admin/summit/purchases?promoCode={code}`
- **View Usage** - Shows usage statistics modal

**Query Parameters:**
- `code` - Highlight or filter to specific promo code

### 3. **Purchases Page** (`/admin/summit/purchases`)

**Navigation Actions:**
- **View Attendees** - Navigate to attendees page filtered by purchase ID
  - URL: `/admin/summit/attendees?purchaseId={id}`
- **View Payments** - Navigate to payments page filtered by purchase ID
  - URL: `/admin/summit/payments?purchaseId={id}`

**Query Parameters:**
- `ticketType` - Filter purchases by ticket type name
- `promoCode` - Filter purchases by promo code
- `purchaseId` - Auto-open purchase details modal
- `status` - Filter by purchase status (pending, paid, cancelled, refunded)
- `paymentStatus` - Filter by payment status (pending, completed, failed, refunded)

**Example URLs:**
- `/admin/summit/purchases?ticketType=VIP%20Delegate`
- `/admin/summit/purchases?promoCode=EARLYBIRD20`
- `/admin/summit/purchases?purchaseId=abc-123&status=paid`

### 4. **Attendees Page** (`/admin/summit/attendees`)

**Navigation Actions:**
- **View Purchase** - Opens purchase details modal and updates URL

**Query Parameters:**
- `purchaseId` - Auto-open purchase details modal and filter attendees
- `ticketType` - Filter attendees by ticket type
- `paymentStatus` - Filter by payment status

**Example URLs:**
- `/admin/summit/attendees?purchaseId=abc-123`
- `/admin/summit/attendees?ticketType=VIP%20Delegate&paymentStatus=completed`

### 5. **Payments Page** (`/admin/summit/payments`)

**Navigation Actions:**
- **View Purchase** - Opens purchase details modal and updates URL
- **View Gateway Response** - Shows gateway transaction details

**Query Parameters:**
- `purchaseId` - Auto-open purchase details modal and filter transactions
- `status` - Filter by transaction status
- `paymentMethod` - Filter by payment method (card, bank_transfer, refund)

**Example URLs:**
- `/admin/summit/payments?purchaseId=abc-123`
- `/admin/summit/payments?status=completed&paymentMethod=card`

### 6. **Analytics Page** (`/admin/summit/analytics`)

**Query Parameters:**
- Date range presets (today, week, month, quarter, year, all)

## Purchase Details Modal

The purchase details modal includes **Quick Links** section with buttons to navigate to:

- **View Attendees** - Navigate to attendees page filtered by purchase ID
- **View Payments** - Navigate to payments page filtered by purchase ID
- **View Promo Code** - Navigate to promo codes page (if promo code was used)
- **View Ticket Type** - Navigate to ticket types page (for the ticket type in purchase)

## Navigation Flow Examples

### Example 1: From Ticket Type to Purchases
1. Go to Ticket Types page
2. Click "View Purchases" action on a ticket type
3. Automatically navigates to Purchases page filtered by that ticket type
4. URL updates: `/admin/summit/purchases?ticketType=VIP%20Delegate`

### Example 2: From Purchase to Related Data
1. View a purchase in Purchases page
2. Purchase details modal opens
3. Click "View Attendees" in Quick Links
4. Navigates to Attendees page filtered by purchase ID
5. URL updates: `/admin/summit/attendees?purchaseId=abc-123`

### Example 3: Deep Link to Specific Purchase
1. Share URL: `/admin/summit/purchases?purchaseId=abc-123`
2. Page loads and automatically opens purchase details modal
3. All filters are preserved in URL

### Example 4: From Promo Code to Usage
1. Go to Promo Codes page
2. Click "View Purchases" on a promo code (if it has usage)
3. Navigates to Purchases page filtered by promo code
4. URL updates: `/admin/summit/purchases?promoCode=EARLYBIRD20`

## Implementation Details

### Navigation Utility
- **Location**: `src/components/summit/SummitNavigation.js`
- **Functions**:
  - `buildSummitLink(page, params)` - Builds URL with query parameters
  - `useSummitNavigation()` - Hook for programmatic navigation
  - `SummitNavigation` - Component for quick navigation bar

### Query Parameter Handling
All pages use `useEffect` hooks to:
1. Read query parameters on mount
2. Apply filters automatically
3. Open modals if specific IDs are provided
4. Update URL when navigating (shallow routing)

### URL Structure
All deep links follow this pattern:
```
/admin/summit/{page}?{param1}={value1}&{param2}={value2}
```

## Benefits

1. **Shareable Links** - Copy and share URLs to specific filtered views
2. **Browser History** - Back/forward buttons work correctly
3. **Bookmarkable** - Save filtered views as bookmarks
4. **Context Preservation** - Maintain context when navigating between pages
5. **Quick Access** - Jump directly to related data from any page

## Future Enhancements

Potential additions:
- Highlight specific rows when deep linking (e.g., highlight promo code in table)
- Breadcrumb navigation showing current filters
- Export filtered views with query parameters preserved
- Analytics dashboard links to filtered views

