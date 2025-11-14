const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAttendeeFilter() {
  const purchaseId = '9c7a52ea-da89-4532-8d78-dd6ea3363079';
  
  console.log('🔍 Testing attendee filter...\n');
  console.log('Purchase ID:', purchaseId);
  console.log('');

  // Test 1: Fetch all attendees
  console.log('📋 Test 1: Fetching ALL attendees (no filter)');
  const { data: allAttendees, error: allError } = await supabase
    .from('attendees')
    .select('id, full_name, email, purchase_id');

  if (allError) {
    console.error('❌ Error:', allError);
  } else {
    console.log(`✅ Found ${allAttendees.length} total attendees:`);
    allAttendees.forEach((a, i) => {
      console.log(`   ${i + 1}. ${a.full_name} - Purchase: ${a.purchase_id}`);
    });
  }
  console.log('');

  // Test 2: Fetch filtered attendees
  console.log('📋 Test 2: Fetching attendees WITH purchaseId filter');
  const { data: filteredAttendees, error: filterError } = await supabase
    .from('attendees')
    .select('id, full_name, email, purchase_id')
    .eq('purchase_id', purchaseId);

  if (filterError) {
    console.error('❌ Error:', filterError);
  } else {
    console.log(`✅ Found ${filteredAttendees.length} filtered attendees:`);
    filteredAttendees.forEach((a, i) => {
      console.log(`   ${i + 1}. ${a.full_name} (${a.email})`);
      console.log(`      Purchase ID: ${a.purchase_id}`);
    });
  }
  console.log('');

  // Test 3: Check if the filter is working
  if (allAttendees && filteredAttendees) {
    if (filteredAttendees.length < allAttendees.length) {
      console.log('✅ Filter is working correctly!');
      console.log(`   Total: ${allAttendees.length}, Filtered: ${filteredAttendees.length}`);
    } else if (filteredAttendees.length === allAttendees.length) {
      console.log('⚠️  Filter returned same number as total - might not be working');
    }
  }

  console.log('\n✅ Test completed');
}

testAttendeeFilter().catch(console.error);
