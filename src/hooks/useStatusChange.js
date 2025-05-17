import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

// Function to generate a memorable Pan-African inspired password
const generatePanAfricanPassword = async () => {
  try {
    // Fetch Pan-African words from the database
    const { data: panAfricanWords, error } = await supabase
      .from("pan_african_words")
      .select("word");

    if (error || !panAfricanWords || panAfricanWords.length === 0) {
      console.warn(
        "Could not fetch Pan-African words, using fallback list",
        error
      );
      // Fallback list if database fetch fails
      return generateFallbackPassword();
    }

    // Numbers to add (4 digits)
    const randomNumber = Math.floor(Math.random() * 9000) + 1000;

    // Pick a random word from the database results
    const randomWord =
      panAfricanWords[Math.floor(Math.random() * panAfricanWords.length)].word;

    // Combine to create password (e.g., "Ubuntu2024")
    return `${randomWord}${randomNumber}`;
  } catch (err) {
    console.error("Error generating password:", err);
    return generateFallbackPassword();
  }
};

// Fallback function if database fetch fails
const generateFallbackPassword = () => {
  // Fallback list of Pan-African inspired words
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

      const answers = candidate.answers?.length > 0 ? candidate.answers : [];

      // Generate password if status is being changed to "Accepted"
      let plainPassword = null;
      let hashedPassword = null;

      if (newStatus === "Accepted") {
        // Generate a plain text password
        plainPassword = await generatePanAfricanPassword();
        if (!plainPassword) {
          throw new Error("Failed to generate password");
        }

        // Hash the password before storing
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(plainPassword, salt);

        console.log(
          `Generated password for ${candidate.primaryContactName}: ${plainPassword}`
        );

        // Update the candidate table with the hashed password
        const { error: candidateUpdateError } = await supabase
          .from("candidates")
          .update({ candidate_password: hashedPassword })
          .eq("id", candidateId);

        if (candidateUpdateError) {
          throw new Error(
            `Failed to update candidate password: ${candidateUpdateError.message}`
          );
        }
      }

      // Update responses table with new status and answers
      const { error } = await supabase
        .from("responses")
        .upsert(
          {
            user_id: candidateId,
            answers: answers,
            status: newStatus,
            company_registration_url: candidate.companyRegistrationUrl,
            portfolio_work_url: candidate.portfolioWorkUrl,
            agency_profile_url: candidate.agencyProfileUrl,
            tax_registration_url: candidate.taxRegistrationUrl,
            country: candidate.country,
            device: candidate.device,
            submitted_at: candidate.submitted_at,
          },
          { onConflict: ["user_id"] }
        )
        .eq("user_id", candidateId);
      if (error) throw error;

      // Update candidates in state
      const updatedCandidates = candidates.map((c) =>
        c.id === candidateId
          ? {
              ...c,
              status: newStatus,
              // Do not store plaintext password in state, only an indicator for UI purposes
              passwordGenerated:
                newStatus === "Accepted" ? true : c.passwordGenerated,
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
                // Do not store plaintext password in state, only an indicator for UI purposes
                passwordGenerated:
                  newStatus === "Accepted" ? true : prev.passwordGenerated,
              }
            : prev
        );
      }

      toast.dismiss(statusToastId);
      toast.success(`Status updated to ${newStatus}!`, { duration: 2000 });

      if (
        ["Accepted", "Reviewed", "Shortlisted", "Rejected"].includes(
          newStatus
        ) &&
        candidate.email
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

        // Replace placeholders in subject and body
        subject = subject
          .replace("{{opening}}", candidate.opening || "Unknown Position")
          .replace("{{fullName}}", candidate.primaryContactName || "Candidate");

        body = body
          .replace("{{fullName}}", candidate.primaryContactName || "Candidate")
          .replace("{{opening}}", candidate.opening || "Unknown Position");

        // Replace password placeholder for Accepted status
        if (newStatus === "Accepted") {
          if (!plainPassword) {
            console.warn(
              `No password generated for candidate ${candidateId} despite Accepted status`
            );
            throw new Error("Password not generated for email");
          }
          body = body.replace("{{password}}", plainPassword);
        }

        // Log the processed body for debugging
        console.log("Processed email body:", body);

        const emailPayload = {
          fullName: candidate.primaryContactName || "Candidate",
          email: candidate.email,
          opening: candidate.opening || "Unknown Position",
          status: newStatus,
          subject,
          body,
        };
        setEmailData(emailPayload);

        toast.custom(
          (t) => (
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5">
              <div className="flex-1 w-0 p-4">
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
                          Their temporary password will be
                          included.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
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
        !candidate.email
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
