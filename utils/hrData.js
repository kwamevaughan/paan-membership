import { supabaseServer } from "@/lib/supabaseServer";

export async function fetchHRData({
  fetchCandidates = true,
  fetchQuestions = true,
  fetchSubscribers = true,
} = {}) {
  try {
    const queries = [];
    let subscribersQueryIndex = -1; // Track subscribers query index

    // Add candidate-related queries
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

    // Add questions query if needed
    if (fetchQuestions && !fetchCandidates) {
      queries.push(
        supabaseServer
          .from("interview_questions")
          .select("*")
          .order("order", { ascending: true })
      );
    }

    // Add subscribers query
    if (fetchSubscribers) {
      subscribersQueryIndex = queries.length; // Store index of subscribers query
      queries.push(supabaseServer.from("newsletter_subscriptions").select("*"));
    }

    // Execute all queries
    const results = await Promise.all(queries);
    console.log("Query results:", results); // Debug: Log all query results

    // Extract subscribers data
    const subscribersData = fetchSubscribers
      ? results[subscribersQueryIndex]?.data || []
      : [];
    console.log("Subscribers data:", subscribersData); // Debug: Log subscribers data

    // Check for subscribers query error
    if (fetchSubscribers && results[subscribersQueryIndex]?.error) {
      console.error(
        "Subscribers query error:",
        results[subscribersQueryIndex].error
      );
      throw results[subscribersQueryIndex].error;
    }

    // Extract candidate-related data
    const candidatesData = fetchCandidates ? results[0]?.data || [] : [];
    const responsesData = fetchCandidates ? results[1]?.data || [] : [];
    const questionsData = fetchQuestions
      ? fetchCandidates
        ? results[2]?.data || []
        : results[0]?.data || []
      : [];

    // Check for candidate-related query errors
    if (fetchCandidates && results[0]?.error) throw results[0].error;
    if (fetchCandidates && results[1]?.error) throw results[1].error;
    if (
      fetchQuestions &&
      (fetchCandidates ? results[2]?.error : results[0]?.error)
    ) {
      throw fetchCandidates ? results[2].error : results[0].error;
    }

    // Process candidates data
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

          parsedAnswers = parsedAnswers.map((answer) => {
            if (!answer || answer === null || answer === "") return null;
            if (Array.isArray(answer)) {
              return answer
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
            }
            if (typeof answer === "object") {
              return (
                answer.customText ||
                Object.entries(answer)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(", ")
              );
            }
            return answer;
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
          filteredQuestions = questionsData.filter(
            (q) => q.job_type === "agencies"
          );
          if (parsedAnswers.length < filteredQuestions.length) {
            parsedAnswers.splice(6, 0, null);
            filteredAnswers = parsedAnswers.concat(
              Array(filteredQuestions.length - parsedAnswers.length).fill(null)
            );
          }
        } else if (isFreelancer) {
          filteredQuestions = questionsData.filter(
            (q) => q.job_type === "freelancer"
          );
          const expectedQuestionCount = filteredQuestions.length;
          const nonNullAnswers = parsedAnswers
            .filter((a) => a !== null && a !== "")
            .slice(-expectedQuestionCount);
          filteredAnswers = nonNullAnswers.concat(
            Array(expectedQuestionCount - nonNullAnswers.length).fill(null)
          );
        }

        if (
          isFreelancer &&
          filteredAnswers.length !== filteredQuestions.length
        ) {
          console.warn(
            `Answer count mismatch for ${candidate.primaryContactName}. Expected ${filteredQuestions.length}, got ${filteredAnswers.length}`
          );
        }

        if (filteredAnswers.length < filteredQuestions.length) {
          filteredAnswers = filteredAnswers.concat(
            Array(filteredQuestions.length - filteredAnswers.length).fill(null)
          );
        } else if (filteredAnswers.length > filteredQuestions.length) {
          filteredAnswers = filteredAnswers.slice(0, filteredQuestions.length);
        }

        return {
          ...candidate,
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

    // Debug: Log final return data
    console.log("Returning data:", {
      initialCandidates: combinedData,
      initialJobOpenings: jobOpenings,
      initialQuestions: questionsData,
      subscribers: subscribersData,
    });

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
