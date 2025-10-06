// API endpoint for masterclasses CRUD operations
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
        return await getMasterclasses(req, res);
      case 'POST':
        return await createMasterclass(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Masterclasses API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getMasterclasses(req, res) {
  const { 
    status, 
    category, 
    instructor, 
    featured, 
    page = 1, 
    limit = 10,
    search,
    upcoming_only 
  } = req.query;

  let query = supabaseAdmin
    .from('masterclasses')
    .select(`
      *,
      category:masterclass_categories(id, name, slug),
      instructor:masterclass_instructors(id, name, title, profile_image_url),
      registrations_count:masterclass_registrations(count)
    `);

  // Apply filters
  if (status) {
    query = query.eq('status', status);
  }

  if (category) {
    query = query.eq('category_id', category);
  }

  if (instructor) {
    query = query.eq('instructor_id', instructor);
  }

  if (featured === 'true') {
    query = query.eq('is_featured', true);
  }

  if (upcoming_only === 'true') {
    query = query.gte('start_date', new Date().toISOString());
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%, description.ilike.%${search}%`);
  }

  // Pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);
  query = query.range(offset, offset + parseInt(limit) - 1);

  // Order by start date
  query = query.order('start_date', { ascending: true });

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching masterclasses:', error);
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

async function createMasterclass(req, res) {
  const {
    title,
    description,
    short_description,
    category_id,
    instructor_id,
    start_date,
    end_date,
    duration_minutes = 90,
    timezone = 'GMT',
    member_price,
    member_original_price,
    non_member_price,
    non_member_original_price,
    currency = 'USD',
    max_seats = 100,
    min_enrollment = 5,
    image_url,
    video_preview_url,
    materials_url,
    agenda,
    learning_objectives = [],
    prerequisites = [],
    benefits = [],
    status = 'draft',
    level = 'all',
    format = 'live',
    is_featured = false,
    is_free = false,
    slug,
    meta_title,
    meta_description,
    tags = []
  } = req.body;

  // Validation
  if (!title || !description || !start_date || !end_date || !member_price || !non_member_price) {
    return res.status(400).json({ 
      error: 'Missing required fields: title, description, start_date, end_date, member_price, non_member_price' 
    });
  }

  // Generate slug if not provided
  const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const { data, error } = await supabaseAdmin
    .from('masterclasses')
    .insert({
      title,
      description,
      short_description,
      category_id,
      instructor_id,
      start_date,
      end_date,
      duration_minutes,
      timezone,
      member_price,
      member_original_price,
      non_member_price,
      non_member_original_price,
      currency,
      max_seats,
      available_seats: max_seats,
      min_enrollment,
      image_url,
      video_preview_url,
      materials_url,
      agenda,
      learning_objectives,
      prerequisites,
      benefits,
      status,
      level,
      format,
      is_featured,
      is_free,
      slug: finalSlug,
      meta_title,
      meta_description,
      tags
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating masterclass:', error);
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json({ data });
}