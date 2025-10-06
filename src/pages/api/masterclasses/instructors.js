// API endpoint for masterclass instructors management
import { createClient } from '@supabase/supabase-js';

// Create admin client with service role key for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getInstructors(req, res);
      case 'POST':
        return await createInstructor(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Instructors API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getInstructors(req, res) {
  const { active_only = 'true', with_counts = 'false' } = req.query;

  let query = supabaseAdmin.from('masterclass_instructors');

  if (with_counts === 'true') {
    query = query.select(`
      *,
      masterclasses_count:masterclasses(count),
      upcoming_masterclasses:masterclasses!inner(id, title, start_date)
    `);
  } else {
    query = query.select('*');
  }

  if (active_only === 'true') {
    query = query.eq('is_active', true);
  }

  query = query.order('name');

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching instructors:', error);
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ data });
}

async function createInstructor(req, res) {
  const {
    name,
    title,
    bio,
    email,
    phone,
    profile_image_url,
    linkedin_url,
    website_url,
    years_experience,
    specializations = [],
    is_active = true
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Instructor name is required' });
  }

  const { data, error } = await supabaseAdmin
    .from('masterclass_instructors')
    .insert({
      name,
      title,
      bio,
      email,
      phone,
      profile_image_url,
      linkedin_url,
      website_url,
      years_experience,
      specializations,
      is_active
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating instructor:', error);
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json({ data });
}