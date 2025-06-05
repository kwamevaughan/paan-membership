import { useState } from "react";

export const useFormValidation = () => {
  const [errors, setErrors] = useState({});

  const nameRegex = /^[a-zA-Z\s'-]{2,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+\d{1,4}\s?\d{7,}$/;
  const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;

  const validLanguageOptions = [
    "English – Fluent",
    "English – Intermediate",
    "French – Fluent",
    "French – Intermediate",
  ];

  // User-friendly field names for toast messages
  const fieldNames = {
    agencyName: "Agency Name",
    yearEstablished: "Year Established",
    headquartersLocation: "Headquarters Location",
    registeredOfficeAddress: "Registered Office Address",
    websiteUrl: "Website URL",
    primaryContactName: "Full Name",
    primaryContactRole: "Primary Contact Role",
    primaryContactEmail: "Email Address",
    primaryContactPhone: "Phone Number",
    primaryContactLinkedin: "LinkedIn URL",
    phoneNumber: "Phone Number",
    countryOfResidence: "Country of Residence",
    languagesSpoken: "Languages Spoken",
    companyRegistration: "Company Registration",
    taxRegistration: "Tax Registration",
  };

  const validateField = (name, value, formData = {}) => {
    let error = "";
    switch (name) {
      case "agencyName":
        if (!value) {
          error = "Agency name is required";
        } else if (!nameRegex.test(value)) {
          error = "Please enter a valid agency name";
        }
        break;
      case "yearEstablished":
        if (!value) {
          error = "Year established is required";
        } else if (
          isNaN(value) ||
          value < 1800 ||
          value > new Date().getFullYear()
        ) {
          error = "Please enter a valid year";
        }
        break;
      case "headquartersLocation":
      case "countryOfResidence":
        if (!value) {
          error = `${
            name === "headquartersLocation"
              ? "Headquarters location"
              : "Country of residence"
          } is required`;
        }
        break;
      case "registeredOfficeAddress":
        if (!value) {
          error = "Registered office address is required";
        }
        break;
      case "websiteUrl":
      case "primaryContactLinkedin":
        if (value && !urlRegex.test(value)) {
          error = `Please enter a valid ${
            name === "websiteUrl" ? "website URL" : "LinkedIn URL"
          }`;
        }
        break;
      case "primaryContactName":
        if (!value) {
          error = "Full name is required";
        } else if (!nameRegex.test(value)) {
          error = "Please enter a valid name";
        }
        break;
      case "primaryContactRole":
        if (!value) {
          error = "Primary contact role is required";
        }
        break;
      case "primaryContactEmail":
        if (!value) {
          error = "Email address is required";
        } else if (!emailRegex.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "primaryContactPhone":
      case "phoneNumber":
        if (!value) {
          error = "Phone number is required";
        } else if (!phoneRegex.test(value)) {
          error =
            "Please enter a valid phone number with country code (e.g., +254 701 850 850)";
        }
        break;
      case "languagesSpoken":
        if (!value) {
          error =
            "At least one language with proficiency level must be selected";
        } else {
          const selectedLanguages = value.split(", ").filter(Boolean);
          if (
            selectedLanguages.some(
              (lang) => !validLanguageOptions.includes(lang)
            )
          ) {
            error = "Please select valid languages and proficiency levels";
          }
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const validateForm = (formData, step) => {
    const newErrors = {};
    const fieldsToValidate = [];

    if (step === 1) {
      if (formData.job_type === "agency") {
        fieldsToValidate.push(
          "agencyName",
          "yearEstablished",
          "headquartersLocation",
          "registeredOfficeAddress",
          "websiteUrl",
          "primaryContactName",
          "primaryContactRole",
          "primaryContactEmail",
          "primaryContactPhone",
          "primaryContactLinkedin"
        );
      } else if (formData.job_type === "freelancer") {
        fieldsToValidate.push(
          "primaryContactName",
          "primaryContactEmail",
          "phoneNumber",
          "countryOfResidence",
          "languagesSpoken"
        );
      }

      // Validate each field and collect errors
      fieldsToValidate.forEach((field) => {
        const value = formData[field];
        const error = validateField(field, value, formData);
        if (error) {
          newErrors[field] = error;
        }
      });
    } else if (step === 3 && formData.job_type === "agencies") {
      if (!formData.companyRegistration) {
        newErrors.companyRegistration = "Company registration is required";
      }
      if (!formData.taxRegistration) {
        newErrors.taxRegistration = "Tax registration is required";
      }
    } else if (step === 3 && formData.job_type === "freelancers") {
      if (!formData.companyRegistration) {
        newErrors.companyRegistration = "Company registration is required";
      }
      if (!formData.taxRegistration) {
        newErrors.taxRegistration = "Tax registration is required";
      }
    }

    // Update errors state
    setErrors(newErrors);

    // Log for debugging
    console.log("Validation Errors:", newErrors);

    // Map errors to user-friendly names for toast
    const toastErrors = Object.keys(newErrors).reduce((acc, key) => {
      acc[fieldNames[key] || key] = newErrors[key];
      return acc;
    }, {});

    return {
      isValid: Object.keys(newErrors).length === 0,
      toastErrors,
    };
  };

  return { errors, validateField, validateForm };
};
