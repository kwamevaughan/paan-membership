import React, { useState } from "react";
import { Icon } from "@iconify/react";

const ResourceForm = ({
  formData,
  handleInputChange,
  submitForm,
  cancelForm,
  isEditing,
  mode,
}) => {
  const resourceTypes = ["PDF", "Video", "Workshop"];
  const validTiers = ["Associate Member", "Full Member", "Gold Member", "Free Member", "All"];
  const [errors, setErrors] = useState({});
  const [resourceSource, setResourceSource] = useState(
    formData.video_url ? "video" : formData.file_path ? "file" : "file"
  );

  const validateForm = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!resourceTypes.includes(formData.resource_type))
      newErrors.resource_type = "Please select a valid resource type";
    if (!validTiers.includes(formData.tier_restriction))
      newErrors.tier_restriction = "Please select a valid tier restriction";
    if (resourceSource === "file" && !formData.file && !formData.file_path)
      newErrors.file = "Please upload a PDF file";
    if (resourceSource === "video" && !formData.video_url)
      newErrors.video_url = "Video URL is required";
    else if (
      resourceSource === "video" &&
      !(
        formData.video_url.startsWith("https://www.youtube.com/") ||
        formData.video_url.startsWith("https://youtu.be/") ||
        formData.video_url.startsWith("https://vimeo.com/")
      )
    )
      newErrors.video_url = "URL must be a valid YouTube or Vimeo link";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    submitForm(e);
  };

  const handleSourceChange = (e) => {
    const newSource = e.target.value;
    setResourceSource(newSource);
    // Reset file and video_url in parent's formData
    handleInputChange({
      target: { name: "file", value: null },
    });
    handleInputChange({
      target: { name: "file_path", value: "" },
    });
    handleInputChange({
      target: { name: "video_url", value: "" },
    });
    setErrors((prev) => ({ ...prev, file: "", video_url: "" }));
  };

  console.log("[ResourceForm] formData:", formData);
  console.log("[ResourceForm] resourceSource:", resourceSource);

  return (
    <div
      className={`rounded-2xl shadow-xl p-6 ${
        mode === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? "Edit Resource" : "Add New Resource"}
      </h2>
      <form onSubmit={validateForm} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-lg border text-sm ${
              mode === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            } focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.title ? "border-red-500" : ""
            }`}
            placeholder="Enter resource title"
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description
          </label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className={`mt-1 block w-full rounded-lg border text-sm ${
              mode === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            } focus:ring-indigo-500 focus:border-indigo-500`}
            placeholder="Enter resource description"
          />
        </div>

        <div>
          <label
            htmlFor="resource_type"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Resource Type
          </label>
          <select
            name="resource_type"
            id="resource_type"
            value={formData.resource_type}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-lg border text-sm ${
              mode === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            } focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.resource_type ? "border-red-500" : ""
            }`}
          >
            {resourceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.resource_type && (
            <p className="text-red-500 text-xs mt-1">{errors.resource_type}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="tier_restriction"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Tier Restriction
          </label>
          <select
            name="tier_restriction"
            id="tier_restriction"
            value={formData.tier_restriction}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-lg border text-sm ${
              mode === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            } focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.tier_restriction ? "border-red-500" : ""
            }`}
          >
            {validTiers.map((tier) => (
              <option key={tier} value={tier}>
                {tier === "All" ? "All Members" : tier}
              </option>
            ))}
          </select>
          {errors.tier_restriction && (
            <p className="text-red-500 text-xs mt-1">
              {errors.tier_restriction}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Resource Source
          </label>
          <div className="mt-2 flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="resourceSource"
                value="file"
                checked={resourceSource === "file"}
                onChange={handleSourceChange}
                className="mr-2"
              />
              Downloadable File (PDF)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="resourceSource"
                value="video"
                checked={resourceSource === "video"}
                onChange={handleSourceChange}
                className="mr-2"
              />
              Video Link (YouTube/Vimeo)
            </label>
          </div>
        </div>

        {resourceSource === "file" && (
          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Upload PDF
            </label>
            <input
              type="file"
              name="file"
              id="file"
              accept="application/pdf"
              onChange={(e) =>
                handleInputChange({
                  target: { name: "file", value: e.target.files[0] },
                })
              }
              className={`mt-1 block w-full text-sm ${
                mode === "dark" ? "text-white" : "text-gray-900"
              } ${errors.file ? "border-red-500" : ""}`}
            />
            {formData.file_path && (
              <p className="text-sm text-gray-500 mt-1">
                Current file: {formData.file_path.split("/").pop()}
              </p>
            )}
            {errors.file && (
              <p className="text-red-500 text-xs mt-1">{errors.file}</p>
            )}
          </div>
        )}

        {resourceSource === "video" && (
          <div>
            <label
              htmlFor="video_url"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Video URL
            </label>
            <input
              type="url"
              name="video_url"
              id="video_url"
              value={formData.video_url}
              onChange={handleInputChange}
              placeholder="https://www.youtube.com/watch?v=..."
              className={`mt-1 block w-full rounded-lg border text-sm ${
                mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.video_url ? "border-red-500" : ""
              }`}
            />
            {errors.video_url && (
              <p className="text-red-500 text-xs mt-1">{errors.video_url}</p>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={cancelForm}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
          >
            <Icon icon="heroicons:x-mark" className="w-4 h-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            <Icon icon="heroicons:check" className="w-4 h-4 mr-2" />
            {isEditing ? "Update Resource" : "Add Resource"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResourceForm;
