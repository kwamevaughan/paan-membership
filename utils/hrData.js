import { supabaseServer } from "@/lib/supabaseServer";

export async function fetchHRData({ fetchCandidates = true, fetchQuestions = true } = {}) {
    try {
        const queries = [];
        if (fetchCandidates) {
            queries.push(
              supabaseServer
                .from("candidates")
                .select(
                  "id, primaryContactName, primaryContactEmail, primaryContactPhone, primaryContactLinkedin, opening, agencyName"
                ),
              supabaseServer
                .from("responses")
                .select(
                  "user_id, answers, company_registration_url, portfolio_work_url, agency_profile_url, tax_registration_url, status, country, device, submitted_at"
                )
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
        const questionsData = fetchQuestions ? (fetchCandidates ? results[2].data : results[0].data) : [];

        if (fetchCandidates && results[0].error) throw results[0].error;
        if (fetchCandidates && results[1].error) throw results[1].error;
        if (fetchQuestions && (fetchCandidates ? results[2].error : results[0].error)) throw fetchCandidates ? results[2].error : results[0].error;

        let combinedData = [];
        if (fetchCandidates) {
            combinedData = candidatesData.map((candidate) => {
                const response = responsesData.find((r) => r.user_id === candidate.id) || {};
                let parsedAnswers = [];
                if (response.answers) {
                    if (typeof response.answers === "string") {
                        try {
                            parsedAnswers = JSON.parse(response.answers);
                        } catch (e) {
                            parsedAnswers = response.answers.split(",").map((a) => a.trim());
                        }
                    } else if (Array.isArray(response.answers)) {
                        parsedAnswers = response.answers;
                    }
                }
                return {
                    ...candidate,
                    answers: Array.isArray(parsedAnswers) ? parsedAnswers : [],
                    companyRegistrationUrl: response.company_registration_url || null,
                    portfolioWorkUrl: response.portfolio_work_url || null,
                    agencyProfileUrl: response.agency_profile_url || null,
                    taxRegistrationUrl: response.tax_registration_url || null,
                    status: response.status || "Pending",
                    country: response.country ? response.country.toUpperCase() : "Unknown",
                    device: response.device || "Unknown",
                    submitted_at: response.submitted_at || null,
                    questions: questionsData,
                };
            });
        }

        const jobOpenings = fetchCandidates ? [...new Set(combinedData.map((c) => c.opening))] : [];

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