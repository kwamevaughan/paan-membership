const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkPurchaseData() {
  console.log('🔍 Checking purchase data...\n');

  // Get a sample purchase
  const { data: purchases, error: purchaseError } = await supabase
    .from('ticket_purchases')
    .select('*')
    .limit(1);

  if (purchaseError) {
    console.error('❌ Error fetching purchases:', purchaseError);
    return;
  }

  if (!purchases || purchases.length === 0) {
    console.log('⚠️  No purchases found in database');
    return;
  }

  const purchase = purchases[0];
  console.log('📦 Sample Purchase:');
  console.log('   ID:', purchase.id);
  console.log('   Status:', purchase.status);
  console.log('   Payment Status:', purchase.payment_status);
  console.log('   Payment Reference:', purchase.payment_reference);
  console.log('   Amount:', purchase.final_amount, purchase.currency);
  console.log('');

  // Check for payment transactions
  const { data: transactions, error: transError } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('purchase_id', purchase.id);

  if (transError) {
    console.error('❌ Error fetching transactions:', transError);
  } else {
    console.log('💳 Payment Transactions for this purchase:');
    if (transactions && transactions.length > 0) {
      transactions.forEach((t, i) => {
        console.log(`   ${i + 1}. ID: ${t.id}`);
        console.log(`      Purchase ID: ${t.purchase_id}`);
        console.log(`      Amount: ${t.amount}`);
        console.log(`      Status: ${t.status}`);
        console.log(`      Reference: ${t.paystack_reference}`);
        console.log('');
      });
    } else {
      console.log('   ⚠️  No transactions found for this purchase');
      console.log('   This is why "View Payments" shows no results!');
      console.log('');
    }
  }

  // Check all transactions
  const { data: allTransactions, error: allTransError } = await supabase
    .from('payment_transactions')
    .select('id, purchase_id, amount, status, paystack_reference')
    .limit(5);

  if (allTransError) {
    console.error('❌ Error fetching all transactions:', allTransError);
  } else {
    console.log('💳 All Payment Transactions (sample):');
    if (allTransactions && allTransactions.length > 0) {
      allTransactions.forEach((t, i) => {
        console.log(`   ${i + 1}. ID: ${t.id}`);
        console.log(`      Purchase ID: ${t.purchase_id || 'NULL ⚠️'}`);
        console.log(`      Amount: ${t.amount}`);
        console.log(`      Status: ${t.status}`);
        console.log('');
      });
    } else {
      console.log('   ⚠️  No transactions found in database');
    }
  }

  // Check attendees
  const { data: attendees, error: attendeeError } = await supabase
    .from('attendees')
    .select('*')
    .eq('purchase_id', purchase.id);

  if (attendeeError) {
    console.error('❌ Error fetching attendees:', attendeeError);
  } else {
    console.log('👥 Attendees for this purchase:');
    if (attendees && attendees.length > 0) {
      attendees.forEach((a, i) => {
        console.log(`   ${i + 1}. ${a.full_name} (${a.email})`);
        console.log(`      Purchase ID: ${a.purchase_id}`);
        console.log('');
      });
    } else {
      console.log('   ⚠️  No attendees found for this purchase');
      console.log('');
    }
  }

  // Check database schema
  console.log('📋 Checking table schemas...\n');
  
  const { data: purchaseColumns } = await supabase
    .from('ticket_purchases')
    .select('*')
    .limit(0);
    
  const { data: transactionColumns } = await supabase
    .from('payment_transactions')
    .select('*')
    .limit(0);

  console.log('✅ Script completed');
}

checkPurchaseData().catch(console.error);
