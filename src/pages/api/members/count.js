import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tier } = req.query;
  // console.log('Received tier:', tier);
  // console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  // console.log('Supabase ANON KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  // console.log('Supabase SERVICE KEY:', process.env.SUPABASE_SERVICE_KEY);
  // console.log('Supabase SERVICE ROLE KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!tier) {
    return res.status(400).json({ error: 'Tier parameter is required' });
  }

  try {
    const supabase = createSupabaseServerClient(req, res);
    
    // Query to count members in the specified tier
    const { count, error } = await supabase
      .from('candidates')
      .select('*', { count: 'exact', head: true })
      .ilike('selected_tier', `${tier}%`);

    if (error) {
      console.error('Error fetching member count:', error);
      return res.status(500).json({ error: 'Failed to fetch member count' });
    }

    return res.status(200).json({ count: count || 0 });
  } catch (error) {
    console.error('Error in member count API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 