import { supabaseServer } from "@/lib/supabaseServer";

export async function fetchHRData({
  fetchCandidates = true,
  fetchQuestions = true,
} = {}) {
  try {
    const queries = [];

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

    if (fetchQuestions) {
      queries.push(
        supabaseServer
          .from("interview_questions")
          .select("*")
          .order("order", { ascending: true })
      );
    }

    const results = await Promise.all(queries);

    const candidatesData = fetchCandidates ? results[0].data : [];
    const responsesData = fetchCandidates ? results[1].data : [];
    const questionsData = fetchQuestions
      ? fetchCandidates
        ? results[2].data
        : results[0].data
      : [];

    if (fetchCandidates && results[0].error) throw results[0].error;
    if (fetchCandidates && results[1].error) throw results[1].error;
    if (
      fetchQuestions &&
      (fetchCandidates ? results[2].error : results[0].error)
    )
      throw fetchCandidates ? results[2].error : results[0].error;

    const agencyQuestions = questionsData.filter(
      (q) => q.job_type === "agency"
    );
    const freelancerQuestions = questionsData.filter(
      (q) => q.job_type === "freelancer"
    );
  

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

          // Flatten answers to strings
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
          // Insert null for missing answers (e.g., index 6)
          if (parsedAnswers.length < filteredQuestions.length) {
            parsedAnswers.splice(6, 0, null); // Insert null for "How can your agency contribute..."
            filteredAnswers = parsedAnswers.concat(
              Array(filteredQuestions.length - parsedAnswers.length).fill(null)
            );
          }
        } else if (isFreelancer) {
          filteredQuestions = questionsData.filter(
            (q) => q.job_type === "freelancer"
          );
          const expectedQuestionCount = filteredQuestions.length;
          // Take the last non-null answers matching expectedQuestionCount
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

        // Ensure filteredAnswers matches filteredQuestions length
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

    combinedData.forEach((candidate) => {
      const jobType =
        (candidate.opening?.toLowerCase() || "").includes("agency") ||
        (candidate.opening?.toLowerCase() || "").includes("agencies")
          ? "Agency"
          : (candidate.opening?.toLowerCase() || "").includes("freelancer") ||
            (candidate.opening?.toLowerCase() || "").includes("freelancers")
          ? "Freelancer"
          : "Other";
      
    });

    return {
      initialCandidates: combinedData,
      initialJobOpenings: jobOpenings,
      initialQuestions: questionsData,
    };
  } catch (error) {
    console.error("Error fetching HR data:", error);
    return {
      initialCandidates: [],
      initialJobOpenings: [],
      initialQuestions: [],
    };
  }
}
