import { supabase } from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Fetching jobs with null timestamps...');
    
    // Get all jobs that have null created_at or updated_at
    const { data: jobs, error: fetchError } = await supabase
      .from('job_openings')
      .select('id, created_at, updated_at')
      .or('created_at.is.null,updated_at.is.null');
    
    if (fetchError) {
      throw fetchError;
    }
    
    console.log(`Found ${jobs.length} jobs with missing timestamps`);
    
    if (jobs.length === 0) {
      return res.status(200).json({ 
        message: 'No jobs need timestamp updates',
        updated: 0 
      });
    }
    
    // Update each job with current timestamp
    const now = new Date().toISOString();
    let updatedCount = 0;
    
    for (const job of jobs) {
      const updateData = {};
      
      if (!job.created_at) {
        updateData.created_at = now;
      }
      
      if (!job.updated_at) {
        updateData.updated_at = now;
      }
      
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('job_openings')
          .update(updateData)
          .eq('id', job.id);
        
        if (updateError) {
          console.error(`Error updating job ${job.id}:`, updateError);
        } else {
          updatedCount++;
        }
      }
    }
    
    console.log(`Successfully updated timestamps for ${updatedCount} jobs`);
    
    return res.status(200).json({ 
      message: `Successfully updated timestamps for ${updatedCount} jobs`,
      updated: updatedCount 
    });
    
  } catch (error) {
    console.error('Error updating job timestamps:', error);
    return res.status(500).json({ 
      error: 'Failed to update job timestamps',
      details: error.message 
    });
  }
}