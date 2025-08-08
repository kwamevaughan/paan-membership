import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

export default function CandidateModal({
  candidate,
  isOpen,
  onClose,
  onStatusChange,
  onCandidateUpdate,
  mode,
}) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isAnswersModalOpen, setIsAnswersModalOpen] = useState(false);
  const [questionAnswerPairs, setQuestionAnswerPairs] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (candidate && candidate.questions && candidate.answers) {
      const pairs = candidate.questions.map((question, index) => ({
        questionId: question.id,
        questionText: question.text,
        answer: candidate.answers[index] ?? null,
      }));
      
      setQuestionAnswerPairs(pairs);
    } else {
      console.warn(`Missing data for candidate:`, candidate);
      setQuestionAnswerPairs([]);
    }
  }, [candidate]);

  if (!isOpen || !candidate) return null;

  const handleDocumentPreview = (url) => {
    if (!url) {
      console.warn('No document URL provided');
      return;
    }

    try {
      const fileId = url.split("id=")[1]?.split("&")[0];
      if (!fileId) {
        console.warn('Invalid Google Drive URL format');
        return;
      }
      const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      setPreviewUrl(previewUrl);
      setIsPreviewModalOpen(true);
    } catch (error) {
      console.error('Error processing document URL:', error);
    }
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setPreviewUrl(null);
  };

  const openAnswersModal = () => setIsAnswersModalOpen(true);
  const closeAnswersModal = () => setIsAnswersModalOpen(false);

  const handleResendEmail = async (candidateId) => {
    const loadingToast = toast.loading("Queuing welcome email...");
    
    try {
      // Immediately update UI to show processing state
      if (onCandidateUpdate && candidate) {
        onCandidateUpdate({
          ...candidate,
          processed_at: new Date().toISOString(),
          email_sent: false,
          error_message: null
        });
      }

      const response = await fetch("/api/resend-welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to resend email");
      }

      toast.success(
        `Email queued for ${result.candidateName}! Processing in background - you can navigate away.`,
        {
          id: loadingToast,
          icon: "📧",
          duration: 6000, // Show longer so they can read it
        }
      );

      // Wait for email processing to complete, then update the status
      if (onCandidateUpdate) {
        setTimeout(() => {
          // Update the candidate with email sent status
          onCandidateUpdate({
            ...candidate,
            email_sent: true,
            processed_at: new Date().toISOString(),
            error_message: null
          });
          
          // Show completion toast
          toast.success(
            `Welcome email sent to ${candidate.primaryContactName}!`,
            {
              icon: "✅",
              duration: 4000,
            }
          );
        }, 12000); // Wait 12 seconds for processing (more realistic timing)
      }
      
    } catch (error) {
      console.error("Error resending email:", error);
      toast.error("Failed to queue welcome email. Please try again.", { 
        id: loadingToast,
        duration: 5000 
      });
      
      // Revert UI state on error
      if (onCandidateUpdate && candidate) {
        onCandidateUpdate({
          ...candidate,
          error_message: error.message
        });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100/80 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200 backdrop-blur-sm";
      case "Reviewed":
        return "bg-blue-100/80 text-blue-900 dark:bg-blue-900/50 dark:text-blue-200 backdrop-blur-sm";
      case "Shortlisted":
        return "bg-green-100/80 text-green-900 dark:bg-green-900/50 dark:text-green-200 backdrop-blur-sm";
      case "Rejected":
        return "bg-red-100/80 text-red-900 dark:bg-red-900/50 dark:text-red-200 backdrop-blur-sm";
      case "Accepted":
        return "bg-green-100/80 text-green-900 dark:bg-green-900/50 dark:text-green-200 backdrop-blur-sm";
      default:
        return "bg-gray-100/80 text-gray-900 dark:bg-gray-700/50 dark:text-gray-200 backdrop-blur-sm";
    }
  };

  const renderAnswer = (answer) => {
    if (answer === undefined || answer === null || answer === "") {
      return "No answer provided";
    }

    if (typeof answer === "string" && answer.includes(";")) {
      try {
        const items = answer
          .split(";")
          .map((item) => {
            item = item.trim();
            if (!item) return null;
            if (item.startsWith("{") && item.endsWith("}")) {
              try {
                const parsed = JSON.parse(item);
                return (
                  parsed.customText ||
                  Object.entries(parsed)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(", ")
                );
              } catch (e) {
                console.warn(
                  `Failed to parse structured answer item: ${item}`,
                  e
                );
                return item;
              }
            }
            return item;
          })
          .filter(Boolean);
        return items.join("; ") || "No answer provided";
      } catch (e) {
        console.warn(`Error processing structured answer: ${answer}`, e);
        return answer;
      }
    }

    if (Array.isArray(answer)) {
      const formatted = answer
        .map((item) => {
          if (item && typeof item === "object") {
            return (
              item.customText ||
              Object.entries(item)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ")
            );
          }
          return item;
        })
        .filter((item) => item !== null && item !== undefined && item !== "")
        .join("; ");
      return formatted || "No answer provided";
    }

    if (typeof answer === "object" && answer !== null) {
      return (
        answer.customText ||
        Object.entries(answer)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ") ||
        "No answer provided"
      );
    }

    return answer.toString() || "No answer provided";
  };

  const openingLower = candidate.opening?.toLowerCase() || "";
  const isAgencyCandidate =
    openingLower.includes("agency") || openingLower.includes("agencies");
  const isFreelancerCandidate =
    openingLower.includes("freelancer") || openingLower.includes("freelancers");

  const candidateTypeLabel = isAgencyCandidate
    ? "Agency"
    : isFreelancerCandidate
    ? "Freelancer"
    : "Candidate";

  const candidateTypeBadgeColor = isAgencyCandidate
    ? "bg-paan-blue"
    : isFreelancerCandidate
    ? "bg-paan-yellow"
    : "bg-paan-blue";

  const documentList = [
    ...(isAgencyCandidate
      ? [
          {
            type: "Agency Profile",
            url: candidate.agencyProfileUrl,
            icon: "mdi:office-building",
          },
          {
            type: "Company Registration",
            url: candidate.companyRegistrationUrl,
            icon: "mdi:certificate",
          },
          {
            type: "Tax Registration",
            url: candidate.taxRegistrationUrl,
            icon: "mdi:file-document-check",
          },
        ]
      : []),
    ...(isFreelancerCandidate
      ? [
          {
            type: "Portfolio",
            url: candidate.portfolioWorkUrl,
            icon: "mdi:briefcase",
          },
        ]
      : []),
  ].filter((doc) => doc.url);

  return (
    <div className="fixed inset-0 z-[50] overflow-y-auto">
      {/* Enhanced Glassmorphic Background */}
      <div
        className={`fixed inset-0 transition-all duration-500 backdrop-blur-sm
          ${
            mode === "dark"
              ? "bg-gradient-to-br from-slate-900/20 via-blue-900/10 to-blue-900/20"
              : "bg-gradient-to-br from-white/20 via-blue-50/30 to-blue-50/20"
          }`}
        onClick={onClose}
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0, 123, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(100, 149, 237, 0.1) 0%, transparent 50%)
          `,
        }}
      />

      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full max-w-4xl rounded-3xl transform transition-all duration-500 max-h-[90vh] overflow-hidden
            shadow-2xl shadow-black/20
            ${
              mode === "dark"
                ? "bg-gray-900/40 text-white border border-white/10"
                : "bg-white/30 text-gray-900 border border-white/20"
            } 
            backdrop-blur-lg`}
          style={{
            backdropFilter: "blur(12px) saturate(180%)",
            WebkitBackdropFilter: "blur(12px) saturate(180%)",
            background:
              mode === "dark"
                ? "linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.3) 100%)"
                : "bg-gradient-to-br from-white/20 via-blue-50/30 to-blue-50/20",
          }}
        >
          {/* Premium Header with Gradient Overlay */}
          <div className="relative px-8 py-4 overflow-hidden bg-gradient-to-r from-blue-300 to-sky-600">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-xl transform -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-lg transform translate-x-12 translate-y-12"></div>
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-full shadow-md">
                  <Icon icon="mdi:account" className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-medium text-white truncate">
                      {candidate.primaryContactName}
                    </h2>
                    <span
                      className={`${candidateTypeBadgeColor} text-white text-xs px-2.5 py-1 rounded-full uppercase font-medium shadow-sm backdrop-blur-sm`}
                    >
                      {candidateTypeLabel}
                    </span>
                  </div>
                  <p className="text-white/90 text-sm">{candidate.opening}</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="group p-3 rounded-2xl transition-all duration-300 hover:bg-white/20 hover:scale-110 active:scale-95"
                style={{
                  backdropFilter: "blur(4px)",
                  background: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <Icon
                  icon="heroicons:x-mark"
                  className="h-6 w-6 text-white transition-transform duration-300 group-hover:rotate-90"
                />
              </button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div
            className={`px-4 pt-4 border-b ${
              mode === "dark" ? "border-gray-700/50" : "border-gray-200/50"
            } ${
              mode === "dark" ? "bg-gray-800/60" : "bg-gray-50/60"
            } backdrop-blur-sm`}
          >
            <div className="flex space-x-1">
              {["profile", "documents", "answers", "status"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-t-lg font-medium transition-all duration-200 text-sm
                    ${
                      activeTab === tab
                        ? `${
                            mode === "dark"
                              ? "bg-gray-800/80 text-blue-400"
                              : "bg-white/80 text-blue-400 border-b-2 border-blue-400"
                          } shadow-md`
                        : `text-gray-500 hover:text-sky-600 ${
                            mode === "dark"
                              ? "hover:bg-gray-700/80"
                              : "hover:bg-gray-100/80"
                          }`
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      icon={
                        tab === "profile"
                          ? "mdi:account-details"
                          : tab === "documents"
                          ? "mdi:file-document-multiple"
                          : tab === "answers"
                          ? "mdi:chat-question"
                          : "mdi:tag"
                      }
                      className="w-5 h-5"
                    />
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {(tab === "documents" && documentList.length > 0) ||
                    (tab === "answers" && questionAnswerPairs.length > 0) ? (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          mode === "dark" ? "bg-gray-700/80" : "bg-gray-200/80"
                        } backdrop-blur-sm`}
                      >
                        {tab === "documents"
                          ? documentList.length
                          : questionAnswerPairs.length}
                      </span>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area with Subtle Glass Effect */}
          <div
            className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]"
            style={{
              background:
                mode === "dark"
                  ? "linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, rgba(30, 41, 59, 0.05) 100%)"
                  : "linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
            }}
          >
            {/* Content wrapper with subtle inner glow */}
            <div
              className={`${
                mode === "dark" ? "text-gray-100" : "text-gray-800"
              }`}
            >
              {activeTab === "profile" && (
                <div className="space-y-6 animate-fade-in">
                  <div
                    className={`${
                      mode === "dark" ? "bg-gray-800/60" : "bg-gray-50/60"
                    } p-6 rounded-xl shadow-md backdrop-blur-sm`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        {
                          label: isAgencyCandidate ? "Agency" : "Name",
                          value: isAgencyCandidate
                            ? candidate.agencyName
                            : candidate.primaryContactName,
                          icon: isAgencyCandidate
                            ? "hugeicons:office"
                            : "mdi:account",
                        },
                        {
                          label: "Email",
                          value: candidate.primaryContactEmail,
                          icon: "mdi:email",
                        },
                        {
                          label: "Phone",
                          value: candidate.primaryContactPhone || "N/A",
                          icon: "mdi:phone",
                        },
                        {
                          label: "Country",
                          value: candidate.countryOfResidence,
                          icon: "mdi:earth",
                        },
                        {
                          label: "LinkedIn",
                          value: candidate.primaryContactLinkedin,
                          icon: "mdi:linkedin",
                          isLink: true,
                        },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              mode === "dark" ? "bg-gray-700/80" : "bg-white/80"
                            } shadow-sm backdrop-blur-sm`}
                          >
                            <Icon
                              icon={item.icon}
                              className="w-6 h-6 text-paan-blue"
                            />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {item.label}
                            </p>
                            {item.isLink &&
                            item.value &&
                            item.value !== "N/A" ? (
                              <a
                                href={item.value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-paan-blue hover:text-paan-dark-blue text-base font-normal break-all transition-colors duration-200"
                              >
                                {item.value}
                              </a>
                            ) : (
                              <p className="text-base font-normal break-all">
                                {item.value}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "documents" && (
                <div className="space-y-6 animate-fade-in">
                  {documentList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {documentList.map((doc, index) => (
                        <div
                          key={index}
                          className={`${
                            mode === "dark"
                              ? "bg-gray-800/60 hover:bg-gray-750/70"
                              : "bg-white/60 hover:bg-gray-50/70"
                          } rounded-xl shadow-md border ${
                            mode === "dark"
                              ? "border-gray-700/50"
                              : "border-gray-200/50"
                          } transition-all duration-200 cursor-pointer backdrop-blur-sm`}
                          onClick={() => handleDocumentPreview(doc.url)}
                        >
                          <div className="p-4 flex items-center gap-4">
                            <div
                              className={`p-3 rounded-lg bg-paan-blue text-paan-blue shadow-sm`}
                            >
                              <Icon icon={doc.icon} className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-base">
                                {doc.type}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Click to preview
                              </p>
                            </div>
                            <Icon
                              icon="mdi:eye"
                              className="w-5 h-5 text-gray-400"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className={`${
                        mode === "dark" ? "bg-gray-800/60" : "bg-gray-50/60"
                      } flex flex-col items-center justify-center py-12 rounded-xl shadow-md backdrop-blur-sm`}
                    >
                      <Icon
                        icon="mdi:file-document-outline"
                        className="w-16 h-16 text-gray-400 mb-4"
                      />
                      <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400">
                        No documents available
                      </h3>
                      <p className="text-gray-400 dark:text-gray-500 mt-2 text-sm">
                        This candidate hasn&apos;t uploaded any documents yet
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "answers" && (
                <div className="space-y-6 animate-fade-in">
                  {questionAnswerPairs.length > 0 ? (
                    questionAnswerPairs.map((item, idx) => (
                      <div
                        key={idx}
                        className={`${
                          mode === "dark" ? "bg-gray-800/60" : "bg-gray-50/60"
                        } p-6 rounded-xl shadow-md transition-all duration-200 backdrop-blur-sm`}
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <div
                            className={`p-2 rounded-lg ${
                              mode === "dark" ? "bg-gray-700/80" : "bg-white/80"
                            } shadow-sm backdrop-blur-sm`}
                          >
                            <Icon
                              icon="mdi:help-circle"
                              className="w-5 h-5 text-paan-blue"
                            />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Question
                            </p>
                            <p className="font-medium text-lg">
                              {item.questionText}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 ml-12">
                          <div
                            className={`p-2 rounded-lg ${
                              mode === "dark" ? "bg-gray-700/80" : "bg-white/80"
                            } shadow-sm backdrop-blur-sm`}
                          >
                            <Icon
                              icon="mdi:message-reply"
                              className="w-5 h-5 text-blue-500"
                            />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Answer
                            </p>
                            <p className="text-base">
                              {renderAnswer(item.answer)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className={`${
                        mode === "dark" ? "bg-gray-800/60" : "bg-gray-50/60"
                      } flex flex-col items-center justify-center py-12 rounded-xl shadow-md backdrop-blur-sm`}
                    >
                      <Icon
                        icon="mdi:message-text-outline"
                        className="w-16 h-16 text-gray-400 mb-4"
                      />
                      <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400">
                        No answers available
                      </h3>
                      <p className="text-gray-400 dark:text-gray-500 mt-2 text-sm">
                        This candidate hasn&apos;t completed the interview
                        questions yet
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "status" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Email Status Section */}
                  <div
                    className={`${
                      mode === "dark" ? "bg-gray-800/60" : "bg-gray-50/60"
                    } p-6 rounded-xl shadow-md backdrop-blur-sm`}
                  >
                    <h3 className="text-lg font-medium mb-4">
                      Welcome Email Status
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            candidate.email_sent
                              ? "bg-green-500"
                              : candidate.error_message
                              ? "bg-red-500"
                              : candidate.processed_at
                              ? "bg-yellow-500"
                              : "bg-gray-400"
                          }`}
                        ></div>
                        <div>
                          <p className="font-medium">
                            {candidate.email_sent
                              ? "Email Sent"
                              : candidate.error_message
                              ? "Email Failed"
                              : candidate.processed_at
                              ? "Email Pending"
                              : "No Email Sent"}
                          </p>
                          {candidate.processed_at && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {candidate.email_sent ? "Sent" : "Processed"} on{" "}
                              {new Date(candidate.processed_at).toLocaleString()}
                            </p>
                          )}
                          {!candidate.processed_at && !candidate.email_sent && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Welcome email was never sent to this candidate
                            </p>
                          )}
                          {candidate.error_message && (
                            <p className="text-sm text-red-500 mt-1">
                              Error: {candidate.error_message}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleResendEmail(candidate.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        {candidate.email_sent ? "Resend Email" : "Send Email"}
                      </button>
                    </div>
                  </div>

                  {/* Application Status Section */}
                  <div
                    className={`${
                      mode === "dark" ? "bg-gray-800/60" : "bg-gray-50/60"
                    } p-6 rounded-xl shadow-md backdrop-blur-sm`}
                  >
                    <h3 className="text-lg font-medium mb-4">
                      Update application status
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          "Pending",
                          "Reviewed",
                          "Shortlisted",
                          "Accepted",
                          "Rejected",
                        ].map((status) => (
                          <label
                            key={status}
                            className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200
                              ${
                                candidate.status === status
                                  ? `ring-2 ring-offset-2 ${
                                      mode === "dark"
                                        ? "ring-blue-400 ring-offset-gray-900"
                                        : "ring-blue-400 ring-offset-white"
                                    }`
                                  : `${
                                      mode === "dark"
                                        ? "bg-gray-700/80 hover:bg-gray-750/90"
                                        : "bg-white/80 hover:bg-gray-50/90"
                                    } border ${
                                      mode === "dark"
                                        ? "border-gray-700/50"
                                        : "border-gray-200/50"
                                    } backdrop-blur-sm`
                              } shadow-md hover:shadow-lg`}
                          >
                            <input
                              type="radio"
                              name="status"
                              value={status}
                              checked={candidate.status === status}
                              onChange={() =>
                                onStatusChange(candidate.id, status)
                              }
                              className="hidden"
                            />
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-4 h-4 rounded-full ${
                                    status === "Pending"
                                      ? "bg-amber-400"
                                      : status === "Reviewed"
                                      ? "bg-blue-500"
                                      : status === "Shortlisted"
                                      ? "bg-purple-500"
                                      : status === "Accepted"
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                ></div>
                                <span className="font-normal">{status}</span>
                              </div>
                              {candidate.status === status && (
                                <Icon
                                  icon="mdi:check-circle"
                                  className="w-5 h-5 text-blue-400"
                                />
                              )}
                            </div>
                          </label>
                        ))}
                      </div>

                      <div
                        className={`p-4 rounded-lg ${getStatusColor(
                          candidate.status || "Pending"
                        )} shadow-md`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon icon="mdi:information" className="w-5 h-5" />
                            <span className="font-normal">Current status</span>
                          </div>
                          <span className="font-semibold">
                            {candidate.status || "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className={`p-4 flex justify-end gap-3 border-t ${
              mode === "dark" ? "border-gray-700/50" : "border-gray-200/50"
            } ${
              mode === "dark" ? "bg-gray-800/60" : "bg-gray-50/60"
            } backdrop-blur-sm`}
          >
            <button
              onClick={onClose}
              className={`px-6 py-2 rounded-lg border font-medium transition-all duration-200
                ${
                  mode === "dark"
                    ? "border-gray-600/50 text-white hover:bg-gray-800/90 backdrop-blur-sm"
                    : "border-gray-300/50 text-gray-700 hover:bg-gray-100/90 backdrop-blur-sm"
                } shadow-md hover:shadow-lg`}
            >
              Close
            </button>

          </div>

          {/* Subtle Border Enhancement */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: `
                linear-gradient(135deg, 
                  rgba(255, 255, 255, 0.2) 0%, 
                  transparent 20%, 
                  transparent 80%, 
                  rgba(255, 255, 255, 0.1) 100%
                )
              `,
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "xor",
              WebkitMaskComposite: "xor",
              padding: "1px",
            }}
          />
        </div>
      </div>

      {/* Document Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-70 backdrop-blur-sm">
          <div
            className={`rounded-xl shadow-2xl w-full max-w-5xl mx-4 flex flex-col max-h-[90vh] ${
              mode === "dark"
                ? "bg-gray-900/40 text-white border border-white/10"
                : "bg-white/30 text-gray-900 border border-white/20"
            } backdrop-blur-lg`}
            style={{
              backdropFilter: "blur(12px) saturate(180%)",
              WebkitBackdropFilter: "blur(12px) saturate(180%)",
              background:
                mode === "dark"
                  ? "linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.3) 100%)"
                  : "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 1) 100%)",
            }}
          >
            <div
              className="relative px-8 py-4 overflow-hidden"
              style={{
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-xl transform -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-lg transform translate-x-12 translate-y-12"></div>
              </div>

              <div className="relative flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Icon icon="mdi:file-document" className="w-6 h-6" />
                  Document Preview
                </h2>
                <button
                  onClick={closePreviewModal}
                  className="group p-3 rounded-2xl transition-all duration-300 hover:bg-white/20 hover:scale-110 active:scale-95"
                  style={{
                    backdropFilter: "blur(4px)",
                    background: "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <Icon
                    icon="heroicons:x-mark"
                    className="h-6 w-6 text-white transition-transform duration-300 group-hover:rotate-90"
                  />
                </button>
              </div>
            </div>

            <div className="flex-1 p-0 overflow-hidden">
              <iframe
                src={previewUrl}
                width="100%"
                height="100%"
                className="border-0 min-h-[70vh]"
                title="Document Preview"
                allow="autoplay"
              />
            </div>

            <div
              className={`p-4 border-t ${
                mode === "dark" ? "border-gray-700/50" : "border-gray-200/50"
              } ${
                mode === "dark" ? "bg-gray-800/60" : "bg-gray-50/60"
              } backdrop-blur-sm`}
            >
              <div className="flex justify-end">
                <button
                  onClick={closePreviewModal}
                  className="px-6 py-2 bg-blue-400 text-white rounded-lg hover:bg-sky-600 transition-all duration-200 flex items-center gap-2 font-medium shadow-md hover:shadow-lg backdrop-blur-sm"
                >
                  <Icon icon="mdi:close" width={20} height={20} />
                  Close Preview
                </button>
              </div>
            </div>

            {/* Subtle Border Enhancement */}
            <div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                background: `
                  linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.2) 0%, 
                    transparent 20%, 
                    transparent 80%, 
                    rgba(255, 255, 255, 0.1) 100%
                  )
                `,
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "xor",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
