# Summit Tables Setup Guide

This guide will help you set up all the necessary database tables for the Summit Management system.

## Tables Required

The following tables need to be created in your Supabase database:

1. **purchasers** - Main purchaser information
2. **ticket_types** - Predefined ticket types with pricing
3. **ticket_purchases** - Main purchase records
4. **purchase_items** - Individual ticket selections in purchases
5. **attendees** - Individual attendee information
6. **payment_transactions** - Payment history and gateway responses
7. **promo_codes** - Discount codes and promotions

## Quick Setup (Recommended)

### Option 1: Run SQL Migration File (Easiest)

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Open the file: `supabase/migrations/summit-tables.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run**

This will:
- Create all ENUM types
- Create all tables
- Create indexes for performance
- Set up triggers for `updated_at` timestamps
- Insert default ticket types and sample promo codes
- Set up Row Level Security (RLS) policies

### Option 2: Use the Node.js Script

1. Make sure you have your environment variables set in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Run the setup script:
   ```bash
   node scripts/setup-summit-tables.js
   ```

3. The script will:
   - Check which tables already exist
   - Generate a migration SQL file
   - Provide instructions for running it

### Option 3: Use Supabase CLI (If using migrations)

If you're using Supabase CLI for migrations:

```bash
# Copy the migration file to your migrations folder
cp supabase/migrations/summit-tables.sql supabase/migrations/$(date +%Y%m%d%H%M%S)_summit_tables.sql

# Apply the migration
supabase migration up
```

## Verification

After running the migration, verify the tables were created:

1. Go to Supabase Dashboard > **Table Editor**
2. You should see all 7 tables listed
3. Check that `ticket_types` has 6 default ticket types
4. Check that `promo_codes` has 4 sample promo codes

## Important Notes

### Row Level Security (RLS)

The migration includes RLS policies that:
- Allow full access to admins (users in `hr_users` table)
- Allow public read access to active ticket types (for the purchase page)

**Important:** Make sure your `hr_users` table exists and is properly set up. If you don't have this table, you'll need to either:
1. Create it first, or
2. Modify the RLS policies to match your authentication setup

### Default Data

The migration includes:
- **6 default ticket types** (General Admission, VIP, Agency Pass, Student, International, Virtual)
- **4 sample promo codes** (EARLYBIRD20, STUDENT50, VIP100, AGENCY25)

You can modify or delete these after the migration runs.

### Currency Field

The `ticket_types` table includes a `currency` field (defaults to 'USD'). This was added to support multi-currency pricing.

## Troubleshooting

### Error: "relation already exists"
- This means the table already exists. The migration uses `CREATE TABLE IF NOT EXISTS`, so it should be safe to run again.

### Error: "type already exists"
- The ENUM types already exist. This is handled by the `DO $$ BEGIN ... EXCEPTION` blocks.

### Error: "permission denied"
- Make sure you're using the **Service Role Key** (not the anon key) when running migrations
- Check that your Supabase project has the necessary permissions

### RLS Policies Not Working
- Verify that `hr_users` table exists
- Check that users are properly added to `hr_users` table
- Review the policy conditions in the SQL file

## Next Steps

After setting up the tables:

1. ✅ Test the Ticket Types page: `/admin/summit/ticket-types`
2. ✅ Test the Promo Codes page: `/admin/summit/promo-codes`
3. ✅ Test the Attendees page: `/admin/summit/attendees`
4. ✅ Test the Payments page: `/admin/summit/payments`
5. ✅ Test the Analytics page: `/admin/summit/analytics`

## Support

If you encounter any issues:
1. Check the Supabase logs in the Dashboard
2. Review the SQL migration file for syntax errors
3. Verify your environment variables are correct
4. Ensure your Supabase project has the necessary permissions

