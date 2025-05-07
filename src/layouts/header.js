import Image from "next/image";
import { Icon } from "@iconify/react";
import Link from "next/link";

const Header = ({ mode, toggleMode, step, currentPage, totalPages, uploadProgress, answeredQuestions, totalQuestions, isStep1Complete }) => {
    let progressPercentage = 0;
    let progressText = "";

    if (step === 1) {
        progressPercentage = isStep1Complete ? 5 : 0;
        progressText = `${progressPercentage}% Done`;
    } else if (step === 2 && totalPages > 0) {
        progressPercentage = 5 + Math.round((answeredQuestions / totalQuestions) * 90);
        progressText = `${progressPercentage}% Done`;
    } else if (step === 3) {
        const resumeProgress = uploadProgress?.resume || 0;
        const coverLetterProgress = uploadProgress?.coverLetter || 0;
        const resumeContribution = (resumeProgress / 100) * 2.5;
        const coverLetterContribution = (coverLetterProgress / 100) * 2.5;
        progressPercentage = 95 + resumeContribution + coverLetterContribution;
        progressText = `${Math.round(progressPercentage)}% Done`;
    }

    return (
      <header
        className={`${
          mode === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-[#fff8f7] border-[#231812]"
        } border-b shadow-lg py-4 md:py-6 px-4 md:px-24 flex items-center sticky top-0 z-50`}
      >
        <div className="flex justify-between items-center w-full">
          <div className="flex-shrink-0">
            <Link href="/">
              {/* Mobile logo - Change based on mode, only visible on mobile */}
              <Image
                src={
                  mode === "dark"
                    ? "/assets/images/favicon-white.png"
                    : "/assets/images/logo.svg"
                }
                alt="PAAN Logo"
                width={240}
                height={40}
                className="w-14 md:hidden" // Hidden on desktop
              />
              {/* Desktop logo - Always visible on desktop */}
              <Image
                src={
                  mode === "dark"
                    ? "/assets/images/paan-logo-white.svg"
                    : "/assets/images/logo.svg"
                }
                alt="PAAN Logo"
                width={240}
                height={40}
                className="hidden md:block w-[150px]" // Hidden on mobile
              />
            </Link>
          </div>

          {(step === 1 || step === 2 || step === 3) && (
            <div className="w-1/2 relative">
              <div
                className={`w-full ${
                  mode === "dark" ? "bg-gray-700" : "bg-gray-200"
                } rounded-lg h-10`}
              >
                <div
                  className="bg-[#f05d23] h-10 px-8 rounded-lg transition-all duration-300 flex items-center justify-center text-white text-base font-semibold"
                  style={{ width: `${progressPercentage}%` }}
                >
                  {progressText}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            {/* Mobile toggle */}
            <button
              onClick={toggleMode}
              className="p-2 focus:outline-none md:hidden"
              aria-label="Toggle dark mode"
            >
              {mode === "dark" ? (
                <Icon icon="bi:sun" className="h-6 w-6 text-yellow-400" />
              ) : (
                <Icon icon="bi:moon" className="h-6 w-6 text-gray-600" />
              )}
            </button>
            {/* Desktop toggle */}
            <label className="hidden md:inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={mode === "dark"}
                onChange={toggleMode}
                className="hidden"
              />
              <div
                className={`relative w-14 h-8 rounded-full border-2 flex items-center ${
                  mode === "dark"
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300 bg-gray-300"
                } transition`}
              >
                <div
                  className={`absolute w-6 h-6 rounded-full bg-white flex items-center justify-center transition-transform ${
                    mode === "dark" ? "translate-x-6" : ""
                  }`}
                >
                  {mode === "dark" ? (
                    <Icon icon="bi:moon" className="h-4 w-4 text-gray-700" />
                  ) : (
                    <Icon icon="bi:sun" className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
            </label>
          </div>
        </div>
      </header>
    );
};

export default Header;
