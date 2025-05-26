// pages/api/sitemap-jobs.xml.js
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function handler(req, res) {
  // Initialize Supabase client
  const supabaseServer = createSupabaseServerClient(req, res);

  try {
    const { data: jobs, error } = await supabaseServer
      .from("job_openings")
      .select("slug, updated_at, expires_on");

    if (error) throw error;

    const activeJobs = jobs.filter(
      (job) => new Date(job.expires_on) >= new Date()
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${activeJobs
      .map(
        (job) => `
    <url>
        <loc>https://membership.paan.africa/jobs/${job.slug}</loc>
        <lastmod>${new Date(job.updated_at).toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
    </url>`
      )
      .join("")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (error) {
    console.error("Error generating jobs sitemap:", error);
    res.status(500).send("Error generating jobs sitemap");
  }
}