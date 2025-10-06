import { Icon } from "@iconify/react";
import FileUpload from "@/components/common/FileUpload";
import Select from "react-select";
import { useEffect, useState } from "react";
import { useCountry } from "@/hooks/useCountry";

export default function RegularFormSection({
  formData,
  handleInputChange,
  mode,
  jobType,
  setJobType,
  handleJobTypeChange,
  handleSkillsChange,
  handleCheckboxChange,
  handleFileUpload,
  uploadedFile,
  setUploadedFile,
  loading,
  projectTypes,
  tiers,
  memberCount,
  notifyMembers,
  handleNotificationToggle,
  isEditing,
  isFreelancer,
}) {
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

  const { countryOptions, loading: countriesLoading } = useCountry();

  const selectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: mode === "dark" ? "#1f2937" : "#ffffff",
      borderColor: mode === "dark" ? "#374151" : "#e5e7eb",
      color: mode === "dark" ? "#f3f4f6" : "#111827",
      paddingLeft: "2.5rem",
      borderRadius: "0.75rem",
      minHeight: "3rem",
      boxShadow: "none",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: mode === "dark" ? "#1f2937" : "#ffffff",
      color: mode === "dark" ? "#f3f4f6" : "#111827",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? mode === "dark" ? "#374151" : "#f3f4f6"
        : state.isSelected
        ? "#3b82f6"
        : mode === "dark" ? "#1f2937" : "#ffffff",
      color: state.isSelected ? "#ffffff" : mode === "dark" ? "#f3f4f6" : "#111827",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: mode === "dark" ? "#f3f4f6" : "#111827",
    }),
    input: (provided) => ({
      ...provided,
      color: mode === "dark" ? "#f3f4f6" : "#111827",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: mode === "dark" ? "#9ca3af" : "#6b7280",
    }),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      {/* Job Type Selection */}
      <div className="col-span-2">
        <label className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
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
                mode === "dark" ? "bg-gray-800 border-gray-600 focus:ring-indigo-400" : ""
              }`}
              required
            />
            <span className={`ml-2 text-sm ${mode === "dark" ? "text-gray-300" : "text-gray-700"}`}>
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
                mode === "dark" ? "bg-gray-800 border-gray-600 focus:ring-indigo-400" : ""
              }`}
            />
            <span className={`ml-2 text-sm ${mode === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Freelancer
            </span>
          </label>
        </div>
      </div>

      {/* Title */}
      <div className="col-span-1">
        <label htmlFor={isFreelancer ? "gig_title" : "organization_name"} className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
          {isFreelancer ? "Gig Title" : "Opportunity Title"} <span className="text-rose-500">*</span>
        </label>
        <div className="relative group">
          <input
            type="text"
            name={isFreelancer ? "gig_title" : "organization_name"}
            id={isFreelancer ? "gig_title" : "organization_name"}
            value={isFreelancer ? formData.gig_title || "" : formData.organization_name || ""}
            onChange={handleInputChange}
            required
            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 ${
              mode === "dark" ? "border-gray-700 bg-gray-800 text-white placeholder:text-gray-500" : "border-gray-200 bg-white text-gray-900"
            }`}
            placeholder={isFreelancer ? "Enter gig title" : "Enter opportunity title"}
          />
          <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
      </div>

      {/* Location (Countries) */}
      <div className="col-span-1">
        <label htmlFor="location" className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
          Locations <span className="text-xs text-gray-400">(select one or more countries)</span>
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon icon="heroicons:map-pin" className={`h-5 w-5 ${mode === "dark" ? "text-gray-300" : "text-gray-400"}`} />
          </div>
          <Select
            inputId="location"
            value={formData.locations ? formData.locations.map(loc => ({
              label: loc,
              value: loc
            })) : []}
            onChange={(selectedOptions) => {
              handleInputChange({
                target: {
                  name: "locations",
                  value: selectedOptions ? selectedOptions.map(option => option.value) : []
                }
              });
            }}
            options={countryOptions}
            isMulti
            isClearable
            isSearchable
            isLoading={countriesLoading}
            placeholder="Select countries..."
            styles={{
              ...selectStyles,
              multiValue: (provided) => ({
                ...provided,
                backgroundColor: mode === 'dark' ? '#374151' : '#e5e7eb',
              }),
              multiValueLabel: (provided) => ({
                ...provided,
                color: mode === 'dark' ? '#f3f4f6' : '#111827',
              }),
              multiValueRemove: (provided) => ({
                ...provided,
                color: mode === 'dark' ? '#9ca3af' : '#6b7280',
                ':hover': {
                  backgroundColor: mode === 'dark' ? '#ef4444' : '#f87171',
                  color: 'white',
                },
              }),
            }}
            className="react-select-container"
            classNamePrefix="react-select"
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null,
            }}
          />
          <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
      </div>

      {/* Description */}
      <div className="col-span-2">
        <label htmlFor="description" className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
          {isFreelancer ? "Gig Description" : "Opportunity Description"} <span className="text-xs text-gray-400">(optional)</span>
        </label>
        <div className="relative group">
          <textarea
            name="description"
            id="description"
            rows={4}
            value={formData.description || ""}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 ${
              mode === "dark" ? "border-gray-700 bg-gray-800 text-white placeholder:text-gray-500" : "border-gray-200 bg-white text-gray-900"
            }`}
            placeholder={isFreelancer ? "Describe the gig in detail" : "Describe the opportunity in detail"}
          />
          <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
      </div>

      {/* Deadline */}
      <div className="col-span-1">
        <label htmlFor="deadline" className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
          Deadline <span className="text-rose-500">*</span>
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon icon="heroicons:calendar" className={`h-5 w-5 ${mode === "dark" ? "text-gray-300" : "text-gray-400"}`} />
          </div>
          <input
            type="date"
            name="deadline"
            id="deadline"
            value={formData.deadline || ""}
            onChange={handleInputChange}
            onClick={(e) => e.target.showPicker()}
            required
            className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
              mode === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-900"
            }`}
          />
          <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
      </div>

      {/* Membership Tier (Agency Only) */}
      {jobType === "Agency" && (
        <div className="col-span-1">
          <label htmlFor="tier_restriction" className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
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
                mode === "dark" ? "border-gray-700 bg-gray-800 text-white placeholder:text-gray-500" : "border-gray-200 bg-white text-gray-900"
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
              <Icon icon="heroicons:chevron-down" className={`h-5 w-5 ${mode === "dark" ? "text-gray-300" : "text-gray-400"}`} />
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
            <label htmlFor="skills_required" className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
              Skills Required <span className="text-xs text-gray-400">(optional)</span>
            </label>
            <div className="relative group">
              <select
                name="skills_required"
                id="skills_required"
                multiple
                value={formData.skills_required || []}
                onChange={handleSkillsChange}
                className={`appearance-none w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  mode === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-900"
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
            <p className={`mt-1 text-xs ${mode === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Hold Ctrl (Windows) or Cmd (Mac) to select multiple skills
            </p>
          </div>

          {/* Estimated Duration */}
          <div className="col-span-1">
            <label htmlFor="estimated_duration" className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
              Estimated Duration <span className="text-xs text-gray-400">(optional)</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Icon icon="heroicons:clock" className={`h-5 w-5 ${mode === "dark" ? "text-gray-300" : "text-gray-400"}`} />
              </div>
              <input
                type="text"
                name="estimated_duration"
                id="estimated_duration"
                value={formData.estimated_duration || ""}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 ${
                  mode === "dark" ? "border-gray-700 bg-gray-800 text-white placeholder:text-gray-500" : "border-gray-200 bg-white text-gray-900"
                }`}
                placeholder="e.g., 2 weeks, 20 hours"
              />
              <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          </div>

          {/* Budget Range */}
          <div className="col-span-1">
            <label htmlFor="budget_range" className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
              Budget Range <span className="text-xs text-gray-400">(optional)</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Icon icon="heroicons:currency-dollar" className={`h-5 w-5 ${mode === "dark" ? "text-gray-300" : "text-gray-400"}`} />
              </div>
              <input
                type="text"
                name="budget_range"
                id="budget_range"
                value={formData.budget_range || ""}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 ${
                  mode === "dark" ? "border-gray-700 bg-gray-800 text-white placeholder:text-gray-500" : "border-gray-200 bg-white text-gray-900"
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
                  mode === "dark" ? "bg-gray-800 border-gray-600 focus:ring-indigo-400" : ""
                }`}
              />
              <span className={`ml-2 text-sm ${mode === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Remote Work Available
              </span>
            </label>
          </div>

          {/* Application Link (Freelancer) */}
          <div className="col-span-1">
            <label htmlFor="application_link" className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
              Application Link <span className="text-xs text-gray-400">(optional)</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Icon icon="heroicons:link" className={`h-5 w-5 ${mode === "dark" ? "text-gray-300" : "text-gray-400"}`} />
              </div>
              <input
                type="url"
                name="application_link"
                id="application_link"
                value={formData.application_link || ""}
                onChange={handleInputChange}
                placeholder="https://example.com/apply"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 ${
                  mode === "dark" ? "border-gray-700 bg-gray-800 text-white placeholder:text-gray-500" : "border-gray-200 bg-white text-gray-900"
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
            <label htmlFor="service_type" className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
              Service Type <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Icon icon="heroicons:briefcase" className={`h-5 w-5 ${mode === "dark" ? "text-gray-300" : "text-gray-400"}`} />
              </div>
              <select
                name="service_type"
                id="service_type"
                value={formData.service_type || ""}
                onChange={handleInputChange}
                required
                className={`appearance-none w-full pl-10 pr-10 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  mode === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-900"
                }`}
              >
                <option value="">Select Service Type</option>
                <option value="Marketing">Marketing</option>
                <option value="Communications">Communications</option>
                <option value="Tech">Tech</option>
                <option value="Design">Design</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Icon icon="heroicons:chevron-down" className={`h-5 w-5 ${mode === "dark" ? "text-gray-300" : "text-gray-400"}`} />
              </div>
              <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          </div>

          {/* Industry */}
          <div className="col-span-1">
            <label htmlFor="industry" className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
              Industry <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Icon icon="heroicons:building-office" className={`h-5 w-5 ${mode === "dark" ? "text-gray-300" : "text-gray-400"}`} />
              </div>
              <select
                name="industry"
                id="industry"
                value={formData.industry || ""}
                onChange={handleInputChange}
                required
                className={`appearance-none w-full pl-10 pr-10 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  mode === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-900"
                }`}
              >
                <option value="">Select Industry</option>
                <option value="Tech">Tech</option>
                <option value="Education">Education</option>
                <option value="Retail">Retail</option>
                <option value="Health">Health</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Icon icon="heroicons:chevron-down" className={`h-5 w-5 ${mode === "dark" ? "text-gray-300" : "text-gray-400"}`} />
              </div>
              <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          </div>

          {/* Project Type and Application Link */}
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Project Type */}
            <div className="col-span-1">
              <label htmlFor="project_type" className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
                Project Type <span className="text-xs text-gray-400">(optional)</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Icon icon="heroicons:document-text" className={`h-5 w-5 ${mode === "dark" ? "text-gray-300" : "text-gray-400"}`} />
                </div>
                <select
                  name="project_type"
                  id="project_type"
                  value={formData.project_type || ""}
                  onChange={handleInputChange}
                  disabled={loading || projectTypes.length === 0}
                  className={`appearance-none w-full pl-10 pr-10 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    mode === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-900"
                  } ${loading || projectTypes.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <option value="">
                    {loading ? "Loading..." : projectTypes.length === 0 ? "No project types available" : "Select Project Type"}
                  </option>
                  {projectTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Icon icon="heroicons:chevron-down" className={`h-5 w-5 ${mode === "dark" ? "text-gray-300" : "text-gray-400"}`} />
                </div>
                <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {/* Application Link (Agency) */}
            <div className="col-span-1">
              <label htmlFor="application_link" className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
                Application Link <span className="text-xs text-gray-400">(optional)</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Icon icon="heroicons:link" className={`h-5 w-5 ${mode === "dark" ? "text-gray-300" : "text-gray-400"}`} />
                </div>
                <input
                  type="url"
                  name="application_link"
                  id="application_link"
                  value={formData.application_link || ""}
                  onChange={handleInputChange}
                  placeholder="https://example.com/apply"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 ${
                    mode === "dark" ? "border-gray-700 bg-gray-800 text-white placeholder:text-gray-500" : "border-gray-200 bg-white text-gray-900"
                  }`}
                />
                <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Section */}
      <div className="col-span-2">
        <label className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
          Attachment <span className="text-xs text-gray-400">(optional)</span>
        </label>
        <p className={`text-xs mb-3 ${mode === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          Upload RFP, project brief, or any supporting documents (PDF, Word, Excel, PowerPoint, ZIP files up to 50MB)
        </p>
        <FileUpload
          mode={mode}
          onFileUpload={handleFileUpload}
          uploadedFile={uploadedFile}
          setUploadedFile={setUploadedFile}
          label="Upload Document"
          placeholder="Choose file or drag and drop"
        />
      </div>

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
              mode === "dark" ? "bg-gray-800 border-gray-600 focus:ring-indigo-400" : ""
            }`}
          />
          <label htmlFor="notify_members" className={`ml-2 block text-sm ${mode === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            Notify Members
          </label>
        </div>
        <p className={`mt-1 text-sm ${mode === "dark" ? "text-gray-400" : "text-gray-500"}`}>
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
  );
} 