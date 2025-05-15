import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

export default function CandidateModal({
  candidate,
  isOpen,
  onClose,
  onStatusChange,
  mode,
}) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isAnswersModalOpen, setIsAnswersModalOpen] = useState(false);
  const [questionAnswerPairs, setQuestionAnswerPairs] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (candidate && candidate.questions) {
      let filteredQuestions = candidate.questions;

      const openingLower = candidate.opening?.toLowerCase() || "";
      const isAgency =
        openingLower.includes("agency") || openingLower.includes("agencies");
      const isFreelancer =
        openingLower.includes("freelancer") ||
        openingLower.includes("freelancers");

      if (isAgency) {
        filteredQuestions = candidate.questions.filter(
          (q) => q.job_type === "agencies"
        );
      } else if (isFreelancer) {
        filteredQuestions = candidate.questions.filter(
          (q) => q.job_type === "freelancers"
        );
      }

      const pairs = filteredQuestions.map((question, index) => {
        const answer = candidate.answers && candidate.answers[index];
        return {
          questionId: question.id,
          questionText: question.text,
          answer: answer,
        };
      });
      setQuestionAnswerPairs(pairs);
    }
  }, [candidate]);

  if (!isOpen || !candidate) return null;

  const handleDocumentPreview = (url) => {
    const fileId = url.split("id=")[1].split("&")[0];
    const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    setPreviewUrl(previewUrl);
    setIsPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setPreviewUrl(null);
  };

  const openAnswersModal = () => setIsAnswersModalOpen(true);
  const closeAnswersModal = () => setIsAnswersModalOpen(false);

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
    if ((!answer && answer !== 0) || answer === "") return "No answer provided";
    if (Array.isArray(answer)) {
      return answer
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
        .filter((item) => item)
        .join("; ");
    }
    if (typeof answer === "object" && answer !== null) {
      return (
        answer.customText ||
        Object.entries(answer)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ")
      );
    }
    return answer.toString();
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
    ? "bg-blue-500/80"
    : isFreelancerCandidate
    ? "bg-green-500/80"
    : "bg-purple-500/80";

  const documentList = [
    {
      type: "Resume",
      url: candidate.resumeUrl,
      icon: "mdi:file-document-outline",
    },
    {
      type: "Cover Letter",
      url: candidate.coverLetterUrl,
      icon: "mdi:file-document",
    },
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

  const isDark = mode === "dark";
  const modalBg = isDark
    ? "bg-gray-900/80 backdrop-blur-xl"
    : "bg-white/80 backdrop-blur-xl";
  const textColor = isDark ? "text-gray-100" : "text-gray-900";
  const borderColor = isDark ? "border-gray-700/50" : "border-gray-200/50";
  const secondaryBg = isDark ? "bg-gray-800/60" : "bg-gray-50/60";
  const buttonHoverBg = isDark
    ? "hover:bg-gray-700/80"
    : "hover:bg-gray-100/80";

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[60] backdrop-blur-sm">
      <div
        className={`rounded-xl shadow-2xl transform transition-all duration-300 animate-fade-in w-full max-w-4xl mx-4 flex flex-col max-h-[90vh] overflow-hidden ${modalBg} ${textColor}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#f05d23] to-[#f28c5e] p-5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full shadow-md">
              <Icon icon="mdi:account" className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white truncate">
                  {candidate.primaryContactName}
                </h2>
                <span
                  className={`${candidateTypeBadgeColor} text-white text-xs px-2.5 py-1 rounded-full uppercase font-semibold shadow-sm backdrop-blur-sm`}
                >
                  {candidateTypeLabel}
                </span>
              </div>
              <p className="text-white/90 text-sm">{candidate.opening}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-all duration-200 bg-white/20 p-2 rounded-full shadow-md hover:shadow-lg"
          >
            <Icon icon="mdi:close" width={20} height={20} />
          </button>
        </div>

        {/* Tabs */}
        <div
          className={`px-4 pt-4 border-b ${borderColor} ${secondaryBg} backdrop-blur-sm`}
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
                          isDark
                            ? "bg-gray-800/80 text-[#f05d23]"
                            : "bg-white/80 text-[#f05d23] border-b-2 border-[#f05d23]"
                        } shadow-md`
                      : `text-gray-500 hover:text-[#f05d23] ${buttonHoverBg}`
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
                        isDark ? "bg-gray-700/80" : "bg-gray-200/80"
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

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-[#f05d23]/80 scrollbar-track-gray-200/50">
          {activeTab === "profile" && (
            <div className="space-y-6 animate-fade-in">
              <div
                className={`${secondaryBg} p-6 rounded-xl shadow-md backdrop-blur-sm`}
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
                      label: "LinkedIn",
                      value: candidate.primaryContactLinkedin,
                      icon: "mdi:linkedin",
                      isLink: true,
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isDark ? "bg-gray-700/80" : "bg-white/80"
                        } shadow-sm backdrop-blur-sm`}
                      >
                        <Icon
                          icon={item.icon}
                          className="w-6 h-6 text-[#f05d23]"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.label}
                        </p>
                        {item.isLink && item.value && item.value !== "N/A" ? (
                          <a
                            href={item.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#f05d23] hover:text-[#f28c5e] text-base font-medium break-all transition-colors duration-200"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-base font-medium break-all">
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
                        isDark
                          ? "bg-gray-800/60 hover:bg-gray-750/70"
                          : "bg-white/60 hover:bg-gray-50/70"
                      } rounded-xl shadow-md border ${borderColor} transition-all duration-200 cursor-pointer backdrop-blur-sm`}
                      onClick={() => handleDocumentPreview(doc.url)}
                    >
                      <div className="p-4 flex items-center gap-4">
                        <div
                          className={`p-3 rounded-lg bg-[#f05d23]/10 text-[#f05d23] shadow-sm`}
                        >
                          <Icon icon={doc.icon} className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-base">{doc.type}</h3>
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
                  className={`${secondaryBg} flex flex-col items-center justify-center py-12 rounded-xl shadow-md backdrop-blur-sm`}
                >
                  <Icon
                    icon="mdi:file-document-outline"
                    className="w-16 h-16 text-gray-400 mb-4"
                  />
                  <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400">
                    No documents available
                  </h3>
                  <p className="text-gray-400 dark:text-gray-500 mt-2 text-sm">
                    This candidate hasn't uploaded any documents yet
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
                    className={`${secondaryBg} p-6 rounded-xl shadow-md transition-all duration-200 backdrop-blur-sm`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className={`p-2 rounded-lg ${
                          isDark ? "bg-gray-700/80" : "bg-white/80"
                        } shadow-sm backdrop-blur-sm`}
                      >
                        <Icon
                          icon="mdi:help-circle"
                          className="w-5 h-5 text-[#f05d23]"
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
                          isDark ? "bg-gray-700/80" : "bg-white/80"
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
                        <p className="text-base">{renderAnswer(item.answer)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className={`${secondaryBg} flex flex-col items-center justify-center py-12 rounded-xl shadow-md backdrop-blur-sm`}
                >
                  <Icon
                    icon="mdi:message-text-outline"
                    className="w-16 h-16 text-gray-400 mb-4"
                  />
                  <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400">
                    No answers available
                  </h3>
                  <p className="text-gray-400 dark:text-gray-500 mt-2 text-sm">
                    This candidate hasn't completed the interview questions yet
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "status" && (
            <div className="space-y-6 animate-fade-in">
              <div
                className={`${secondaryBg} p-6 rounded-xl shadow-md backdrop-blur-sm`}
              >
                <h3 className="text-lg font-semibold mb-4">
                  Update candidate status
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
                                  isDark
                                    ? "ring-[#f05d23] ring-offset-gray-900"
                                    : "ring-[#f05d23] ring-offset-white"
                                }`
                              : `${
                                  isDark
                                    ? "bg-gray-700/80 hover:bg-gray-750/90"
                                    : "bg-white/80 hover:bg-gray-50/90"
                                } border ${borderColor} backdrop-blur-sm`
                          } shadow-md hover:shadow-lg`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={status}
                          checked={candidate.status === status}
                          onChange={() => onStatusChange(candidate.id, status)}
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
                            <span className="font-medium">{status}</span>
                          </div>
                          {candidate.status === status && (
                            <Icon
                              icon="mdi:check-circle"
                              className="w-5 h-5 text-[#f05d23]"
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
                        <span className="font-medium">Current status</span>
                      </div>
                      <span className="font-bold">
                        {candidate.status || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-4 flex justify-end gap-3 border-t ${borderColor} ${secondaryBg} backdrop-blur-sm`}
        >
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg border font-medium transition-all duration-200
              ${
                isDark
                  ? "border-gray-600/50 text-white hover:bg-gray-800/90 backdrop-blur-sm"
                  : "border-gray-300/50 text-gray-700 hover:bg-gray-100/90 backdrop-blur-sm"
              } shadow-md hover:shadow-lg`}
          >
            Close
          </button>
          {activeTab === "status" && (
            <button className="px-6 py-2 bg-[#f05d23] text-white rounded-lg hover:bg-[#f28c5e] transition-all duration-200 font-medium shadow-md hover:shadow-lg backdrop-blur-sm">
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-70 backdrop-blur-sm">
          <div
            className={`rounded-xl shadow-2xl w-full max-w-5xl mx-4 flex flex-col max-h-[90vh] ${modalBg}`}
          >
            <div className="bg-gradient-to-r from-[#f05d23] to-[#f28c5e] rounded-t-xl p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Icon icon="mdi:file-document" className="w-6 h-6" />
                Document Preview
              </h2>
              <button
                onClick={closePreviewModal}
                className="text-white hover:text-gray-200 transition-all duration-200 bg-white/20 p-2 rounded-full shadow-md hover:shadow-lg"
              >
                <Icon icon="mdi:close" width={20} height={20} />
              </button>
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
              className={`p-4 border-t ${borderColor} ${secondaryBg} backdrop-blur-sm`}
            >
              <div className="flex justify-end">
                <button
                  onClick={closePreviewModal}
                  className="px-6 py-2 bg-[#f05d23] text-white rounded-lg hover:bg-[#f28c5e] transition-all duration-200 flex items-center gap-2 font-medium shadow-md hover:shadow-lg backdrop-blur-sm"
                >
                  <Icon icon="mdi:close" width={20} height={20} />
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
