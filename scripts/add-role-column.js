/**
 * Add Role Column Script
 * 
 * This script adds the role column to hr_users table using direct SQL execution.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addRoleColumn() {
  try {
    console.log('🚀 Adding role column to hr_users table...');
    
    // First, let's check the current structure
    console.log('📋 Checking current hr_users structure...');
    const { data: users, error: selectError } = await supabaseAdmin
      .from('hr_users')
      .select('*')
      .limit(1);
    
    if (selectError) {
      throw new Error(`Failed to query hr_users: ${selectError.message}`);
    }
    
    console.log('Current columns:', users.length > 0 ? Object.keys(users[0]) : 'No users found');
    
    // Try to add the role column using a stored procedure approach
    console.log('➕ Attempting to add role column...');
    
    // Create a function to add the column
    const addColumnSQL = `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'hr_users' AND column_name = 'role'
        ) THEN
          ALTER TABLE hr_users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
          ALTER TABLE hr_users ADD CONSTRAINT hr_users_role_check 
            CHECK (role IN ('admin', 'user', 'moderator'));
        END IF;
      END $$;
    `;
    
    // Try using rpc to execute SQL
    const { error: rpcError } = await supabaseAdmin.rpc('exec_sql', {
      sql: addColumnSQL
    });
    
    if (rpcError) {
      console.log('⚠️  RPC method failed:', rpcError.message);
      console.log('');
      console.log('Please run this SQL manually in your Supabase SQL editor:');
      console.log('');
      console.log('-- Add role column to hr_users table');
      console.log('ALTER TABLE hr_users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT \'user\';');
      console.log('ALTER TABLE hr_users ADD CONSTRAINT IF NOT EXISTS hr_users_role_check CHECK (role IN (\'admin\', \'user\', \'moderator\'));');
      console.log('');
      console.log('-- Set existing users to admin role');
      console.log('UPDATE hr_users SET role = \'admin\' WHERE role IS NULL OR role = \'user\';');
      console.log('');
      console.log('-- Create index for performance');
      console.log('CREATE INDEX IF NOT EXISTS idx_hr_users_role ON hr_users(role);');
      console.log('');
      return;
    }
    
    console.log('✅ Role column added successfully');
    
    // Now update existing users to admin
    console.log('🔄 Setting existing users to admin role...');
    const { error: updateError } = await supabaseAdmin
      .from('hr_users')
      .update({ role: 'admin' })
      .neq('role', 'admin'); // Update all non-admin users
    
    if (updateError) {
      console.log('⚠️  Could not update via Supabase client:', updateError.message);
      console.log('Please run this SQL manually:');
      console.log('UPDATE hr_users SET role = \'admin\' WHERE role IS NULL OR role = \'user\';');
      return;
    }
    
    console.log('✅ Updated existing users to admin role');
    
    // List current users
    const { data: adminUsers, error: listError } = await supabaseAdmin
      .from('hr_users')
      .select('username, name, role')
      .order('username');
    
    if (listError) {
      console.log('⚠️  Could not list users:', listError.message);
    } else {
      console.log('');
      console.log('📋 Current hr_users:');
      adminUsers.forEach(user => {
        console.log(`   - ${user.username} (${user.name || 'No name'}) - Role: ${user.role || 'NULL'}`);
      });
    }
    
    console.log('');
    console.log('🎉 Setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('Manual SQL to run in Supabase SQL editor:');
    console.log('');
    console.log('-- Add role column to hr_users table');
    console.log('ALTER TABLE hr_users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT \'user\';');
    console.log('ALTER TABLE hr_users ADD CONSTRAINT IF NOT EXISTS hr_users_role_check CHECK (role IN (\'admin\', \'user\', \'moderator\'));');
    console.log('');
    console.log('-- Set existing users to admin role');
    console.log('UPDATE hr_users SET role = \'admin\' WHERE role IS NULL OR role = \'user\';');
    console.log('');
    console.log('-- Create index for performance');
    console.log('CREATE INDEX IF NOT EXISTS idx_hr_users_role ON hr_users(role);');
  }
}

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

addRoleColumn().catch(console.error);