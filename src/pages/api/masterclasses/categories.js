// API endpoint for masterclass categories management
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
        return await getCategories(req, res);
      case 'POST':
        return await createCategory(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Categories API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getCategories(req, res) {
  const { active_only = 'true', with_counts = 'false' } = req.query;

  let query = supabaseAdmin.from('masterclass_categories');

  if (with_counts === 'true') {
    query = query.select(`
      *,
      masterclasses_count:masterclasses(count)
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
    console.error('Error fetching categories:', error);
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ data });
}

async function createCategory(req, res) {
  const { name, description, slug, is_active = true } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  // Generate slug if not provided
  const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const { data, error } = await supabaseAdmin
    .from('masterclass_categories')
    .insert({
      name,
      description,
      slug: finalSlug,
      is_active
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json({ data });
}