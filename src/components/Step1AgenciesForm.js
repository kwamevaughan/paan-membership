import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import Select from "react-select";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useCountry } from "@/hooks/useCountry";
import ItemActionModal from "./ItemActionModal"; // Import ItemActionModal

export default function Step1AgenciesForm({ formData, handleChange, mode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false); // Modal state

  const { countryOptions } = useCountry();
  const { errors, validateField, validateForm } = useFormValidation();

  useEffect(() => {
    setIsMounted(true); // Set the component as mounted after client-side render
  }, []);

  if (!isMounted) {
    return null; // Return null or a loading state before the component is mounted
  }

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: mode === "dark" ? "#374151" : "#F9FAFB",
      borderColor: mode === "dark" ? "#4B5563" : "#D1D5DB",
      color: mode === "dark" ? "#FFFFFF" : "#231812",
      boxShadow: state.isFocused ? "0 0 0 2px #f05d23" : "none",
      borderWidth: errors.headquartersLocation ? "2px" : "1px",
      borderStyle: "solid",
      borderRadius: "0.5rem",
      padding: "0.5rem 0",
      "&:hover": {
        borderColor: mode === "dark" ? "#6B7280" : "#9CA3AF",
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
      color: mode === "dark" ? "#FFFFFF" : "#231812",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#f05d23"
        : mode === "dark"
        ? "#374151"
        : "#FFFFFF",
      color: state.isSelected || mode === "dark" ? "#FFFFFF" : "#231812",
      "&:hover": {
        backgroundColor: mode === "dark" ? "#4B5563" : "#F3F4F6",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: mode === "dark" ? "#9CA3AF" : "#6B7280",
    }),
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Ensure the URL starts with "https://"
    if (
      name === "websiteUrl" &&
      value &&
      typeof value === "string" &&
      !value.startsWith("https://")
    ) {
      handleChange({
        target: {
          name,
          value: `https://${value.replace(/^https?:\/\//, "")}`,
        },
      });
    } else {
      handleChange(e);
    }
  };

  const handleCountryChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    handleChange({ target: { name: "headquartersLocation", value } });
    validateField("headquartersLocation", value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate the form before submitting
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length === 0) {
      // No errors, submit the form
      console.log("Form submitted successfully:", formData);
    } else {
      console.log("Form contains errors:", validationErrors);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div
        className={`rounded-lg px-2 py-2 ${
          mode === "dark" ? "bg-gray-800 text-white" : "bg-white text-[#231812]"
        }`}
      >
        <div className="flex items-center justify-center mb-6">
          <Icon icon="mdi:handshake" className="w-8 h-8 text-blue-400 mr-2" />
          <h2 className="text-3xl font-bold text-center">Let’s Get Started</h2>
        </div>
        <p
          className={`text-center mb-8 italic ${
            mode === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Welcome to the Pan-African Agency Network! Please fill out the EOI
          form to begin your journey.
        </p>

        {/* Instructions Button */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => setIsInstructionsOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-all duration-200 shadow-md focus:outline-none focus:ring-2"
            aria-label="View application instructions"
          >
            <Icon icon="mdi:help-circle" className="w-5 h-5 mr-2" />
            View Instructions
          </button>
        </div>

        <div className="space-y-6 max-h-[50vh] overflow-y-auto">
          <h3 className="text-lg font-bold">Agency Details</h3>

          <div className="relative">
            <label
              htmlFor="agencyName"
              className="block text-sm font-medium mb-1"
            >
              Agency Name <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <Icon
                icon="mdi:office-building"
                className="absolute left-3 text-[#f05d23] w-5 h-5"
              />
              <input
                type="text"
                name="agencyName"
                id="agencyName"
                value={formData.agencyName}
                onChange={handleInputChange}
                placeholder="e.g., Company XYZ"
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition-all duration-200 ${
                  mode === "dark"
                    ? `bg-gray-700 text-white border-gray-600 ${
                        errors.agencyName
                          ? "border-red-500"
                          : "focus:border-[#f05d23]"
                      }`
                    : `bg-gray-50 text-[#231812] border-gray-300 ${
                        errors.agencyName
                          ? "border-red-500"
                          : "focus:border-[#f05d23]"
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

          <div className="relative">
            <label
              htmlFor="yearEstablished"
              className="block text-sm font-medium mb-1"
            >
              Year Established <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <Icon
                icon="mdi:calendar"
                className="absolute left-3 text-[#f05d23] w-5 h-5"
              />
              <input
                type="number"
                name="yearEstablished"
                id="yearEstablished"
                value={formData.yearEstablished}
                onChange={handleInputChange}
                placeholder="e.g., 2005"
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition-all duration-200 ${
                  mode === "dark"
                    ? `bg-gray-700 text-white border-gray-600 ${
                        errors.yearEstablished
                          ? "border-red-500"
                          : "focus:border-[#f05d23]"
                      }`
                    : `bg-gray-50 text-[#231812] border-gray-300 ${
                        errors.yearEstablished
                          ? "border-red-500"
                          : "focus:border-[#f05d23]"
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
                        : "focus:border-[#f05d23]"
                    }`
                  : `bg-gray-50 text-[#231812] border-gray-300 ${
                      errors.headquartersLocation
                        ? "border-red-500"
                        : "focus:border-[#f05d23]"
                    }`
              }`}
            >
              <Icon
                icon="mdi:map-marker"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#f05d23] w-5 h-5 z-10"
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
                options={countryOptions}
                placeholder="Select or type country"
                isSearchable
                isClearable
                styles={customStyles}
                className="w-full"
                classNamePrefix="dropdown"
              />
            </div>
            {errors.headquartersLocation && (
              <span className="mt-1 text-xs text-red-500 flex items-center">
                <Icon icon="mdi:alert-circle" className="mr-2 h-4 w-4" />
                {errors.headquartersLocation}
              </span>
            )}
          </div>

          <div className="relative">
            <label
              htmlFor="registeredOfficeAddress"
              className="block text-sm font-medium mb-1"
            >
              Registered Office <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <Icon
                icon="house"
                className="absolute left-3 text-[#f05d23] w-3 h-3"
              />
              <input
                type="text"
                name="registeredOfficeAddress"
                id="registeredOfficeAddress"
                value={formData.registeredOfficeAddress}
                onChange={handleInputChange}
                placeholder="e.g., 123 Main St, Nairobi, Kenya"
                required
                className={`
      w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition-all duration-200
      ${
        mode === "dark"
          ? `bg-gray-700 text-white border-gray-600 ${
              errors.registeredOfficeAddress
                ? "border-red-500"
                : "focus:border-[#f05d23]"
            }`
          : `bg-gray-50 text-[#231812] border-gray-300 ${
              errors.registeredOfficeAddress
                ? "border-red-500"
                : "focus:border-[#f05d23]"
            }`
      }
    `}
              />
            </div>

            {errors.registeredOfficeAddress && (
              <span className="mt-1 text-xs text-red-500 flex items-center">
                <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />
                {errors.registeredOfficeAddress}
              </span>
            )}
          </div>

          <div className="relative w-full">
            <label
              htmlFor="websiteUrl"
              className="block text-sm font-medium mb-1"
            >
              Website URL <span className="text-red-500">*</span>
            </label>
            <div
              className={`flex items-center px-3 py-3 border rounded-lg shadow-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-[#f05d23] transition-all duration-200 ${
                mode === "dark"
                  ? `bg-gray-700 text-white border-gray-600 ${
                      errors.websiteUrl
                        ? "border-red-500"
                        : "focus-within:border-[#f05d23]"
                    }`
                  : `bg-gray-50 text-[#231812] border-gray-300 ${
                      errors.websiteUrl
                        ? "border-red-500"
                        : "focus-within:border-[#f05d23]"
                    }`
              }`}
            >
              <Icon icon="mdi:web" className="text-[#f05d23] w-5 h-5" />
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
                <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />
                {errors.websiteUrl}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold mt-8">Primary Contact Person</h3>

          <div className="relative">
            <label
              htmlFor="primaryContactName"
              className="block text-sm font-medium mb-1"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <Icon
                icon="mdi:user"
                className="absolute left-3 text-[#f05d23] w-5 h-5"
              />
              <input
                type="text"
                name="primaryContactName"
                id="primaryContactName"
                value={formData.primaryContactName}
                onChange={handleInputChange}
                placeholder="e.g., John Doe"
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition-all duration-200 ${
                  mode === "dark"
                    ? `bg-gray-700 text-white border-gray-600 ${
                        errors.primaryContactName
                          ? "border-red-500"
                          : "focus:border-[#f05d23]"
                      }`
                    : `bg-gray-50 text-[#231812] border-gray-300 ${
                        errors.primaryContactName
                          ? "border-red-500"
                          : "focus:border-[#f05d23]"
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

          <div className="relative">
            <label
              htmlFor="primaryContactRole"
              className="block text-sm font-medium mb-1"
            >
              Role/Title <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <Icon
                icon="mdi:briefcase"
                className="absolute left-3 text-[#f05d23] w-5 h-5"
              />
              <input
                type="text"
                name="primaryContactRole"
                id="primaryContactRole"
                value={formData.primaryContactRole}
                onChange={handleInputChange}
                placeholder="e.g., CEO"
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition-all duration-200 ${
                  mode === "dark"
                    ? `bg-gray-700 text-white border-gray-600 ${
                        errors.primaryContactRole
                          ? "border-red-500"
                          : "focus:border-[#f05d23]"
                      }`
                    : `bg-gray-50 text-[#231812] border-gray-300 ${
                        errors.primaryContactRole
                          ? "border-red-500"
                          : "focus:border-[#f05d23]"
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

          <div className="relative">
            <label
              htmlFor="primaryContactEmail"
              className="block text-sm font-medium mb-1"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <Icon
                icon="mdi:email"
                className="absolute left-3 text-[#f05d23] w-5 h-5"
              />
              <input
                type="email"
                name="primaryContactEmail"
                id="primaryContactEmail"
                value={formData.primaryContactEmail}
                onChange={handleInputChange}
                placeholder="e.g., john.doe@example.com"
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition-all duration-200 ${
                  mode === "dark"
                    ? `bg-gray-700 text-white border-gray-600 ${
                        errors.primaryContactEmail
                          ? "border-red-500"
                          : "focus:border-[#f05d23]"
                      }`
                    : `bg-gray-50 text-[#231812] border-gray-300 ${
                        errors.primaryContactEmail
                          ? "border-red-500"
                          : "focus:border-[#f05d23]"
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

          <div className="relative">
            <label
              htmlFor="primaryContactPhone"
              className="block text-sm font-medium mb-1"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <Icon
                icon="mdi:phone"
                className="absolute left-3 text-[#f05d23] w-5 h-5"
              />
              <input
                type="tel"
                name="primaryContactPhone"
                id="primaryContactPhone"
                value={formData.primaryContactPhone}
                onChange={handleInputChange}
                placeholder="e.g., +254 701 850 850"
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition-all duration-200 ${
                  mode === "dark"
                    ? `bg-gray-700 text-white border-gray-600 ${
                        errors.primaryContactPhone
                          ? "border-red-500"
                          : "focus:border-[#f05d23]"
                      }`
                    : `bg-gray-50 text-[#231812] border-gray-300 ${
                        errors.primaryContactPhone
                          ? "border-red-500"
                          : "focus:border-[#f05d23]"
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

          <div className="relative">
            <label
              htmlFor="primaryContactLinkedin"
              className="block text-sm font-medium mb-1"
            >
              LinkedIn URL <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <Icon
                icon="mdi:linkedin"
                className="absolute left-3 text-[#f05d23] w-5 h-5"
              />
              <input
                type="text"
                name="primaryContactLinkedin"
                id="primaryContactLinkedin"
                value={formData.primaryContactLinkedin}
                onChange={handleInputChange}
                placeholder="e.g., https://linkedin.com/in/johndoe"
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition-all duration-200 ${
                  mode === "dark"
                    ? `bg-gray-700 text-white border-gray-600 ${
                        errors.primaryContactLinkedin
                          ? "border-red-500"
                          : "focus:border-[#f05d23]"
                      }`
                    : `bg-gray-50 text-[#231812] border-gray-300 ${
                        errors.primaryContactLinkedin
                          ? "border-red-500"
                          : "focus:border-[#f05d23]"
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

          <div className="relative">
            <label className="block text-sm font-medium mb-1">
              Applying for <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <Icon
                icon="mdi:briefcase"
                className="absolute left-3 text-[#f05d23] w-5 h-5"
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
                    : "bg-gray-100 border-gray-300 text-gray-500"
                }`}
              />
            </div>
            {!formData.opening && (
              <div className="text-center mt-2">
                <Link href="/" className="text-[#f05d23] underline">
                  Click here to return to the landing page
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Instructions Modal */}

      <ItemActionModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
        title="Application Instructions"
        mode={mode}
      >
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Icon icon="lucide:file-text" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                Prepare for Your Application
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get ready in just 10 minutes
              </p>
            </div>
          </div>

          {/* Required Documents Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon
                icon="lucide:folder-open"
                className="w-5 h-5 text-blue-500"
              />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                Required Documents (PDF Format)
              </h4>
            </div>

            <div className="grid gap-3">
              {[
                {
                  icon: "lucide:building-2",
                  title: "Company Registration Certificate",
                  description: "Official business registration document",
                },
                {
                  icon: "lucide:briefcase",
                  title: "Portfolio",
                  description:
                    "Examples of your agency's previous work or projects",
                },
                {
                  icon: "lucide:user-check",
                  title: "Agency Profile",
                  description: "Overview of capabilities, team, and services",
                },
                {
                  icon: "lucide:receipt",
                  title: "Tax Registration Certificate",
                  description:
                    "Tax documentation per your country's requirements",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
                >
                  <div className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm">
                    <Icon icon={item.icon} className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {item.title}
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Process Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon icon="lucide:info" className="w-5 h-5 text-blue-500" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                What to Expect
              </h4>
            </div>

            <div className="space-y-3">
              {[
                {
                  icon: "lucide:clock",
                  text: "Complete registration in approximately 10 minutes",
                  highlight: "10 minutes",
                },
                {
                  icon: "lucide:save",
                  text: "Progress automatically saved for same-device resume",
                  highlight: "automatically saved",
                },
                {
                  icon: "lucide:check-circle",
                  text: "Ensure all required fields are completed before submission",
                  highlight: "required fields",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Icon
                    icon={item.icon}
                    className="w-4 h-4 text-blue-500 flex-shrink-0"
                  />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {item.text.split(item.highlight).map((part, i) =>
                      i === 0 ? (
                        part
                      ) : (
                        <span key={i}>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {item.highlight}
                          </span>
                          {part}
                        </span>
                      )
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-orange-50 dark:from-blue-900/20 dark:to-orange-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Icon
                icon="lucide:help-circle"
                className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Need assistance? We're here to help!
                </p>
                <a
                  href="mailto:membership@paan.africa"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <Icon icon="lucide:mail" className="w-4 h-4" />
                  membership@paan.africa
                </a>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsInstructionsOpen(false)}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                setIsInstructionsOpen(false);
                // Add logic to proceed to application
              }}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <span>Start Application</span>
              <Icon icon="lucide:arrow-right" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </ItemActionModal>
    </div>
  );
}