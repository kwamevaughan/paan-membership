import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tier } = req.query;

  if (!tier) {
    return res.status(400).json({ error: 'Tier parameter is required' });
  }

  try {
    const supabase = createSupabaseServerClient(req, res);
    
    // Query to get members in the specified tier
    const { data, error } = await supabase
      .from('candidates')
      .select('id, primaryContactName, primaryContactEmail, agencyName, created_at, job_type')
      .ilike('selected_tier', `${tier}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching members:', error);
      return res.status(500).json({ error: 'Failed to fetch members' });
    }

    return res.status(200).json({ members: data || [] });
  } catch (error) {
    console.error('Error in members list API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 