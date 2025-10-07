import React, { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const ResourceForm = ({
  formData,
  handleInputChange,
  submitForm,
  cancelForm,
  isEditing,
  mode,
}) => {
  const resourceTypes = ["PDF", "Video", "Workshop", "Audio", "Other"];
  const validTiers = useMemo(() => [
    "Associate Member",
    "Full Member",
    "Gold Member",
    "Free Member",
  ], []);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resourceSource, setResourceSource] = useState(
    formData.video_url ? "video" : formData.file_path ? "file" : "file"
  );

  // Ensure tier_restriction is valid on mount
  useEffect(() => {
    if (!validTiers.includes(formData.tier_restriction)) {
      handleInputChange({
        target: { name: "tier_restriction", value: validTiers[0] }
      });
    }
  }, [formData.tier_restriction, handleInputChange, validTiers]);

  const validateForm = async (e) => {
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
    
    try {
      setIsSubmitting(true);
      const loadingToast = toast.loading(
        isEditing ? "Updating resource..." : "Creating resource..."
      );
      
      await submitForm(e);
      
      toast.success(
        isEditing ? "Resource updated successfully!" : "Resource created successfully!",
        { id: loadingToast }
      );
      
      // Close the modal after successful submission
      cancelForm();
    } catch (error) {
      toast.error(
        isEditing ? "Failed to update resource" : "Failed to create resource",
        { id: loadingToast }
      );
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSourceChange = (e) => {
    const newSource = e.target.value;
    setResourceSource(newSource);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl ${
        mode === "dark" 
          ? "bg-gray-800/90 backdrop-blur-sm" 
          : ""
      }`}
    >
      <div className="mb-8">
        
        <p className={`mt-2 text-sm ${
          mode === "dark" ? "text-gray-400" : "text-gray-500"
        }`}>
          Fill in the details below to {isEditing ? "update" : "create"} your resource.
        </p>
      </div>

      <form onSubmit={validateForm} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Title
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`block w-full rounded-xl border text-sm px-4 py-3 transition-all duration-200 ${
                    mode === "dark"
                      ? "bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                      : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  } ${errors.title ? "border-red-500" : ""}`}
                  placeholder="Enter resource title"
                />
                {errors.title && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-6 left-0 text-red-500 text-xs"
                  >
                    {errors.title}
                  </motion.p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Description
              </label>
              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`mt-1 block w-full rounded-xl border text-sm px-4 py-3 transition-all duration-200 ${
                  mode === "dark"
                    ? "bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                    : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                }`}
                placeholder="Enter resource description"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="resource_type"
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Resource Type
              </label>
              <select
                name="resource_type"
                id="resource_type"
                value={formData.resource_type}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-xl border text-sm px-4 py-3 transition-all duration-200 ${
                  mode === "dark"
                    ? "bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                    : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                } ${errors.resource_type ? "border-red-500" : ""}`}
              >
                {resourceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.resource_type && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-red-500 text-xs"
                >
                  {errors.resource_type}
                </motion.p>
              )}
            </div>

            <div>
              <label
                htmlFor="tier_restriction"
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Tier Restriction
              </label>
              <select
                name="tier_restriction"
                id="tier_restriction"
                value={formData.tier_restriction}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-xl border text-sm px-4 py-3 transition-all duration-200 ${
                  mode === "dark"
                    ? "bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                    : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                } ${errors.tier_restriction ? "border-red-500" : ""}`}
              >
                {validTiers.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier === "Free Member" ? "Free Member" : tier}
                  </option>
                ))}
              </select>
              {errors.tier_restriction && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-red-500 text-xs"
                >
                  {errors.tier_restriction}
                </motion.p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 space-y-6">
          <label className={`block text-sm font-medium ${
            mode === "dark" ? "text-gray-200" : "text-gray-700"
          }`}>
            Resource Source
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              resourceSource === "file"
                ? mode === "dark"
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-blue-500 bg-blue-50"
                : mode === "dark"
                ? "border-gray-700 hover:border-gray-600"
                : "border-gray-200 hover:border-gray-300"
            }`}>
              <input
                type="radio"
                name="resourceSource"
                value="file"
                checked={resourceSource === "file"}
                onChange={handleSourceChange}
                className="sr-only"
              />
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  resourceSource === "file"
                    ? "border-blue-500"
                    : "border-gray-400"
                }`}>
                  {resourceSource === "file" && (
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  )}
                </div>
                <span className={`ml-3 text-sm font-medium ${
                  mode === "dark" ? "text-gray-200" : "text-gray-700"
                }`}>
                  Downloadable File (PDF)
                </span>
              </div>
            </label>

            <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              resourceSource === "video"
                ? mode === "dark"
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-blue-500 bg-blue-50"
                : mode === "dark"
                ? "border-gray-700 hover:border-gray-600"
                : "border-gray-200 hover:border-gray-300"
            }`}>
              <input
                type="radio"
                name="resourceSource"
                value="video"
                checked={resourceSource === "video"}
                onChange={handleSourceChange}
                className="sr-only"
              />
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  resourceSource === "video"
                    ? "border-blue-500"
                    : "border-gray-400"
                }`}>
                  {resourceSource === "video" && (
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  )}
                </div>
                <span className={`ml-3 text-sm font-medium ${
                  mode === "dark" ? "text-gray-200" : "text-gray-700"
                }`}>
                  Video Link (YouTube/Vimeo)
                </span>
              </div>
            </label>
          </div>

          {resourceSource === "file" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <label
                htmlFor="file"
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Upload PDF
              </label>
              <div className="mt-1">
                <div className={`flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-xl transition-all duration-200 ${
                  mode === "dark"
                    ? "border-gray-600 hover:border-gray-500 bg-gray-700/50"
                    : "border-gray-300 hover:border-gray-400 bg-white"
                }`}>
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
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                {formData.file_path && (
                  <p className={`mt-2 text-sm ${
                    mode === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}>
                    Current file: {formData.file_path.split("/").pop()}
                  </p>
                )}
                {errors.file && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-red-500 text-xs"
                  >
                    {errors.file}
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}

          {resourceSource === "video" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <label
                htmlFor="video_url"
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-200" : "text-gray-700"
                }`}
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
                className={`mt-1 block w-full rounded-xl border text-sm px-4 py-3 transition-all duration-200 ${
                  mode === "dark"
                    ? "bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                    : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                } ${errors.video_url ? "border-red-500" : ""}`}
              />
              {errors.video_url && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-red-500 text-xs"
                >
                  {errors.video_url}
                </motion.p>
              )}
            </motion.div>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={cancelForm}
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
              mode === "dark"
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            <Icon icon="heroicons:x-mark" className="w-5 h-5" />
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 flex items-center space-x-2 ${
              isSubmitting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Icon icon="heroicons:check" className="w-5 h-5" />
                <span>{isEditing ? "Update Resource" : "Create Resource"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ResourceForm;
