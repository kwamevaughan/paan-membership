// Script to update existing job records with proper timestamps
const { createClient } = require("@supabase/supabase-js");

// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateJobTimestamps() {
  try {
    console.log("Fetching jobs with null timestamps...");

    // Get all jobs that have null created_at or updated_at
    const { data: jobs, error: fetchError } = await supabase
      .from("job_openings")
      .select("id, created_at, updated_at")
      .or("created_at.is.null,updated_at.is.null");

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${jobs.length} jobs with missing timestamps`);

    if (jobs.length === 0) {
      console.log("No jobs need timestamp updates");
      return;
    }

    // Update each job with current timestamp
    const now = new Date().toISOString();
    const updates = [];

    for (const job of jobs) {
      const updateData = {
        id: job.id,
        created_at: job.created_at || now,
        updated_at: job.updated_at || now,
      };
      updates.push(updateData);
    }

    console.log("Updating job timestamps...");

    // Use upsert to update the records
    const { error: updateError } = await supabase
      .from("job_openings")
      .upsert(updates, { onConflict: "id" });

    if (updateError) {
      throw updateError;
    }

    console.log(`Successfully updated timestamps for ${jobs.length} jobs`);
  } catch (error) {
    console.error("Error updating job timestamps:", error);
    process.exit(1);
  }
}

// Run the script
updateJobTimestamps();
