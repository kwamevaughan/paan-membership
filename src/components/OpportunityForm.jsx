import { Icon } from "@iconify/react";

export default function OpportunityForm({
  formData,
  handleInputChange,
  submitForm,
  cancelForm,
  isEditing,
  tiers,
  mode,
}) {
  return (
    <form onSubmit={submitForm}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Opportunity Title */}
        <div className="col-span-1">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Opportunity Title <span className="text-rose-500">*</span>
          </label>
          <div className="relative group">
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
              placeholder="Enter opportunity title"
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
            Location <span className="text-rose-500">*</span>
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
              value={formData.location}
              onChange={handleInputChange}
              required
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
            Description <span className="text-rose-500">*</span>
          </label>
          <div className="relative group">
            <textarea
              name="description"
              id="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
              placeholder="Describe the opportunity in detail"
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
              value={formData.deadline}
              onChange={handleInputChange}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
            <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
          </div>
        </div>

        {/* Membership Tier */}
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
              value={formData.tier_restriction}
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

        {/* Two columns in a row */}
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
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
                value={formData.service_type}
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
                value={formData.industry}
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
        </div>

        {/* Project Type */}
        <div className="col-span-1">
          <label
            htmlFor="project_type"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Project Type <span className="text-rose-500">*</span>
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
              value={formData.project_type}
              onChange={handleInputChange}
              required
              className="appearance-none w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Select Project Type</option>
              <option value="Advertising Campaign">Advertising Campaign</option>
              <option value="Software Development">Software Development</option>
              <option value="Consulting">Consulting</option>
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
          className="px-6 py-3 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all duration-200 flex items-center shadow-sm"
        >
          <Icon icon="heroicons:x-mark" className="h-4 w-4 mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 text-sm font-medium rounded-xl border border-transparent text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-all duration-200 flex items-center"
        >
          <Icon
            icon={isEditing ? "heroicons:pencil" : "heroicons:plus"}
            className="h-4 w-4 mr-2"
          />
          {isEditing ? "Update Opportunity" : "Create Opportunity"}
        </button>
      </div>
    </form>
  );
}
