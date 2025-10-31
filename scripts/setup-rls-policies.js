/**
 * Setup RLS Policies for hr_users
 * 
 * This script sets up Row Level Security policies for the hr_users table.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupRLSPolicies() {
  try {
    console.log('🔒 Setting up RLS policies for hr_users table...');
    console.log('');
    
    // Note: We can't execute DDL statements through the Supabase client
    // So we'll provide the SQL that needs to be run manually
    
    console.log('Please run the following SQL in your Supabase SQL editor:');
    console.log('');
    console.log('-- Enable Row Level Security on hr_users table');
    console.log('ALTER TABLE hr_users ENABLE ROW LEVEL SECURITY;');
    console.log('');
    console.log('-- Drop existing policies if they exist');
    console.log('DROP POLICY IF EXISTS "HR users can view their own data" ON hr_users;');
    console.log('DROP POLICY IF EXISTS "Admins can manage hr_users" ON hr_users;');
    console.log('DROP POLICY IF EXISTS "Users can update their own profile" ON hr_users;');
    console.log('');
    console.log('-- Create policy for users to view their own data');
    console.log('CREATE POLICY "HR users can view their own data" ON hr_users');
    console.log('FOR SELECT USING (auth.uid() = id);');
    console.log('');
    console.log('-- Create policy for admins to manage all hr_users');
    console.log('CREATE POLICY "Admins can manage hr_users" ON hr_users');
    console.log('FOR ALL USING (');
    console.log('    EXISTS (');
    console.log('        SELECT 1 FROM hr_users');
    console.log('        WHERE hr_users.id = auth.uid()');
    console.log('        AND hr_users.role = \'admin\'');
    console.log('    )');
    console.log(');');
    console.log('');
    console.log('-- Create policy for users to update their own profile (but not role)');
    console.log('CREATE POLICY "Users can update their own profile" ON hr_users');
    console.log('FOR UPDATE USING (auth.uid() = id)');
    console.log('WITH CHECK (');
    console.log('    auth.uid() = id AND');
    console.log('    -- Prevent users from changing their own role unless they are admin');
    console.log('    (OLD.role = NEW.role OR EXISTS (');
    console.log('        SELECT 1 FROM hr_users');
    console.log('        WHERE hr_users.id = auth.uid()');
    console.log('        AND hr_users.role = \'admin\'');
    console.log('    ))');
    console.log(');');
    console.log('');
    
    // Test current access
    console.log('🧪 Testing current access levels...');
    
    // Test with admin client (should work)
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('hr_users')
      .select('username, role')
      .limit(5);
    
    if (adminError) {
      console.log('❌ Admin client access failed:', adminError.message);
    } else {
      console.log(`✅ Admin client can access hr_users (${adminData.length} records)`);
    }
    
    // Test with regular client (should be limited after RLS is enabled)
    const supabaseRegular = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data: regularData, error: regularError } = await supabaseRegular
      .from('hr_users')
      .select('username, role')
      .limit(5);
    
    if (regularError) {
      console.log('✅ Regular client correctly blocked:', regularError.message);
    } else {
      console.log(`⚠️  Regular client can still access hr_users (${regularData.length} records)`);
      console.log('   This means RLS is not yet enabled. Please run the SQL above.');
    }
    
    console.log('');
    console.log('📋 Current hr_users:');
    if (adminData) {
      adminData.forEach(user => {
        console.log(`   - ${user.username} (${user.role})`);
      });
    }
    
    console.log('');
    console.log('🎯 Next steps:');
    console.log('1. Run the SQL statements above in your Supabase SQL editor');
    console.log('2. Test the login system to ensure admin users can still access');
    console.log('3. Verify that non-admin users are properly blocked');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

setupRLSPolicies().catch(console.error);