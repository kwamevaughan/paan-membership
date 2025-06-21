import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Icon } from "@iconify/react";
import ItemActionModal from "./ItemActionModal";
import toast, { Toaster } from "react-hot-toast";
import ConfirmationProgress from "./ConfirmationProgress";

export default function Step4Confirmation({
  formData,
  submissionStatus,
  mode,
}) {
  const router = useRouter();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState(
    submissionStatus?.referenceNumber || 
    submissionStatus?.reference_number || 
    formData?.referenceNumber || 
    formData?.reference_number || 
    null
  );
  const isDark = mode === "dark";
  const textColor = isDark ? "text-white" : "text-gray-800";
  const subTextColor = isDark ? "text-gray-300" : "text-gray-600";
  const bgColor = isDark ? "bg-gray-800" : "bg-white";
  const cardBgColor = isDark ? "bg-gray-700" : "bg-gray-50";

  const isFreelancer = formData.job_type === "freelancers";

  const [feedbackRatings, setFeedbackRatings] = useState({
    easeOfUse: 0,
    design: 0,
    clarity: 0,
    overall: 0
  });
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [feedbackType, setFeedbackType] = useState("general");

  const emojis = [
    { icon: "😊", label: "Great Experience" },
    { icon: "😐", label: "Neutral" },
    { icon: "😕", label: "Could Be Better" },
    { icon: "😍", label: "Loved It" },
    { icon: "🤔", label: "Confusing" }
  ];

  const feedbackTypes = [
    { id: "general", label: "General Feedback" },
    { id: "suggestion", label: "Suggestion" },
    { id: "bug", label: "Report an Issue" },
    { id: "praise", label: "Praise" }
  ];

  const ratingLabels = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent"
  };

  const handleRatingChange = (category, value) => {
    setFeedbackRatings(prev => ({
      ...prev,
      [category]: value
    }));
  };

  useEffect(() => {
    if (submissionStatus?.status === "success") {
      const newReferenceNumber = 
        submissionStatus.referenceNumber || 
        submissionStatus.reference_number || 
        formData.referenceNumber || 
        formData.reference_number;
      
      if (newReferenceNumber) {
        setReferenceNumber(newReferenceNumber);
        console.log("Setting reference number:", newReferenceNumber);
      }
    }
  }, [submissionStatus, formData]);

  useEffect(() => {
    console.log("Submission Status:", submissionStatus);
    console.log("Form Data:", formData);
    console.log("Current Reference Number:", referenceNumber);
  }, [submissionStatus, formData, referenceNumber]);

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      toast.error("Please enter your feedback before submitting");
      return;
    }
    
    setIsSubmittingFeedback(true);
    const submitToast = toast.loading("Submitting your feedback...");
    
    try {
      console.log("Submitting feedback with data:", {
        email: formData.primaryContactEmail,
        name: formData.primaryContactName,
        job_type: formData.job_type,
        reference_number: referenceNumber,
        feedback,
        ratings: feedbackRatings,
        emoji: selectedEmoji,
        feedbackType
      });

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedback,
          email: formData.primaryContactEmail,
          name: formData.primaryContactName,
          job_type: formData.job_type,
          reference_number: referenceNumber,
          ratings: feedbackRatings,
          emoji: selectedEmoji,
          feedbackType
        }),
      });

      if (!response.ok) throw new Error("Failed to submit feedback");
      
      setFeedback("");
      setFeedbackRatings({
        easeOfUse: 0,
        design: 0,
        clarity: 0,
        overall: 0
      });
      setSelectedEmoji(null);
      setFeedbackType("general");
      setShowFeedbackModal(false);
      toast.success("Thank you for your feedback!", {
        id: submitToast,
        icon: "✅",
      });
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.", {
        id: submitToast,
        icon: "❌",
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  useEffect(() => {
    if (submissionStatus?.status === "success") {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#f05d23", "#231812", "#d94f1e"],
        });

        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#f05d23", "#231812", "#d94f1e"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [submissionStatus]);

  const TimelineStep = ({ number, text }) => (
    <div className="flex items-start">
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isDark ? "bg-blue-400" : "bg-sky-800"
        } text-white font-bold mr-3`}
      >
        {number}
      </div>
      <p className={`${subTextColor} text-left pt-1`}>{text}</p>
    </div>
  );

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDark ? "#1f2937" : "#fff",
            color: isDark ? "#fff" : "#1f2937",
            border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
          },
        }}
      />
      <div className="animate-fade-in max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <ConfirmationProgress
              submissionStatus={submissionStatus}
              referenceNumber={referenceNumber}
              mode={mode}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className={`shadow-xl rounded-xl overflow-hidden ${bgColor}`}>
              {/* Header Section */}
              <div className="text-center py-8 px-6 border-b border-gray-200">
                <div className="mb-6">
                  <Icon
                    icon={
                      submissionStatus.status === "success"
                        ? "mdi:check-circle"
                        : "mdi:alert-circle"
                    }
                    className={`w-20 h-20 mx-auto ${
                      submissionStatus.status === "success"
                        ? "text-blue-400 animate-pulse"
                        : "text-red-500 animate-bounce"
                    }`}
                  />
                </div>
                <h2 className={`text-3xl font-semibold mb-3 ${textColor}`}>
                  {submissionStatus.status === "success"
                    ? `Thank You, ${
                        formData.primaryContactName || "Applicant"
                      }!`
                    : "Submission Failed"}
                </h2>
                <p className={`text-lg mb-4 ${subTextColor}`}>
                  {submissionStatus.status === "success"
                    ? "Your application has been successfully submitted."
                    : "Something went wrong. Please try again."}
                </p>
                {submissionStatus.status === "success" && (
                  <div className="bg-paan-blue/10 border-l-4 border-paan-blue p-4 mx-auto max-w-md rounded text-left">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Icon
                          icon="mdi:email-outline"
                          className="h-5 w-5 text-paan-blue"
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-paan-dark-blue">
                          We&apos;ve sent a confirmation email to{" "}
                          <span className="font-semibold">
                            {formData.primaryContactEmail || "your email"}
                          </span>
                          . Please check your inbox (and spam folder) for
                          further details.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {submissionStatus.status !== "success" && (
                  <div className="bg-paan-red/10 border-l-4 border-paan-red p-4 mx-auto max-w-md rounded text-left">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Icon
                          icon="mdi:alert-outline"
                          className="h-5 w-5 text-paan-red"
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-paan-red">
                          {submissionStatus.message ||
                            "An unexpected error occurred. Please try again or contact support."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline Section */}
              {submissionStatus.status === "success" && (
                <div className={`px-6 py-6 ${cardBgColor}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>
                    What happens next?
                  </h3>
                  <div className="space-y-4">
                    {isFreelancer ? (
                      <>
                        <TimelineStep
                          number="1"
                          text="PAAN's Talent Vetting Team will review your application within 10 business days."
                        />
                        <TimelineStep
                          number="2"
                          text="Shortlisted candidates will be invited for a virtual skill assessment."
                        />
                        <TimelineStep
                          number="3"
                          text="Approved freelancers will receive a welcome kit and access to PAAN's freelancer portal."
                        />
                        <div className="mt-6">
                          <p className={`text-sm ${subTextColor}`}>
                            Questions? Contact{" "}
                            <a
                              href="mailto:freelancing@paan.africa"
                              className="text-[#f05d23] hover:underline"
                            >
                              freelancing@paan.africa
                            </a>
                          </p>
                          <p
                            className={`text-sm font-semibold mt-2 ${textColor}`}
                          >
                            PAAN – Empowering Africa&apos;s Creative & Digital
                            Ecosystem
                          </p>
                          <p className={`text-xs italic mt-2 ${subTextColor}`}>
                            Note: Submission of this form does not guarantee
                            certification. PAAN reserves the right to decline
                            applications that do not meet program standards.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <TimelineStep
                          number="1"
                          text="PAAN's Secretariat will acknowledge receipt within 2 business days."
                        />
                        <TimelineStep
                          number="2"
                          text="Shortlisted agencies will undergo a due diligence review."
                        />
                        <TimelineStep
                          number="3"
                          text="Final decisions will be communicated within 15 days of submission."
                        />
                      </>
                    )}
                  </div>

                  <div
                    className={`mt-6 p-4 rounded-lg ${
                      isDark ? "bg-gray-600" : "bg-white"
                    } border ${isDark ? "border-gray-500" : "border-gray-200"}`}
                  >
                    <div className="flex items-start">
                      <Icon
                        icon="mdi:information-outline"
                        className="flex-shrink-0 w-5 h-5 mt-1 text-paan-red"
                      />
                      <div className="ml-3">
                        <p className={`text-sm ${subTextColor}`}>
                          {isFreelancer
                            ? "PAAN prioritizes freelancers committed to professionalism, ethical practices, and collaboration. All information will be treated confidentially."
                            : "PAAN prioritizes agencies committed to ethical practices, innovation, and pan-African collaboration. All information will be treated confidentially."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons Section */}
              <div className="px-6 py-6 flex flex-col sm:flex-row gap-4 justify-center border-t border-gray-200">
                <button
                  onClick={() => router.reload()}
                  className="bg-paan-red text-white font-semibold px-6 py-3 rounded-xl hover:bg-paan-red/80 transition-all transform hover:scale-105 flex items-center justify-center"
                >
                  <Icon icon="mdi:refresh" className="mr-2 w-5 h-5" />
                  Return to Forms
                </button>
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className={`${
                    isDark
                      ? "bg-gray-600 hover:bg-gray-500"
                      : "bg-paan-blue hover:bg-paan-blue/80"
                  } text-white font-semibold px-6 py-3 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center`}
                >
                  <Icon
                    icon="mdi:message-text-outline"
                    className="mr-2 w-5 h-5"
                  />
                  Share Feedback
                </button>
                <Link href="https://paan.africa" target="_blank">
                  <button
                    className={`${
                      isDark
                        ? "bg-gray-600 hover:bg-gray-500"
                        : "bg-paan-dark-blue hover:bg-paan-dark-blue/80"
                    } text-white font-semibold px-6 py-3 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center`}
                  >
                    <Icon icon="mdi:web" className="mr-2 w-5 h-5" />
                    Visit Website
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Feedback Modal */}
        <ItemActionModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          title="Share Your Feedback"
          mode={mode}
        >
          <div className="space-y-8 pt-4">
            {/* Header Section */}
            <div className="relative -m-6 mb-6 px-4 py-6 bg-gray-200/10 rounded-xl">
              <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-2">
                  
                  
                </div>
                <p className="leading-relaxed">
                  We value your feedback! Please share your thoughts about the
                  application process and any suggestions for improvement.
                </p>
              </div>
            </div>

            {/* Emoji Reaction */}
            <div className="space-y-4">
              <label
                className={`block text-lg font-semibold ${textColor} flex items-center gap-2`}
              >
                How was your experience?
                <span className="text-xl">😊</span>
              </label>
              <div className="flex gap-3 justify-center">
                {emojis.map((emoji) => (
                  <button
                    key={emoji.icon}
                    onClick={() => setSelectedEmoji(emoji.icon)}
                    className={`relative p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 group ${
                      selectedEmoji === emoji.icon
                        ? isDark
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25"
                          : "bg-gradient-to-r from-blue-100 to-purple-100 shadow-lg shadow-blue-200/50"
                        : isDark
                        ? "bg-gray-700/50 hover:bg-gray-600/50 backdrop-blur-sm"
                        : "bg-gray-50 hover:bg-gray-100 shadow-sm"
                    }`}
                    title={emoji.label}
                  >
                    <span className="text-3xl block">{emoji.icon}</span>
                    {selectedEmoji === emoji.icon && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
                        {emoji.label}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Type */}
            <div className="space-y-4">
              <label className={`block text-lg font-semibold ${textColor}`}>
                Type of Feedback
              </label>
              <div className="grid grid-cols-2 gap-3">
                {feedbackTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFeedbackType(type.id)}
                    className={`p-4 rounded-xl text-sm font-medium transition-all duration-200 border-2 transform hover:scale-[1.02] ${
                      feedbackType === type.id
                        ? isDark
                          ? "bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/25"
                          : "bg-blue-50 text-blue-800 border-blue-200 shadow-md"
                        : isDark
                        ? "bg-gray-700/50 text-gray-300 border-gray-600 hover:bg-gray-600/50"
                        : "bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{type.icon}</span>
                      {type.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Categories */}
            <div className="space-y-6">
              <label className={`block text-lg font-semibold ${textColor}`}>
                Rate Your Experience
              </label>
              <div className="space-y-6">
                {Object.entries(feedbackRatings).map(([category, value]) => (
                  <div key={category} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span
                        className={`font-medium capitalize ${subTextColor}`}
                      >
                        {category.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span
                        className={`text-sm px-3 py-1 rounded-full font-medium ${
                          value > 0
                            ? isDark
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-blue-100 text-blue-700"
                            : isDark
                            ? "bg-gray-700 text-gray-400"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {value > 0 ? ratingLabels[value] : "Not rated"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRatingChange(category, rating)}
                          className={`flex-1 h-8 rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 font-medium ${
                            value >= rating
                              ? isDark
                                ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg"
                                : "bg-gradient-to-r from-blue-100 to-blue-200 text-gray-400 shadow-md"
                              : isDark
                              ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          }`}
                        >
                          <span className="text-lg">★</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="space-y-4">
              <label
                htmlFor="feedback"
                className={`block text-lg font-semibold ${textColor}`}
              >
                Your Detailed Feedback
              </label>
              <div className="relative">
                <textarea
                  id="feedback"
                  rows={5}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your thoughts in detail..."
                  className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 resize-none ${
                    isDark
                      ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-700 focus:border-blue-500"
                      : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-400 focus:bg-blue-50/30"
                  } focus:outline-none focus:ring-0`}
                />
                <div
                  className={`absolute bottom-3 right-3 text-xs ${subTextColor}`}
                >
                  {feedback.length}/500
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200/50">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleFeedbackSubmit}
                disabled={!feedback.trim() || isSubmittingFeedback}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 transform hover:scale-[1.02] ${
                  !feedback.trim() || isSubmittingFeedback
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-lg"
                } bg-gradient-to-r from-blue-400 to-sky-600 text-white hover:from-blue-600 hover:to-sky-700`}
              >
                {isSubmittingFeedback ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </div>
        </ItemActionModal>
      </div>
    </>
  );
}
