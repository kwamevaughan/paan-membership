import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function upsertCandidate({
  agencyName,
  yearEstablished,
  headquartersLocation,
  registeredOfficeAddress,
  websiteUrl,
  primaryContactName,
  primaryContactRole,
  primaryContactEmail,
  primaryContactPhone,
  primaryContactLinkedin,
  opening,
  job_type,
  reference_number,
  opening_id,
  selected_tier,
  languagesSpoken,
  phoneNumber,
  countryOfResidence,
  req, // Add req parameter
  res, // Add res parameter
}) {
  try {
    // Initialize Supabase client
    const supabaseServer = createSupabaseServerClient(req, res);

    // Validate job_type
    if (!["agency", "freelancers", "freelancer"].includes(job_type)) {
      console.error("Invalid job_type:", job_type);
      return {
        error: {
          status: 400,
          message:
            "Invalid job_type, must be 'agency', 'freelancers', or 'freelancer'",
          details: `Received job_type: ${job_type}`,
        },
      };
    }

    console.log("Upserting candidate with data:", {
      primaryContactEmail,
      primaryContactName,
      primaryContactLinkedin,
      job_type,
      reference_number,
    });

    console.log(
      "Checking for existing candidate with email:",
      primaryContactEmail
    );
    const { data: existingCandidate, error: fetchError } = await supabaseServer
      .from("candidates")
      .select("id")
      .eq("primaryContactEmail", primaryContactEmail)
      .eq("opening_id", opening_id)
      .single();

    let userId;
    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Fetch existing candidate error:", fetchError);
      return {
        error: {
          status: 500,
          message: "Error checking existing candidate",
          details: fetchError.message,
        },
      };
    }

    const candidateData = {
      primaryContactName,
      primaryContactEmail,
      primaryContactLinkedin,
      opening,
      job_type,
      reference_number,
      opening_id,
      updated_at: new Date().toISOString(),
    };

    if (job_type === "freelancers" || job_type === "freelancer") {
      Object.assign(candidateData, {
        primaryContactPhone: phoneNumber,
        languagesSpoken,
        countryOfResidence,
      });
    } else if (job_type === "agency") {
      Object.assign(candidateData, {
        agencyName,
        yearEstablished,
        headquartersLocation,
        registeredOfficeAddress,
        websiteUrl,
        primaryContactRole,
        primaryContactPhone,
        selected_tier,
      });
    }

    if (existingCandidate) {
      console.log(
        "Updating existing candidate with email:",
        primaryContactEmail
      );
      const { data: updatedCandidate, error: updateError } =
        await supabaseServer
          .from("candidates")
          .update(candidateData)
          .eq("primaryContactEmail", primaryContactEmail)
          .eq("opening_id", opening_id)
          .select()
          .single();
      if (updateError) throw updateError;
      userId = updatedCandidate.id;
    } else {
      console.log("Inserting new candidate with data:", candidateData);
      const { data: newCandidate, error: insertError } = await supabaseServer
        .from("candidates")
        .insert([candidateData])
        .select()
        .single();
      if (insertError) throw insertError;
      userId = newCandidate.id;
    }
    return { userId };
  } catch (error) {
    console.error("Database operation error:", error.message);
    return {
      error: {
        status: 500,
        message: "Database operation failed",
        details: error.message,
      },
    };
  }
}

export async function upsertResponse({
  userId,
  answers,
  company_registration_url,
  portfolio_work_url,
  agency_profile_url,
  tax_registration_url,
  company_registration_file_id,
  portfolio_work_file_id,
  agency_profile_file_id,
  tax_registration_file_id,
  country,
  device,
  submitted_at,
  status,
  job_type,
  req, // Add req parameter
  res, // Add res parameter
}) {
  try {
    // Initialize Supabase client
    const supabaseServer = createSupabaseServerClient(req, res);

    // Validate job_type
    if (!["agency", "freelancers", "freelancer"].includes(job_type)) {
      console.error("Invalid job_type:", job_type);
      return {
        error: {
          status: 400,
          message:
            "Invalid job_type, must be 'agency', 'freelancers', or 'freelancer'",
          details: `Received job_type: ${job_type}`,
        },
      };
    }

    const responseData = {
      user_id: userId,
      answers: JSON.stringify(answers),
      country,
      device,
      submitted_at: submitted_at || new Date().toISOString(),
      status,
    };

    if (job_type === "agency") {
      Object.assign(responseData, {
        company_registration_url,
        portfolio_work_url,
        agency_profile_url,
        tax_registration_url,
        company_registration_file_id,
        portfolio_work_file_id,
        agency_profile_file_id,
        tax_registration_file_id,
      });
    }

    const { error } = await supabaseServer
      .from("responses")
      .upsert([responseData], {
        onConflict: ["user_id"],
        update: [
          "answers",
          "country",
          "device",
          "submitted_at",
          "status",
          ...(job_type === "agency"
            ? [
                "company_registration_url",
                "portfolio_work_url",
                "agency_profile_url",
                "tax_registration_url",
                "company_registration_file_id",
                "portfolio_work_file_id",
                "agency_profile_file_id",
                "tax_registration_file_id",
              ]
            : []),
        ],
      });

    if (error) {
      console.error("Response upsert error:", error);
      return {
        error: {
          status: 403,
          message: "Failed to upsert response",
          details: error.message,
        },
      };
    }
    return {};
  } catch (error) {
    console.error("Response upsert error:", error.message);
    return {
      error: {
        status: 500,
        message: "Response upsert failed",
        details: error.message,
      },
    };
  }
}
