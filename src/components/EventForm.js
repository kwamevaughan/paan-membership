import { useState } from "react";
import { Icon } from "@iconify/react";

export default function EventForm({
  formData,
  handleInputChange,
  submitForm,
  cancelForm,
  isEditing,
  tiers,
  mode,
}) {
  const eventTypes = ["Networking", "Workshop", "Conference", "Webinar"];
  const validTiers = ["Founding", "Full", "Associate", "All"];
  const [errors, setErrors] = useState({});

  const validateForm = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!eventTypes.includes(formData.event_type))
      newErrors.event_type = "Please select a valid event type";
    if (!formData.date) newErrors.date = "Date is required";
    if (!validTiers.includes(formData.tier_restriction))
      newErrors.tier_restriction = "Please select a valid tier restriction";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    submitForm(e);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 border-0 ${
        mode === "dark" ? "text-gray-200" : "text-gray-900"
      }`}
    >
      <h2 className="text-2xl font-semibold mb-6">
        {isEditing ? "Edit Event" : "Create New Event"}
      </h2>
      <form onSubmit={validateForm}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1.5">
              Event Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200 ${
                mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-white border-gray-300 text-gray-900"
              } ${errors.title ? "border-red-500" : ""}`}
              placeholder="Enter event title"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="event_type"
              className="block text-sm font-medium mb-1.5"
            >
              Event Type
            </label>
            <select
              id="event_type"
              name="event_type"
              value={formData.event_type || "Networking"}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200 ${
                mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-white border-gray-300 text-gray-900"
              } ${errors.event_type ? "border-red-500" : ""}`}
            >
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.event_type && (
              <p className="text-red-500 text-xs mt-1">{errors.event_type}</p>
            )}
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1.5">
              Date and Time
            </label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              value={formData.date ? formData.date.slice(0, 16) : ""}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200 ${
                mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-white border-gray-300 text-gray-900"
              } ${errors.date ? "border-red-500" : ""}`}
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="tier_restriction"
              className="block text-sm font-medium mb-1.5"
            >
              Tier Restriction
            </label>
            <select
              id="tier_restriction"
              name="tier_restriction"
              value={formData.tier_restriction || "Founding"}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200 ${
                mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-white border-gray-300 text-gray-900"
              } ${errors.tier_restriction ? "border-red-500" : ""}`}
            >
              <option value="Founding">Founding</option>
              <option value="Full">Full</option>
              <option value="Associate">Associate</option>
              <option value="All">All Members</option>
            </select>
            {errors.tier_restriction && (
              <p className="text-red-500 text-xs mt-1">
                {errors.tier_restriction}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium mb-1.5"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location || ""}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200 ${
                mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              placeholder="Enter location or 'Virtual'"
            />
          </div>
          <div>
            <label
              htmlFor="registration_link"
              className="block text-sm font-medium mb-1.5"
            >
              Registration Link
            </label>
            <input
              type="url"
              id="registration_link"
              name="registration_link"
              value={formData.registration_link || ""}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200 ${
                mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              placeholder="Enter registration link"
            />
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1.5"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200 ${
                mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              placeholder="Enter event description"
            />
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center text-sm font-medium">
              <input
                type="checkbox"
                name="is_virtual"
                checked={formData.is_virtual || false}
                onChange={handleInputChange}
                className={`mr-2 rounded border-gray-300 focus:ring-indigo-500 ${
                  mode === "dark" ? "bg-gray-700" : "bg-white"
                }`}
              />
              Virtual Event
            </label>
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={cancelForm}
            className="inline-flex items-center px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all duration-200"
          >
            <Icon icon="heroicons:arrow-left" className="w-5 h-5 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-xl shadow-sm transition-all duration-200 hover:shadow-lg hover:from-indigo-700 hover:to-purple-700"
          >
            <Icon
              icon={isEditing ? "heroicons:pencil-square" : "heroicons:plus"}
              className="w-5 h-5 mr-2"
            />
            {isEditing ? "Update Event" : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
}
