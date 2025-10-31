/**
 * Check and Update User Roles
 * 
 * This script checks current user roles and updates them as needed.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAndUpdateRoles() {
  try {
    console.log('🔍 Checking current user roles...');
    
    // Get all hr_users
    const { data: users, error: selectError } = await supabaseAdmin
      .from('hr_users')
      .select('id, username, name, role')
      .order('username');
    
    if (selectError) {
      throw new Error(`Failed to query hr_users: ${selectError.message}`);
    }
    
    console.log(`Found ${users.length} users in hr_users table:`);
    console.log('');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username}`);
      console.log(`   Name: ${user.name || 'Not set'}`);
      console.log(`   Role: ${user.role || 'NULL'}`);
      console.log(`   ID: ${user.id}`);
      console.log('');
    });
    
    // Count users by role
    const roleCount = users.reduce((acc, user) => {
      const role = user.role || 'NULL';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Role distribution:');
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} users`);
    });
    console.log('');
    
    // Update users with NULL or 'user' role to 'admin'
    const usersToUpdate = users.filter(user => !user.role || user.role === 'user');
    
    if (usersToUpdate.length > 0) {
      console.log(`🔄 Updating ${usersToUpdate.length} users to admin role...`);
      
      for (const user of usersToUpdate) {
        const { error: updateError } = await supabaseAdmin
          .from('hr_users')
          .update({ role: 'admin' })
          .eq('id', user.id);
        
        if (updateError) {
          console.error(`❌ Failed to update ${user.username}:`, updateError.message);
        } else {
          console.log(`✅ Updated ${user.username} to admin`);
        }
      }
    } else {
      console.log('✅ All users already have appropriate roles');
    }
    
    // Final check
    console.log('');
    console.log('🔍 Final role check...');
    const { data: finalUsers, error: finalError } = await supabaseAdmin
      .from('hr_users')
      .select('username, role')
      .order('username');
    
    if (finalError) {
      throw new Error(`Failed to do final check: ${finalError.message}`);
    }
    
    finalUsers.forEach(user => {
      const status = user.role === 'admin' ? '✅' : '⚠️';
      console.log(`   ${status} ${user.username} - ${user.role}`);
    });
    
    const adminCount = finalUsers.filter(user => user.role === 'admin').length;
    console.log('');
    console.log(`🎉 Setup complete! ${adminCount} admin users configured.`);
    
    if (adminCount === 0) {
      console.log('⚠️  WARNING: No admin users found! You may need to manually set at least one user to admin role.');
    }
    
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

checkAndUpdateRoles().catch(console.error);