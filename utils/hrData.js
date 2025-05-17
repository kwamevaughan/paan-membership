import { supabaseServer } from "@/lib/supabaseServer";

export async function fetchHRData({
  fetchCandidates = true,
  fetchQuestions = true,
  fetchSubscribers = true,
} = {}) {
  try {
    const queries = [];
    let subscribersQueryIndex = -1;

    if (fetchCandidates) {
      queries.push(supabaseServer.from("candidates").select("*"));
      queries.push(supabaseServer.from("responses").select("*"));
      queries.push(
        supabaseServer
          .from("interview_questions")
          .select("*")
          .order("order", { ascending: true })
      );
    }

    if (fetchQuestions && !fetchCandidates) {
      queries.push(
        supabaseServer
          .from("interview_questions")
          .select("*")
          .order("order", { ascending: true })
      );
    }

    if (fetchSubscribers) {
      subscribersQueryIndex = queries.length;
      queries.push(supabaseServer.from("newsletter_subscriptions").select("*"));
    }

    const results = await Promise.all(queries);

    const subscribersData = fetchSubscribers
      ? results[subscribersQueryIndex]?.data || []
      : [];

    if (fetchSubscribers && results[subscribersQueryIndex]?.error) {
      console.error(
        "Subscribers query error:",
        results[subscribersQueryIndex].error
      );
      throw results[subscribersQueryIndex].error;
    }

    const candidatesData = fetchCandidates ? results[0]?.data || [] : [];
    const responsesData = fetchCandidates ? results[1]?.data || [] : [];
    const questionsData = fetchQuestions
      ? fetchCandidates
        ? results[2]?.data || []
        : results[0]?.data || []
      : [];

    if (fetchCandidates && results[0]?.error) throw results[0].error;
    if (fetchCandidates && results[1]?.error) throw results[1].error;
    if (
      fetchQuestions &&
      (fetchCandidates ? results[2]?.error : results[0]?.error)
    ) {
      throw fetchCandidates ? results[2].error : results[0].error;
    }

    let combinedData = [];
    if (fetchCandidates) {
      combinedData = candidatesData.map((candidate) => {
        const response =
          responsesData.find((r) => r.user_id === candidate.id) || {};
        let parsedAnswers = [];

        if (response.answers) {
          if (typeof response.answers === "string") {
            try {
              parsedAnswers = JSON.parse(response.answers);
            } catch (e) {
              console.error(
                `Failed to parse answers for ${candidate.primaryContactName}:`,
                e
              );
              parsedAnswers = response.answers.split(",").map((a) => a.trim());
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
          Pending: "Pending",
        };
        const status = statusMap[response.status] || "Pending";

        const openingLower = candidate.opening?.toLowerCase() || "";
        const isAgency =
          openingLower.includes("agency") || openingLower.includes("agencies");
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
            `Answer count mismatch for ${candidate.primaryContactName}. Expected ${filteredQuestions.length}, got ${filteredAnswers.length}`
          );
        }

        return {
          ...candidate,
          email: candidate.primaryContactEmail || "", // Map primaryContactEmail to email
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
      });
    }

    const jobOpenings = fetchCandidates
      ? [...new Set(combinedData.map((c) => c.opening))]
      : [];


    return {
      initialCandidates: combinedData,
      initialJobOpenings: jobOpenings,
      initialQuestions: questionsData,
      subscribers: subscribersData,
    };
  } catch (error) {
    console.error("Error fetching HR data:", error);
    return {
      initialCandidates: [],
      initialJobOpenings: [],
      initialQuestions: [],
      subscribers: [],
    };
  }
}
