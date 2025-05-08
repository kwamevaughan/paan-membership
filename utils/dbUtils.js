import { supabaseServer } from "@/lib/supabaseServer";

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
  reference_number,
  opening_id,
}) {
  try {
    console.log(
      "Checking for existing candidate with email:",
      primaryContactEmail
    );
    const { data: existingCandidate, error: fetchError } = await supabaseServer
      .from("candidates")
      .select("id")
      .eq("primaryContactEmail", primaryContactEmail)
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

    if (existingCandidate) {
      console.log(
        "Updating existing candidate with email:",
        primaryContactEmail
      );
      const { data: updatedCandidate, error: updateError } =
        await supabaseServer
          .from("candidates")
          .update({
            agencyName,
            yearestablished: yearEstablished,
            headquarterslocation: headquartersLocation,
            registeredOfficeAddress,
            websiteUrl,
            primaryContactName,
            primarycontactrole: primaryContactRole,
            primaryContactPhone,
            primaryContactLinkedin,
            opening,
            reference_number,
            opening_id,
            updated_at: new Date().toISOString(),
          })
          .eq("primaryContactEmail", primaryContactEmail)
          .select()
          .single();
      if (updateError) throw updateError;
      userId = updatedCandidate.id;
    } else {
      console.log("Inserting new candidate with data:", {
        agencyName,
        yearestablished: yearEstablished,
        headquarterslocation: headquartersLocation,
        registeredOfficeAddress,
        websiteUrl,
        primaryContactName,
        primarycontactrole: primaryContactRole,
        primaryContactEmail,
        primaryContactPhone,
        primaryContactLinkedin,
        opening,
        reference_number,
        opening_id,
      });
      const { data: newCandidate, error: insertError } = await supabaseServer
        .from("candidates")
        .insert([
          {
            agencyName,
            yearestablished: yearEstablished,
            headquarterslocation: headquartersLocation,
            registeredOfficeAddress,
            websiteUrl,
            primaryContactName,
            primarycontactrole: primaryContactRole,
            primaryContactEmail,
            primaryContactPhone,
            primaryContactLinkedin,
            opening,
            reference_number,
            opening_id,
            updated_at: new Date().toISOString(),
          },
        ])
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
  companyRegistrationUrl,
  portfolioWorkUrl,
  agencyProfileUrl,
  taxRegistrationUrl,
  companyRegistrationFileId,
  portfolioWorkFileId,
  agencyProfileFileId,
  taxRegistrationFileId,
  country,
  device,
  submittedAt,
}) {
  try {
    console.log("Attempting to upsert response with data:", {
      user_id: userId,
      answers: JSON.stringify(answers),
      company_registration_url: companyRegistrationUrl,
      portfolio_work_url: portfolioWorkUrl,
      agency_profile_url: agencyProfileUrl,
      tax_registration_url: taxRegistrationUrl,
      company_registration_file_id: companyRegistrationFileId,
      portfolio_work_file_id: portfolioWorkFileId,
      agency_profile_file_id: agencyProfileFileId,
      tax_registration_file_id: taxRegistrationFileId,
      country,
      device,
      submitted_at: submittedAt,
    });
    const { error } = await supabaseServer.from("responses").upsert(
      [
        {
          user_id: userId,
          answers: JSON.stringify(answers),
          company_registration_url: companyRegistrationUrl,
          portfolio_work_url: portfolioWorkUrl,
          agency_profile_url: agencyProfileUrl,
          tax_registration_url: taxRegistrationUrl,
          company_registration_file_id: companyRegistrationFileId,
          portfolio_work_file_id: portfolioWorkFileId,
          agency_profile_file_id: agencyProfileFileId,
          tax_registration_file_id: taxRegistrationFileId,
          country,
          device,
          submitted_at: submittedAt,
        },
      ],
      {
        onConflict: ["user_id"],
        update: [
          "answers",
          "company_registration_url",
          "portfolio_work_url",
          "agency_profile_url",
          "tax_registration_url",
          "company_registration_file_id",
          "portfolio_work_file_id",
          "agency_profile_file_id",
          "tax_registration_file_id",
          "country",
          "device",
          "submitted_at",
        ],
      }
    );

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
