import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { candidateId } = req.body;

  if (!candidateId) {
    return res.status(400).json({ error: "Candidate ID is required" });
  }

  try {
    console.log(
      "[resend-welcome-email] Processing resend for candidate:",
      candidateId
    );

    const supabaseServer = createSupabaseServerClient(req, res);

    // Get the candidate and response data
    const { data: candidate, error: candidateError } = await supabaseServer
      .from("candidates")
      .select("*")
      .eq("id", candidateId)
      .single();

    if (candidateError || !candidate) {
      console.error(
        "[resend-welcome-email] Candidate not found:",
        candidateError
      );
      return res.status(404).json({ error: "Candidate not found" });
    }

    const { data: response, error: responseError } = await supabaseServer
      .from("responses")
      .select("*")
      .eq("user_id", candidateId)
      .single();

    if (responseError || !response) {
      console.error(
        "[resend-welcome-email] Response not found:",
        responseError
      );
      return res.status(404).json({ error: "Response data not found" });
    }

    // Check if email_data exists, if not create it for legacy candidates
    let emailData;
    if (!response.email_data) {
      console.log(
        "[resend-welcome-email] No email data found, creating for legacy candidate:",
        candidateId
      );

      // Create email data for legacy candidate
      emailData = {
        userId: candidateId,
        agencyName: candidate.agencyName,
        yearEstablished: candidate.yearEstablished,
        headquartersLocation: candidate.headquartersLocation,
        registeredOfficeAddress: candidate.registeredOfficeAddress,
        websiteUrl: candidate.websiteUrl,
        primaryContactName: candidate.primaryContactName,
        primaryContactRole: candidate.primaryContactRole,
        primaryContactEmail: candidate.primaryContactEmail,
        primaryContactPhone: candidate.primaryContactPhone,
        primaryContactLinkedin: candidate.primaryContactLinkedin,
        phoneNumber: candidate.primaryContactPhone,
        countryOfResidence: candidate.headquartersLocation,
        languagesSpoken: candidate.languagesSpoken,
        opening: candidate.opening,
        opening_id: candidate.opening_id,
        job_type: candidate.job_type,
        answers: response.answers
          ? typeof response.answers === "string"
            ? JSON.parse(response.answers)
            : response.answers
          : [],
        companyRegistration: null,
        portfolioWork: null,
        agencyProfile: null,
        portfolioLinks: response.portfolio_links || [],
        companyRegistrationMimeType: null,
        portfolioWorkMimeType: null,
        agencyProfileMimeType: null,
        country: response.country,
        device: response.device,
        submittedAt: response.submitted_at || candidate.created_at,
        referenceNumber: candidate.reference_number,
      };

      // Store the generated email data for future use
      await supabaseServer
        .from("responses")
        .update({
          email_data: JSON.stringify(emailData),
        })
        .eq("user_id", candidateId);

      console.log(
        "[resend-welcome-email] Generated and stored email data for legacy candidate"
      );
    }

    // Reset email status and trigger processing
    await supabaseServer
      .from("responses")
      .update({
        email_sent: false,
        processed_at: null,
        error_message: null,
      })
      .eq("user_id", candidateId);

    console.log(
      "[resend-welcome-email] Reset email status for candidate:",
      candidateId
    );

    // Trigger email processing
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? process.env.BASE_URL || "http://localhost:3000"
        : process.env.PRODUCTION_URL || "https://membership.paan.africa";

    const triggerUrl = `${baseUrl}/api/trigger-email-processing`;

    const triggerResponse = await fetch(triggerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!triggerResponse.ok) {
      throw new Error("Failed to trigger email processing");
    }

    const result = await triggerResponse.json();
    console.log(
      "[resend-welcome-email] Email processing triggered:",
      result.message
    );

    return res.status(200).json({
      success: true,
      message: "Welcome email queued for resending",
      candidateName: candidate.primaryContactName,
    });
  } catch (error) {
    console.error("[resend-welcome-email] Error:", error.message);
    return res.status(500).json({ error: "Failed to resend welcome email" });
  }
}
