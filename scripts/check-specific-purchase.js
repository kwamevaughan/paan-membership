const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSpecificPurchase() {
  console.log('🔍 Checking purchase with James Makau...\n');

  // Find purchase by purchaser email
  const { data: purchaser, error: purchaserError } = await supabase
    .from('purchasers')
    .select('*')
    .eq('email', 'jacjimus@gmail.com')
    .single();

  if (purchaserError) {
    console.error('❌ Error finding purchaser:', purchaserError);
    return;
  }

  console.log('👤 Purchaser found:');
  console.log('   ID:', purchaser.id);
  console.log('   Name:', purchaser.full_name);
  console.log('   Email:', purchaser.email);
  console.log('');

  // Get purchases for this purchaser
  const { data: purchases, error: purchaseError } = await supabase
    .from('ticket_purchases')
    .select('*')
    .eq('purchaser_id', purchaser.id);

  if (purchaseError) {
    console.error('❌ Error fetching purchases:', purchaseError);
    return;
  }

  console.log(`📦 Purchases (${purchases.length}):`);
  purchases.forEach((p, i) => {
    console.log(`\n   ${i + 1}. Purchase ID: ${p.id}`);
    console.log(`      Status: ${p.status}`);
    console.log(`      Payment Status: ${p.payment_status}`);
    console.log(`      Payment Method: ${p.payment_method}`);
    console.log(`      Payment Reference: ${p.payment_reference || 'NULL'}`);
    console.log(`      Amount: ${p.currency} ${p.final_amount}`);
    console.log(`      Created: ${p.created_at}`);
  });

  // Check transactions for each purchase
  for (const purchase of purchases) {
    console.log(`\n💳 Checking transactions for purchase ${purchase.id}...`);
    
    const { data: transactions, error: transError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('purchase_id', purchase.id);

    if (transError) {
      console.error('   ❌ Error:', transError);
    } else if (!transactions || transactions.length === 0) {
      console.log('   ⚠️  No transactions found');
      console.log('   💡 This is why "View Payments" shows empty!');
    } else {
      console.log(`   ✅ Found ${transactions.length} transaction(s)`);
      transactions.forEach((t, i) => {
        console.log(`      ${i + 1}. ${t.paystack_reference} - ${t.status} - ${t.amount}`);
      });
    }

    // Check attendees
    const { data: attendees, error: attendeeError } = await supabase
      .from('attendees')
      .select('full_name, email, purchase_id')
      .eq('purchase_id', purchase.id);

    if (attendeeError) {
      console.error('   ❌ Error fetching attendees:', attendeeError);
    } else if (!attendees || attendees.length === 0) {
      console.log('   ⚠️  No attendees found');
    } else {
      console.log(`\n👥 Attendees (${attendees.length}):`);
      attendees.forEach((a, i) => {
        console.log(`      ${i + 1}. ${a.full_name} (${a.email})`);
      });
    }
  }

  console.log('\n✅ Script completed');
}

checkSpecificPurchase().catch(console.error);
