import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import Select from "react-select";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useCountry } from "@/hooks/useCountry";

export default function Step1AgenciesForm({ formData, handleChange, mode }) {
  const [isMounted, setIsMounted] = useState(false);
  const { countryOptions, getDialCode, loading } = useCountry();
  const { errors, validateField, validateForm } = useFormValidation();

  useEffect(() => {
    setIsMounted(true);
    // Set default phone number country code on page load if phone is empty
    if (!formData.primaryContactPhone && formData.headquartersLocation) {
      const defaultCode = getDialCode(formData.headquartersLocation) || "+254";
      handleChange({
        target: {
          name: "primaryContactPhone",
          value: defaultCode,
        },
      });
    }
  }, [
    formData.headquartersLocation,
    formData.primaryContactPhone,
    getDialCode,
    handleChange,
  ]);

  if (!isMounted || loading) {
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

    if (name === "websiteUrl" || name === "primaryContactLinkedin") {
      const cleanedValue = value.replace(/^https?:\/\//, "").trim();
      handleChange({
        target: {
          name,
          value: cleanedValue ? `https://${cleanedValue}` : "",
        },
      });
    } else if (name === "primaryContactPhone") {
      // Allow only digits and a leading '+' for the country code
      const cleanedValue = value
        .replace(/[^0-9+]/g, "")
        .replace(/\+(?=.*\+)/g, "");
      handleChange({
        target: {
          name,
          value: cleanedValue,
        },
      });
    } else {
      handleChange(e);
    }
  };

  const handleCountryChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    const countryCode = getDialCode(value) || "+254"; // Default to Kenya if no country selected

    // Update headquartersLocation
    handleChange({ target: { name: "headquartersLocation", value } });
    validateField("headquartersLocation", value);

    // Update phone number only if it's empty or starts with the previous country code
    const currentPhone = formData.primaryContactPhone || "";
    const prevCountryCode =
      getDialCode(formData.headquartersLocation) || "+254";
    if (!currentPhone || currentPhone.startsWith(prevCountryCode)) {
      const phoneWithoutCode = currentPhone.replace(/^\+\d+\s*/, "").trim();
      handleChange({
        target: {
          name: "primaryContactPhone",
          value: phoneWithoutCode
            ? `${countryCode} ${phoneWithoutCode}`
            : countryCode,
        },
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length === 0) {
      console.log("Form submitted successfully:", formData);
    } else {
      console.log("Form contains errors:", validationErrors);
    }
  };

  return (
    <div className="animate-fade-in">
      <div
        className={`rounded-lg px-2 py-2 border border-blue-100 ${
          mode === "dark" ? "bg-gray-800 text-white" : "bg-white text-[#231812]"
        }`}
      >
        <div
          className={`px-4 py-4 ${
            mode === "dark"
              ? "bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700"
              : "bg-gradient-to-r from-gray-50 to-white border-gray-100"
          }`}
        >
          <div className="flex items-center gap-4 mb-6">
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
              <h2 className="text-xl font-bold mb-1">Let&apos;s Get Started</h2>
              <p
                className={`text-sm leading-relaxed ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Complete this Expression of Interest form to begin your journey.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          <h3 className="text-lg font-bold">Agency Details</h3>

          {/* Agency Name and Year Established (Already on Same Row) */}
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
            {/* Agency Name */}
            <div className="relative flex-1">
              <label
                htmlFor="agencyName"
                className="block text-sm font-medium mb-1"
              >
                Agency Name <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <Icon
                  icon="mdi:office-building"
                  className="absolute left-3 text-blue-400 w-5 h-5"
                />
                <input
                  type="text"
                  name="agencyName"
                  id="agencyName"
                  value={formData.agencyName}
                  onChange={handleInputChange}
                  placeholder="e.g., Company XYZ"
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                    mode === "dark"
                      ? `bg-gray-700 text-white border-gray-600 ${
                          errors.agencyName
                            ? "border-red-500"
                            : "focus:border-blue-500"
                        }`
                      : `bg-gray-50 text-[#231812] border-blue-300 ${
                          errors.agencyName
                            ? "border-red-500"
                            : "focus:border-blue-500"
                        }`
                  }`}
                />
              </div>
              {errors.agencyName && (
                <span className="mt-1 text-xs text-red-500 flex items-center">
                  <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />{" "}
                  {errors.agencyName}
                </span>
              )}
            </div>

            {/* Year Established */}
            <div className="relative flex-1">
              <label
                htmlFor="yearEstablished"
                className="block text-sm font-medium mb-1"
              >
                Year Established <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <Icon
                  icon="mdi:calendar"
                  className="absolute left-3 text-blue-400 w-5 h-5"
                />
                <input
                  type="number"
                  name="yearEstablished"
                  id="yearEstablished"
                  value={formData.yearEstablished}
                  onChange={handleInputChange}
                  placeholder="e.g., 2005"
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                    mode === "dark"
                      ? `bg-gray-700 text-white border-gray-600 ${
                          errors.yearEstablished
                            ? "border-red-500"
                            : "focus:border-blue-400"
                        }`
                      : `bg-gray-50 text-[#231812] border-blue-300 ${
                          errors.yearEstablished
                            ? "border-red-500"
                            : "focus:border-blue-400"
                        }`
                  }`}
                />
              </div>
              {errors.yearEstablished && (
                <span className="mt-1 text-xs text-red-500 flex items-center">
                  <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />{" "}
                  {errors.yearEstablished}
                </span>
              )}
            </div>
          </div>

          {/* Headquarters Country (Separate Row) */}
          <div className="relative">
            <label
              htmlFor="headquartersLocation"
              className="block text-sm font-medium mb-1"
            >
              Headquarters Country <span className="text-red-500">*</span>
            </label>
            <div
              className={`relative flex items-center w-full border rounded-lg shadow-sm ${
                mode === "dark"
                  ? `bg-gray-700 text-white border-gray-600 ${
                      errors.headquartersLocation
                        ? "border-red-500"
                        : "focus:border-blue-400"
                    }`
                  : `bg-gray-50 text-[#231812] border-blue-300 ${
                      errors.headquartersLocation
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
                id="headquarters-location-select"
                value={
                  formData.headquartersLocation
                    ? {
                        label: formData.headquartersLocation,
                        value: formData.headquartersLocation,
                      }
                    : { label: "Kenya", value: "Kenya" }
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
            {errors.headquartersLocation && (
              <span className="mt-1 text-xs text-red-500 flex items-center">
                <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />{" "}
                {errors.headquartersLocation}
              </span>
            )}
          </div>

          {/* Registered Office Address (Separate Row) */}
          <div className="relative">
            <label
              htmlFor="registeredOfficeAddress"
              className="block text-sm font-medium mb-1"
            >
              Registered Office Address <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <Icon
                icon="mdi:home"
                className="absolute left-3 text-blue-400 w-5 h-5"
              />
              <input
                type="text"
                name="registeredOfficeAddress"
                id="registeredOfficeAddress"
                value={formData.registeredOfficeAddress}
                onChange={handleInputChange}
                placeholder="e.g., 123 Main St, Nairobi, Kenya"
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                  mode === "dark"
                    ? `bg-gray-700 text-white border-gray-600 ${
                        errors.registeredOfficeAddress
                          ? "border-red-500"
                          : "focus:border-blue-400"
                      }`
                    : `bg-gray-50 text-[#231812] border-blue-300 ${
                        errors.registeredOfficeAddress
                          ? "border-red-500"
                          : "focus:border-blue-400"
                      }`
                }`}
              />
            </div>
            {errors.registeredOfficeAddress && (
              <span className="mt-1 text-xs text-red-500 flex items-center">
                <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />{" "}
                {errors.registeredOfficeAddress}
              </span>
            )}
          </div>

          {/* Website URL (Separate Row) */}
          <div className="relative w-full">
            <label
              htmlFor="websiteUrl"
              className="block text-sm font-medium mb-1"
            >
              Website URL <span className="text-red-500">*</span>
            </label>
            <div
              className={`flex items-center px-3 py-3 border rounded-lg shadow-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200 ${
                mode === "dark"
                  ? `bg-gray-700 text-white border-gray-600 ${
                      errors.websiteUrl
                        ? "border-red-500"
                        : "focus-within:border-blue-400"
                    }`
                  : `bg-gray-50 text-[#231812] border-blue-300 ${
                      errors.websiteUrl
                        ? "border-red-500"
                        : "focus-within:border-blue-400"
                    }`
              }`}
            >
              <Icon icon="mdi:web" className="text-blue-400 w-5 h-5" />
              <span className="text-sm text-gray-500 pl-3 pr-1">https://</span>
              <input
                type="text"
                name="websiteUrl"
                id="websiteUrl"
                value={formData.websiteUrl.replace(/^https?:\/\//, "")}
                onChange={handleInputChange}
                placeholder="example.com"
                required
                className={`w-full pl-1 pr-4 py-2 bg-transparent focus:outline-none focus:ring-0 ${
                  mode === "dark"
                    ? `text-white ${errors.websiteUrl ? "border-red-500" : ""}`
                    : `text-[#231812] ${
                        errors.websiteUrl ? "border-red-500" : ""
                      }`
                }`}
              />
            </div>
            {errors.websiteUrl && (
              <span className="mt-1 text-xs text-red-500 flex items-center">
                <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />{" "}
                {errors.websiteUrl}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold mt-8">Primary Contact Person</h3>

          {/* Primary Contact Name and Role/Title (On Same Row) */}
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
            {/* Primary Contact Name */}
            <div className="relative flex-1">
              <label
                htmlFor="primaryContactName"
                className="block text-sm font-medium mb-1"
              >
                Name <span className="text-red-500">*</span>
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
                  value={formData.primaryContactName}
                  onChange={handleInputChange}
                  placeholder="e.g., John Doe"
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
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

            {/* Primary Contact Role/Title */}
            <div className="relative flex-1">
              <label
                htmlFor="primaryContactRole"
                className="block text-sm font-medium mb-1"
              >
                Role/Title <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <Icon
                  icon="mdi:briefcase"
                  className="absolute left-3 text-blue-400 w-5 h-5"
                />
                <input
                  type="text"
                  name="primaryContactRole"
                  id="primaryContactRole"
                  value={formData.primaryContactRole}
                  onChange={handleInputChange}
                  placeholder="e.g., CEO"
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                    mode === "dark"
                      ? `bg-gray-700 text-white border-gray-600 ${
                          errors.primaryContactRole
                            ? "border-red-500"
                            : "focus:border-blue-400"
                        }`
                      : `bg-gray-50 text-[#231812] border-blue-300 ${
                          errors.primaryContactRole
                            ? "border-red-500"
                            : "focus:border-blue-400"
                        }`
                  }`}
                />
              </div>
              {errors.primaryContactRole && (
                <span className="mt-1 text-xs text-red-500 flex items-center">
                  <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />{" "}
                  {errors.primaryContactRole}
                </span>
              )}
            </div>
          </div>

          {/* Primary Contact Email and Phone Number (On Same Row) */}
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
            {/* Primary Contact Email */}
            <div className="relative flex-1">
              <label
                htmlFor="primaryContactEmail"
                className="block text-sm font-medium mb-1"
              >
                Email <span className="text-red-500">*</span>
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
                  value={formData.primaryContactEmail}
                  onChange={handleInputChange}
                  placeholder="e.g., john.doe@example.com"
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
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

            {/* Primary Contact Phone Number */}
            <div className="relative flex-1">
              <label
                htmlFor="primaryContactPhone"
                className="block text-sm font-medium mb-1"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <Icon
                  icon="mdi:phone"
                  className="absolute left-3 text-blue-400 w-5 h-5"
                />
                <input
                  type="tel"
                  name="primaryContactPhone"
                  id="primaryContactPhone"
                  value={formData.primaryContactPhone}
                  onChange={handleInputChange}
                  placeholder={`e.g., ${
                    getDialCode(formData.headquartersLocation) || "+254"
                  } 701 850 850`}
                  required
                  pattern="[0-9+]*"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                    mode === "dark"
                      ? `bg-gray-700 text-white border-gray-600 ${
                          errors.primaryContactPhone
                            ? "border-red-500"
                            : "focus:border-blue-400"
                        }`
                      : `bg-gray-50 text-[#231812] border-blue-300 ${
                          errors.primaryContactPhone
                            ? "border-red-500"
                            : "focus:border-blue-400"
                        }`
                  }`}
                />
              </div>
              {errors.primaryContactPhone && (
                <span className="mt-1 text-xs text-red-500 flex items-center">
                  <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />{" "}
                  {errors.primaryContactPhone}
                </span>
              )}
            </div>
          </div>

          {/* Primary Contact LinkedIn URL (Separate Row) */}
          <div className="relative w-full">
            <label
              htmlFor="primaryContactLinkedin"
              className="block text-sm font-medium mb-1"
            >
              LinkedIn URL <span className="text-red-500">*</span>
            </label>
            <div
              className={`flex items-center px-3 py-3 border rounded-lg shadow-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200 ${
                mode === "dark"
                  ? `bg-gray-700 text-white border-gray-600 ${
                      errors.primaryContactLinkedin
                        ? "border-red-500"
                        : "focus-within:border-blue-400"
                    }`
                  : `bg-gray-50 text-[#231812] border-blue-300 ${
                      errors.primaryContactLinkedin
                        ? "border-red-500"
                        : "focus-within:border-blue-400"
                    }`
              }`}
            >
              <Icon icon="mdi:linkedin" className="text-blue-400 w-5 h-5" />
              <span className="text-sm text-gray-500 pl-3 pr-1">https://</span>
              <input
                type="text"
                name="primaryContactLinkedin"
                id="primaryContactLinkedin"
                value={formData.primaryContactLinkedin.replace(
                  /^https?:\/\//,
                  ""
                )}
                onChange={handleInputChange}
                placeholder="linkedin.com/in/johndoe"
                required
                className={`w-full pl-1 pr-4 py-2 bg-transparent focus:outline-none focus:ring-0 ${
                  mode === "dark"
                    ? `text-white ${
                        errors.primaryContactLinkedin ? "border-red-500" : ""
                      }`
                    : `text-[#231812] ${
                        errors.primaryContactLinkedin ? "border-red-500" : ""
                      }`
                }`}
              />
            </div>
            {errors.primaryContactLinkedin && (
              <span className="mt-1 text-xs text-red-500 flex items-center">
                <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />{" "}
                {errors.primaryContactLinkedin}
              </span>
            )}
          </div>

          {/* Applying For (Separate Row) */}
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
                  "Please select an opening on the landing page"
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
                <Link href="/" className="text-blue-400 underline">
                  Click here to return to the landing page
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
