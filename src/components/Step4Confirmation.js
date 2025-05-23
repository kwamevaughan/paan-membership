import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Icon } from "@iconify/react";

export default function Step4Confirmation({
  formData,
  submissionStatus,
  mode,
}) {
  const router = useRouter();
  const isDark = mode === "dark";
  const textColor = isDark ? "text-white" : "text-gray-800";
  const subTextColor = isDark ? "text-gray-300" : "text-gray-600";
  const bgColor = isDark ? "bg-gray-800" : "bg-white";
  const cardBgColor = isDark ? "bg-gray-700" : "bg-gray-50";

  const isFreelancer = formData.job_type === "freelancers";

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
          isDark ? "bg-[#f05d23]" : "bg-[#f05d23]"
        } text-white font-bold mr-3`}
      >
        {number}
      </div>
      <p className={`${subTextColor} text-left pt-1`}>{text}</p>
    </div>
  );

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div
        className={`shadow-xl rounded-xl overflow-hidden border-t-4 border-[#f05d23] ${bgColor}`}
      >
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
                  ? "text-[#f05d23] animate-pulse"
                  : "text-red-500 animate-bounce"
              }`}
            />
          </div>
          <h2 className={`text-3xl font-bold mb-3 ${textColor}`}>
            {submissionStatus.status === "success"
              ? `Thank You, ${formData.primaryContactName || "Applicant"}!`
              : "Submission Failed"}
          </h2>
          <p className={`text-lg mb-4 ${subTextColor}`}>
            {submissionStatus.status === "success"
              ? "Your application has been successfully submitted."
              : "Something went wrong. Please try again."}
          </p>
          {submissionStatus.status === "success" && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-auto max-w-md rounded text-left">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Icon
                    icon="mdi:email-outline"
                    className="h-5 w-5 text-blue-400"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    We've sent a confirmation email to{" "}
                    <span className="font-semibold">
                      {formData.primaryContactEmail || "your email"}
                    </span>
                    . Please check your inbox (and spam folder) for further
                    details.
                  </p>
                </div>
              </div>
            </div>
          )}
          {submissionStatus.status !== "success" && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-auto max-w-md rounded text-left">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Icon
                    icon="mdi:alert-outline"
                    className="h-5 w-5 text-red-400"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
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
                    text="PAAN’s Talent Vetting Team will review your application within 10 business days."
                  />
                  <TimelineStep
                    number="2"
                    text="Shortlisted candidates will be invited for a virtual skill assessment."
                  />
                  <TimelineStep
                    number="3"
                    text="Approved freelancers will receive a welcome kit and access to PAAN’s freelancer portal."
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
                    <p className={`text-sm font-semibold mt-2 ${textColor}`}>
                      PAAN – Empowering Africa’s Creative & Digital Ecosystem
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
                  className="flex-shrink-0 w-5 h-5 mt-1 text-[#f05d23]"
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
            className="bg-[#f05d23] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#d94f1e] transition-all transform hover:scale-105 flex items-center justify-center"
          >
            <Icon icon="mdi:refresh" className="mr-2 w-5 h-5" />
            Return to Forms
          </button>
          <Link href="https://paan.africa" target="_blank">
            <button
              className={`${
                isDark
                  ? "bg-gray-600 hover:bg-gray-500"
                  : "bg-gray-700 hover:bg-gray-800"
              } text-white font-semibold px-6 py-3 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center`}
            >
              <Icon icon="mdi:web" className="mr-2 w-5 h-5" />
              Visit Website
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
