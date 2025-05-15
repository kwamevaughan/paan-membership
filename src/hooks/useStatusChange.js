import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase"; // Client-side Supabase instance

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
            const answers = candidate.answers.length > 0 ? candidate.answers : [];

            // Update status in Supabase
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

            // Update local state
            const updatedCandidates = candidates.map((c) =>
                c.id === candidateId ? { ...c, status: newStatus } : c
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
                    prev && prev.id === candidateId ? { ...prev, status: newStatus } : prev
                );
            }

            toast.dismiss(statusToastId);
            toast.success(`Status updated to ${newStatus}!`, { duration: 2000 });

            // Handle email notification for specific statuses
            if (["Reviewed", "Shortlisted", "Rejected"].includes(newStatus)) {
                // Fetch email template from Supabase
                const { data: templateData, error: templateError } = await supabase
                    .from("email_templates")
                    .select("subject, body")
                    .eq("name", newStatus.toLowerCase() + "Email") // e.g., "reviewedEmail"
                    .single();

                if (templateError || !templateData) {
                    throw new Error(`Failed to fetch email template for ${newStatus}: ${templateError?.message || "No template found"}`);
                }

                const { subject, body } = templateData;

                // Replace placeholders in the template
                const emailPayload = {
                    fullName: candidate.full_name,
                    email: candidate.email,
                    opening: candidate.opening,
                    status: newStatus,
                    subject: subject.replace("{{opening}}", candidate.opening).replace("{{fullName}}", candidate.full_name),
                    body: body.replace("{{fullName}}", candidate.full_name).replace("{{opening}}", candidate.opening),
                };
                setEmailData(emailPayload);

                // Prompt to send email
                toast.custom(
                    (t) => (
                        <div
                            className={`${
                                t.visible ? "animate-enter" : "animate-leave"
                            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                        >
                            <div className="flex-1 w-0 p-4">
                                <div className="flex items-start">
                                    <div className="ml-3 flex-1">
                                        <p className="text-xl font-medium text-gray-900">
                                            Send email notification?
                                        </p>
                                        <p className="mt-2 text-base text-gray-500">
                                            Would you like to notify {candidate.full_name} about their{" "}
                                            {newStatus.toLowerCase()} status?
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
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error(`Failed to update status: ${error.message}`);
        }
    };

    return { handleStatusChange };
};

export default useStatusChange;