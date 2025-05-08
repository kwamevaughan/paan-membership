import { useState } from "react";

export const useFormData = (questionCount = 0) => {
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
    answers: Array(questionCount).fill([]),
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
    // console.log(
    //   `useFormData handleOptionToggle: questionIndex=${questionIndex}, option=${option}, customText=`,
    //   customText,
    //   `isMultiSelect=${isMultiSelect}`
    // );
    setFormData((prev) => {
      const newAnswers = [...prev.answers];
      newAnswers[questionIndex] = newAnswers[questionIndex] || [];

      let updatedAnswers;
      if (option === null && Array.isArray(customText)) {
        // Handle country select (array of strings) or structured answers (array of objects)
        if (customText.every((item) => typeof item === "string")) {
          // Country select: customText is ['Kenya', 'Nigeria', ...]
          updatedAnswers = customText.filter((ans) => ans.trim() !== "");
        } else {
          // Structured/open-ended answers
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

      // console.log(
      //   `Updated formData.answers[${questionIndex}]:`,
      //   newAnswers[questionIndex]
      // );
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

  const handleSubmit = async () => {
    try {
      setSubmissionStatus("submitting");
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

      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedFormData),
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
      console.log("Submission failed. Please try again.");
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
    fileToBase64,
    handleSubmit,
  };
};
