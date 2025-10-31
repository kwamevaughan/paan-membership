/**
 * Manual Migration Runner
 * 
 * This script runs the admin role migration manually against the database.
 * It should be run with appropriate environment variables set.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  try {
    console.log('🚀 Starting admin role migration...');
    
    // Check if role column already exists
    console.log('📋 Checking if role column exists...');
    const { data: columns, error: columnsError } = await supabaseAdmin
      .from('hr_users')
      .select('*')
      .limit(1);
    
    if (columnsError) {
      throw new Error(`Failed to check table structure: ${columnsError.message}`);
    }
    
    // Check if any record has a role column
    const hasRoleColumn = columns.length > 0 && columns[0].hasOwnProperty('role');
    
    if (hasRoleColumn) {
      console.log('✅ Role column already exists');
    } else {
      console.log('➕ Adding role column to hr_users table...');
      
      // Add role column (this might fail if column already exists, which is fine)
      const { error: alterError } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          ALTER TABLE hr_users 
          ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' 
          CHECK (role IN ('admin', 'user', 'moderator'));
        `
      });
      
      if (alterError && !alterError.message.includes('already exists')) {
        console.log('⚠️  Could not add column via RPC, this might be expected');
        console.log('   You may need to run this SQL manually in your database:');
        console.log('   ALTER TABLE hr_users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT \'user\' CHECK (role IN (\'admin\', \'user\', \'moderator\'));');
      }
    }
    
    // Update existing users to admin role
    console.log('🔄 Setting existing hr_users to admin role...');
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('hr_users')
      .update({ role: 'admin' })
      .or('role.is.null,role.eq.user');
    
    if (updateError) {
      throw new Error(`Failed to update user roles: ${updateError.message}`);
    }
    
    console.log('✅ Successfully updated existing users to admin role');
    
    // List current admin users
    console.log('📋 Current admin users:');
    const { data: adminUsers, error: listError } = await supabaseAdmin
      .from('hr_users')
      .select('username, name, role, created_at')
      .eq('role', 'admin')
      .order('created_at', { ascending: false });
    
    if (listError) {
      throw new Error(`Failed to list admin users: ${listError.message}`);
    }
    
    if (adminUsers.length === 0) {
      console.log('⚠️  No admin users found');
    } else {
      adminUsers.forEach(user => {
        console.log(`   - ${user.username} (${user.name || 'No name'}) - ${user.role}`);
      });
    }
    
    console.log('');
    console.log('🎉 Migration completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Review the admin users listed above');
    console.log('2. Remove any users who should not have admin access');
    console.log('3. Use scripts/manage-admin-users.js to manage admin users going forward');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

runMigration().catch(console.error);