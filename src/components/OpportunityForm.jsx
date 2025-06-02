import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";

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
        console.log(
          "[OpportunityForm] Fetched project types for Agency:",
          data
        );
        setProjectTypes(data.map((item) => item.name));
      }
      setLoading(false);
    }
    fetchProjectTypes();
  }, [jobType]);

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

  return (
    <form onSubmit={submitForm}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Job Type Selection */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600"
                required
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
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
                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Freelancer
              </span>
            </label>
          </div>
        </div>

        {/* Title */}
        <div className="col-span-1">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
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
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
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
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Location <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Icon
                icon="heroicons:map-pin"
                className="h-5 w-5 text-gray-400"
              />
            </div>
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location || ""}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
              placeholder="Enter location"
            />
            <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
          </div>
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {isFreelancer ? "Gig Description" : "Opportunity Description"}{" "}
            <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <div className="relative group">
            <textarea
              name="description"
              id="description"
              rows={4}
              value={formData.description || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
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
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Deadline <span className="text-rose-500">*</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Icon
                icon="heroicons:calendar"
                className="h-5 w-5 text-gray-400"
              />
            </div>
            <input
              type="date"
              name="deadline"
              id="deadline"
              value={formData.deadline || ""}
              onChange={handleInputChange}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
            <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
          </div>
        </div>

        {/* Membership Tier (Agency Only) */}
        {jobType === "Agency" && (
          <div className="col-span-1">
            <label
              htmlFor="tier_restriction"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
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
                className="appearance-none w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
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
                  className="h-5 w-5 text-gray-400"
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
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Skills Required{" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative group">
                <select
                  name="skills_required"
                  id="skills_required"
                  multiple
                  value={formData.skills_required || []}
                  onChange={handleSkillsChange}
                  className="appearance-none w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  {skillsOptions.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Hold Ctrl (Windows) or Cmd (Mac) to select multiple skills
              </p>
            </div>

            {/* Estimated Duration */}
            <div className="col-span-1">
              <label
                htmlFor="estimated_duration"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Estimated Duration{" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Icon
                    icon="heroicons:clock"
                    className="h-5 w-5 text-gray-400"
                  />
                </div>
                <input
                  type="text"
                  name="estimated_duration"
                  id="estimated_duration"
                  value={formData.estimated_duration || ""}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
                  placeholder="e.g., 2 weeks, 20 hours"
                />
                <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {/* Budget Range */}
            <div className="col-span-1">
              <label
                htmlFor="budget_range"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Budget Range{" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Icon
                    icon="heroicons:currency-dollar"
                    className="h-5 w-5 text-gray-400"
                  />
                </div>
                <input
                  type="text"
                  name="budget_range"
                  id="budget_range"
                  value={formData.budget_range || ""}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
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
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Remote Work Available
                </span>
              </label>
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
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Service Type <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Icon
                    icon="heroicons:briefcase"
                    className="h-5 w-5 text-gray-400"
                  />
                </div>
                <select
                  name="service_type"
                  id="service_type"
                  value={formData.service_type || ""}
                  onChange={handleInputChange}
                  required
                  className="appearance-none w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
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
                    className="h-5 w-5 text-gray-400"
                  />
                </div>
                <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {/* Industry */}
            <div className="col-span-1">
              <label
                htmlFor="industry"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Industry <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Icon
                    icon="heroicons:building-office"
                    className="h-5 w-5 text-gray-400"
                  />
                </div>
                <select
                  name="industry"
                  id="industry"
                  value={formData.industry || ""}
                  onChange={handleInputChange}
                  required
                  className="appearance-none w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
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
                    className="h-5 w-5 text-gray-400"
                  />
                </div>
                <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {/* Project Type */}
            <div className="col-span-1">
              <label
                htmlFor="project_type"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Project Type{" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Icon
                    icon="heroicons:document-text"
                    className="h-5 w-5 text-gray-400"
                  />
                </div>
                <select
                  name="project_type"
                  id="project_type"
                  value={formData.project_type || ""}
                  onChange={handleInputChange}
                  disabled={loading || projectTypes.length === 0}
                  className="appearance-none w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
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
                    className="h-5 w-5 text-gray-400"
                  />
                </div>
                <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>
          </div>
        )}

        {/* Application Link */}
        <div className="col-span-1">
          <label
            htmlFor="application_link"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Application Link{" "}
            <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Icon icon="heroicons:link" className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              name="application_link"
              id="application_link"
              value={formData.application_link || ""}
              onChange={handleInputChange}
              placeholder="https://example.com/apply"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
            />
            <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="mt-12 flex justify-end space-x-4">
        <button
          type="button"
          onClick={cancelForm}
          className="px-6 py-3 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center shadow-sm"
        >
          <Icon icon="heroicons:x-mark" className="h-4 w-4 mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 text-sm font-medium rounded-xl  text-white bg-gradient-to-r from-blue-200 to-blue-600 hover:from-blue-400 hover:to-blue-700 shadow-md transition-all duration-200 flex items-center"
          disabled={loading}
        >
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
  );
}
