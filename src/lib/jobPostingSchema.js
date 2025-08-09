export function generateJobPostingSchema(job, countries) {
  if (!job) return null;

  // Helper function to safely parse dates
  const parseDate = (dateString) => {
    if (!dateString) return null;

    try {
      // Handle different date formats
      let date;
      if (dateString.includes("/")) {
        // DD/MM/YYYY format - convert to YYYY-MM-DD
        const [day, month, year] = dateString.split("/");
        date = new Date(
          `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
        );
      } else {
        // ISO format or other standard formats
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) return null;
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.warn("Error parsing date:", dateString, error);
      return null;
    }
  };

  const countryCode = job.location?.country
    ? countries?.find((c) => c.name === job.location.country)?.code ||
      job.location.country
    : "KE";

  // Build the schema with required fields
  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title || "Job Opening",
    description:
      job.description ||
      "Join our team at Pan-African Agency Network (PAAN). Apply now to be part of our growing network of creative professionals across Africa.",
    hiringOrganization: {
      "@type": "Organization",
      name: "Pan-African Agency Network (PAAN)",
      sameAs: "https://paan.africa",
      logo: "https://membership.paan.africa/assets/images/logo.png",
    },
    jobLocation: job.location
      ? {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            streetAddress:
              job.location.streetAddress || "Mitsumi Business Park, 7th floor",
            addressLocality: job.location.city || "Nairobi",
            addressRegion: job.location.region || "Nairobi County",
            postalCode: job.location.postalCode || "00100",
            addressCountry: countryCode,
          },
        }
      : {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Mitsumi Business Park, 7th floor",
            addressLocality: "Nairobi",
            addressRegion: "Nairobi County",
            postalCode: "00100",
            addressCountry: "KE",
          },
        },
    directApply: true,
    url: `https://membership.paan.africa/jobs/${job.slug}`,
  };

  // Add optional fields if they exist
  if (job.created_at) {
    const datePosted = parseDate(job.created_at);
    if (datePosted) schema.datePosted = datePosted;
  }

  if (job.expires_on) {
    const validThrough = parseDate(job.expires_on_display || job.expires_on);
    if (validThrough) schema.validThrough = validThrough;
  }

  if (job.employment_type) {
    // Map employment types to Google Jobs format
    const employmentTypeMap = {
      FULL_TIME: "FULL_TIME",
      PART_TIME: "PART_TIME",
      CONTRACT: "CONTRACTOR",
      TEMPORARY: "TEMPORARY",
      INTERN: "INTERN",
      VOLUNTEER: "VOLUNTEER",
    };
    schema.employmentType =
      employmentTypeMap[job.employment_type] || "FULL_TIME";
  }

  if (job.remote) {
    schema.jobLocation = "TELECOMMUTE";
  }

  // Add job benefits if available
  if (job.benefits) {
    schema.jobBenefits = Array.isArray(job.benefits)
      ? job.benefits
      : [job.benefits];
  }

  // Add skills/qualifications if available
  if (job.skills || job.requirements) {
    schema.skills = job.skills || job.requirements;
  }

  // Debug: Log the schema in development
  if (process.env.NODE_ENV === "development") {
    console.log("Generated Job Schema for:", job.title, schema);
  }

  return schema;
}
