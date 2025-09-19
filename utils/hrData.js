export async function fetchHRData({
  supabaseClient,
  fetchCandidates = false,
  fetchQuestions = false,
  fetchEmailTemplates = false,
} = {}) {
  try {
    const queries = [];
    let questionQueryIndex = -1;
    let emailTemplatesQueryIndex = -1;
    let tiersQueryIndex = -1;

    let queryIndex = 0;

    if (fetchCandidates) {
      queries.push(supabaseClient.from("candidates").select("*"));
      queries.push(supabaseClient.from("responses").select("*"));
      queries.push(
        supabaseClient
          .from("interview_questions")
          .select("*")
          .order("order", { ascending: true })
      );
      queryIndex += 3;
    }

    if (fetchQuestions && !fetchCandidates) {
      questionQueryIndex = queryIndex;
      queries.push(
        supabaseClient
          .from("interview_questions")
          .select("*")
          .order("order", { ascending: true })
      );
      queryIndex += 1;
    }

    if (fetchEmailTemplates) {
      emailTemplatesQueryIndex = queryIndex;
      queries.push(
        supabaseClient
          .from("email_templates")
          .select("id, name, subject, body, updated_at")
          .order("updated_at", { ascending: false, nullsLast: true })
      );
      queryIndex += 1;
    }

    tiersQueryIndex = queryIndex;
    queries.push(
      supabaseClient
        .from("candidates")
        .select("selected_tier")
        .neq("selected_tier", null)
    );

    const results = await Promise.all(queries);

    // Log all query results for debugging
    results.forEach((result, index) => {
      if (result?.error) {
        console.error(
          `[fetchHRData] Query ${index} error:`,
          result.error.message
        );
      }
    });

    let resultIndex = 0;

    const candidatesData = fetchCandidates
      ? results[resultIndex++]?.data || []
      : [];
    const responsesData = fetchCandidates
      ? results[resultIndex++]?.data || []
      : [];
    const questionsData = fetchCandidates
      ? results[resultIndex++]?.data || []
      : fetchQuestions
      ? results[questionQueryIndex]?.data || []
      : [];
    const emailTemplatesData = fetchEmailTemplates
      ? results[emailTemplatesQueryIndex]?.data || []
      : [];

    // Normalize tier names
    const normalizeTier = (tier) => {
      if (!tier || typeof tier !== "string") return tier;
      // Remove appended requirements (e.g., "- Requirement: ...")
      const match = tier.match(/^(.+?)(?:\s*-\s*Requirement:.*)?$/i);
      return match ? match[1].trim() : tier.trim();
    };

    const tiersData = results[tiersQueryIndex]?.data
      ? [
          ...new Set(
            results[tiersQueryIndex].data
              .map((item) => normalizeTier(item.selected_tier))
              .filter(
                (tier) => tier && typeof tier === "string" && tier.trim() !== ""
              )
          ),
        ].sort()
      : [];

    // Validate data
    if (fetchCandidates && candidatesData.length === 0 && !results[0]?.error) {
      console.warn("[fetchHRData] No candidates data returned");
    }

    // Throw errors for failed queries
    if (fetchCandidates && results[0]?.error) {
      throw new Error(`Candidates query error: ${results[0].error.message}`);
    }
    if (fetchCandidates && results[1]?.error) {
      throw new Error(`Responses query error: ${results[1].error.message}`);
    }
    if (fetchCandidates && results[2]?.error) {
      throw new Error(`Questions query error: ${results[2].error.message}`);
    }
    if (
      fetchQuestions &&
      !fetchCandidates &&
      results[questionQueryIndex]?.error
    ) {
      throw new Error(
        `Questions query error: ${results[questionQueryIndex].error.message}`
      );
    }
    if (fetchEmailTemplates && results[emailTemplatesQueryIndex]?.error) {
      throw new Error(
        `Email Templates query error: ${results[emailTemplatesQueryIndex].error.message}`
      );
    }
    if (results[tiersQueryIndex]?.error) {
      throw new Error(
        `Tiers query error: ${results[tiersQueryIndex].error.message}`
      );
    }

    const combinedData = fetchCandidates
      ? candidatesData.map((candidate) => {
          const response =
            responsesData.find((r) => r.user_id === candidate.id) || {};
          let parsedAnswers = [];

          if (response.answers) {
            if (typeof response.answers === "string") {
              try {
                parsedAnswers = JSON.parse(response.answers);
              } catch (e) {
                console.error(
                  `[fetchHRData] Failed to parse answers for ${candidate.primaryContactName}:`,
                  e
                );
                parsedAnswers = response.answers
                  .split(",")
                  .map((a) => a.trim());
              }
            } else if (Array.isArray(response.answers)) {
              parsedAnswers = response.answers;
            }

            // Format each answer but keep the array length intact to preserve indexing
            parsedAnswers = parsedAnswers.map((answer) => {
              if (!answer || answer === null || answer === "") {
                return null;
              }

              let processedAnswer = answer;
              if (Array.isArray(answer)) {
                if (answer.length === 0) {
                  return null;
                }
                if (
                  answer.length === 1 &&
                  answer[0] &&
                  typeof answer[0] === "object"
                ) {
                  processedAnswer = answer[0].customText || answer[0];
                } else if (answer.length === 1) {
                  processedAnswer = answer[0];
                } else {
                  processedAnswer = answer;
                }
              }

              if (Array.isArray(processedAnswer)) {
                const formatted = processedAnswer
                  .map((item) =>
                    item && typeof item === "object"
                      ? item.customText ||
                        Object.entries(item)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ")
                      : item
                  )
                  .filter((item) => item)
                  .join("; ");
                return formatted || null;
              }
              if (
                typeof processedAnswer === "object" &&
                processedAnswer !== null
              ) {
                const formatted =
                  processedAnswer.customText ||
                  Object.entries(processedAnswer)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(", ");
                return formatted || null;
              }
              return processedAnswer;
            });
          }

          // Use the actual status from responses table, with fallback mapping for legacy data
          const statusMap = {
            completed: "Accepted",
            Hundreds: "Pending",
          };
          const status = response.status
            ? statusMap[response.status] || response.status
            : "Pending";

          const openingLower = candidate.opening?.toLowerCase() || "";
          const isAgency =
            openingLower.includes("agency") ||
            openingLower.includes("agencies");
          const isFreelancer =
            openingLower.includes("freelancer") ||
            openingLower.includes("freelancers");

          // Build job-specific questions and align answers by question.id - 1
          const jobQuestions = isAgency
            ? questionsData.filter((q) => q.job_type === "agency")
            : isFreelancer
            ? questionsData.filter((q) => q.job_type === "freelancer")
            : questionsData;

          const alignedAnswers = jobQuestions.map(
            (q) => parsedAnswers[q.id - 1] ?? null
          );

          if (alignedAnswers.length !== jobQuestions.length) {
            console.warn(
              `[fetchHRData] Answer count mismatch for ${candidate.primaryContactName}. Expected ${jobQuestions.length}, got ${alignedAnswers.length}`
            );
          }

          return {
            ...candidate,
            email: candidate.primaryContactEmail || "",
            primaryContactName: candidate.primaryContactName || "Unknown",
            opening: candidate.opening || "Unknown Position",
            answers: alignedAnswers,
            companyRegistrationUrl: response.company_registration_url || null,
            portfolioWorkUrl: response.portfolio_work_url || null,
            agencyProfileUrl: response.agency_profile_url || null,
            taxRegistrationUrl: response.tax_registration_url || null,
            status,
            country: response.country
              ? response.country.toUpperCase()
              : "Unknown",
            device: response.device || "Unknown",
            submitted_at: response.submitted_at || null,
            questions: jobQuestions,
            selected_tier: normalizeTier(candidate.selected_tier), // Normalize tier in candidate data
            // Email status fields
            email_sent: response.email_sent || false,
            processed_at: response.processed_at || null,
            error_message: response.error_message || null,
          };
        })
      : [];

    const jobOpenings = fetchCandidates
      ? [
          ...new Set(
            combinedData.map((c) => {
              const opening = c.opening || "";
              return opening.replace(/\s+/g, " ").trim();
            })
          ),
        ]
          .filter(Boolean) // Remove null/undefined/empty strings
          .sort((a, b) => a.localeCompare(b)) // Sort alphabetically
      : [];

    return {
      initialCandidates: combinedData,
      initialJobOpenings: jobOpenings,
      initialQuestions: questionsData,
      emailTemplates: emailTemplatesData,
      tiers: tiersData,
    };
  } catch (error) {
    console.error("[fetchHRData] Error fetching HR data:", error.message);
    return {
      initialCandidates: [],
      initialJobOpenings: [],
      initialQuestions: [],
      emailTemplates: [],
      tiers: [],
    };
  }
}
