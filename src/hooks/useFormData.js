import { useState, useEffect } from "react";

export const useFormData = (questionCount = 0) => {
  // Normalize job_type from URL query parameter
  const getInitialJobType = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const jobType = params.get("job_type");
      if (jobType === "agencies") return "agency";
      if (jobType === "freelancers") return "freelancer";
      return jobType === "freelancer" ? "freelancer" : "";
    }
    return "";
  };

  const [formData, setFormData] = useState({
    agencyName: "",
    yearEstablished: "",
    headquartersLocation: "Kenya",
    registeredOfficeAddress: "",
    websiteUrl: "",
    primaryContactName: "",
    primaryContactRole: "",
    primaryContactEmail: "",
    primaryContactPhone: "",
    primaryContactLinkedin: "",
    phoneNumber: "",
    countryOfResidence: "",
    languagesSpoken: "",
    opening: "",
    job_type: getInitialJobType(),
    answers: Array(questionCount).fill([]),
    companyRegistration: null,
    portfolioWork: null,
    agencyProfile: null,
    taxRegistration: null,
  });
  const [submissionStatus, setSubmissionStatus] = useState(null);

  // Update job_type and opening if URL changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jobType = params.get("job_type");
    const opening = params.get("opening");
    const normalizedJobType =
      jobType === "agencies"
        ? "agency"
        : jobType === "freelancers" || jobType === "freelancer"
        ? "freelancer"
        : "";

    setFormData((prev) => ({
      ...prev,
      job_type: normalizedJobType,
      opening: opening || prev.opening,
    }));
  }, []);

  const handleChange = (input) => {
    setFormData((prev) => {
      if (Array.isArray(input)) {
        // Handle array of { name, value } objects
        const updates = input.reduce(
          (acc, { name, value }) => ({ ...acc, [name]: value }),
          {}
        );
        return { ...prev, ...updates };
      } else {
        // Handle standard DOM event
        const { name, value } = input.target;
        return { ...prev, [name]: value };
      }
    });
  };

  const handleOptionToggle = (
    questionIndex,
    option,
    customText = null,
    isMultiSelect = false
  ) => {
    setFormData((prev) => {
      const newAnswers = [...prev.answers];
      newAnswers[questionIndex] = newAnswers[questionIndex] || [];

      let updatedAnswers;
      if (option === null && Array.isArray(customText)) {
        if (customText.every((item) => typeof item === "string")) {
          updatedAnswers = customText.filter((ans) => ans.trim() !== "");
        } else {
          updatedAnswers = customText.filter((ans) => {
            if (ans.customText) {
              try {
                const parsed =
                  typeof ans.customText === "string"
                    ? JSON.parse(ans.customText)
                    : ans.customText;
                return (
                  Object.values(parsed).every(
                    (val) => typeof val === "string" && val.trim() !== ""
                  ) || ans.customText.trim() !== ""
                );
              } catch {
                return (
                  typeof ans.customText === "string" &&
                  ans.customText.trim() !== ""
                );
              }
            }
            return false;
          });
        }
      } else if (option === "Other") {
        const existingOther = newAnswers[questionIndex].find(
          (ans) => typeof ans === "object" && ans.option === "Other"
        );
        if (customText !== null && typeof customText === "string") {
          if (existingOther) {
            updatedAnswers = newAnswers[questionIndex].map((ans) =>
              ans.option === "Other" ? { option: "Other", customText } : ans
            );
          } else {
            updatedAnswers = [
              ...newAnswers[questionIndex],
              { option: "Other", customText: customText || "" },
            ];
          }
        } else {
          if (existingOther) {
            updatedAnswers = newAnswers[questionIndex].filter(
              (ans) => ans.option !== "Other"
            );
          } else {
            updatedAnswers = [
              ...newAnswers[questionIndex],
              { option: "Other", customText: "" },
            ];
          }
        }
      } else {
        if (isMultiSelect) {
          if (
            newAnswers[questionIndex].some(
              (ans) =>
                ans === option ||
                (typeof ans === "object" && ans.option === option)
            )
          ) {
            updatedAnswers = newAnswers[questionIndex].filter(
              (ans) =>
                ans !== option &&
                !(typeof ans === "object" && ans.option === option)
            );
          } else {
            updatedAnswers = [
              ...newAnswers[questionIndex],
              customText !== null && typeof customText === "string"
                ? { option, customText }
                : option,
            ];
          }
        } else {
          updatedAnswers = [
            customText !== null && typeof customText === "string"
              ? { option, customText }
              : option,
          ];
        }
      }

      newAnswers[questionIndex] = updatedAnswers.filter(
        (ans) =>
          (typeof ans === "string" && ans.trim() !== "") ||
          (typeof ans === "object" &&
            (ans.option ||
              (ans.customText &&
                (typeof ans.customText === "string"
                  ? ans.customText.trim() !== ""
                  : Object.values(
                      typeof ans.customText === "string"
                        ? JSON.parse(ans.customText || "{}")
                        : ans.customText
                    ).every(
                      (val) => typeof val === "string" && val.trim() !== ""
                    )))))
      );

      return { ...prev, answers: newAnswers };
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmissionStatus("submitting");

      // Validate job_type
      if (!["agency", "freelancer"].includes(formData.job_type)) {
        throw new Error(
          "Valid job_type ('agency' or 'freelancer') is required"
        );
      }

      console.log("Submitting form with job_type:", formData.job_type);

      const cleanedFormData = {
        ...formData,
        answers: formData.answers.map((answer) =>
          Array.isArray(answer)
            ? answer.filter(
                (ans) =>
                  (typeof ans === "string" && ans.trim() !== "") ||
                  (typeof ans === "object" &&
                    (ans.option ||
                      (ans.customText &&
                        (typeof ans.customText === "string"
                          ? ans.customText.trim() !== ""
                          : Object.values(
                              typeof ans.customText === "string"
                                ? JSON.parse(ans.customText || "{}")
                                : ans.customText
                            ).every(
                              (val) =>
                                typeof val === "string" && val.trim() !== ""
                            )))))
              )
            : answer
        ),
      };

      const form = new FormData();
      // Append non-file fields as JSON
      const nonFileData = {
        agencyName: cleanedFormData.agencyName,
        yearEstablished: cleanedFormData.yearEstablished,
        headquartersLocation: cleanedFormData.headquartersLocation,
        registeredOfficeAddress: cleanedFormData.registeredOfficeAddress,
        websiteUrl: cleanedFormData.websiteUrl,
        primaryContactName: cleanedFormData.primaryContactName,
        primaryContactRole: cleanedFormData.primaryContactRole,
        primaryContactEmail: cleanedFormData.primaryContactEmail,
        primaryContactPhone: cleanedFormData.primaryContactPhone,
        primaryContactLinkedin: cleanedFormData.primaryContactLinkedin,
        phoneNumber: cleanedFormData.phoneNumber,
        countryOfResidence: cleanedFormData.countryOfResidence,
        languagesSpoken: cleanedFormData.languagesSpoken,
        opening: cleanedFormData.opening,
        job_type: cleanedFormData.job_type,
        answers: cleanedFormData.answers,
      };
      form.append("data", JSON.stringify(nonFileData));

      // Append files
      if (cleanedFormData.companyRegistration) {
        form.append("companyRegistration", cleanedFormData.companyRegistration);
      }
      if (cleanedFormData.portfolioWork) {
        form.append("portfolioWork", cleanedFormData.portfolioWork);
      }
      if (cleanedFormData.agencyProfile) {
        form.append("agencyProfile", cleanedFormData.agencyProfile);
      }
      if (cleanedFormData.taxRegistration) {
        form.append("taxRegistration", cleanedFormData.taxRegistration);
      }

      const response = await fetch("/api/submit", {
        method: "POST",
        body: form,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Submission failed");
      }

      setSubmissionStatus("success");
      console.log("Submission sent! You'll receive a confirmation email soon.");
      return result;
    } catch (error) {
      setSubmissionStatus("error");
      console.error("Submission failed:", error.message);
      throw error;
    }
  };

  return {
    formData,
    setFormData,
    submissionStatus,
    setSubmissionStatus,
    handleChange,
    handleOptionToggle,
    handleSubmit,
  };
};
