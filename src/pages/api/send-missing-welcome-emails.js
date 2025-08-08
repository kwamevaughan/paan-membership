import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[send-missing-welcome-emails] Starting bulk email processing...');
    
    const supabaseServer = createSupabaseServerClient(req, res);

    // Find all candidates who haven't received welcome emails
    const { data: candidatesWithoutEmails, error: queryError } = await supabaseServer
      .from('responses')
      .select(`
        user_id,
        email_sent,
        email_data,
        candidates!inner(
          id,
          primaryContactName,
          primaryContactEmail,
          agencyName,
          job_type,
          created_at
        )
      `)
      .eq('email_sent', false)
      .is('processed_at', null);

    if (queryError) {
      console.error('[send-missing-welcome-emails] Query error:', queryError);
      return res.status(500).json({ error: 'Failed to query candidates' });
    }

    if (!candidatesWithoutEmails || candidatesWithoutEmails.length === 0) {
      return res.status(200).json({ 
        message: 'No candidates found without welcome emails',
        count: 0 
      });
    }

    console.log(`[send-missing-welcome-emails] Found ${candidatesWithoutEmails.length} candidates without emails`);

    // Process each candidate
    let processedCount = 0;
    let errorCount = 0;

    for (const record of candidatesWithoutEmails) {
      try {
        const candidateId = record.user_id;
        const candidate = record.candidates;

        console.log(`[send-missing-welcome-emails] Processing candidate: ${candidate.primaryContactName}`);

        // If no email_data exists, we'll let the resend endpoint handle creating it
        const resendResponse = await fetch(`${req.headers.origin}/api/resend-welcome-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateId }),
        });

        if (resendResponse.ok) {
          processedCount++;
          console.log(`[send-missing-welcome-emails] Queued email for: ${candidate.primaryContactName}`);
        } else {
          errorCount++;
          const errorResult = await resendResponse.json();
          console.error(`[send-missing-welcome-emails] Failed to queue email for ${candidate.primaryContactName}:`, errorResult.error);
        }

        // Add a small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        errorCount++;
        console.error(`[send-missing-welcome-emails] Error processing candidate:`, error);
      }
    }

    console.log(`[send-missing-welcome-emails] Completed. Processed: ${processedCount}, Errors: ${errorCount}`);

    return res.status(200).json({
      message: `Bulk email processing completed`,
      totalFound: candidatesWithoutEmails.length,
      processed: processedCount,
      errors: errorCount
    });

  } catch (error) {
    console.error('[send-missing-welcome-emails] Error:', error.message);
    return res.status(500).json({ error: 'Failed to process bulk emails' });
  }
}