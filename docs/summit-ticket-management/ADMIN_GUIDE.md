# Summit Ticket Management - Admin Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Managing Ticket Types](#managing-ticket-types)
3. [Managing Promo Codes](#managing-promo-codes)
4. [Processing Purchases](#processing-purchases)
5. [Managing Attendees](#managing-attendees)
6. [Payment Management](#payment-management)
7. [Analytics & Reporting](#analytics--reporting)
8. [Bulk Operations](#bulk-operations)

---

## Getting Started

### Accessing the Admin Panel

1. Navigate to `/admin/summit/purchases`
2. Log in with your admin credentials
3. You'll see the main dashboard with navigation to all sections

### Navigation

The Summit Management section includes:
- **Purchases**: View and manage all ticket purchases
- **Ticket Types**: Create and manage ticket types
- **Promo Codes**: Create and manage discount codes
- **Attendees**: View and manage attendee information
- **Payments**: Monitor and reconcile payments
- **Analytics**: View sales and revenue analytics

---

## Managing Ticket Types

### Creating a New Ticket Type

1. Go to **Ticket Types** page
2. Click **Add Ticket Type** button
3. Fill in the required information:
   - **Name**: Ticket name (e.g., "VIP Pass")
   - **Category**: Ticket category (e.g., "Premium", "Standard")
   - **Price**: Current price
   - **Original Price** (optional): Show discount by setting higher original price
   - **Currency**: Currency code (e.g., "USD")
   - **Features**: List of features included (one per line)
4. Click **Save**

### Editing a Ticket Type

1. Find the ticket type in the list
2. Click the **Edit** icon
3. Update the information
4. Click **Save**

### Activating/Deactivating Ticket Types

1. Find the ticket type in the list
2. Click **Toggle Status**
3. Inactive tickets won't be available for purchase but existing purchases remain valid

### Best Practices

- Use clear, descriptive names
- Keep features concise and benefit-focused
- Set original price to show savings
- Deactivate instead of deleting to preserve purchase history

---

## Managing Promo Codes

### Creating a Promo Code

1. Go to **Promo Codes** page
2. Click **Add Promo Code**
3. Fill in the details:
   - **Code**: Unique code (uppercase, no spaces)
   - **Description**: Internal description
   - **Discount Type**: Percentage or Fixed Amount
   - **Discount Value**: Amount or percentage
   - **Usage Limit** (optional): Maximum number of uses
   - **Valid From/Until**: Date range for validity
   - **Applicable Ticket Types**: Select which tickets the code applies to
4. Click **Save**

### Monitoring Promo Code Usage

1. View the **Used Count** column to see how many times a code has been used
2. Click on a promo code to see detailed usage statistics
3. Check the **Usage** endpoint in Analytics for effectiveness metrics

### Deactivating a Promo Code

1. Find the promo code in the list
2. Click **Edit**
3. Uncheck **Active**
4. Click **Save**

### Best Practices

- Use memorable, relevant codes (e.g., "EARLYBIRD", "SUMMIT2024")
- Set reasonable usage limits to control costs
- Monitor usage regularly
- Deactivate expired codes to keep the list clean

---

## Processing Purchases

### Viewing Purchases

1. Go to **Purchases** page
2. Use filters to find specific purchases:
   - Search by name or email
   - Filter by status or payment status
   - Filter by date range
3. Click on a purchase to view full details

### Purchase Details

Each purchase shows:
- Purchaser information
- Items purchased (tickets)
- Attendee information
- Payment transactions
- Status history

### Updating Purchase Status

1. Open the purchase details
2. Click **Update Status**
3. Select new status:
   - **Pending**: Awaiting payment
   - **Confirmed**: Payment received
   - **Cancelled**: Purchase cancelled
   - **Refunded**: Refund processed
4. Add optional notes
5. Click **Save**

### Processing Refunds

1. Open the purchase details
2. Click **Process Refund**
3. Enter refund details:
   - **Amount**: Full or partial refund
   - **Reason**: Required for audit trail
   - **Refund Method**: Original payment method or other
4. Click **Confirm Refund**
5. The system will:
   - Create a refund transaction
   - Update purchase status
   - Send notification email
   - Log the action in audit trail

### Refund Guidelines

- Full refunds: Use total purchase amount
- Partial refunds: Specify exact amount
- Always provide a clear reason
- Refunds are logged and cannot be undone
- Customer will receive automatic email notification

---

## Managing Attendees

### Viewing Attendees

1. Go to **Attendees** page
2. View all registered attendees
3. Use filters:
   - Search by name or email
   - Filter by ticket type
   - Filter by visa letter requirement

### Visa Letter Requests

Attendees requiring visa letters are highlighted with an alert icon.

To handle visa letter requests:
1. Filter for "Visa Letters Only"
2. Export the filtered list
3. Process visa letters externally
4. Update attendee records as needed

### Exporting Attendee Data

1. Select attendees (or select all)
2. Click **Export** button
3. Choose format:
   - **CSV**: For spreadsheets
   - **Excel**: For Microsoft Excel
   - **Visa Letters**: Special format for visa processing
4. File will download automatically

### Updating Attendee Information

1. Find the attendee in the list
2. Click **Edit**
3. Update information
4. Click **Save**

---

## Payment Management

### Viewing Transactions

1. Go to **Payments** page
2. View all payment transactions
3. Filter by:
   - Payment status
   - Payment method
   - Date range

### Transaction Details

Each transaction shows:
- Purchase reference
- Amount and currency
- Payment method and gateway
- Gateway transaction ID
- Gateway response
- Status and timestamps

### Reconciling Payments

For payments that need manual verification:

1. Find the transaction
2. Click **Reconcile**
3. Verify payment with gateway
4. Update status:
   - **Completed**: Payment verified
   - **Failed**: Payment failed
   - **Pending**: Still processing
5. Add notes explaining the reconciliation
6. Click **Save**

### Payment Status Meanings

- **Pending**: Payment initiated, awaiting confirmation
- **Completed**: Payment successful
- **Failed**: Payment failed
- **Refunded**: Payment refunded
- **Cancelled**: Payment cancelled

---

## Analytics & Reporting

### Revenue Analytics

1. Go to **Analytics** page
2. View key metrics:
   - Total revenue
   - Total tickets sold
   - Average ticket price
   - Total discounts given

### Revenue Trends

- View revenue over time
- Select date range
- Choose interval (daily, weekly, monthly)
- Identify peak sales periods

### Ticket Sales by Type

- See which ticket types are most popular
- View quantity sold and revenue per type
- Identify best-performing tickets

### Geographic Distribution

- View purchases by country
- Identify key markets
- Plan targeted marketing

### Promo Code Effectiveness

- See which promo codes are most used
- Calculate discount impact
- Measure ROI of promotional campaigns

### Exporting Reports

1. Select the data you want to export
2. Click **Export**
3. Choose format (CSV or Excel)
4. File downloads with current filters applied

---

## Bulk Operations

### Bulk Email

1. Go to **Attendees** page
2. Click **Send Bulk Email**
3. Configure email:
   - **Recipients**: Select filters
     - All attendees
     - By ticket type
     - By payment status
     - By visa letter requirement
   - **Subject**: Email subject line
   - **Body**: Email content (supports HTML)
   - **Template** (optional): Use saved template
4. Preview recipients count
5. Click **Send**

### Email Best Practices

- Test with a small group first
- Use clear, concise subject lines
- Include relevant information only
- Provide contact information
- Respect unsubscribe requests

### Bulk Export

1. Select multiple items using checkboxes
2. Click **Export Selected**
3. Choose format
4. File downloads with selected items only

### Bulk Delete

1. Select multiple items using checkboxes
2. Click **Delete Selected**
3. Confirm the action
4. Items are archived (soft delete)

---

## Tips & Best Practices

### General

- Regularly review and update ticket types
- Monitor promo code usage to prevent abuse
- Process refunds promptly
- Keep attendee information up to date
- Review analytics weekly

### Security

- Never share admin credentials
- Log out when finished
- Review audit logs regularly
- Report suspicious activity immediately

### Performance

- Use filters to narrow down large lists
- Export data in smaller batches if needed
- Clear browser cache if experiencing issues
- Use Chrome or Firefox for best experience

### Customer Service

- Respond to refund requests within 24 hours
- Keep customers informed of status changes
- Be professional in all communications
- Document all customer interactions

---

## Troubleshooting

### Common Issues

**Can't find a purchase**
- Check spelling in search
- Try searching by email instead of name
- Check date filters
- Verify purchase exists in database

**Refund not processing**
- Verify payment was completed
- Check refund amount is valid
- Ensure you have admin permissions
- Contact technical support if issue persists

**Export not downloading**
- Check browser pop-up blocker
- Try different browser
- Reduce export size
- Clear browser cache

**Email not sending**
- Verify recipients are selected
- Check email content is valid
- Ensure email service is configured
- Review error message for details

---

## Support

For technical issues or questions:
1. Check this guide first
2. Review the API documentation
3. Check the troubleshooting section
4. Contact technical support with:
   - Description of issue
   - Steps to reproduce
   - Screenshots if applicable
   - Your admin username (never password)
