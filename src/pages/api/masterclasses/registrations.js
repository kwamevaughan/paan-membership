// API endpoint for masterclass registrations management
import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getRegistrations(req, res);
      case 'POST':
        return await createRegistration(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Registrations API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getRegistrations(req, res) {
  const { 
    masterclass_id,
    user_id,
    payment_status,
    attendance_status,
    page = 1,
    limit = 20,
    search
  } = req.query;

  let query = supabase
    .from('masterclass_registrations')
    .select(`
      *,
      masterclass:masterclasses(id, title, start_date, end_date, image_url),
      payments:masterclass_payments(id, amount, status, payment_method, created_at)
    `);

  // Apply filters
  if (masterclass_id) {
    query = query.eq('masterclass_id', masterclass_id);
  }

  if (user_id) {
    query = query.eq('user_id', user_id);
  }

  if (payment_status) {
    query = query.eq('payment_status', payment_status);
  }

  if (attendance_status) {
    query = query.eq('attendance_status', attendance_status);
  }

  if (search) {
    query = query.or(`customer_name.ilike.%${search}%, customer_email.ilike.%${search}%, customer_organization.ilike.%${search}%`);
  }

  // Pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);
  query = query.range(offset, offset + parseInt(limit) - 1);

  // Order by creation date
  query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching registrations:', error);
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / parseInt(limit))
    }
  });
}

async function createRegistration(req, res) {
  const {
    masterclass_id,
    user_id,
    seats_booked = 1,
    customer_name,
    customer_email,
    customer_phone,
    customer_organization,
    is_member_pricing = false,
    payment_reference,
    registration_source = 'web',
    notes
  } = req.body;

  // Validation
  if (!masterclass_id || !customer_email) {
    return res.status(400).json({ 
      error: 'Missing required fields: masterclass_id, customer_email' 
    });
  }

  // Get masterclass details for pricing
  const { data: masterclass, error: masterclassError } = await supabase
    .from('masterclasses')
    .select('member_price, non_member_price, available_seats, currency, max_seats')
    .eq('id', masterclass_id)
    .single();

  if (masterclassError || !masterclass) {
    return res.status(404).json({ error: 'Masterclass not found' });
  }

  // Check seat availability
  if (masterclass.available_seats < seats_booked) {
    return res.status(400).json({ 
      error: `Only ${masterclass.available_seats} seats available` 
    });
  }

  // Calculate total amount
  const price_per_seat = is_member_pricing ? masterclass.member_price : masterclass.non_member_price;
  const total_amount = price_per_seat * seats_booked;

  // Start transaction
  const { data, error } = await supabase
    .from('masterclass_registrations')
    .insert({
      masterclass_id,
      user_id,
      seats_booked,
      total_amount,
      currency: masterclass.currency,
      is_member_pricing,
      customer_name,
      customer_email,
      customer_phone,
      customer_organization,
      payment_reference,
      registration_source,
      notes
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating registration:', error);
    return res.status(400).json({ error: error.message });
  }

  // Update available seats
  const { error: updateError } = await supabase
    .from('masterclasses')
    .update({ 
      available_seats: masterclass.available_seats - seats_booked 
    })
    .eq('id', masterclass_id);

  if (updateError) {
    console.error('Error updating available seats:', updateError);
    // Note: In production, you'd want to rollback the registration here
  }

  return res.status(201).json({ data });
}