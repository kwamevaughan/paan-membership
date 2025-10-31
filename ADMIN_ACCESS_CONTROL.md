# Admin Access Control System

This document explains the admin access control system implemented to secure the HR dashboard.

## Overview

The system now requires users to have explicit admin privileges to access the HR dashboard. Simply having a Supabase auth account is no longer sufficient.

## How It Works

1. **Authentication**: Users must first authenticate with Supabase Auth (email/password or magic link)
2. **Authorization**: After authentication, the system checks if the user exists in the `hr_users` table with `role = 'admin'`
3. **Access Control**: Only users with admin role can access HR dashboard pages

## Database Schema

The `hr_users` table now includes a `role` column:

```sql
ALTER TABLE hr_users ADD COLUMN role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'moderator'));
```

### Roles

- `admin`: Full access to HR dashboard and all admin functions
- `moderator`: Limited admin access (future use)
- `user`: No admin access (default)

## Managing Admin Users

### Using the Management Script

A command-line script is provided to manage admin users:

```bash
# List all admin users
node scripts/manage-admin-users.js list

# Add a new admin user (user must exist in auth.users first)
node scripts/manage-admin-users.js add admin@example.com "Admin Name"

# Promote existing user to admin
node scripts/manage-admin-users.js promote user@example.com

# Demote admin user to regular user
node scripts/manage-admin-users.js demote user@example.com

# Remove user from hr_users table
node scripts/manage-admin-users.js remove user@example.com
```

### Prerequisites

1. User must first create an account through normal Supabase Auth (sign up)
2. Set required environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Manual Database Management

You can also manage admin users directly in the database:

```sql
-- Add new admin user (replace with actual user ID and email)
INSERT INTO hr_users (id, username, name, role) 
VALUES ('user-uuid-here', 'admin@example.com', 'Admin Name', 'admin');

-- Promote existing user to admin
UPDATE hr_users SET role = 'admin' WHERE username = 'user@example.com';

-- List all admin users
SELECT * FROM hr_users WHERE role = 'admin';
```

## Security Features

1. **No Auto-Registration**: Users are no longer automatically added to `hr_users` table
2. **Role-Based Access**: Explicit role checking prevents unauthorized access
3. **Server-Side Validation**: Both client and server-side checks ensure security
4. **Audit Trail**: All admin actions are logged through Supabase RLS policies

## Migration Notes

- Existing users in `hr_users` table are automatically set to `admin` role during migration
- Review existing users and adjust roles as needed
- Remove any users who shouldn't have admin access

## Troubleshooting

### "Access denied. You don't have admin privileges."

This means:
1. User is not in the `hr_users` table, OR
2. User's role is not set to 'admin'

**Solution**: Use the management script to add the user as admin.

### "User not found in hr_users"

This means the user doesn't exist in the `hr_users` table at all.

**Solution**: 
1. Ensure user has signed up through normal auth flow first
2. Use the management script to add them as admin

### Script shows "User not found in auth.users"

This means the user hasn't signed up yet.

**Solution**: User must create an account first through the normal sign-up process.

## Best Practices

1. **Principle of Least Privilege**: Only give admin access to users who need it
2. **Regular Audits**: Periodically review admin users and remove unnecessary access
3. **Secure Environment**: Keep `SUPABASE_SERVICE_ROLE_KEY` secure and never commit it to version control
4. **Documentation**: Keep track of who has admin access and why

## Development vs Production

### Development
- You can be more liberal with admin access for testing
- Use the script to quickly add/remove test admin users

### Production
- Carefully control who has admin access
- Document all admin user additions/removals
- Consider implementing approval workflows for admin access requests

## Future Enhancements

1. **Moderator Role**: Implement limited admin access for content moderation
2. **Permission System**: More granular permissions beyond just admin/user
3. **Admin Activity Logging**: Track admin actions for audit purposes
4. **Self-Service**: Allow super-admins to manage other admin users through the UI