import { useState } from "react";

export const useFormData = () => {
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
    opening: "",
    answers: [],
    companyRegistration: null,
    portfolioWork: null,
    agencyProfile: null,
    taxRegistration: null,
  });
  const [submissionStatus, setSubmissionStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        // Handle open-ended or structured answers
        updatedAnswers = customText.filter(
          (ans) =>
            ans.customText &&
            typeof ans.customText === "string" &&
            ans.customText.trim() !== ""
        );
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
          // Multi-select: Toggle option
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
          // Single-select: Replace with new option
          updatedAnswers = [
            customText !== null && typeof customText === "string"
              ? { option, customText }
              : option,
          ];
        }
      }

      newAnswers[questionIndex] = updatedAnswers;
      
      return { ...prev, answers: newAnswers };
    });
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  const initializeAnswers = (questionCount) => {
    setFormData((prev) => ({
      ...prev,
      answers: Array.from({ length: questionCount }, () => []),
    }));
  };

  return {
    formData,
    setFormData,
    submissionStatus,
    setSubmissionStatus,
    handleChange,
    handleOptionToggle,
    fileToBase64,
    initializeAnswers,
  };
};
