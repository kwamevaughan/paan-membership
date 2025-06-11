import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";
import ItemActionModal from "@/components/ItemActionModal";
import { toast } from "react-hot-toast";

export default function OpportunityForm({
  formData,
  handleInputChange,
  submitForm,
  cancelForm,
  isEditing,
  tiers,
  mode,
}) {
  const [jobType, setJobType] = useState(formData.job_type || "Agency");
  const [projectTypes, setProjectTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifyMembers, setNotifyMembers] = useState(false);
  const [showNotificationConfirm, setShowNotificationConfirm] = useState(false);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    async function fetchProjectTypes() {
      if (jobType !== "Agency") {
        setProjectTypes([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("project_types")
        .select("name")
        .eq("job_type", "Agency")
        .order("name", { ascending: true });
      if (error) {
        console.error("[OpportunityForm] Error fetching project types:", error);
        setProjectTypes([]);
      } else {
        setProjectTypes(data.map((item) => item.name));
      }
      setLoading(false);
    }
    fetchProjectTypes();
  }, [jobType]);

  // Add effect to fetch member count when tier changes
  useEffect(() => {
    if (formData.tier_restriction) {
      fetchMemberCount(formData.tier_restriction);
    }
  }, [formData.tier_restriction]);

  const fetchMemberCount = async (tier) => {
    try {
      const response = await fetch(`/api/members/count?tier=${encodeURIComponent(tier)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch member count');
      }
      const data = await response.json();
      setMemberCount(data.count);
    } catch (error) {
      console.error('Error fetching member count:', error);
      setMemberCount(0);
    }
  };

  const handleJobTypeChange = (e) => {
    const newJobType = e.target.value;
    setJobType(newJobType);
    handleInputChange({ target: { name: "job_type", value: newJobType } });
    if (newJobType === "Freelancer") {
      handleInputChange({ target: { name: "tier_restriction", value: "" } });
      handleInputChange({ target: { name: "project_type", value: "" } });
    }
  };

  const handleSkillsChange = (e) => {
    const skills = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    handleInputChange({ target: { name: "skills_required", value: skills } });
  };

  const handleCheckboxChange = (e) => {
    handleInputChange({
      target: { name: e.target.name, value: e.target.checked },
    });
  };

  // Handle notification toggle
  const handleNotificationToggle = (e) => {
    if (e.target.checked) {
      setShowNotificationConfirm(true);
    } else {
      setNotifyMembers(false);
      handleInputChange({
        target: { name: "notify_members", value: false },
      });
    }
  };

  // Handle notification confirmation
  const handleNotificationConfirm = () => {
    setNotifyMembers(true);
    handleInputChange({
      target: { 
        name: "notify_members", 
        value: true 
      }
    });
    setShowNotificationConfirm(false);
  };

  // Handle notification cancel
  const handleNotificationCancel = () => {
    setNotifyMembers(false);
    handleInputChange({
      target: { 
        name: "notify_members", 
        value: false 
      }
    });
    setShowNotificationConfirm(false);
  };

  const skillsOptions = [
    "Graphic Design",
    "Copywriting",
    "Web Development",
    "SEO",
    "Video Editing",
    "Social Media Management",
    "UI/UX Design",
    "Data Analysis",
  ];

  const isFreelancer = jobType === "Freelancer";

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // If notifications are enabled, send them in the background
    if (notifyMembers) {
      // Don't await this - let it run in background
      fetch('/api/opportunities/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          tier_restriction: formData.tier_restriction,
          job_type: formData.job_type,
          project_type: formData.project_type,
          skills_required: formData.skills_required,
          location: formData.location,
          deadline: formData.deadline,
          budget: formData.budget,
          category: formData.category,
          tags: formData.tags
        }),
      }).catch(error => {
        console.error('Error sending notifications:', error);
        toast.error('Opportunity saved but notifications failed to send');
      });
    }

    // Submit the form
    submitForm(e);
  };

  return (
    <>
      <form onSubmit={handleFormSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Job Type Selection */}
          <div className="col-span-2">
            <label
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              } mb-1.5`} // Fixed mb-1.1 to mb-1.5
            >
              Job Type <span className="text-rose-500">*</span>
            </label>
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="job_type"
                  value="Agency"
                  checked={jobType === "Agency"}
                  onChange={handleJobTypeChange}
                  className={`h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 ${
                    mode === "dark"
                      ? "bg-gray-800 border-gray-600 focus:ring-indigo-400"
                      : ""
                  }`}
                  required
                />
                <span
                  className={`ml-2 text-sm ${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Agency
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="job_type"
                  value="Freelancer"
                  checked={jobType === "Freelancer"}
                  onChange={handleJobTypeChange}
                  className={`h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 ${
                    mode === "dark"
                      ? "bg-gray-800 border-gray-600 focus:ring-indigo-400"
                      : ""
                  }`}
                />
                <span
                  className={`ml-2 text-sm ${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Freelancer
                </span>
              </label>
            </div>
          </div>

          {/* Title */}
          <div className="col-span-1">
            <label
              htmlFor="title"
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              } mb-1.5`}
            >
              {isFreelancer ? "Gig Title" : "Opportunity Title"}{" "}
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title || ""}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 ${
                  mode === "dark"
                    ? "border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
                    : "border-gray-200 bg-white text-gray-900"
                }`}
                placeholder={
                  isFreelancer ? "Enter gig title" : "Enter opportunity title"
                }
              />
              <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          </div>

          {/* Location */}
          <div className="col-span-1">
            <label
              htmlFor="location"
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              } mb-1.5`}
            >
              Location <span className="text-xs text-gray-400">(optional)</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Icon
                  icon="heroicons:map-pin"
                  className={`h-5 w-5 ${
                    mode === "dark" ? "text-gray-300" : "text-gray-400"
                  }`}
                />
              </div>
              <input
                type="text"
                name="location"
                id="location"
                value={formData.location || ""}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 ${
                  mode === "dark"
                    ? "border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
                    : "border-gray-200 bg-white text-gray-900"
                }`}
                placeholder="Enter location"
              />
              <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label
              htmlFor="description"
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              } mb-1.5`}
            >
              {isFreelancer ? "Gig Description" : "Opportunity Description"}{" "}
              <span className="text-xs text-gray-400">(optional)</span>
            </label>
            <div className="relative group">
              <textarea
                name="description"
                id="description"
                rows={4}
                value={formData.description || ""}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 ${
                  mode === "dark"
                    ? "border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
                    : "border-gray-200 bg-white text-gray-900"
                }`}
                placeholder={
                  isFreelancer
                    ? "Describe the gig in detail"
                    : "Describe the opportunity in detail"
                }
              />
              <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          </div>

          {/* Deadline */}
          <div className="col-span-1">
            <label
              htmlFor="deadline"
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              } mb-1.5`}
            >
              Deadline <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Icon
                  icon="heroicons:calendar"
                  className={`h-5 w-5 ${
                    mode === "dark" ? "text-gray-300" : "text-gray-400"
                  }`}
                />
              </div>
              <input
                type="date"
                name="deadline"
                id="deadline"
                value={formData.deadline || ""}
                onChange={handleInputChange}
                required
                className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  mode === "dark"
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-gray-200 bg-white text-gray-900"
                }`}
              />
              <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          </div>

          {/* Membership Tier (Agency Only) */}
          {jobType === "Agency" && (
            <div className="col-span-1">
              <label
                htmlFor="tier_restriction"
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-1.5`}
              >
                Membership Tier <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <select
                  name="tier_restriction"
                  id="tier_restriction"
                  value={formData.tier_restriction || ""}
                  onChange={handleInputChange}
                  required
                  className={`appearance-none w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    mode === "dark"
                      ? "border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
                      : "border-gray-200 bg-white text-gray-900"
                  }`}
                >
                  <option value="">Select Tier</option>
                  {tiers.length > 0 &&
                    tiers.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Icon
                    icon="heroicons:chevron-down"
                    className={`h-5 w-5 ${
                      mode === "dark" ? "text-gray-300" : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>
          )}

          {/* Freelancer-Specific Fields */}
          {jobType === "Freelancer" && (
            <>
              {/* Skills Required */}
              <div className="col-span-2">
                <label
                  htmlFor="skills_required"
                  className={`block text-sm font-medium ${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  } mb-1.5`}
                >
                  Skills Required{" "}
                  <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <div className="relative group">
                  <select
                    name="skills_required"
                    id="skills_required"
                    multiple
                    value={formData.skills_required || []}
                    onChange={handleSkillsChange}
                    className={`appearance-none w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      mode === "dark"
                        ? "border-gray-700 bg-gray-800 text-white"
                        : "border-gray-200 bg-white text-gray-900"
                    }`}
                  >
                    {skillsOptions.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
                <p
                  className={`mt-1 text-xs ${
                    mode === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Hold Ctrl (Windows) or Cmd (Mac) to select multiple skills
                </p>
              </div>

              {/* Estimated Duration */}
              <div className="col-span-1">
                <label
                  htmlFor="estimated_duration"
                  className={`block text-sm font-medium ${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  } mb-1.5`}
                >
                  Estimated Duration{" "}
                  <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Icon
                      icon="heroicons:clock"
                      className={`h-5 w-5 ${
                        mode === "dark" ? "text-gray-300" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    type="text"
                    name="estimated_duration"
                    id="estimated_duration"
                    value={formData.estimated_duration || ""}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 ${
                      mode === "dark"
                        ? "border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
                        : "border-gray-200 bg-white text-gray-900"
                    }`}
                    placeholder="e.g., 2 weeks, 20 hours"
                  />
                  <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </div>

              {/* Budget Range */}
              <div className="col-span-1">
                <label
                  htmlFor="budget_range"
                  className={`block text-sm font-medium ${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  } mb-1.5`}
                >
                  Budget Range{" "}
                  <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Icon
                      icon="heroicons:currency-dollar"
                      className={`h-5 w-5 ${
                        mode === "dark" ? "text-gray-300" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    type="text"
                    name="budget_range"
                    id="budget_range"
                    value={formData.budget_range || ""}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 ${
                      mode === "dark"
                        ? "border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
                        : "border-gray-200 bg-white text-gray-900"
                    }`}
                    placeholder="e.g., $500-$1000"
                  />
                  <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </div>

              {/* Remote Work */}
              <div className="col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="remote_work"
                    checked={formData.remote_work || false}
                    onChange={handleCheckboxChange}
                    className={`h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 ${
                      mode === "dark"
                        ? "bg-gray-800 border-gray-600 focus:ring-indigo-400"
                        : ""
                    }`}
                  />
                  <span
                    className={`ml-2 text-sm ${
                      mode === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Remote Work Available
                  </span>
                </label>
              </div>

              {/* Application Link (Freelancer) */}
              <div className="col-span-1">
                <label
                  htmlFor="application_link"
                  className={`block text-sm font-medium ${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  } mb-1.5`}
                >
                  Application Link{" "}
                  <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Icon
                      icon="heroicons:link"
                      className={`h-5 w-5 ${
                        mode === "dark" ? "text-gray-300" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    type="url"
                    name="application_link"
                    id="application_link"
                    value={formData.application_link || ""}
                    onChange={handleInputChange}
                    placeholder="https://example.com/apply"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 ${
                      mode === "dark"
                        ? "border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
                        : "border-gray-200 bg-white text-gray-900"
                    }`}
                  />
                  <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </div>
            </>
          )}

          {/* Agency-Specific Fields */}
          {jobType === "Agency" && (
            <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Service Type */}
              <div className="col-span-1">
                <label
                  htmlFor="service_type"
                  className={`block text-sm font-medium ${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  } mb-1.5`}
                >
                  Service Type <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Icon
                      icon="heroicons:briefcase"
                      className={`h-5 w-5 ${
                        mode === "dark" ? "text-gray-300" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <select
                    name="service_type"
                    id="service_type"
                    value={formData.service_type || ""}
                    onChange={handleInputChange}
                    required
                    className={`appearance-none w-full pl-10 pr-10 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      mode === "dark"
                        ? "border-gray-700 bg-gray-800 text-white"
                        : "border-gray-200 bg-white text-gray-900"
                    }`}
                  >
                    <option value="">Select Service Type</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Communications">Communications</option>
                    <option value="Tech">Tech</option>
                    <option value="Design">Design</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Icon
                      icon="heroicons:chevron-down"
                      className={`h-5 w-5 ${
                        mode === "dark" ? "text-gray-300" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </div>

              {/* Industry */}
              <div className="col-span-1">
                <label
                  htmlFor="industry"
                  className={`block text-sm font-medium ${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  } mb-1.5`}
                >
                  Industry <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Icon
                      icon="heroicons:building-office"
                      className={`h-5 w-5 ${
                        mode === "dark" ? "text-gray-300" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <select
                    name="industry"
                    id="industry"
                    value={formData.industry || ""}
                    onChange={handleInputChange}
                    required
                    className={`appearance-none w-full pl-10 pr-10 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      mode === "dark"
                        ? "border-gray-700 bg-gray-800 text-white"
                        : "border-gray-200 bg-white text-gray-900"
                    }`}
                  >
                    <option value="">Select Industry</option>
                    <option value="Tech">Tech</option>
                    <option value="Education">Education</option>
                    <option value="Retail">Retail</option>
                    <option value="Health">Health</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Icon
                      icon="heroicons:chevron-down"
                      className={`h-5 w-5 ${
                        mode === "dark" ? "text-gray-300" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </div>

              {/* Project Type and Application Link */}
              <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Project Type */}
                <div className="col-span-1">
                  <label
                    htmlFor="project_type"
                    className={`block text-sm font-medium ${
                      mode === "dark" ? "text-gray-300" : "text-gray-700"
                    } mb-1.5`}
                  >
                    Project Type{" "}
                    <span className="text-xs text-gray-400">(optional)</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Icon
                        icon="heroicons:document-text"
                        className={`h-5 w-5 ${
                          mode === "dark" ? "text-gray-300" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <select
                      name="project_type"
                      id="project_type"
                      value={formData.project_type || ""}
                      onChange={handleInputChange}
                      disabled={loading || projectTypes.length === 0}
                      className={`appearance-none w-full pl-10 pr-10 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                        mode === "dark"
                          ? "border-gray-700 bg-gray-800 text-white"
                          : "border-gray-200 bg-white text-gray-900"
                      } ${
                        loading || projectTypes.length === 0
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <option value="">
                        {loading
                          ? "Loading..."
                          : projectTypes.length === 0
                          ? "No project types available"
                          : "Select Project Type"}
                      </option>
                      {projectTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Icon
                        icon="heroicons:chevron-down"
                        className={`h-5 w-5 ${
                          mode === "dark" ? "text-gray-300" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                </div>

                {/* Application Link (Agency) */}
                <div className="col-span-1">
                  <label
                    htmlFor="application_link"
                    className={`block text-sm font-medium ${
                      mode === "dark" ? "text-gray-300" : "text-gray-700"
                    } mb-1.5`}
                  >
                    Application Link{" "}
                    <span className="text-xs text-gray-400">(optional)</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Icon
                        icon="heroicons:link"
                        className={`h-5 w-5 ${
                          mode === "dark" ? "text-gray-300" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <input
                      type="url"
                      name="application_link"
                      id="application_link"
                      value={formData.application_link || ""}
                      onChange={handleInputChange}
                      placeholder="https://example.com/apply"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 ${
                        mode === "dark"
                          ? "border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
                          : "border-gray-200 bg-white text-gray-900"
                      }`}
                    />
                    <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notify Members Checkbox */}
          <div className="col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notify_members"
                name="notify_members"
                checked={notifyMembers}
                onChange={handleNotificationToggle}
                className={`h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 ${
                  mode === "dark"
                    ? "bg-gray-800 border-gray-600 focus:ring-indigo-400"
                    : ""
                }`}
              />
              <label
                htmlFor="notify_members"
                className={`ml-2 block text-sm ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Notify Members
              </label>
            </div>
            <p className={`mt-1 text-sm ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>
              {memberCount > 0 ? (
                <span>
                  {memberCount} member{memberCount !== 1 ? 's' : ''} in the {formData.tier_restriction} tier will be notified
                </span>
              ) : (
                "Send a notification to all members in the selected tier about this opportunity"
              )}
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="col-span-2 mt-12 flex justify-end space-x-4">
          <button
            type="button"
            onClick={cancelForm}
            className={`px-6 py-3 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center shadow-sm ${
              mode === "dark"
                ? "border-gray-600 text-gray-200 bg-gray-800 hover:bg-gray-700"
                : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
            }`}
          >
            <Icon icon="heroicons:x-mark" className="h-4 w-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            className={`px-6 py-3 text-sm font-medium rounded-xl text-white shadow-md transition-all duration-200 flex items-center ${
              mode === "dark"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900"
                : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={loading}
          >
            {" "}
            <Icon
              icon={isEditing ? "heroicons:pencil" : "heroicons:plus"}
              className="h-4 w-4 mr-2"
            />
            {isEditing
              ? `Update ${isFreelancer ? "Gig" : "Opportunity"}`
              : `Create ${isFreelancer ? "Gig" : "Opportunity"}`}
          </button>
        </div>
      </form>

      {/* Notification Confirmation Modal */}
      <ItemActionModal
        isOpen={showNotificationConfirm}
        onClose={handleNotificationCancel}
        title="Confirm Member Notification"
        mode={mode}
      >
        <div className="space-y-6">
          <p className={`text-sm ${
            mode === "dark" ? "text-gray-300" : "text-gray-600"
          }`}>
            Are you sure you want to notify all members in the selected tier about this opportunity? This will send an email notification to all eligible members.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleNotificationCancel}
              className={`px-6 py-3 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center shadow-sm ${
                mode === "dark"
                  ? "border-gray-600 text-gray-200 bg-gray-800 hover:bg-gray-700"
                  : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              <Icon icon="heroicons:x-mark" className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleNotificationConfirm}
              className={`px-6 py-3 text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 flex items-center shadow-sm ${
                mode === "dark" ? "shadow-white/10" : "shadow-gray-200"
              }`}
            >
              <Icon icon="heroicons:bell" className="h-4 w-4 mr-2" />
              Notify Members
            </button>
          </div>
        </div>
      </ItemActionModal>
    </>
  );
}