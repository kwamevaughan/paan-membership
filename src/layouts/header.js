import Image from "next/image";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState, useEffect } from "react";

const Header = ({
  mode,
  toggleMode,
  step,
  currentPage,
  totalPages,
  answeredQuestions,
  totalQuestions,
  isStep1Complete,
  job_type = "freelancer", // Default to 'freelancer'
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [hoverStep, setHoverStep] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Define all steps
  const allSteps = [
    {
      label: "Details",
      icon: "fluent:person-info-20-regular",
      tooltip:
        job_type === "freelancer"
          ? "Provide your contact and personal details"
          : "Provide your agency's contact and registration details",
    },
    {
      label: "Form Details",
      icon: "fluent:form-20-regular",
      tooltip: "Complete details on services, expertise, and qualifications",
    },
    // {
    //   label: "Documents",
    //   icon: "fluent:document-text-20-regular",
    //   tooltip: "Upload required documents like registration and portfolio",
    // },
    {
      label: "Confirmation",
      icon: "fluent:checkmark-starburst-20-regular",
      tooltip: "Review and confirm your submission",
    },
  ];

  // Filter steps based on job_type - COMMENTED OUT since documents step is removed
  // const steps =
  //   job_type === "freelancer"
  //     ? allSteps.filter((step) => step.label !== "Documents")
  //     : allSteps;
  
  const steps = allSteps;

  // Calculate progress
  let progressPercentage = 0;
  let progressText = "";

  if (step >= 1 && step <= steps.length) {
    progressPercentage = (step / steps.length) * 100;
    progressText = `${Math.round(progressPercentage)}%`;
  }

  return (
    <header
      className={`${mode === "dark" ? "bg-slate-900" : "bg-white"} 
      ${scrolled ? "shadow-2xl backdrop-blur-xl bg-opacity-95" : ""} 
      transition-all duration-500 relative z-20 border-b 
      ${mode === "dark" ? "border-slate-800/70" : "border-slate-200/70"} `}
    >
      {/* Animated gradient bar */}
      <div className="h-1 w-full bg-paan-blue bg-[length:200%_auto] animate-gradient"></div>

      <div className="container mx-auto px-4 sm:px-6 py-4 md:py-5">
        <div className="flex justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg"
              aria-label="Go to homepage"
            >
              <div className="block md:hidden relative h-16 w-16 overflow-hidden rounded-xl">
                <Image
                  src={
                    mode === "dark"
                      ? "/assets/images/favicon-white.png"
                      : "/assets/images/logo.svg"
                  }
                  alt="PAAN Logo"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="hidden md:block relative h-20 w-64">
                <Image
                  src={
                    mode === "dark"
                      ? "/assets/images/logo-white.svg"
                      : "/assets/images/logo.svg"
                  }
                  alt="PAAN Logo"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
          </div>

          {/* Step Navigation & Progress Bar */}
          {step >= 1 && step <= steps.length && (
            <div className="hidden md:flex flex-1 justify-start items-center">
              <div className="relative w-full max-w-3xl">
                {/* Step Progress Bar */}
                <div className="absolute top-6 left-0 w-full h-1 bg-gray-200/60 dark:bg-gray-800/60 -z-10"></div>
                <div
                  className="absolute top-6 left-0 h-1 bg-paan-blue -z-10 transition-all duration-1000 ease-in-out"
                  style={{
                    width: `${((step - 1) / (steps.length - 1)) * 100}%`,
                  }}
                ></div>

                {/* Steps */}
                <div className="flex justify-between">
                  {steps.map((item, i) => {
                    const isCompleted = step > i + 1;
                    const isCurrent = step === i + 1;

                    return (
                      <div
                        key={i}
                        className="flex items-center flex-1 group relative"
                        onMouseEnter={() => setHoverStep(i)}
                        onMouseLeave={() => setHoverStep(null)}
                      >
                        <div className="flex flex-col items-center z-10">
                          <button
                            className={`flex items-center justify-center h-10 w-10 rounded-full border-2 transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f05d23]
                  ${
                    isCompleted
                      ? "bg-paan-blue border-transparent text-white shadow-lg"
                      : isCurrent
                      ? mode === "dark"
                        ? "bg-slate-800/90 border-paan-blue text-white shadow-md"
                        : "bg-white/90 border-paan-blue text-slate-700 shadow-md"
                      : mode === "dark"
                      ? "bg-slate-800/90 border-slate-700/60 text-slate-500"
                      : "bg-white/90 border-slate-200/60 text-slate-400"
                  }
                  ${hoverStep === i || isCurrent ? "scale-110" : ""}
                  backdrop-blur-md
                `}
                            aria-label={`${item.label} ${
                              isCompleted
                                ? "completed"
                                : isCurrent
                                ? "current"
                                : "upcoming"
                            }`}
                            aria-current={isCurrent ? "step" : undefined}
                          >
                            {isCompleted ? (
                              <Icon icon="ph:check-bold" className="h-5 w-5" />
                            ) : (
                              <Icon
                                icon={item.icon}
                                className={`h-5 w-5 ${
                                  isCurrent ? "animate-pulse" : ""
                                }`}
                              />
                            )}
                          </button>

                          <span
                            className={`mt-3 text-sm font-medium transition-all duration-300
                  ${
                    isCurrent
                      ? mode === "dark"
                        ? "text-white"
                        : "text-slate-800"
                      : mode === "dark"
                      ? "text-slate-400"
                      : "text-slate-500"
                  }
                  ${isCurrent ? "font-bold" : ""}
                  ${
                    hoverStep === i
                      ? "scale-105 bg-clip-text text-transparent bg-paan-blue"
                      : ""
                  }
                  hidden sm:block
                `}
                          >
                            {item.label}
                          </span>
                        </div>

                        {/* Tooltip */}
                        <div
                          className={`absolute top-16 left-1/2 transform -translate-x-1/2 z-[999] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none
                ${
                  mode === "dark"
                    ? "bg-slate-800 text-slate-200 border-slate-700/50"
                    : "bg-white text-slate-700 border-slate-200/50"
                }
                px-3 py-2 rounded-lg shadow-lg border text-sm flex items-center space-x-2 whitespace-nowrap
              `}
                        >
                          <Icon icon={item.icon} className="h-5 w-5" />
                          <span>{item.tooltip}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Progress Bar Below Steps */}
                <div className="mt-6 w-full h-3.5 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-800/70 backdrop-blur-md shadow-inner relative">
                  <div
                    className="h-full rounded-full bg-paan-blue bg-[length:200%_auto] animate-gradient transition-all duration-1000 ease-in-out relative"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <span
                      className="absolute top-1/2 transform -translate-y-1/2 text-sm font-semibold text-white"
                      style={{
                        right: progressPercentage === 100 ? "0.5rem" : "1rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {progressText} <span className="font-bold">Complete</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => toggleMode()}
              className={`relative p-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
    ${
      mode === "dark"
        ? "bg-slate-800/90 text-slate-200 hover:bg-slate-700/90"
        : "bg-slate-100/90 text-slate-700 hover:bg-slate-200/90"
    }
    transform hover:scale-110 transition-all duration-300 backdrop-blur-md shadow-md flex items-center justify-center group`}
              aria-label={`Switch to ${
                mode === "dark" ? "light" : "dark"
              } mode`}
            >
              <Icon
                icon={mode === "dark" ? "ph:moon-bold" : "ph:sun-bold"}
                className="h-6 w-6 transition-transform duration-300 group-hover:rotate-180"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
