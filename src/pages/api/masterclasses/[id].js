// API endpoint for individual masterclass operations
import { createClient } from '@supabase/supabase-js';

// Create admin client with service role key for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { method, query: { id } } = req;

  if (!id) {
    return res.status(400).json({ error: 'Masterclass ID is required' });
  }

  try {
    switch (method) {
      case 'GET':
        return await getMasterclass(req, res, id);
      case 'PUT':
        return await updateMasterclass(req, res, id);
      case 'DELETE':
        return await deleteMasterclass(req, res, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Masterclass API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getMasterclass(req, res, id) {
  const { data, error } = await supabaseAdmin
    .from('masterclasses')
    .select(`
      *,
      category:masterclass_categories(id, name, slug, description),
      instructor:masterclass_instructors(id, name, title, bio, profile_image_url, linkedin_url, years_experience),
      registrations:masterclass_registrations(
        id,
        seats_booked,
        payment_status,
        attendance_status,
        customer_name,
        customer_email,
        created_at
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching masterclass:', error);
    return res.status(404).json({ error: 'Masterclass not found' });
  }

  // Calculate enrollment stats
  const enrollmentStats = {
    total_registrations: data.registrations?.length || 0,
    total_seats_booked: data.registrations?.reduce((sum, reg) => sum + (reg.seats_booked || 0), 0) || 0,
    paid_registrations: data.registrations?.filter(reg => reg.payment_status === 'completed').length || 0,
    attended_count: data.registrations?.filter(reg => reg.attendance_status === 'attended').length || 0
  };

  return res.status(200).json({ 
    data: {
      ...data,
      enrollment_stats: enrollmentStats
    }
  });
}

async function updateMasterclass(req, res, id) {
  const updateData = { ...req.body };
  delete updateData.id; // Remove id from update data
  
  // Update available seats if max_seats changed
  if (updateData.max_seats) {
    const { data: currentData } = await supabaseAdmin
      .from('masterclasses')
      .select('max_seats, available_seats')
      .eq('id', id)
      .single();
    
    if (currentData) {
      const seatsDifference = updateData.max_seats - currentData.max_seats;
      updateData.available_seats = Math.max(0, currentData.available_seats + seatsDifference);
    }
  }

  const { data, error } = await supabaseAdmin
    .from('masterclasses')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating masterclass:', error);
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ data });
}

async function deleteMasterclass(req, res, id) {
  // Check if there are any registrations
  const { data: registrations } = await supabaseAdmin
    .from('masterclass_registrations')
    .select('id')
    .eq('masterclass_id', id);

  if (registrations && registrations.length > 0) {
    return res.status(400).json({ 
      error: 'Cannot delete masterclass with existing registrations. Cancel or refund registrations first.' 
    });
  }

  const { error } = await supabaseAdmin
    .from('masterclasses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting masterclass:', error);
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ message: 'Masterclass deleted successfully' });
}