export async function fetchHRData({
  supabaseClient,
  fetchCandidates = false,
  fetchQuestions = false,
  fetchSubscribers = false,
  fetchOpportunities = false,
  fetchEvents = false,
  fetchResources = false,
  fetchEmailTemplates = false,
} = {}) {
  try {
    const queries = [];
    let subscribersQueryIndex = -1;
    let opportunitiesQueryIndex = -1;
    let eventsQueryIndex = -1;
    let resourcesQueryIndex = -1;
    let tiersQueryIndex = -1;
    let emailTemplatesQueryIndex = -1;

    if (fetchCandidates) {
      queries.push(supabaseClient.from("candidates").select("*"));
      queries.push(supabaseClient.from("responses").select("*"));
      queries.push(
        supabaseClient
          .from("interview_questions")
          .select("*")
          .order("order", { ascending: true })
      );
    }

    if (fetchQuestions && !fetchCandidates) {
      queries.push(
        supabaseClient
          .from("interview_questions")
          .select("*")
          .order("order", { ascending: true })
      );
    }

    if (fetchSubscribers) {
      subscribersQueryIndex = queries.length;
      queries.push(supabaseClient.from("newsletter_subscriptions").select("*"));
    }

    if (fetchOpportunities) {
      opportunitiesQueryIndex = queries.length;
      queries.push(supabaseClient.from("business_opportunities").select("*"));
    }

    if (fetchEvents) {
      eventsQueryIndex = queries.length;
      queries.push(
        supabaseClient
          .from("events")
          .select("*")
          .order("date", { ascending: true })
      );
    }

    if (fetchResources) {
      resourcesQueryIndex = queries.length;
      queries.push(
        supabaseClient
          .from("resources")
          .select("*")
          .order("created_at", { ascending: true })
      );
    }

    if (fetchEmailTemplates) {
      emailTemplatesQueryIndex = queries.length;
      queries.push(
        supabaseClient
          .from("email_templates")
          .select("id, name, subject, body, updated_at")
          .order("updated_at", { ascending: false, nullsLast: true })
      );
    }

    tiersQueryIndex = queries.length;
    queries.push(
      supabaseClient
        .from("candidates")
        .select("selected_tier")
        .neq("selected_tier", null)
    );

    const results = await Promise.all(queries);

    const subscribersData = fetchSubscribers
      ? results[subscribersQueryIndex]?.data || []
      : [];

    const opportunitiesData = fetchOpportunities
      ? results[opportunitiesQueryIndex]?.data || []
      : [];

    const eventsData = fetchEvents ? results[eventsQueryIndex]?.data || [] : [];

    const resourcesData = fetchResources
      ? results[resourcesQueryIndex]?.data || []
      : [];

    const emailTemplatesData = fetchEmailTemplates
      ? results[emailTemplatesQueryIndex]?.data || []
      : [];

    const tiersData = results[tiersQueryIndex]?.data
      ? [
          ...new Set(
            results[tiersQueryIndex].data
              .map((item) => item.selected_tier)
              .filter(
                (tier) => tier && typeof tier === "string" && tier.trim() !== ""
              )
          ),
        ].sort()
      : [];

    results.forEach((result, index) => {
      if (result?.error) {
        console.error(`[fetchHRData] Query ${index} error:`, result.error);
      }
    });

    if (fetchSubscribers && results[subscribersQueryIndex]?.error) {
      throw new Error(
        `Subscribers query error: ${results[subscribersQueryIndex].error.message}`
      );
    }

    if (fetchOpportunities && results[opportunitiesQueryIndex]?.error) {
      throw new Error(
        `Opportunities query error: ${results[opportunitiesQueryIndex].error.message}`
      );
    }

    if (fetchEvents && results[eventsQueryIndex]?.error) {
      throw new Error(
        `Events query error: ${results[eventsQueryIndex].error.message}`
      );
    }

    if (fetchResources && results[resourcesQueryIndex]?.error) {
      throw new Error(
        `Resources query error: ${results[resourcesQueryIndex].error.message}`
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

    const candidatesData = fetchCandidates ? results[0]?.data || [] : [];
    const responsesData = fetchCandidates ? results[1]?.data || [] : [];
    const questionsData = fetchQuestions
      ? fetchCandidates
        ? results[2]?.data || []
        : results[0]?.data || []
      : [];

    if (fetchCandidates && results[0]?.error) {
      throw new Error(`Candidates query error: ${results[0].error.message}`);
    }
    if (fetchCandidates && results[1]?.error) {
      throw new Error(`Responses query error: ${results[1].error.message}`);
    }
    if (
      fetchQuestions &&
      (fetchCandidates ? results[2]?.error : results[0]?.error)
    ) {
      throw new Error(
        `Questions query error: ${
          fetchCandidates ? results[2].error.message : results[0].error.message
        }`
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

            parsedAnswers = parsedAnswers.map((answer, index) => {
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

          const statusMap = {
            completed: "Accepted",
            Reviewed: "Reviewed",
            Hundreds: "Pending",
          };
          const status = statusMap[response.status] || "Pending";

          const openingLower = candidate.opening?.toLowerCase() || "";
          const isAgency =
            openingLower.includes("agency") ||
            openingLower.includes("agencies");
          const isFreelancer =
            openingLower.includes("freelancer") ||
            openingLower.includes("freelancers");

          let filteredQuestions = questionsData;
          let filteredAnswers = parsedAnswers;

          if (isAgency) {
            const allAgencyQuestions = questionsData.filter(
              (q) => q.job_type === "agency"
            );
            filteredAnswers = parsedAnswers.filter(
              (answer) => answer !== null && answer !== ""
            );
            filteredQuestions = allAgencyQuestions.slice(
              0,
              filteredAnswers.length
            );
          } else if (isFreelancer) {
            filteredQuestions = questionsData.filter(
              (q) => q.job_type === "freelancer"
            );
            filteredAnswers = parsedAnswers.filter(
              (answer) => answer !== null && answer !== ""
            );
            filteredQuestions = filteredQuestions.slice(
              0,
              filteredAnswers.length
            );
          }

          if (filteredAnswers.length !== filteredQuestions.length) {
            
          }

          return {
            ...candidate,
            email: candidate.primaryContactEmail || "",
            primaryContactName: candidate.primaryContactName || "Unknown",
            opening: candidate.opening || "Unknown Position",
            answers: filteredAnswers,
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
            questions: filteredQuestions,
          };
        })
      : [];

    const jobOpenings = fetchCandidates
      ? [...new Set(combinedData.map((c) => c.opening))]
      : [];

    return {
      initialCandidates: combinedData,
      initialJobOpenings: jobOpenings,
      initialQuestions: questionsData,
      subscribers: subscribersData,
      opportunities: opportunitiesData,
      events: eventsData,
      resources: resourcesData,
      emailTemplates: emailTemplatesData,
      tiers: tiersData,
    };
  } catch (error) {
    console.error("[fetchHRData] Error fetching HR data:", error.message);
    return {
      initialCandidates: [],
      initialJobOpenings: [],
      initialQuestions: [],
      subscribers: [],
      opportunities: [],
      events: [],
      resources: [],
      emailTemplates: [],
      tiers: [],
    };
  }
}