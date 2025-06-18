import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import Select from "react-select";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useCountry } from "@/hooks/useCountry";
import ItemActionModal from "./ItemActionModal";
import FreelancerInstructions from "./FreelancerInstructions";

export default function Step1FreelancersForm({ formData, handleChange, mode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const { countryOptions, getDialCode } = useCountry();
  const { errors, validateField } = useFormValidation();
  const [dialCode, setDialCode] = useState("");

  // Languages and proficiency levels
  const languages = ["English", "French"];
  const proficiencyLevels = ["Fluent", "Intermediate"];
  const borderColors = ["border-blue-300", "border-blue-300"];

  useEffect(() => {
    setIsMounted(true);
    // Set initial dial code based on countryOfResidence
    if (formData.countryOfResidence) {
      const code = getDialCode(formData.countryOfResidence);
      setDialCode(code);
    }
  }, [formData.countryOfResidence, getDialCode]);

  if (!isMounted) {
    return null;
  }

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: mode === "dark" ? "#374151" : "#F9FAFB",
      borderColor: mode === "dark" ? "#4B5563" : "#D1D5DB",
      color: mode === "dark" ? "#FFFFFF" : "#231812",
      boxShadow: state.isFocused ? "0 0 0 2px #60a5fa" : "none",
      borderWidth: errors.headquartersLocation ? "2px" : "1px",
      borderStyle: "solid",
      borderRadius: "0.5rem",
      padding: "0.5rem 0",
      "&:hover": {
        borderColor: mode === "dark" ? "#6B7280" : "#60a5fa",
      },
    }),
    input: (provided) => ({
      ...provided,
      color: mode === "dark" ? "#FFFFFF" : "#231812",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: mode === "dark" ? "#FFFFFF" : "#231812",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: mode === "dark" ? "#374151" : "#FFFFFF",
      color: mode === "dark" ? "#FFFFFF" : "#000",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#afd2fe"
        : mode === "dark"
        ? "#374151"
        : "#FFFFFF",
      color: state.isSelected || mode === "dark" ? "#000" : "#000",
      "&:hover": {
        backgroundColor: mode === "dark" ? "#4B5563" : "#F9FAFB",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: mode === "dark" ? "#9CA3AF" : "#6B7280",
    }),
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    handleChange(e);
    validateField(name, value);
  };

  const handleCountryChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    const newDialCode = value ? getDialCode(value) : "";
    setDialCode(newDialCode);

    // Update phoneNumber to include new dial code
    let newPhoneNumber = formData.phoneNumber || "";
    if (newDialCode && !newPhoneNumber.startsWith(newDialCode)) {
      newPhoneNumber = newPhoneNumber.replace(/^\+\d+[-]?/, "").trim();
      newPhoneNumber = newDialCode
        ? `${newDialCode} ${newPhoneNumber}`
        : newPhoneNumber;
    } else if (!newDialCode) {
      newPhoneNumber = "";
    }

    handleChange([
      { name: "countryOfResidence", value },
      { name: "phoneNumber", value: newPhoneNumber },
    ]);

    validateField("countryOfResidence", value);
    if (newPhoneNumber) {
      validateField("phoneNumber", newPhoneNumber);
    }
  };

  const handlePhoneChange = (e) => {
    let { value } = e.target;

    // Remove any characters that are not digits, "+", or spaces
    let cleanedValue = value.replace(/[^0-9+\s]/g, "");

    // Ensure the dial code is preserved
    if (dialCode && !cleanedValue.startsWith(dialCode)) {
      cleanedValue = `${dialCode} ${cleanedValue.trim()}`;
    }

    // Prevent multiple "+" signs
    cleanedValue = cleanedValue.replace(/\+{2,}/g, "+");

    // Update form data and validate
    handleChange({ target: { name: "phoneNumber", value: cleanedValue } });
    validateField("phoneNumber", cleanedValue);
  };

  const handleLanguageToggle = (language) => {
    const currentLanguages = formData.languagesSpoken
      ? formData.languagesSpoken.split(", ").filter(Boolean)
      : [];
    let newLanguages;
    if (currentLanguages.some((lang) => lang.startsWith(language))) {
      // Deselect language
      newLanguages = currentLanguages.filter(
        (lang) => !lang.startsWith(language)
      );
    } else {
      // Select language with default proficiency (Fluent)
      newLanguages = [...currentLanguages, `${language} – Fluent`];
    }
    const newValue = newLanguages.join(", ");
    handleChange({ target: { name: "languagesSpoken", value: newValue } });
    validateField("languagesSpoken", newValue);
  };

  const handleProficiencyChange = (language, newProficiency) => {
    const currentLanguages = formData.languagesSpoken
      ? formData.languagesSpoken.split(", ").filter(Boolean)
      : [];
    const newLanguages = currentLanguages.map((lang) =>
      lang.startsWith(language) ? `${language} – ${newProficiency}` : lang
    );
    const newValue = newLanguages.join(", ");
    handleChange({ target: { name: "languagesSpoken", value: newValue } });
    validateField("languagesSpoken", newValue);
  };

  return (
    <div className="animate-fade-in mx-auto">
      <div
        className={`px-4 py-4 rounded-xl ${
          mode === "dark"
            ? "bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700"
            : "bg-gradient-to-r from-gray-50 to-white border border-blue-100"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30"
                  : "bg-gradient-to-br from-blue-100 to-purple-100 border border-blue-200"
              }`}
            >
              <Icon
                icon="mdi:handshake"
                className={`w-6 h-6 ${
                  mode === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">Let&apos;s Get Started</h2>
              <p
                className={`text-sm leading-relaxed ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Welcome to the PAAN Certified Freelancers Program! Please
                provide your details to begin.
              </p>
            </div>
          </div>

          {/* <button
            onClick={() => setIsInstructionsOpen(true)}
            className={`group flex items-center px-5 py-3 rounded-xl font-medium transition-all duration-300 border-2 hover:scale-[1.02] active:scale-[0.98] ${
              mode === "dark"
                ? "border-blue-400/30 bg-blue-900/30 text-blue-300 hover:bg-blue-800/40 hover:border-blue-400/50"
                : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 shadow-sm hover:shadow-md"
            }`}
            aria-label="View application instructions"
          >
            <Icon
              icon="solar:question-circle-bold-duotone"
              className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300"
            />
            Instructions
          </button> */}
        </div>

        <div className="space-y-6 max-h-[65vh] overflow-y-auto">
          <h3 className="text-lg font-bold">Personal information</h3>

          {/* Full Name */}
          <div className="relative">
            <label
              htmlFor="primaryContactName"
              className="block text-sm font-medium mb-1"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <Icon
                icon="mdi:user"
                className="absolute left-3 text-blue-400 w-5 h-5"
              />
              <input
                type="text"
                name="primaryContactName"
                id="primaryContactName"
                value={formData.primaryContactName || ""}
                onChange={handleInputChange}
                placeholder="e.g., John Doe"
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${
                  mode === "dark"
                    ? `bg-gray-700 text-white border-gray-600 ${
                        errors.primaryContactName
                          ? "border-red-500"
                          : "focus:border-blue-400"
                      }`
                    : `bg-gray-50 text-[#231812] border-blue-300 ${
                        errors.primaryContactName
                          ? "border-red-500"
                          : "focus:border-blue-400"
                      }`
                }`}
              />
            </div>
            {errors.primaryContactName && (
              <span className="mt-1 text-xs text-red-500 flex items-center">
                <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />{" "}
                {errors.primaryContactName}
              </span>
            )}
          </div>

          {/* Email Address */}
          <div className="relative">
            <label
              htmlFor="primaryContactEmail"
              className="block text-sm font-medium mb-1"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <Icon
                icon="mdi:email"
                className="absolute left-3 text-blue-400 w-5 h-5"
              />
              <input
                type="email"
                name="primaryContactEmail"
                id="primaryContactEmail"
                value={formData.primaryContactEmail || ""}
                onChange={handleInputChange}
                placeholder="e.g., john.doe@example.com"
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${
                  mode === "dark"
                    ? `bg-gray-700 text-white border-gray-600 ${
                        errors.primaryContactEmail
                          ? "border-red-500"
                          : "focus:border-blue-400"
                      }`
                    : `bg-gray-50 text-[#231812] border-blue-300 ${
                        errors.primaryContactEmail
                          ? "border-red-500"
                          : "focus:border-blue-400"
                      }`
                }`}
              />
            </div>
            {errors.primaryContactEmail && (
              <span className="mt-1 text-xs text-red-500 flex items-center">
                <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />{" "}
                {errors.primaryContactEmail}
              </span>
            )}
          </div>

          {/* Country of Residence */}
          <div className="relative">
            <label
              htmlFor="countryOfResidence"
              className="block text-sm font-medium mb-1"
            >
              Country of Residence <span className="text-red-500">*</span>
            </label>
            <div
              className={`relative flex items-center w-full border rounded-lg shadow-sm ${
                mode === "dark"
                  ? `bg-gray-700 text-white border-gray-600 ${
                      errors.countryOfResidence
                        ? "border-red-500"
                        : "focus:border-blue-400"
                    }`
                  : `bg-gray-50 text-[#231812] border-blue-300 ${
                      errors.countryOfResidence
                        ? "border-red-500"
                        : "focus:border-blue-400"
                    }`
              }`}
            >
              <Icon
                icon="mdi:map-marker"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 z-10"
              />
              <Select
                id="country-of-residence-select"
                value={
                  formData.countryOfResidence
                    ? {
                        label: formData.countryOfResidence,
                        value: formData.countryOfResidence,
                      }
                    : null
                }
                onChange={handleCountryChange}
                options={countryOptions.filter(option => !option.value.includes("All of") && option.value !== "Global (All Regions)")}
                placeholder="Select or type country"
                isSearchable
                isClearable
                styles={customStyles}
                className="w-full pl-10 py-2"
                classNamePrefix="react-select"
              />
            </div>
            {errors.countryOfResidence && (
              <span className="mt-1 text-xs text-red-500 flex items-center">
                <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />{" "}
                {errors.countryOfResidence}
              </span>
            )}
          </div>

          {/* Phone Number */}
          <div className="relative">
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium mb-1"
            >
              Phone Number (with dialing code){" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <Icon
                icon="mdi:phone"
                className="absolute left-3 text-blue-400 w-5 h-5"
              />
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                value={formData.phoneNumber || ""}
                onChange={handlePhoneChange}
                placeholder={
                  dialCode
                    ? `${dialCode} 701 850 850`
                    : "e.g., +254 701 850 850"
                }
                pattern="\+?[0-9\s]+"
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${
                  mode === "dark"
                    ? `bg-gray-700 text-white border-gray-600 ${
                        errors.phoneNumber
                          ? "border-red-500"
                          : "focus:border-blue-400"
                      }`
                    : `bg-gray-50 text-[#231812] border-blue-300 ${
                        errors.phoneNumber
                          ? "border-red-500"
                          : "focus:border-blue-400"
                      }`
                }`}
              />
            </div>
            {errors.phoneNumber && (
              <span className="mt-1 text-xs text-red-500 flex items-center">
                <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />{" "}
                {errors.phoneNumber}
              </span>
            )}
          </div>

          {/* Languages Spoken */}
          <div className="relative">
            <label
              htmlFor="languagesSpoken"
              className="block text-sm font-medium mb-1"
            >
              Languages Spoken <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-3">
              {languages.map((language, idx) => {
                const isSelected = formData.languagesSpoken
                  ?.split(", ")
                  .some((lang) => lang.startsWith(language));
                const selectedProficiency = isSelected
                  ? formData.languagesSpoken
                      ?.split(", ")
                      .find((lang) => lang.startsWith(language))
                      ?.split(" – ")[1] || "Fluent"
                  : "Fluent";
                return (
                  <div key={language} className="flex items-center space-x-3">
                    <button
                      onClick={() => handleLanguageToggle(language)}
                      className={`flex-1 p-3 rounded-lg border-2 text-left text-sm font-medium transition ${
                        borderColors[idx % borderColors.length]
                      } ${
                        isSelected
                          ? "bg-blue-100 border-blue-200 shadow-md"
                          : mode === "dark"
                          ? "bg-gray-700 text-white hover:bg-gray-600 hover:border-blue-400"
                          : "bg-gray-50 text-[#231812] hover:bg-gray-100 hover:border-blue-400"
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon
                          icon={
                            isSelected
                              ? "mdi:checkbox-marked"
                              : "mdi:checkbox-blank-outline"
                          }
                          className={`w-5 h-5 mr-2 ${
                            !isSelected && mode === "dark"
                              ? "text-gray-400"
                              : ""
                          }`}
                        />
                        <span>{language}</span>
                      </div>
                    </button>
                    {isSelected && (
                      <select
                        value={selectedProficiency}
                        onChange={(e) =>
                          handleProficiencyChange(language, e.target.value)
                        }
                        className={`p-2 border rounded-lg ${
                          mode === "dark"
                            ? "bg-gray-700 text-white border-gray-600 focus:border-blue-600"
                            : "bg-gray-50 text-[#231812] border-blue-300 focus:border-blue-600"
                        } focus:outline-none focus:ring-2 focus:ring-blue-600`}
                      >
                        {proficiencyLevels.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
            {errors.languagesSpoken && (
              <span className="mt-1 text-xs text-red-500 flex items-center">
                <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />{" "}
                {errors.languagesSpoken}
              </span>
            )}
          </div>

          {/* Applying for */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">
              Applying for <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <Icon
                icon="mdi:briefcase"
                className="absolute left-3 text-blue-400 w-5 h-5"
              />
              <input
                type="text"
                value={
                  formData.opening ||
                  "Please select an opening on the freelancers page"
                }
                readOnly
                className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed ${
                  mode === "dark"
                    ? "bg-gray-600 border-gray-500 text-gray-300"
                    : "bg-gray-100 border-blue-300 text-gray-500"
                }`}
              />
            </div>
            {!formData.opening && (
              <div className="text-center mt-2">
                <Link href="/freelancers" className="text-blue-400 underline">
                  Click here to return to the freelancers page
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <ItemActionModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
        title="Application Instructions"
        mode={mode}
      >
        <FreelancerInstructions
          mode={mode}
          setIsInstructionsOpen={setIsInstructionsOpen}
        />
      </ItemActionModal>
    </div>
  );
}
