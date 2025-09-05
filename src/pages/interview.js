import { useState, useEffect, useCallback } from "react";
import Header from "@/layouts/header";
import toast from "react-hot-toast";
import { useFormData } from "@/hooks/useFormData";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useFormValidation } from "@/hooks/useFormValidation";
import Step1AgenciesForm from "@/components/Step1AgenciesForm";
import Step1FreelancersForm from "@/components/Step1FreelancersForm";
import Step2Questions from "@/components/Step2Questions";
import Step3Documents from "@/components/Step3Documents";
import Step4Confirmation from "@/components/Step4Confirmation";
import ConnectingDotsBackground from "@/components/ConnectingDotsBackground";
import MovingDotBorder from "@/components/MovingDotBorder";
import { Icon } from "@iconify/react";
import Footer from "@/layouts/footer";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import Head from "next/head";
import { useCategories } from "@/hooks/useCategories";
import ItemActionModal from "@/components/ItemActionModal";
import QuestionsProgress from "@/components/QuestionsProgress";
import FreelancerInstructions from "@/components/FreelancerInstructions";
import AgencyInstructions from "@/components/AgencyInstructions";
import Link from "next/link";

export default function InterviewPage({
  mode,
  toggleMode,
  initialQuestions,
  job_type,
  opening,
  opening_id,
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions] = useState(initialQuestions);
  const { categories, isLoading } = useCategories();
  const [showProgressPopup, setShowProgressPopup] = useState(false);
  const [savedProgress, setSavedProgress] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const {
    formData,
    setFormData,
    submissionStatus,
    setSubmissionStatus,
    handleChange,
    handleOptionToggle,
    handleSubmit,
  } = useFormData(initialQuestions.length);

  const { errors, validateForm } = useFormValidation();
  const fileUploadProps = useFileUpload(formData, setFormData);

  const totalQuestions = questions.length;

  // Initialize formData with server-side props
  useEffect(() => {
    const normalizedJobType =
      job_type?.toLowerCase() === "agencies"
        ? "agency"
        : job_type?.toLowerCase() === "freelancers" ||
          job_type?.toLowerCase() === "freelancer"
        ? "freelancer"
        : "freelancer"; // Default to freelancer

    setFormData((prev) => ({
      ...prev,
      job_type: prev.job_type || normalizedJobType,
      opening: prev.opening || opening || "",
      opening_id: prev.opening_id || opening_id || "",
    }));

    // Set page loading to false after initialization
    setIsPageLoading(false);
  }, [job_type, opening, opening_id, setFormData]);

  const isStep1Complete = () => {
    if (formData.job_type === "agency") {
      return (
        formData.agencyName &&
        formData.yearEstablished &&
        formData.headquartersLocation &&
        formData.registeredOfficeAddress &&
        formData.primaryContactName &&
        formData.primaryContactRole &&
        formData.primaryContactEmail &&
        formData.primaryContactPhone &&
        formData.primaryContactLinkedin &&
        !Object.values(errors).some((error) => error)
      );
    } else if (formData.job_type === "freelancer") {
      return (
        formData.primaryContactName &&
        formData.primaryContactEmail &&
        formData.phoneNumber &&
        formData.countryOfResidence &&
        formData.languagesSpoken &&
        !Object.values(errors).some((error) => error)
      );
    }
    return false;
  };

  const LS_KEY = "registration-progress";

  const saveProgress = useCallback((currentStep, currentFormData) => {
    try {
      const progressData = {
        step: currentStep,
        formData: currentFormData,
        timestamp: Date.now(),
        version: "1.0",
      };
      localStorage.setItem(LS_KEY, JSON.stringify(progressData));
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  }, []);

  // Add a function to update form data with current indices
  const updateFormDataWithIndices = useCallback(
    (categoryIndex, questionIndex) => {
      setFormData((prev) => ({
        ...prev,
        currentCategoryIndex: categoryIndex,
        currentQuestionIndex: questionIndex,
      }));
    },
    [setFormData]
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const progressData = JSON.parse(saved);
        if (progressData && progressData.step && progressData.formData) {
          const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
          const isRecent =
            !progressData.timestamp || progressData.timestamp > thirtyDaysAgo;
          if (isRecent) {
            const validStep = Math.min(Math.max(1, progressData.step), 4);
            const sanitizedFormData = {
              ...progressData.formData,
              answers: Array.isArray(progressData.formData.answers)
                ? progressData.formData.answers
                : new Array(initialQuestions.length).fill(""),
              selectedOptions: progressData.formData.selectedOptions || {},
            };
            if (sanitizedFormData.answers.length !== initialQuestions.length) {
              const newAnswers = new Array(initialQuestions.length).fill("");
              for (
                let i = 0;
                i <
                Math.min(
                  sanitizedFormData.answers.length,
                  initialQuestions.length
                );
                i++
              ) {
                newAnswers[i] = sanitizedFormData.answers[i] || "";
              }
              sanitizedFormData.answers = newAnswers;
            }
            setSavedProgress({
              step: validStep,
              formData: sanitizedFormData,
              timestamp: progressData.timestamp,
            });
            if (validStep > 1) {
              setShowProgressPopup(true);
            }
          } else {
            localStorage.removeItem(LS_KEY);
          }
        }
      }
    } catch (error) {
      console.error("Error parsing saved progress:", error);
      localStorage.removeItem(LS_KEY);
    }
    setIsInitialized(true);
  }, [initialQuestions.length]);

  useEffect(() => {
    if (isInitialized && step < 4) {
      saveProgress(step, formData);
    }
  }, [step, formData, isInitialized, saveProgress]);

  useEffect(() => {
    if (step === 4 || (step === 3 && formData.job_type === "freelancer")) {
      try {
        localStorage.removeItem(LS_KEY);
      } catch (error) {
        console.error("Error clearing progress:", error);
      }
    }
  }, [step, formData.job_type]);

  useEffect(() => {
    const { opening, job_type: queryJobType, opening_id } = router.query;
    if (opening && !formData.opening) {
      setFormData((prev) => ({
        ...prev,
        opening: decodeURIComponent(opening),
        opening_id: opening_id ? decodeURIComponent(opening_id) : "",
      }));
    }
    if (queryJobType && formData.job_type !== queryJobType) {
      const decodedJobType = decodeURIComponent(queryJobType).toLowerCase();
      const normalizedJobType =
        decodedJobType === "agencies"
          ? "agency"
          : decodedJobType === "freelancers" || decodedJobType === "freelancer"
          ? "freelancer"
          : "freelancer";
      setFormData((prev) => ({
        ...prev,
        job_type: normalizedJobType,
      }));
    }
  }, [router.query, formData.opening, formData.job_type, setFormData]);

  const handleNext = async () => {
    if (step === 1) {
      const { isValid, toastErrors } = validateForm(formData, step);
      console.log("Form Data:", formData); // Debug formData
      console.log("Validation Result:", { isValid, toastErrors }); // Debug validation
      if (!isValid) {
        const errorMessage = Object.entries(toastErrors)
          .map(([field, error]) => `${field}: ${error}`)
          .join("\n");
        toast.error(
          errorMessage
            ? `Please address the following issues:\n${errorMessage}`
            : "An unexpected error occurred.",
          {
            icon: "⚠️",
            duration: 5000,
            style: {
              whiteSpace: "pre-line",
            },
          }
        );
        return;
      }
      setStep(2);
      toast.success("Great! Let's move to the questions.", { icon: "🎉" });
    } else if (step === 2) {
      if (formData.job_type === "freelancer") {
        setIsSubmitting(true);
        const submitToast = toast.loading("Submitting your application...");
        try {
          const result = await handleSubmit();
          toast.success("Submission successful!", {
            id: submitToast,
            icon: "✅",
          });
          setSubmissionStatus({ ...submissionStatus, status: "success" });
          setStep(4);
        } catch (error) {
          toast.error(`Submission failed: ${error.message}`, {
            id: submitToast,
            icon: "❌",
          });
          setSubmissionStatus({
            ...submissionStatus,
            status: "error",
            message: error.message,
          });
        } finally {
          setIsSubmitting(false);
        }
      } else {
        // toast.success("Proceeding to document upload.", { icon: "📝" });
        toast.success("Proceeding to next step.", { icon: "📝" });
        setStep(3);
      }
    } else if (step === 3) {
      setIsSubmitting(true);
      const maxFileSize = 5 * 1024 * 1024;
      // Document validation checks - COMMENTED OUT since we're no longer uploading documents
      // if (
      //   formData.job_type === "agency" &&
      //   (!formData.companyRegistration ||
      //     !formData.agencyProfile)
      // ) {
      //   toast.error("Please provide all required documents.", { icon: "❌" });
      //   setIsSubmitting(false);
      //   return;
      // }
      // if (
      //   (formData.companyRegistration &&
      //     formData.companyRegistration.size > maxFileSize) ||
      //   (formData.portfolioWork &&
      //     formData.portfolioWork.size > maxFileSize) ||
      //   (formData.agencyProfile && formData.agencyProfile.size > maxFileSize)
      // ) {
      //   toast.error("File size exceeds 5MB limit.", { icon: "❌" });
      //   setIsSubmitting(false);
      //   return;
      // }
      const submitToast = toast.loading("Submitting your application...");
      try {
        const result = await handleSubmit();
        toast.success("Submission successful!", {
          id: submitToast,
          icon: "✅",
        });
        setSubmissionStatus({ ...submissionStatus, status: "success" });
        setStep(4);
      } catch (error) {
        toast.error(`Submission failed: ${error.message}`, {
          id: submitToast,
          icon: "❌",
        });
        setSubmissionStatus({
          ...submissionStatus,
          status: "error",
          message: error.message,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      toast("Returning to the previous step...", { icon: "⬅️" });
    }
  };

  const answeredQuestions = questions.filter(
    (q) => formData.answers[q.id - 1]?.length > 0
  ).length;

  const handleResumeProgress = () => {
    if (savedProgress) {
      const sanitizedFormData = {
        agencyName: savedProgress.formData.agencyName || "",
        primaryContactName: savedProgress.formData.primaryContactName || "",
        primaryContactEmail: savedProgress.formData.primaryContactEmail || "",
        phoneNumber: savedProgress.formData.phoneNumber || "",
        countryOfResidence: savedProgress.formData.countryOfResidence || "",
        languagesSpoken: savedProgress.formData.languagesSpoken || "",
        opening: savedProgress.formData.opening || opening || "",
        opening_id: savedProgress.formData.opening_id || opening_id || "",
        job_type: savedProgress.formData.job_type || job_type || "freelancer",
        answers: Array.isArray(savedProgress.formData.answers)
          ? savedProgress.formData.answers.map((answer) => answer || "")
          : new Array(initialQuestions.length).fill(""),
        selectedOptions: savedProgress.formData.selectedOptions || {},
        companyRegistration: savedProgress.formData.companyRegistration || null,
        portfolioWork: savedProgress.formData.portfolioWork || null,
        agencyProfile: savedProgress.formData.agencyProfile || null,
        taxRegistration: savedProgress.formData.taxRegistration || null,
        ...Object.keys(savedProgress.formData).reduce((acc, key) => {
          if (
            ![
              "agencyName",
              "primaryContactName",
              "primaryContactEmail",
              "phoneNumber",
              "countryOfResidence",
              "languagesSpoken",
              "opening",
              "opening_id",
              "job_type",
              "answers",
              "selectedOptions",
              "companyRegistration",
              "portfolioWork",
              "agencyProfile",
              "taxRegistration",
            ].includes(key)
          ) {
            const value = savedProgress.formData[key];
            acc[key] = typeof value === "string" ? value || "" : value;
          }
          return acc;
        }, {}),
      };
      if (sanitizedFormData.answers.length !== initialQuestions.length) {
        const newAnswers = new Array(initialQuestions.length).fill("");
        for (
          let i = 0;
          i <
          Math.min(sanitizedFormData.answers.length, initialQuestions.length);
          i++
        ) {
          newAnswers[i] = sanitizedFormData.answers[i] || "";
        }
        sanitizedFormData.answers = newAnswers;
      }
      setFormData(sanitizedFormData);
      setTimeout(() => {
        setStep(savedProgress.step);
        if (
          savedProgress.step === 2 &&
          savedProgress.currentCategoryIndex !== undefined &&
          savedProgress.currentQuestionIndex !== undefined
        ) {
          updateFormDataWithIndices(
            savedProgress.currentCategoryIndex,
            savedProgress.currentQuestionIndex
          );
        }
        toast.success(`Resuming from step ${savedProgress.step}`, {
          icon: "🔄",
        });
      }, 50);
    }
    setShowProgressPopup(false);
  };

  const handleStartOver = () => {
    try {
      localStorage.removeItem(LS_KEY);
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
    setShowProgressPopup(false);
    setStep(1);
    toast.success("Starting fresh!", { icon: "✨" });
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (step < 4) {
        saveProgress(step, formData);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [step, formData, saveProgress]);

  // Show loading state while page is initializing
  if (isPageLoading || !isInitialized) {
    return (
      <>
        <Head>
          <title>Loading... | PAAN Application</title>
        </Head>
        <div
          className={`min-h-screen flex items-center justify-center ${
            mode === "dark"
              ? "bg-[#0f172a] text-white"
              : "bg-gray-200 text-gray-900"
          }`}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-paan-yellow mx-auto mb-4"></div>
            <p className="text-lg font-medium">Loading application...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>
          Join PAAN | Expression of Interest - Pan-African Agency Network
        </title>
        <meta
          name="description"
          content="Join the Pan-African Agency Network (PAAN) to collaborate with independent agencies across Africa and the diaspora. Submit your expression of interest to be part of a network driving creativity, innovation, and global influence."
        />
        <meta
          name="keywords"
          content="PAAN, Pan-African Agency Network, African agencies, collaboration, creativity, innovation, global influence, expression of interest, join PAAN"
        />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Pan-African Agency Network (PAAN)" />
        <meta
          property="og:title"
          content="Join PAAN | Expression of Interest - Pan-African Agency Network"
        />
        <meta
          property="og:description"
          content="Become a part of PAAN, a collaborative network of African agencies transforming fragmentation into unity. Submit your expression of interest to join our mission for global impact."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://membership.paan.africa" />
        <meta
          property="og:image"
          content="https://paan.africa/assets/images/logo.svg"
        />
        <meta property="og:site_name" content="PAAN Expression of Interest" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Join PAAN | Expression of Interest - Pan-African Agency Network"
        />
        <meta
          name="twitter:description"
          content="Express your interest to join PAAN and collaborate with African agencies to shape global narratives through creativity and technology."
        />
        <meta
          name="twitter:image"
          content="https://paan.africa/assets/images/logo.svg"
        />
      </Head>

      <ItemActionModal
        isOpen={showProgressPopup}
        onClose={() => setShowProgressPopup(false)}
        title="Continue Your EOI Application"
        mode={mode}
      >
        <div className="space-y-8 max-w-lg mx-auto">
          <div
            className={`relative p-6 rounded-2xl border-2 border-dashed transition-all duration-300 ${
              mode === "dark"
                ? "border-gray-600 bg-gray-800/50 backdrop-blur-sm"
                : "border-gray-200 bg-gray-50/80 backdrop-blur-sm"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex-shrink-0 p-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gradient-to-br from-paan-blue/20 to-paan-blue/20 border border-paan-blue/30"
                    : "bg-gradient-to-br from-paan-blue/10 to-paan-blue/10 border border-paan-blue/20"
                }`}
              >
                <Icon
                  icon="solar:bookmark-check-bold-duotone"
                  className={`w-6 h-6 ${
                    mode === "dark" ? "text-paan-blue" : "text-paan-blue"
                  }`}
                  aria-hidden="true"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    mode === "dark" ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  Application in Progress
                </h3>

                <p
                  className={`text-base leading-relaxed ${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Your PAAN Expression of Interest is saved at{" "}
                  <span className="font-semibold text-paan-blue">
                    Step {savedProgress?.step}
                  </span>
                  . Continue your application or start over with fresh
                  information.
                </p>

                {savedProgress?.timestamp && (
                  <div
                    className={`flex items-center gap-2 mt-3 text-sm ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <Icon
                      icon="solar:history-2-linear"
                      className="w-4 h-4 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span>
                      {new Date(savedProgress.timestamp).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleStartOver}
              className={`group flex items-center justify-center w-full px-5 py-3 rounded-xl font-medium transition-all duration-300 border-2 hover:scale-[1.02] active:scale-[0.98] ${
                mode === "dark"
                  ? "border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700 hover:text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 shadow-sm hover:shadow-md"
              }`}
            >
              <Icon
                icon="solar:restart-bold-duotone"
                className="w-5 h-5 mr-2.5 group-hover:rotate-180 transition-transform duration-500"
                aria-hidden="true"
              />
              Start Over
            </button>

            <button
              onClick={handleResumeProgress}
              className="group flex items-center justify-center w-full px-5 py-3 bg-paan-dark-blue text-white rounded-xl font-medium hover:from-paan-blue hover:to-paan-deep-blue transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <Icon
                icon="solar:play-circle-bold-duotone"
                className="w-5 h-5 mr-2.5 group-hover:scale-110 transition-transform duration-300 relative z-10"
                aria-hidden="true"
              />
              <span className="relative z-10">Continue Application</span>
            </button>
          </div>

          <div
            className={`flex items-start gap-3 p-4 rounded-xl ${
              mode === "dark"
                ? "bg-paan-dark-blue/10 border border-paan-dark-blue/20"
                : "bg-paan-blue/10 border border-paan-blue/20"
            }`}
          >
            <Icon
              icon="solar:lightbulb-bolt-linear"
              className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                mode === "dark" ? "text-paan-dark-blue" : "text-paan-dark-blue"
              }`}
              aria-hidden="true"
            />
            <p
              className={`text-sm leading-relaxed ${
                mode === "dark" ? "text-paan-dark-blue" : "text-paan-dark-blue"
              }`}
            >
              <strong>Secure & Private:</strong> Your EOI information is
              automatically saved and encrypted as you progress through the
              application.
            </p>
          </div>
        </div>
      </ItemActionModal>
      <Header
        mode={mode}
        toggleMode={toggleMode}
        step={step}
        currentPage={0}
        totalPages={1}
        answeredQuestions={answeredQuestions}
        totalQuestions={totalQuestions}
        isStep1Complete={isStep1Complete()}
        job_type={formData.job_type || job_type || "freelancer"}
      />

      <div
        className={`flex flex-col items-center relative ${
          mode === "dark" ? "bg-paan-dark-blue" : "bg-gray-200"
        }`}
      >
        <div className="absolute inset-0 z-10 pointer-events-none">
          <ConnectingDotsBackground
            color="paan-red"
            secondaryColor={mode === "dark" ? "paan-red" : "#505050"}
            dotCount={50}
            dotSize={2.2}
            lineDistance={180}
            speed={0.6}
            mode={mode}
          />
        </div>

        <div className="max-w-7xl w-full mx-auto p-6 py-10 relative z-10">
          <MovingDotBorder mode={mode}>
            <div
              className={`rounded-[calc(1rem-4px)] p-6 ${
                mode !== "dark" ? "bg-white" : ""
              }`}
            >
              {step === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Instructions Sidebar */}
                  <div className="lg:col-span-1">
                    {formData.job_type === "freelancer" ? (
                      <FreelancerInstructions mode={mode} />
                    ) : (
                      <AgencyInstructions mode={mode} />
                    )}
                  </div>

                  {/* Form Content */}
                  <div className="lg:col-span-2">
                    {formData.job_type === "freelancer" ? (
                      <Step1FreelancersForm
                        formData={formData}
                        handleChange={handleChange}
                        mode={mode}
                      />
                    ) : (
                      <Step1AgenciesForm
                        formData={formData}
                        handleChange={handleChange}
                        mode={mode}
                      />
                    )}
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Progress Sidebar */}
                  <div className="lg:col-span-1">
                    <QuestionsProgress
                      currentCategoryIndex={formData.currentCategoryIndex}
                      currentQuestionIndex={formData.currentQuestionIndex}
                      categories={categories}
                      questions={questions}
                      mode={mode}
                      formData={formData}
                    />
                  </div>

                  {/* Questions Form */}
                  <div className="lg:col-span-2">
                    <Step2Questions
                      formData={formData}
                      setFormData={setFormData}
                      handleOptionToggle={handleOptionToggle}
                      questions={questions}
                      categories={categories || []}
                      isLoading={isLoading}
                      onComplete={handleNext}
                      mode={mode}
                      initialCategoryIndex={formData.currentCategoryIndex}
                      initialQuestionIndex={formData.currentQuestionIndex}
                      onIndicesChange={updateFormDataWithIndices}
                    />
                  </div>
                </div>
              )}
              {step === 3 && formData.job_type === "agency" && (
                <Step3Documents
                  formData={formData}
                  setFormData={setFormData}
                  isSubmitting={isSubmitting}
                  mode={mode}
                  {...fileUploadProps}
                />
              )}
              {step === 4 && (
                <Step4Confirmation
                  formData={formData}
                  submissionStatus={submissionStatus}
                  mode={mode}
                />
              )}

              {step !== 4 && step !== 2 && (
                <div
                  className={`mt-8 flex justify-between items-center gap-4 ${
                    mode !== "dark" ? "bg-white" : ""
                  }`}
                >
                  <button
                    onClick={handleBack}
                    disabled={step === 1 || isSubmitting}
                    className={`flex items-center justify-center px-4 py-2 rounded-lg hover:bg-gray-600 disabled:bg-gray-500 disabled:text-gray-300 transition-all duration-200 shadow-md ${
                      mode === "dark"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-400 text-white"
                    }`}
                  >
                    <Icon icon="mdi:arrow-left" className="mr-2 w-5 h-5" />
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className={`flex items-center justify-center px-4 py-2 bg-[#172840] text-white rounded-lg hover:bg-sky-900 disabled:bg-gray-300 disabled:text-gray-600 transition-all duration-200 shadow-md`}
                  >
                    {step === 3 && formData.job_type === "agency" ? (
                      <>
                        {/* Upload & Submit */}
                        Submit
                        <Icon icon="chevron-right" className="ml-2 h-4 w-4" />
                      </>
                    ) : step === 3 ? (
                      <>
                        Submit
                        <Icon icon="chevron-right" className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Next
                        <Icon icon="chevron-right" className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
              <p className="mt-4 text-center text-sm text-gray-500">
                Having any challenges? Email us for quick help at{" "}
                <Link
                  href="mailto:support@paan.africa"
                  className="text-paan-blue hover:underline"
                >
                  support@paan.africa
                </Link>
              </p>
            </div>
          </MovingDotBorder>
        </div>
      </div>
      <Footer mode={mode} />
    </>
  );
}

export async function getServerSideProps(context) {
  const { getInterviewPageProps } = await import("utils/getPropsUtils");
  return await getInterviewPageProps({
    req: context.req,
    res: context.res,
    query: context.query,
  });
}
