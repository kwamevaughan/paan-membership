export async function fetchHRData({
  supabaseClient,
  fetchCandidates = false,
  fetchQuestions = false,
  fetchSubscribers = false,
  fetchOpportunities = false,
  fetchEvents = false,
  fetchResources = false,
  fetchOffers = false,
  fetchEmailTemplates = false,
  fetchMarketIntel = false, // New option
} = {}) {
  try {
    const queries = [];
    let subscribersQueryIndex = -1;
    let opportunitiesQueryIndex = -1;
    let eventsQueryIndex = -1;
    let resourcesQueryIndex = -1;
    let offersQueryIndex = -1;
    let offerFeedbackQueryIndex = -1;
    let tiersQueryIndex = -1;
    let emailTemplatesQueryIndex = -1;
    let questionQueryIndex = -1;
    let marketIntelQueryIndex = -1;
    let marketIntelFeedbackQueryIndex = -1;

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

    if (fetchSubscribers) {
      subscribersQueryIndex = queryIndex;
      queries.push(supabaseClient.from("newsletter_subscriptions").select("*"));
      queryIndex += 1;
    }

    if (fetchOpportunities) {
      opportunitiesQueryIndex = queryIndex;
      queries.push(supabaseClient.from("business_opportunities").select("*"));
      queryIndex += 1;
    }

    if (fetchEvents) {
      eventsQueryIndex = queryIndex;
      queries.push(
        supabaseClient
          .from("events")
          .select("*")
          .order("date", { ascending: true })
      );
      queryIndex += 1;
    }

    if (fetchResources) {
      resourcesQueryIndex = queryIndex;
      queries.push(
        supabaseClient
          .from("resources")
          .select("*")
          .order("created_at", { ascending: true })
      );
      queryIndex += 1;
    }

    if (fetchOffers) {
      offersQueryIndex = queryIndex;
      queries.push(
        supabaseClient
          .from("offers")
          .select(
            "id, title, description, tier_restriction, url, icon_url, created_at, updated_at"
          )
      );
      offerFeedbackQueryIndex = queryIndex + 1;
      queries.push(
        supabaseClient
          .from("offer_feedback")
          .select("id, offer_id, user_id, rating, comment, created_at")
      );
      queryIndex += 2;
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

    if (fetchMarketIntel) {
      marketIntelQueryIndex = queryIndex;
      queries.push(
        supabaseClient
          .from("market_intel")
          .select(
            "id, title, description, tier_restriction, url, icon_url, created_at, updated_at, region, type, downloadable"
          )
          .order("created_at", { ascending: false })
      );
      marketIntelFeedbackQueryIndex = queryIndex + 1;
      queries.push(
        supabaseClient
          .from("market_intel_feedback")
          .select("id, market_intel_id, user_id, rating, comment, created_at")
      );
      queryIndex += 2;
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
      } else {
        console.log(`[fetchHRData] Query ${index} result:`, result?.data);
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
    const offersData = fetchOffers ? results[offersQueryIndex]?.data || [] : [];
    const offerFeedbackData = fetchOffers
      ? results[offerFeedbackQueryIndex]?.data || []
      : [];
    const emailTemplatesData = fetchEmailTemplates
      ? results[emailTemplatesQueryIndex]?.data || []
      : [];
    const marketIntelData = fetchMarketIntel
      ? results[marketIntelQueryIndex]?.data || []
      : [];
    const marketIntelFeedbackData = fetchMarketIntel
      ? results[marketIntelFeedbackQueryIndex]?.data || []
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

    // Validate data
    if (fetchCandidates && candidatesData.length === 0 && !results[0]?.error) {
      console.warn("[fetchHRData] No candidates data returned");
    }
    if (
      fetchOffers &&
      offersData.length === 0 &&
      !results[offersQueryIndex]?.error
    ) {
      console.warn("[fetchHRData] No offers data returned");
    }
    if (
      fetchMarketIntel &&
      marketIntelData.length === 0 &&
      !results[marketIntelQueryIndex]?.error
    ) {
      console.warn("[fetchHRData] No market intel data returned");
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
    if (fetchOffers && results[offersQueryIndex]?.error) {
      throw new Error(
        `Offers query error: ${results[offersQueryIndex].error.message}`
      );
    }
    if (fetchOffers && results[offerFeedbackQueryIndex]?.error) {
      throw new Error(
        `Offer feedback query error: ${results[offerFeedbackQueryIndex].error.message}`
      );
    }
    if (fetchEmailTemplates && results[emailTemplatesQueryIndex]?.error) {
      throw new Error(
        `Email Templates query error: ${results[emailTemplatesQueryIndex].error.message}`
      );
    }
    if (fetchMarketIntel && results[marketIntelQueryIndex]?.error) {
      throw new Error(
        `Market Intel query error: ${results[marketIntelQueryIndex].error.message}`
      );
    }
    if (fetchMarketIntel && results[marketIntelFeedbackQueryIndex]?.error) {
      throw new Error(
        `Market Intel feedback query error: ${results[marketIntelFeedbackQueryIndex].error.message}`
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
            console.warn(
              `[fetchHRData] Answer count mismatch for ${candidate.primaryContactName}. Expected ${filteredQuestions.length}, got ${filteredAnswers.length}`
            );
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

    console.log("[fetchHRData] Returning market intel:", marketIntelData);
    console.log(
      "[fetchHRData] Returning market intel feedback:",
      marketIntelFeedbackData
    );

    return {
      initialCandidates: combinedData,
      initialJobOpenings: jobOpenings,
      initialQuestions: questionsData,
      subscribers: subscribersData,
      opportunities: opportunitiesData,
      events: eventsData,
      resources: resourcesData,
      offers: offersData,
      offerFeedback: offerFeedbackData,
      emailTemplates: emailTemplatesData,
      tiers: tiersData,
      marketIntel: marketIntelData,
      marketIntelFeedback: marketIntelFeedbackData,
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
      offers: [],
      offerFeedback: [],
      emailTemplates: [],
      tiers: [],
      marketIntel: [],
      marketIntelFeedback: [],
    };
  }
}
