import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export default function AddCandidateModal({
  isOpen,
  onClose,
  onCandidateAdded,
  mode,
  openings = [],
}) {
  const [candidateType, setCandidateType] = useState("agency");
  const [formData, setFormData] = useState({
    // Primary Contact
    primaryContactName: "",
    primaryContactEmail: "",
    primaryContactPhone: "",
    primaryContactRole: "",
    primaryContactLinkedin: "",
    
    // Agency Information
    agencyName: "",
    yearEstablished: "",
    headquartersLocation: "",
    websiteUrl: "",
    
    // Secondary Contact (Agency only)
    secondaryContactName: "",
    secondaryContactRole: "",
    secondaryContactEmail: "",
    secondaryContactPhone: "",
    
    // Freelancer Information
    countryOfResidence: "",
    
    // Common fields
    opening: "",
    selected_tier: "Free Member (Tier 1)",
    status: "Pending",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const tierOptions = [
    "Free Member (Tier 1)",
    "Associate Member (Tier 2)",
    "Full Member (Tier 3)",
    "Gold Member (Tier 4)",
  ];

  const candidateTypes = [
    { value: "agency", label: "Agency", icon: "mdi:office-building" },
    { value: "freelancer", label: "Freelancer", icon: "mdi:briefcase" },
  ];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        primaryContactName: "",
        primaryContactEmail: "",
        primaryContactPhone: "",
        primaryContactRole: "",
        primaryContactLinkedin: "",
        agencyName: "",
        yearEstablished: "",
        headquartersLocation: "",
        websiteUrl: "",
        secondaryContactName: "",
        secondaryContactRole: "",
        secondaryContactEmail: "",
        secondaryContactPhone: "",
        countryOfResidence: "",
        opening: "",
        selected_tier: "Free Member (Tier 1)",
        status: "Pending",
      });
      setErrors({});
      setCandidateType("agency");
    }
  }, [isOpen]);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      return () => document.removeEventListener("keydown", handleEscapeKey);
    }
  }, [isOpen, onClose]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields for all types
    if (!formData.primaryContactName.trim()) {
      newErrors.primaryContactName = "Name is required";
    }
    if (!formData.primaryContactEmail.trim()) {
      newErrors.primaryContactEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.primaryContactEmail)) {
      newErrors.primaryContactEmail = "Please enter a valid email address";
    }
    if (!formData.opening) {
      newErrors.opening = "Please select a position";
    }
    
    // Agency-specific required fields
    if (candidateType === "agency") {
      if (!formData.agencyName.trim()) {
        newErrors.agencyName = "Agency name is required";
      }
      if (!formData.headquartersLocation.trim()) {
        newErrors.headquartersLocation = "Headquarters location is required";
      }
    }
    
    // Freelancer-specific required fields
    if (candidateType === "freelancer") {
      if (!formData.countryOfResidence.trim()) {
        newErrors.countryOfResidence = "Country of residence is required";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);
    const savingToast = toast.loading("Creating candidate...");

    try {
      // Prepare data for insertion
      const candidateData = {
        primaryContactName: formData.primaryContactName.trim(),
        primaryContactEmail: formData.primaryContactEmail.trim(),
        primaryContactPhone: formData.primaryContactPhone.trim() || null,
        primaryContactRole: candidateType === "agency" ? formData.primaryContactRole.trim() || null : null,
        primaryContactLinkedin: formData.primaryContactLinkedin.trim() || null,
        opening: formData.opening.trim(),
        selected_tier: formData.selected_tier,
        job_type: candidateType,
      };

      // Add type-specific fields
      if (candidateType === "agency") {
        candidateData.agencyName = formData.agencyName.trim();
        candidateData.yearEstablished = formData.yearEstablished.trim() || null;
        candidateData.headquartersLocation = formData.headquartersLocation.trim();
        candidateData.websiteUrl = formData.websiteUrl.trim() || null;
        candidateData.secondaryContactName = formData.secondaryContactName.trim() || null;
        candidateData.secondaryContactRole = formData.secondaryContactRole.trim() || null;
        candidateData.secondaryContactEmail = formData.secondaryContactEmail.trim() || null;
        candidateData.secondaryContactPhone = formData.secondaryContactPhone.trim() || null;
      } else if (candidateType === "freelancer") {
        candidateData.countryOfResidence = formData.countryOfResidence.trim();
      }

      const { data, error } = await supabase
        .from("candidates")
        .insert([candidateData])
        .select()
        .single();

      if (error) throw error;

      toast.success("Candidate created successfully!", { id: savingToast });
      
      if (onCandidateAdded) {
        onCandidateAdded(data);
      }
      
      onClose();
    } catch (err) {
      console.error("Failed to create candidate", err);
      toast.error("Failed to create candidate. Please try again.", { id: savingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormField = (field, label, type = "text", placeholder = "", required = false, icon = "mdi:form") => {
    return (
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Icon icon={icon} className="w-4 h-4 text-paan-blue" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          value={formData[field] || ""}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-paan-blue/20 focus:border-paan-blue ${
            errors[field]
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
              : mode === "dark"
              ? "bg-gray-700/80 border-gray-600/50 text-white placeholder-gray-400"
              : "bg-white border-gray-300/60 text-gray-800 placeholder-gray-500"
          }`}
        />
        {errors[field] && (
          <p className="text-red-500 text-xs flex items-center gap-1">
            <Icon icon="mdi:alert-circle" className="w-3 h-3" />
            {errors[field]}
          </p>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 999999 }}>
      {/* Enhanced Glassmorphic Background */}
      <div
        className={`fixed inset-0 transition-all duration-500 backdrop-blur-sm
          ${
            mode === "dark"
              ? "bg-gradient-to-br from-slate-900/20 via-blue-900/10 to-blue-900/20"
              : "bg-gradient-to-br from-white/20 via-blue-50/30 to-blue-50/20"
          }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0, 123, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(100, 149, 237, 0.1) 0%, transparent 50%)
          `,
        }}
      />

      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full max-w-4xl rounded-3xl transform transition-all duration-500 max-h-[90vh] overflow-hidden
            shadow-2xl shadow-black/20
            ${
              mode === "dark"
                ? "bg-gray-900/40 text-white border border-white/10"
                : "bg-white/30 text-gray-900 border border-white/20"
            } 
            backdrop-blur-lg`}
          style={{
            backdropFilter: "blur(12px) saturate(180%)",
            WebkitBackdropFilter: "blur(12px) saturate(180%)",
            background:
              mode === "dark"
                ? "linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.3) 100%)"
                : "bg-gradient-to-br from-white/20 via-blue-50/30 to-blue-50/20",
          }}
        >
          {/* Header */}
          <div className="relative px-8 py-4 overflow-hidden bg-gradient-to-r from-blue-300 to-sky-600">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-xl transform -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-lg transform translate-x-12 translate-y-12"></div>
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-full shadow-md">
                  <Icon icon="mdi:account-plus" className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-medium text-white">Add New Candidate</h2>
                  <p className="text-white/90 text-sm">Create a new candidate profile</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="group p-3 rounded-2xl transition-all duration-300 hover:bg-white/20 hover:scale-110 active:scale-95"
                style={{
                  backdropFilter: "blur(4px)",
                  background: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <Icon
                  icon="heroicons:x-mark"
                  className="h-6 w-6 text-white transition-transform duration-300 group-hover:rotate-90"
                />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Candidate Type Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Icon icon="mdi:account-group" className="w-5 h-5 text-paan-blue" />
                  Candidate Type
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidateTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                        candidateType === type.value
                          ? `ring-2 ring-offset-2 ${
                              mode === "dark"
                                ? "ring-blue-400 ring-offset-gray-900"
                                : "ring-blue-400 ring-offset-white"
                            }`
                          : `${
                              mode === "dark"
                                ? "bg-gray-700/80 hover:bg-gray-750/90"
                                : "bg-white/80 hover:bg-gray-50/90"
                            } border ${
                              mode === "dark"
                                ? "border-gray-700/50"
                                : "border-gray-200/50"
                            }`
                      } shadow-md hover:shadow-lg`}
                    >
                      <input
                        type="radio"
                        name="candidateType"
                        value={type.value}
                        checked={candidateType === type.value}
                        onChange={(e) => setCandidateType(e.target.value)}
                        className="hidden"
                      />
                      <div className="flex items-center gap-3">
                        <Icon icon={type.icon} className="w-6 h-6 text-paan-blue" />
                        <span className="font-medium">{type.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Primary Contact Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Icon icon="mdi:account-star" className="w-5 h-5 text-paan-blue" />
                  Primary Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFormField(
                    "primaryContactName",
                    candidateType === "agency" ? "Contact Name" : "Full Name",
                    "text",
                    "Enter full name",
                    true,
                    "mdi:account"
                  )}
                  {candidateType === "agency" && renderFormField(
                    "primaryContactRole",
                    "Role/Title",
                    "text",
                    "e.g., CEO, Director",
                    false,
                    "mdi:briefcase"
                  )}
                  {renderFormField(
                    "primaryContactEmail",
                    "Email Address",
                    "email",
                    "Enter email address",
                    true,
                    "mdi:email"
                  )}
                  {renderFormField(
                    "primaryContactPhone",
                    "Phone Number",
                    "tel",
                    "Enter phone number",
                    false,
                    "mdi:phone"
                  )}
                  {renderFormField(
                    "primaryContactLinkedin",
                    "LinkedIn Profile",
                    "url",
                    "https://linkedin.com/in/username",
                    false,
                    "mdi:linkedin"
                  )}
                </div>
              </div>

              {/* Agency Information */}
              {candidateType === "agency" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Icon icon="mdi:office-building" className="w-5 h-5 text-paan-blue" />
                    Agency Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderFormField(
                      "agencyName",
                      "Agency Name",
                      "text",
                      "Enter agency name",
                      true,
                      "mdi:office-building"
                    )}
                    {renderFormField(
                      "yearEstablished",
                      "Year Established",
                      "number",
                      "e.g., 2020",
                      false,
                      "mdi:calendar"
                    )}
                    {renderFormField(
                      "headquartersLocation",
                      "Headquarters Location",
                      "text",
                      "Enter city, country",
                      true,
                      "mdi:earth"
                    )}
                    {renderFormField(
                      "websiteUrl",
                      "Website URL",
                      "url",
                      "https://example.com",
                      false,
                      "mdi:web"
                    )}
                  </div>
                </div>
              )}

              {/* Freelancer Information */}
              {candidateType === "freelancer" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Icon icon="mdi:briefcase" className="w-5 h-5 text-paan-blue" />
                    Freelancer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderFormField(
                      "countryOfResidence",
                      "Country of Residence",
                      "text",
                      "Enter country",
                      true,
                      "mdi:earth"
                    )}
                  </div>
                </div>
              )}

              {/* Secondary Contact (Agency only) */}
              {candidateType === "agency" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Icon icon="mdi:account-multiple" className="w-5 h-5 text-paan-blue" />
                    Secondary Contact (Optional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderFormField(
                      "secondaryContactName",
                      "Name",
                      "text",
                      "Enter secondary contact name",
                      false,
                      "mdi:account"
                    )}
                    {renderFormField(
                      "secondaryContactRole",
                      "Role/Title",
                      "text",
                      "e.g., Manager, Coordinator",
                      false,
                      "mdi:briefcase"
                    )}
                    {renderFormField(
                      "secondaryContactEmail",
                      "Email Address",
                      "email",
                      "Enter secondary contact email",
                      false,
                      "mdi:email"
                    )}
                    {renderFormField(
                      "secondaryContactPhone",
                      "Phone Number",
                      "tel",
                      "Enter secondary contact phone",
                      false,
                      "mdi:phone"
                    )}
                  </div>
                </div>
              )}

              {/* Application Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Icon icon="mdi:file-document" className="w-5 h-5 text-paan-blue" />
                  Application Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Position/Opening Dropdown */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Icon icon="mdi:briefcase" className="w-4 h-4 text-paan-blue" />
                      Position/Opening
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.opening}
                      onChange={(e) => handleInputChange("opening", e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-paan-blue/20 focus:border-paan-blue ${
                        errors.opening
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : mode === "dark"
                          ? "bg-gray-700/80 border-gray-600/50 text-white"
                          : "bg-white border-gray-300/60 text-gray-800"
                      }`}
                    >
                      <option value="">Select a position...</option>
                      {openings.map((opening) => (
                        <option key={opening} value={opening}>
                          {opening}
                        </option>
                      ))}
                    </select>
                    {errors.opening && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <Icon icon="mdi:alert-circle" className="w-3 h-3" />
                        {errors.opening}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Icon icon="mdi:crown" className="w-4 h-4 text-paan-blue" />
                      Membership Tier
                    </label>
                    <select
                      value={formData.selected_tier}
                      onChange={(e) => handleInputChange("selected_tier", e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-paan-blue/20 focus:border-paan-blue ${
                        mode === "dark"
                          ? "bg-gray-700/80 border-gray-600/50 text-white"
                          : "bg-white border-gray-300/60 text-gray-800"
                      }`}
                    >
                      {tierOptions.map((tier) => (
                        <option key={tier} value={tier}>
                          {tier}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div
            className={`p-6 flex justify-end gap-3 border-t ${
              mode === "dark" ? "border-gray-700/50" : "border-gray-200/50"
            } ${
              mode === "dark" ? "bg-gray-800/60" : "bg-gray-50/60"
            } backdrop-blur-sm`}
          >
            <button
              onClick={onClose}
              className={`px-6 py-3 rounded-lg border font-medium transition-all duration-200
                ${
                  mode === "dark"
                    ? "border-gray-600/50 text-white hover:bg-gray-800/90 backdrop-blur-sm"
                    : "border-gray-300/50 text-gray-700 hover:bg-gray-100/90 backdrop-blur-sm"
                } shadow-md hover:shadow-lg`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105 active:scale-95 hover:shadow-xl"
              } bg-paan-blue text-white`}
            >
              <Icon
                icon={isSubmitting ? "mdi:loading" : "mdi:account-plus"}
                className={`w-4 h-4 ${isSubmitting ? "animate-spin" : ""}`}
              />
              {isSubmitting ? "Creating..." : "Create Candidate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
