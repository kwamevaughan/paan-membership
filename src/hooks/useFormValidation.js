import { useState } from "react";

export const useFormValidation = () => {
  const [errors, setErrors] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const urlRegex = /^https:\/\/[^\s/$.?#].[^\s]*$/; // Enforce https://
  const phoneRegex = /^\+?[\d\s-]{10,}$/;

  const validateField = (name, value) => {
    let error = "";
    if (name === "agencyName" && !value.trim()) {
      error = "Agency name is required";
    } else if (name === "yearEstablished") {
      if (!value.trim()) {
        error = "Year established is required";
      } else if (
        !/^\d{4}$/.test(value) ||
        value < 1800 ||
        value > new Date().getFullYear()
      ) {
        error = "Please enter a valid year";
      }
    } else if (name === "headquartersLocation" && !value.trim()) {
      error = "Headquarters country is required";
    } else if (name === "registeredOfficeAddress" && !value.trim()) {
      error = "Registered office address is required";
    } else if (name === "websiteUrl") {
      if (!value.trim()) {
        error = "Website URL is required";
      } else if (!urlRegex.test(value)) {
        error =
          "Please enter a valid URL with https:// prefix (e.g., https://example.com)";
      }
    } else if (name === "primaryContactName" && !value.trim()) {
      error = "Contact name is required";
    } else if (name === "primaryContactRole" && !value.trim()) {
      error = "Role/title is required";
    } else if (name === "primaryContactEmail") {
      if (!value.trim()) {
        error = "Email is required";
      } else if (!emailRegex.test(value)) {
        error = "Please enter a valid email (e.g., hello@gmail.com)";
      }
    } else if (name === "primaryContactPhone") {
      if (!value.trim()) {
        error = "Phone number is required";
      } else if (!phoneRegex.test(value)) {
        error = "Please enter a valid phone number";
      }
    } else if (name === "primaryContactLinkedin") {
      if (!value.trim()) {
        error = "LinkedIn URL is required";
      } else if (!urlRegex.test(value)) {
        error =
          "Please enter a valid URL (e.g., https://linkedin.com/in/username)";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const validateForm = (formData) => {
    let validationErrors = {};
    Object.keys(formData).forEach((field) => {
      const value = formData[field];
      const error = validateField(field, value);
      if (error) {
        validationErrors[field] = error;
      }
    });

    setErrors(validationErrors);

    // Log missing fields
    const missingFields = Object.keys(validationErrors);
    if (missingFields.length > 0) {
      console.log("Missing fields: ", missingFields);
    }

    return validationErrors;
  };

  return { errors, validateField, validateForm, setErrors };
};
