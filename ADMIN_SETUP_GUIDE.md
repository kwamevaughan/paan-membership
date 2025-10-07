# Admin Setup Guide for Masterclass Management

## Environment Variables Required

To enable admin functionality for masterclass management, you need to add the following environment variable to your `.env.local` file:

```bash
# Supabase Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## How to Get the Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (not the anon key)
4. Add it to your `.env.local` file

## Why This Is Needed

The service role key allows the admin interface to:
- Create registrations on behalf of customers
- Update registration statuses
- Bypass Row Level Security (RLS) policies for admin operations
- Access all registration data for management purposes

## Security Note

⚠️ **Important**: The service role key should only be used on the server-side and never exposed to the client. Our implementation ensures it's only used in API routes.

## Database Migrations

Make sure to run the following migrations to set up proper RLS policies:

1. `20250106000001_create_masterclasses_schema.sql` - Creates the masterclass tables
2. `20250107000001_add_ticket_fields.sql` - Adds ticket management fields
3. `20250107000002_fix_admin_rls_policies.sql` - Fixes RLS policies for admin access

## Testing Admin Functionality

After setting up the environment variable:

1. Restart your development server
2. Navigate to `/admin/tickets`
3. Try creating a new ticket using the "Issue New Ticket" button
4. The operation should now work without RLS policy violations

## Troubleshooting

If you still get RLS policy errors:

1. Verify the service role key is correct
2. Ensure your user is in the `hr_users` table
3. Check that the migrations have been applied
4. Restart your development server after adding environment variables