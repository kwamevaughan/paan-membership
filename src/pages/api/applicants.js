import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseServer = createSupabaseServerClient(req, res);

    // Check authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabaseServer.auth.getSession();

    if (sessionError || !session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Cap at 100
    const offset = (page - 1) * limit;

    // Fetch paginated candidates data with responses
    const { data: candidatesData, error: candidatesError, count } = await supabaseServer
      .from("candidates")
      .select(`
        id, 
        primaryContactName, 
        primaryContactEmail, 
        primaryContactPhone,
        primaryContactLinkedin,
        opening,
        opening_id,
        reference_number,
        agencyName,
        headquartersLocation,
        selected_tier,
        job_type,
        countryOfResidence,
        created_at,
        responses:responses!user_id(
          id,
          submitted_at,
          status,
          country,
          device,
          email_sent,
          processed_at,
          error_message
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (candidatesError) {
      console.error('Error fetching candidates:', candidatesError);
      return res.status(500).json({ error: 'Failed to fetch candidates' });
    }

    // Transform the data to flatten the responses
    const candidates = candidatesData?.map(candidate => {
      // Get the first response (there should only be one per candidate)
      const response = Array.isArray(candidate.responses) ? candidate.responses[0] : candidate.responses;
      
      const { responses, ...candidateWithoutResponses } = candidate;
      
      return {
        ...candidateWithoutResponses,
        // Flatten response data to candidate level for easier access
        submitted_at: response?.submitted_at || candidate.created_at,
        status: response?.status || 'Pending',
        country: response?.country || candidate.countryOfResidence,
        device: response?.device || null,
        email_sent: response?.email_sent || false,
        processed_at: response?.processed_at || null,
        error_message: response?.error_message || null,
      };
    }) || [];

    return res.status(200).json({
      candidates: candidates || [],
      pagination: {
        currentPage: page,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        limit,
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}