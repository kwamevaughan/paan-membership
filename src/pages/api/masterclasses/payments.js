// API endpoint for masterclass payments tracking
import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getPayments(req, res);
      case 'POST':
        return await processPayment(req, res);
      case 'PUT':
        return await updatePaymentStatus(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Payments API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getPayments(req, res) {
  const { 
    registration_id,
    status,
    gateway,
    page = 1,
    limit = 20,
    date_from,
    date_to
  } = req.query;

  let query = supabase
    .from('masterclass_payments')
    .select(`
      *,
      registration:masterclass_registrations(
        id,
        customer_name,
        customer_email,
        seats_booked,
        masterclass:masterclasses(id, title, start_date)
      )
    `);

  // Apply filters
  if (registration_id) {
    query = query.eq('registration_id', registration_id);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (gateway) {
    query = query.eq('gateway', gateway);
  }

  if (date_from) {
    query = query.gte('created_at', date_from);
  }

  if (date_to) {
    query = query.lte('created_at', date_to);
  }

  // Pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);
  query = query.range(offset, offset + parseInt(limit) - 1);

  // Order by creation date
  query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching payments:', error);
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

async function processPayment(req, res) {
  const {
    registration_id,
    amount,
    currency = 'USD',
    payment_method,
    payment_reference,
    gateway_reference,
    gateway = 'paystack',
    gateway_response = {}
  } = req.body;

  if (!registration_id || !amount || !payment_method || !payment_reference) {
    return res.status(400).json({ 
      error: 'Missing required fields: registration_id, amount, payment_method, payment_reference' 
    });
  }

  const { data, error } = await supabase
    .from('masterclass_payments')
    .insert({
      registration_id,
      amount,
      currency,
      payment_method,
      payment_reference,
      gateway_reference,
      gateway,
      gateway_response,
      status: 'processing'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating payment:', error);
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json({ data });
}

async function updatePaymentStatus(req, res) {
  const {
    payment_id,
    status,
    gateway_response = {},
    completed_at,
    failed_at
  } = req.body;

  if (!payment_id || !status) {
    return res.status(400).json({ 
      error: 'Missing required fields: payment_id, status' 
    });
  }

  const updateData = {
    status,
    gateway_response
  };

  if (status === 'completed' && completed_at) {
    updateData.completed_at = completed_at;
  }

  if (status === 'failed' && failed_at) {
    updateData.failed_at = failed_at;
  }

  const { data, error } = await supabase
    .from('masterclass_payments')
    .update(updateData)
    .eq('id', payment_id)
    .select()
    .single();

  if (error) {
    console.error('Error updating payment:', error);
    return res.status(400).json({ error: error.message });
  }

  // If payment completed, update registration status
  if (status === 'completed') {
    const { error: regError } = await supabase
      .from('masterclass_registrations')
      .update({ 
        payment_status: 'completed',
        payment_date: new Date().toISOString()
      })
      .eq('id', data.registration_id);

    if (regError) {
      console.error('Error updating registration payment status:', regError);
    }
  }

  return res.status(200).json({ data });
}