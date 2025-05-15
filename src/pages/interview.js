import { useState, useEffect } from "react";
import Header from "@/layouts/header";
import toast, { Toaster } from "react-hot-toast";
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
    handleSubmit,
  } = useFormData(initialQuestions.length);

  const { errors, validateForm } = useFormValidation();
  const fileUploadProps = useFileUpload(formData, setFormData);

  const totalQuestions = questions.length;

  useEffect(() => {
    const { opening, job_type } = router.query;
    if (opening && !formData.opening) {
      setFormData((prev) => ({
        ...prev,
        opening: decodeURIComponent(opening),
      }));
    }
    if (job_type && !formData.job_type) {
      const decodedJobType = decodeURIComponent(job_type).toLowerCase();
      const normalizedJobType =
        decodedJobType === "agencies"
          ? "agency"
          : decodedJobType === "freelancers" || decodedJobType === "freelancer"
          ? "freelancer"
          : "";
      if (normalizedJobType) {
        setFormData((prev) => ({
          ...prev,
          job_type: normalizedJobType,
        }));
      } else {
        toast.error("Invalid job type provided in URL.", { icon: "⚠️" });
      }
    }
  }, [router.query, formData.opening, formData.job_type, setFormData]);

  const handleNext = async () => {
    if (step === 1) {
      const isValid = validateForm(formData, step);
      if (!isValid) {
        toast.error("Please fill out all required fields correctly.", {
          icon: "⚠️",
        });
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
          setStep(3); // Skip to Confirmation for freelancer
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
        toast.success("Proceeding to document upload.", { icon: "📝" });
        setStep(3);
      }
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
        (formData.companyRegistration &&
          formData.companyRegistration.size > maxFileSize) ||
        (formData.portfolioWork && formData.portfolioWork.size > maxFileSize) ||
        (formData.agencyProfile && formData.agencyProfile.size > maxFileSize) ||
        (formData.taxRegistration &&
          formData.taxRegistration.size > maxFileSize)
      ) {
        toast.error("File size exceeds 5MB limit.", { icon: "⚠️" });
        setIsSubmitting(false);
        return;
      }

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

  const isStep1Complete =
    formData.job_type === "freelancer"
      ? formData.primaryContactName &&
        formData.primaryContactEmail &&
        formData.phoneNumber &&
        formData.countryOfResidence &&
        formData.languagesSpoken
      : formData.agencyName && formData.primaryContactEmail;

  const answeredQuestions = questions.filter(
    (q) => formData.answers[q.id - 1]?.length > 0
  ).length;

  return (
    <>
      <Toaster />
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

      <Header
        mode={mode}
        toggleMode={toggleMode}
        step={step}
        currentPage={0}
        totalPages={1}
        answeredQuestions={answeredQuestions}
        totalQuestions={totalQuestions}
        isStep1Complete={isStep1Complete}
        job_type={formData.job_type} // Pass job_type
      />

      <div
        className={`flex flex-col items-center relative min-h-screen ${
          mode === "dark" ? "bg-[#0f172a]" : "bg-gray-200"
        }`}
      >
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

        <div className="max-w-3xl w-full mx-auto p-6 pb-24 relative z-20">
          <MovingDotBorder mode={mode}>
            <div
              className={`rounded-[calc(1rem-4px)] p-6 ${
                mode !== "dark" ? "bg-white" : ""
              }`}
            >
              {step === 1 && (
                <>
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
                </>
              )}
              {step === 2 && (
                <Step2Questions
                  formData={formData}
                  setFormData={setFormData}
                  handleOptionToggle={handleOptionToggle}
                  questions={questions}
                  categories={categories || []}
                  isLoading={isLoading}
                  onComplete={handleNext}
                  mode={mode}
                />
              )}
              {step === 3 && formData.job_type === "agency" && (
                <Step3Documents
                  formData={formData}
                  setFormData={setFormData}
                  isSubmitting={isSubmitting}
                  mode={mode}
                  handleNext={handleNext}
                  {...fileUploadProps}
                />
              )}
              {step === 4 && formData.job_type === "agency" && (
                <Step4Confirmation
                  formData={formData}
                  submissionStatus={submissionStatus}
                  mode={mode}
                />
              )}
              {step === 3 && formData.job_type === "freelancer" && (
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
