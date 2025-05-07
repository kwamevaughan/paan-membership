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
import { Icon } from "@iconify/react";
import Footer from "@/layouts/footer";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import Head from "next/head";
import { useCategories } from "@/hooks/useCategories";

export default function InterviewPage({ mode, toggleMode, initialQuestions }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [uploadProgress, setUploadProgress] = useState({
    companyRegistration: 0,
    portfolioWork: 0,
    agencyProfile: 0,
    taxRegistration: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [questions] = useState(initialQuestions);
  const { categories, isLoading, addCategory, editCategory, deleteCategory } =
    useCategories();

  const {
    formData,
    setFormData,
    submissionStatus,
    setSubmissionStatus,
    handleChange,
    handleOptionToggle,
    fileToBase64,
    initializeAnswers,
  } = useFormData();

  const { errors, validateForm } = useFormValidation();

  const fileUploadProps = useFileUpload(formData, setFormData);

  const questionsPerPage = 5;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const totalQuestions = questions.length;
  const currentQuestions = questions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  useEffect(() => {
    setIsClient(true);
    const opening = router.query.opening;
    if (opening && !formData.opening) {
      setFormData((prev) => ({
        ...prev,
        opening: decodeURIComponent(opening),
      }));
    }
    if (formData.answers.length === 0) {
      initializeAnswers(initialQuestions.length);
    }
  }, [
    router.query.opening,
    formData.opening,
    formData.answers.length,
    initializeAnswers,
  ]);

  const handleNext = async () => {
    console.log("handleNext called", {
      step,
      currentPage,
      formDataAnswers: formData.answers,
      timestamp: new Date().toISOString(),
    });

    if (step === 1) {
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        console.log("Step 1 validation failed", { errors: validationErrors });
        toast.error("Please fill out all required fields correctly.", {
          icon: "⚠️",
        });
        return;
      }

      console.log("Step 1 validation passed, moving to Step 2");
      setStep(2);
      toast.success("Great! Let’s move to the questions.", { icon: "🎉" });
    } else if (step === 2) {
      const pageComplete = isPageComplete();
      console.log("Step 2 validation check", {
        isPageComplete: pageComplete,
        currentQuestions: currentQuestions.map((q) => ({
          id: q.id,
          answers: formData.answers[q.id - 1] || [],
        })),
        currentPage,
        totalPages,
        timestamp: new Date().toISOString(),
      });

      if (!pageComplete) {
        const missingOtherInput = currentQuestions.find((q) => {
          const answers = formData.answers[q.id - 1] || [];
          return answers.some(
            (ans) =>
              ans.option === "Other" &&
              (!ans.customText || ans.customText.trim() === "")
          );
        });
        if (missingOtherInput) {
          console.log("Step 2 validation failed: Missing 'Other' input", {
            questionId: missingOtherInput.id,
            answers: formData.answers[missingOtherInput.id - 1],
          });
          toast.error("Please provide input for all 'Other' selections.", {
            icon: "⚠️",
          });
        } else {
          console.log("Step 2 validation failed: Incomplete questions");
          toast.error("Please answer all questions on this page.", {
            icon: "⚠️",
          });
        }
        return;
      }

      if (currentPage < totalPages - 1) {
        console.log("Advancing to next page via handleNext", {
          currentPage,
          totalPages,
        });
        handleNextPage();
      } else {
        console.log("All pages complete, moving to Step 3");
        setStep(3);
        toast.success("All questions completed! Upload your documents next.", {
          icon: "📝",
        });
      }
    } else if (step === 3) {
      console.log("Step 3: Starting submission");
      setIsSubmitting(true);
      const maxFileSize = 5 * 1024 * 1024;

      if (
        !formData.companyRegistration ||
        !formData.portfolioWork ||
        !formData.agencyProfile ||
        !formData.taxRegistration
      ) {
        console.log("Step 3 validation failed: Missing required fields");
        toast.error("Please provide all required documents.", {
          icon: "⚠️",
        });
        setIsSubmitting(false);
        return;
      }

      if (
        formData.companyRegistration &&
        formData.portfolioWork &&
        formData.agencyProfile &&
        formData.taxRegistration > maxFileSize
      ) {
        console.log("Step 3 validation failed: File size exceeds 5MB");
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

      console.log("Step 3: Data to send:", {
        ...dataToSend,
        companyRegistration: dataToSend.companyRegistration
          ? "present"
          : "none",
        portfolioWork: dataToSend.portfolioWork ? "present" : "none",
        agencyProfile: dataToSend.agencyProfile ? "present" : "none",
        taxRegistration: dataToSend.taxRegistration ? "present" : "none",
      });

      const submitToast = toast.loading("Submitting your application...");

      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress({
            companyRegistration: formData.companyRegistration
              ? Math.min(progress, 100)
              : 0,
            portfolioWork: formData.portfolioWork ? Math.min(progress, 100) : 0,
            agencyProfile: formData.agencyProfile ? Math.min(progress, 100) : 0,
            taxRegistration: formData.taxRegistration
              ? Math.min(progress, 100)
              : 0,
          });
          if (progress >= 100) clearInterval(interval);
        }, 200);
        return interval;
      };

      const progressInterval = simulateProgress();

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
          console.log("Step 3: Submission successful", { score: result.score });
          clearInterval(progressInterval);
          setUploadProgress({
            companyRegistration: 100,
            portfolioWork: 100,
            agencyProfile: 100,
            taxRegistration: 100,
          });
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
        console.log("Step 3: Submission failed", { error: error.message });
        clearInterval(progressInterval);
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
    if (step === 2 && currentPage > 0) {
      setCurrentPage(currentPage - 1);
      toast("Going back to the previous set...", { icon: "⬅️" });
    } else if (step > 1) {
      setStep(step - 1);
      setUploadProgress({
        companyRegistration: 0,
        portfolioWork: 0,
        agencyProfile: 0,
        taxRegistration: 0,
      });
      toast("Returning to the previous step...", { icon: "⬅️" });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleQuestionsComplete = () => {
    setStep(3);
    setUploadProgress({
      companyRegistration: 0,
      portfolioWork: 0,
      agencyProfile: 0,
      taxRegistration: 0,
    });
    toast.success("All questions completed! Upload your documents next.", {
      icon: "📝",
    });
  };

  const isPageComplete = () => {
    return currentQuestions.every((q) => {
      const answers = formData.answers[q.id - 1] || [];

      if (q.depends_on_question_id) {
        const parentAnswers =
          formData.answers[q.depends_on_question_id - 1] || [];
        if (
          !parentAnswers.some((ans) =>
            typeof ans === "object"
              ? ans.option === q.depends_on_answer
              : ans === q.depends_on_answer
          )
        ) {
          return true;
        }
      }

      if (q.skippable && answers.length === 0) return true;

      if (answers.length === 0) {
        console.log(`No answers for q.id=${q.id} in isPageComplete`, {
          answers,
        });
        return false;
      }

      if (q.is_open_ended) {
        if (q.structured_answers) {
          return answers.every((ans) => {
            try {
              const parsed = JSON.parse(ans.customText || "{}");
              return q.structured_answers.fields.every(
                (field) =>
                  typeof parsed[field.name.toLowerCase()] === "string" &&
                  parsed[field.name.toLowerCase()].trim() !== ""
              );
            } catch {
              return false;
            }
          });
        }
        return answers.some(
          (ans) =>
            typeof ans.customText === "string" && ans.customText.trim() !== ""
        );
      }

      const hasOther = answers.some((ans) => ans.option === "Other");
      if (hasOther) {
        return answers.every(
          (ans) =>
            ans.option !== "Other" ||
            (typeof ans.customText === "string" && ans.customText.trim() !== "")
        );
      }

      if (q.is_multi_select) {
        return answers.length >= 1;
      }

      return true;
    });
  };

  const isStep1Complete = formData.fullName && formData.email;
  const answeredQuestions = questions.filter(
    (q) => formData.answers[q.id - 1]?.length > 0
  ).length;

  return (
    <>
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
        currentPage={currentPage}
        totalPages={totalPages}
        uploadProgress={uploadProgress}
        answeredQuestions={answeredQuestions}
        totalQuestions={totalQuestions}
        isStep1Complete={isStep1Complete}
      />
      <div
        className={`flex flex-col justify-center items-center ${
          mode === "dark"
            ? "bg-gradient-to-b from-gray-900 to-gray-800"
            : "bg-gradient-to-b from-gray-100 to-gray-200"
        }`}
      >
        <div className="max-w-3xl w-full mx-auto p-6 pb-24">
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
              currentPage={currentPage}
              questionsPerPage={questionsPerPage}
              questions={questions}
              categories={categories || []}
              isLoading={isLoading}
              handleNextPage={handleNextPage}
              totalPages={totalPages}
              onComplete={handleQuestionsComplete}
              mode={mode}
              initializeAnswers={initializeAnswers}
            />
          )}
          {step === 3 && (
            <Step3Documents
              formData={formData}
              setFormData={setFormData}
              isSubmitting={isSubmitting}
              uploadProgress={uploadProgress}
              setUploadProgress={setUploadProgress}
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
            <div className="mt-8 flex justify-between items-center gap-4">
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
                disabled={(step === 2 && !isPageComplete()) || isSubmitting}
                className={`flex items-center justify-center px-4 py-2 bg-[#f05d23] text-white rounded-lg hover:bg-[#d94f1e] disabled:bg-gray-300 disabled:text-gray-600 transition-all duration-200 shadow-md`}
              >
                {step === 3 ? (
                  <>
                    Submit
                    <Icon icon="mdi:send" className="ml-2 w-5 h-5" />
                  </>
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
      </div>
      <Footer mode={mode} />
    </>
  );
}

export async function getStaticProps() {
  try {
    console.time("fetchInterviewQuestions");
    const { data: questions, error } = await supabase
      .from("interview_questions")
      .select("*, max_answers")
      .order("id", { ascending: true });
    console.timeEnd("fetchInterviewQuestions");

    if (error) throw error;

    return {
      props: {
        initialQuestions: questions,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching questions in getStaticProps:", error);
    return {
      props: {
        initialQuestions: [],
      },
      revalidate: 60,
    };
  }
}
