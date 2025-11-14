# Summit Ticket Management System

A comprehensive ticket management system for summit events, built with Next.js, Supabase, and React.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Admin Guide](#admin-guide)
- [Database Schema](#database-schema)
- [Security](#security)
- [Performance](#performance)

## Overview

The Summit Ticket Management System provides a complete solution for managing ticket sales, attendees, payments, and analytics for summit events. It includes both customer-facing and administrative interfaces.

## Features

### Ticket Management
- Multiple ticket types with customizable features
- Dynamic pricing with original price display
- Category-based organization
- Active/inactive status control

### Promo Codes
- Percentage and fixed amount discounts
- Usage limits and tracking
- Date range validity
- Ticket type restrictions
- Automatic validation

### Purchase Management
- Complete purchase tracking
- Multiple attendees per purchase
- Payment status monitoring
- Refund processing
- Status updates with audit trail

### Attendee Management
- Individual attendee records
- Visa letter request tracking
- Dietary requirements and special needs
- Export functionality (CSV/Excel)
- Bulk email capabilities

### Payment Processing
- Multiple payment methods support
- Gateway integration tracking
- Transaction reconciliation
- Payment status management
- Refund handling

### Analytics & Reporting
- Revenue trends and forecasting
- Ticket sales by type
- Geographic distribution
- Promo code effectiveness
- Key performance metrics

### Security Features
- Role-based access control
- Rate limiting
- Input sanitization
- Audit logging
- CSRF protection

## Architecture

### Frontend
- **Framework**: Next.js 13+ with App Router
- **UI Components**: React with Tailwind CSS
- **State Management**: React Hooks
- **Icons**: Iconify
- **Forms**: Custom form components with validation

### Backend
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage (for exports)

### Key Directories
```
paan-membership/
├── src/
│   ├── pages/
│   │   ├── admin/summit/          # Admin pages
│   │   └── api/summit/            # API routes
│   ├── components/
│   │   ├── summit/                # Summit-specific components
│   │   └── common/                # Shared components
│   ├── hooks/                     # Custom React hooks
│   ├── utils/                     # Utility functions
│   └── lib/                       # Third-party integrations
└── docs/summit-ticket-management/ # Documentation
```

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd paan-membership
   npm install
   ```

3. Set up environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. Run database migrations (see [Database Schema](#database-schema))

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Access the admin panel at `http://localhost:3000/admin/summit/purchases`

## API Documentation

See [API.md](./API.md) for complete API documentation including:
- Endpoint descriptions
- Request/response formats
- Authentication requirements
- Error handling
- Rate limits

## Admin Guide

See [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) for:
- How to manage ticket types
- Creating and managing promo codes
- Processing refunds
- Viewing analytics
- Exporting data
- Sending bulk emails

## Database Schema

See [SCHEMA.md](./SCHEMA.md) for:
- Table structures
- Relationships
- Indexes
- Constraints
- Sample queries

## Security

### Authentication
All admin routes require authentication and admin role verification.

### Rate Limiting
API routes are rate-limited to prevent abuse:
- Default: 100 requests per minute per IP
- Configurable per endpoint

### Input Validation
All user inputs are validated and sanitized:
- Email format validation
- Phone number validation
- XSS prevention
- SQL injection prevention

### Audit Logging
All sensitive operations are logged:
- Refunds
- Status changes
- Payment reconciliation
- Bulk operations

### CSRF Protection
CSRF tokens are used for state-changing operations.

## Performance

### Caching
- Query results cached for 1-5 minutes
- Configurable TTL per query type
- Automatic cache invalidation

### Pagination
- All list endpoints support pagination
- Default page size: 50 items
- Maximum page size: 100 items

### Database Optimization
- Indexes on frequently queried columns
- Efficient join queries
- Query result limiting

### Frontend Optimization
- React.memo for expensive components
- Lazy loading for large lists
- Debounced search inputs
- Optimized re-renders

## Troubleshooting

### Common Issues

**Issue**: API returns 401 Unauthorized
- **Solution**: Verify authentication token is valid and user has admin role

**Issue**: Slow query performance
- **Solution**: Check database indexes, reduce page size, enable caching

**Issue**: Export fails
- **Solution**: Check data size, verify permissions, check browser console for errors

**Issue**: Promo code not applying
- **Solution**: Verify code is active, within date range, and applicable to selected tickets

## Support

For issues and questions:
1. Check this documentation
2. Review the [API documentation](./API.md)
3. Check the [Admin Guide](./ADMIN_GUIDE.md)
4. Contact the development team

## License

Proprietary - All rights reserved
