import { useState, useEffect } from "react";
import Header from "@/layouts/header";
import toast, { Toaster } from "react-hot-toast";
import { useFormData } from "@/hooks/useFormData";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useFormValidation } from "@/hooks/useFormValidation";
import Step1Form from "@/components/Step1Form";
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

export default function InterviewPage({ mode, toggleMode, initialQuestions }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions] = useState(initialQuestions);
  const { categories, isLoading } = useCategories();

  const {
    formData,
    setFormData,
    submissionStatus,
    setSubmissionStatus,
    handleChange,
    handleOptionToggle,
    fileToBase64,
  } = useFormData(initialQuestions.length);

  const { errors, validateForm } = useFormValidation();
  const fileUploadProps = useFileUpload(formData, setFormData);

  const totalQuestions = questions.length;

  useEffect(() => {
    const opening = router.query.opening;
    if (opening && !formData.opening) {
      setFormData((prev) => ({
        ...prev,
        opening: decodeURIComponent(opening),
      }));
    }
  }, [
    router.query.opening,
    formData.opening,
    formData.answers,
    setFormData,
    questions,
  ]);

  const handleNext = async () => {
    if (step === 1) {
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        toast.error("Please fill out all required fields correctly.", {
          icon: "⚠️",
        });
        return;
      }
      setStep(2);
      toast.success("Great! Let's move to the questions.", { icon: "🎉" });
    } else if (step === 2) {
      toast.success("Proceeding to document upload.", { icon: "📝" });
      setStep(3);
    } else if (step === 3) {
      setIsSubmitting(true);
      const maxFileSize = 5 * 1024 * 1024;

      if (
        !formData.companyRegistration ||
        !formData.portfolioWork ||
        !formData.agencyProfile ||
        !formData.taxRegistration
      ) {
        toast.error("Please provide all required documents.", { icon: "⚠️" });
        setIsSubmitting(false);
        return;
      }

      if (
        formData.companyRegistration &&
        formData.portfolioWork &&
        formData.agencyProfile &&
        formData.taxRegistration > maxFileSize
      ) {
        toast.error("File size exceeds 5MB limit.", { icon: "⚠️" });
        setIsSubmitting(false);
        return;
      }

      const dataToSend = {
        agencyName: formData.agencyName,
        yearEstablished: formData.yearEstablished,
        headquartersLocation: formData.headquartersLocation,
        registeredOfficeAddress: formData.registeredOfficeAddress,
        websiteUrl: formData.websiteUrl,
        primaryContactName: formData.primaryContactName,
        primaryContactRole: formData.primaryContactRole,
        primaryContactEmail: formData.primaryContactEmail,
        primaryContactPhone: formData.primaryContactPhone,
        primaryContactLinkedin: formData.primaryContactLinkedin,
        opening: formData.opening,
        answers: formData.answers,
        companyRegistration: formData.companyRegistration
          ? await fileToBase64(formData.companyRegistration)
          : null,
        portfolioWork: formData.portfolioWork
          ? await fileToBase64(formData.portfolioWork)
          : null,
        agencyProfile: formData.agencyProfile
          ? await fileToBase64(formData.agencyProfile)
          : null,
        taxRegistration: formData.taxRegistration
          ? await fileToBase64(formData.taxRegistration)
          : null,
      };

      const submitToast = toast.loading("Submitting your application...");
      try {
        const response = await fetch("/api/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        });
        const result = await response.json();
        if (response.ok) {
          toast.success("Submission successful!", {
            id: submitToast,
            icon: "✅",
          });
          setSubmissionStatus({ success: true, score: result.score });
          setStep(4);
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        toast.error(`Submission failed: ${error.message}`, {
          id: submitToast,
          icon: "❌",
        });
        setSubmissionStatus({ success: false, message: error.message });
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

  const isStep1Complete = formData.fullName && formData.email;
  const answeredQuestions = questions.filter(
    (q) => formData.answers[q.id - 1]?.length > 0
  ).length;

  return (
    <>
      <Toaster />
      <Head>
        <title>
          Expression of Interest | Pan-African Agency Network (PAAN)
        </title>
        <meta name="description" content="" />
        <meta name="keywords" content="" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Pan-African Agency Network (PAAN)" />
        <meta
          property="og:title"
          content="Expression of Interest | Pan-African Agency Network (PAAN)"
        />
        <meta property="og:description" content="" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://membership.paan.africa" />
        <meta
          property="og:image"
          content="https://careers.growthpad.co.ke/assets/images/logo.svg"
        />
        <meta property="og:site_name" content="Growthpad Careers" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Expression of Interest | Pan-African Agency Network (PAAN)"
        />
        <meta name="twitter:description" content="" />
        <meta
          name="twitter:image"
          content="https://careers.growthpad.co.ke/assets/images/logo.svg"
        />
      </Head>

      <Header
        mode={mode}
        toggleMode={toggleMode}
        step={step}
        currentPage={0}
        totalPages={1}
        answeredQuestions={answeredQuestions}
        totalQuestions={totalQuestions}
        isStep1Complete={isStep1Complete}
      />

      <div
        className={`flex flex-col justify-center items-center relative min-h-screen ${
          mode === "dark" ? "bg-[#0f172a]" : "bg-gray-200"
        }`}
      >
        {/* Connecting dots background (z-10) */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <ConnectingDotsBackground
            color="#f05d23"
            secondaryColor={mode === "dark" ? "#f05d23" : "#505050"}
            dotCount={50}
            dotSize={2.2}
            lineDistance={180}
            speed={0.6}
            mode={mode}
          />
        </div>

        {/* Main form content (z-20) */}
        <div className="max-w-3xl w-full mx-auto p-6 pb-24 relative z-20">
          <MovingDotBorder mode={mode}>
            <div
              className={`rounded-[calc(1rem-4px)] p-6 ${
                mode !== "dark" ? "bg-white" : ""
              }`}
            >
              {/* Form content based on the current step */}
              {step === 1 && (
                <Step1Form
                  formData={formData}
                  handleChange={handleChange}
                  mode={mode}
                />
              )}
              {step === 2 && (
                <Step2Questions
                  formData={formData}
                  setFormData={setFormData}
                  handleOptionToggle={handleOptionToggle}
                  questions={questions}
                  categories={categories || []}
                  isLoading={isLoading}
                  onComplete={() => setStep(3)}
                  mode={mode}
                />
              )}
              {step === 3 && (
                <Step3Documents
                  formData={formData}
                  setFormData={setFormData}
                  isSubmitting={isSubmitting}
                  mode={mode}
                  handleNext={handleNext}
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
                    className="flex items-center justify-center px-4 py-2 bg-[#f05d23] text-white rounded-lg hover:bg-[#d94f1e] disabled:bg-gray-300 disabled:text-gray-600 transition-all duration-200 shadow-md"
                  >
                    {step === 3 ? (
                      <>Submit</>
                    ) : (
                      <>
                        Next
                        <Icon icon="mdi:arrow-right" className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </MovingDotBorder>
        </div>
      </div>
      <Footer mode={mode} />
    </>
  );
}

export async function getStaticProps() {
  try {
    const { data: questions, error } = await supabase
      .from("interview_questions")
      .select("*, max_answers")
      .order("id", { ascending: true });

    if (error) throw error;

    return {
      props: {
        initialQuestions: questions,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching questions:", error);
    return {
      props: {
        initialQuestions: [],
      },
      revalidate: 60,
    };
  }
}
