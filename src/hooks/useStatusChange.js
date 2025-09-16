import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

// Function to generate a memorable Pan-African inspired password
const generatePanAfricanPassword = async () => {
  try {
    const { data: panAfricanWords, error } = await supabase
      .from("pan_african_words")
      .select("word");

    if (error || !panAfricanWords || panAfricanWords.length === 0) {
      console.warn(
        "Could not fetch Pan-African words, using fallback list",
        error
      );
      return generateFallbackPassword();
    }

    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    const randomWord =
      panAfricanWords[Math.floor(Math.random() * panAfricanWords.length)].word;
    return `${randomWord}${randomNumber}`;
  } catch (err) {
    console.error("Error generating password:", err);
    return generateFallbackPassword();
  }
};

// Fallback function if database fetch fails
const generateFallbackPassword = () => {
  const fallbackWords = [
    "Ubuntu",
    "Amani",
    "Uhuru",
    "Sankofa",
    "Ujima",
    "Umoja",
    "Imani",
    "Kujichagulia",
    "Nia",
    "Zawadi",
  ];

  const randomNumber = Math.floor(Math.random() * 9000) + 1000;
  const randomWord =
    fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
  return `${randomWord}${randomNumber}`;
};

const useStatusChange = ({
  candidates,
  setCandidates,
  setFilteredCandidates,
  setSelectedCandidate,
  setEmailData,
  setIsEmailModalOpen,
}) => {
  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      const statusToastId = toast.loading(`Updating status to ${newStatus}...`);

      const candidate = candidates.find((c) => c.id === candidateId);
      if (!candidate) {
        throw new Error("Candidate not found");
      }

      // Only include answers when they exist to avoid overwriting with []
      const hasAnswers = Array.isArray(candidate.answers) && candidate.answers.length > 0;

      let plainPassword = null;
      let authUserId = candidate.auth_user_id;

      if (newStatus === "Accepted" && candidate.primaryContactEmail !== "support@paan.africa") {
        plainPassword = await generatePanAfricanPassword();
        if (!plainPassword) {
          throw new Error("Failed to generate password");
        }

        console.log(
          `Generated password for ${candidate.primaryContactName}: ${plainPassword}`
        );

        // Manage auth user via API
        const response = await fetch("/api/manage-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: candidate.auth_user_id ? "update_password" : "create",
            email: candidate.primaryContactEmail,
            password: plainPassword,
            full_name: candidate.primaryContactName || "Candidate",
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(`Failed to manage auth user: ${result.error}`);
        }

        authUserId = result.auth_user_id;
        console.log(
          result.existed
            ? `Updated auth user password for ${candidate.primaryContactEmail}`
            : `Created auth user for ${candidate.primaryContactEmail}`
        );

        // Update candidate with auth_user_id if valid
        if (authUserId) {
          const { error: candidateUpdateError } = await supabase
            .from("candidates")
            .update({ auth_user_id: authUserId })
            .eq("id", candidateId);

          if (candidateUpdateError) {
            console.error(
              `Failed to update candidate auth_user_id: ${candidateUpdateError.message}`
            );
            // Continue to allow status update
          } else {
            console.log(
              `Updated auth_user_id for candidate ${candidate.primaryContactEmail}`
            );
          }
        } else {
          console.warn(
            `No valid authUserId for ${candidate.primaryContactEmail}`
          );
        }
      }

      // Update responses table (do not overwrite answers if not provided)
      const upsertPayload = {
        user_id: candidateId,
        status: newStatus,
        company_registration_url: candidate.companyRegistrationUrl,
        portfolio_work_url: candidate.portfolioWorkUrl,
        agency_profile_url: candidate.agencyProfileUrl,
        tax_registration_url: candidate.taxRegistrationUrl,
        country: candidate.country,
        device: candidate.device,
        submitted_at: candidate.submitted_at,
      };
      if (hasAnswers) {
        upsertPayload.answers = candidate.answers;
      }

      const { error } = await supabase
        .from("responses")
        .upsert(upsertPayload, { onConflict: ["user_id"] })
        .eq("user_id", candidateId);
      if (error) throw error;

      const updatedCandidates = candidates.map((c) =>
        c.id === candidateId
          ? {
              ...c,
              status: newStatus,
              auth_user_id:
                newStatus === "Accepted" ? authUserId : c.auth_user_id,
            }
          : c
      );
      setCandidates(updatedCandidates);
      if (setFilteredCandidates) {
        setFilteredCandidates(
          updatedCandidates.filter((c) =>
            candidates.some((fc) => fc.id === c.id)
          )
        );
      }
      if (setSelectedCandidate) {
        setSelectedCandidate((prev) =>
          prev && prev.id === candidateId
            ? {
                ...prev,
                status: newStatus,
                auth_user_id:
                  newStatus === "Accepted" ? authUserId : prev.auth_user_id,
              }
            : prev
        );
      }

      toast.dismiss(statusToastId);

      if (
        ["Accepted", "Reviewed", "Shortlisted", "Rejected"].includes(
          newStatus
        ) &&
        candidate.primaryContactEmail
      ) {
        const { data: templateData, error: templateError } = await supabase
          .from("email_templates")
          .select("subject, body")
          .eq("name", newStatus.toLowerCase() + "Email")
          .single();

        if (templateError || !templateData) {
          throw new Error(
            `Failed to fetch email template for ${newStatus}: ${
              templateError?.message || "No template found"
            }`
          );
        }

        let { subject, body } = templateData;

        subject = subject
          .replace("{{opening}}", candidate.opening || "Unknown Position")
          .replace("{{fullName}}", candidate.primaryContactName || "Candidate");

        body = body
          .replace("{{fullName}}", candidate.primaryContactName || "Candidate")
          .replace("{{opening}}", candidate.opening || "Unknown Position")
          .replace("{{email}}", candidate.email || "your email address");

        if (newStatus === "Accepted" && candidate.primaryContactEmail !== "support@paan.africa") {
          if (!plainPassword) {
            console.warn(`No password generated for candidate ${candidateId}`);
            throw new Error("Password not generated for email");
          }
          body = body.replace("{{password}}", plainPassword);
        } else if (newStatus === "Accepted" && candidate.primaryContactEmail === "support@paan.africa") {
          // Remove or replace the password placeholder for admin account
          body = body.replace("{{password}}", "[Admin account - password unchanged]");
        }

        const emailPayload = {
          fullName: candidate.primaryContactName || "Candidate",
          primaryContactEmail: candidate.primaryContactEmail,
          opening: candidate.opening || "Unknown Position",
          status: newStatus,
          subject,
          body,
        };
        setEmailData(emailPayload);

        toast.custom(
          (t) => (
            <div 
              className="flex-col bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5"
            >
              <div className="flex-1 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Send email notification?
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Would you like to notify{" "}
                      {candidate.primaryContactName || "the candidate"} about
                      their {newStatus.toLowerCase()} status?
                      {newStatus === "Accepted" && plainPassword && (
                        <span className="font-medium">
                          {" "}
                          Their temporary password ({plainPassword}) will be
                          included.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex  border-l border-gray-200 min-w-[120px]">
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    setIsEmailModalOpen(true);
                  }}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-[#f05d23] hover:text-[#d94f1e] hover:bg-[#ffe0b3] transition-colors focus:outline-none"
                >
                  Yes
                </button>
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                  }}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 hover:bg-[#f3f4f6] transition-colors focus:outline-none"
                >
                  No
                </button>
              </div>
            </div>
          ),
          { duration: Infinity }
        );
      } else if (
        ["Accepted", "Reviewed", "Shortlisted", "Rejected"].includes(
          newStatus
        ) &&
        !candidate.primaryContactEmail
      ) {
        console.warn(`No email found for candidate ${candidateId}`);
        toast.error("Cannot send email: Candidate email is missing", {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(`Failed to update status: ${error.message}`);
    }
  };

  return { handleStatusChange };
};

export default useStatusChange;
