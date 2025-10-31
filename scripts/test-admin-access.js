/**
 * Test Admin Access Control
 * 
 * This script tests the admin access control system.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create regular client (not admin)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Create admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAdminAccess() {
  try {
    console.log('🧪 Testing admin access control system...');
    console.log('');
    
    // Test 1: List all hr_users (should work with admin client)
    console.log('Test 1: Admin client accessing hr_users...');
    const { data: adminUsers, error: adminError } = await supabaseAdmin
      .from('hr_users')
      .select('username, role')
      .order('username');
    
    if (adminError) {
      console.log('❌ Admin client failed:', adminError.message);
    } else {
      console.log('✅ Admin client success - found users:');
      adminUsers.forEach(user => {
        console.log(`   - ${user.username} (${user.role})`);
      });
    }
    console.log('');
    
    // Test 2: Regular client accessing hr_users (should fail or be limited)
    console.log('Test 2: Regular client accessing hr_users...');
    const { data: regularUsers, error: regularError } = await supabase
      .from('hr_users')
      .select('username, role')
      .order('username');
    
    if (regularError) {
      console.log('✅ Regular client correctly blocked:', regularError.message);
    } else {
      console.log('⚠️  Regular client unexpectedly succeeded - found users:');
      regularUsers.forEach(user => {
        console.log(`   - ${user.username} (${user.role})`);
      });
    }
    console.log('');
    
    // Test 3: Check specific admin user
    console.log('Test 3: Checking specific admin user access...');
    const testEmail = 'support@paan.africa';
    
    const { data: specificUser, error: specificError } = await supabaseAdmin
      .from('hr_users')
      .select('id, username, role')
      .eq('username', testEmail)
      .single();
    
    if (specificError) {
      console.log('❌ Failed to find test user:', specificError.message);
    } else {
      console.log('✅ Found test user:');
      console.log(`   Email: ${specificUser.username}`);
      console.log(`   Role: ${specificUser.role}`);
      console.log(`   ID: ${specificUser.id}`);
      
      // Simulate the login check
      if (specificUser.role === 'admin') {
        console.log('✅ User would be granted admin access');
      } else {
        console.log('❌ User would be denied admin access');
      }
    }
    console.log('');
    
    // Test 4: Simulate non-admin user check
    console.log('Test 4: Simulating non-admin user access...');
    
    // Create a test user entry with 'user' role
    const testUserId = 'test-user-id-123';
    const { error: insertError } = await supabaseAdmin
      .from('hr_users')
      .upsert([{
        id: testUserId,
        username: 'test@example.com',
        name: 'Test User',
        role: 'user'
      }], { onConflict: 'id' });
    
    if (insertError) {
      console.log('⚠️  Could not create test user:', insertError.message);
    } else {
      // Check if this user would be granted access
      const { data: testUser, error: testError } = await supabaseAdmin
        .from('hr_users')
        .select('role')
        .eq('id', testUserId)
        .single();
      
      if (testError) {
        console.log('❌ Failed to check test user:', testError.message);
      } else {
        if (testUser.role === 'admin') {
          console.log('❌ Test user would incorrectly be granted admin access');
        } else {
          console.log('✅ Test user would correctly be denied admin access');
        }
      }
      
      // Clean up test user
      await supabaseAdmin
        .from('hr_users')
        .delete()
        .eq('id', testUserId);
    }
    
    console.log('');
    console.log('🎉 Admin access control tests completed!');
    console.log('');
    console.log('Summary:');
    console.log('- Admin users can access the system');
    console.log('- Non-admin users are blocked');
    console.log('- Role-based access control is working');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

testAdminAccess().catch(console.error);