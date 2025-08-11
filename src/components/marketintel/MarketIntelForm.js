import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import ItemActionModal from "@/components/ItemActionModal";

export default function MarketIntelForm({
  mode,
  formData,
  handleInputChange,
  submitForm,
  cancelForm,
  isEditing,
}) {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const types = [
    "Report",
    "Analysis",
    "Regional Insight",
    "Data Visualization",
  ];

  const validTiers = useMemo(
    () => ["Associate Member", "Full Member", "Gold Member", "Free Member"],
    []
  );

  // Ensure tier_restriction is valid on mount
  useEffect(() => {
    if (!validTiers.includes(formData.tier_restriction)) {
      handleInputChange({
        target: { name: "tier_restriction", value: validTiers[0] },
      });
    }
  }, [formData.tier_restriction, handleInputChange, validTiers]);

  const validateForm = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.title) newErrors.title = "Title is required";
    if (!types.includes(formData.type))
      newErrors.type = "Please select a valid type";
    if (!validTiers.includes(formData.tier_restriction))
      newErrors.tier_restriction = "Please select a valid tier restriction";
    if (!formData.file && !formData.file_path)
      newErrors.file = "Please upload a PDF file";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      setIsSubmitting(true);
      const loadingToast = toast.loading(
        isEditing ? "Updating market intel..." : "Creating market intel..."
      );

      await submitForm(e);

      toast.success(
        isEditing
          ? "Market intel updated successfully!"
          : "Market intel created successfully!",
        { id: loadingToast }
      );

      // Close the modal after successful submission
      cancelForm();
    } catch (error) {
      toast.error(
        isEditing
          ? "Failed to update market intel"
          : "Failed to create market intel"
      );
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-2xl ${
          mode === "dark" ? "bg-gray-800/90 backdrop-blur-sm" : ""
        }`}
      >
        <div className="mb-8">
          <p
            className={`mt-2 text-sm ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Fill in the details below to {isEditing ? "update" : "create"} your
            market intel report.
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
                    value={formData.title || ""}
                    onChange={handleInputChange}
                    className={`block w-full rounded-xl border text-sm px-4 py-3 transition-all duration-200 ${
                      mode === "dark"
                        ? "bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                        : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    } ${errors.title ? "border-red-500" : ""}`}
                    placeholder="Enter market intel title"
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
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  rows={4}
                  className={`mt-1 block w-full rounded-xl border text-sm px-4 py-3 transition-all duration-200 ${
                    mode === "dark"
                      ? "bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                      : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  placeholder="Enter market intel description"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="type"
                  className={`block text-sm font-medium ${
                    mode === "dark" ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  Type
                </label>
                <select
                  name="type"
                  id="type"
                  value={formData.type || ""}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-xl border text-sm px-4 py-3 transition-all duration-200 ${
                    mode === "dark"
                      ? "bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                      : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  } ${errors.type ? "border-red-500" : ""}`}
                >
                  <option value="">Select type</option>
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-red-500 text-xs"
                  >
                    {errors.type}
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
                  value={formData.tier_restriction || ""}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-xl border text-sm px-4 py-3 transition-all duration-200 ${
                    mode === "dark"
                      ? "bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                      : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  } ${errors.tier_restriction ? "border-red-500" : ""}`}
                >
                  <option value="">Select tier</option>
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
            <label
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Upload PDF
            </label>
            <div className="mt-1">
              <div
                className={`flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-xl transition-all duration-200 ${
                  mode === "dark"
                    ? "border-gray-600 hover:border-gray-500 bg-gray-700/50"
                    : "border-gray-300 hover:border-gray-400 bg-white"
                }`}
              >
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
                <div
                  className={`mt-2 flex items-center justify-between p-3 rounded-lg ${
                    mode === "dark" ? "bg-gray-700/50" : "bg-gray-100"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon
                      icon="heroicons:document-text"
                      className="w-4 h-4 text-green-500"
                    />
                    <span
                      className={`text-sm ${
                        mode === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Current file: {formData.file_path.split("/").pop()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(true)}
                      className={`flex items-center space-x-1 px-2 py-1 text-xs rounded transition-colors ${
                        mode === "dark"
                          ? "text-blue-400 hover:bg-blue-900/20 hover:text-blue-300"
                          : "text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                      title="Preview PDF"
                    >
                      <Icon icon="heroicons:eye" className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleInputChange({
                          target: { name: "file_path", value: "" },
                        })
                      }
                      className={`flex items-center space-x-1 px-2 py-1 text-xs rounded transition-colors ${
                        mode === "dark"
                          ? "text-red-400 hover:bg-red-900/20 hover:text-red-300"
                          : "text-red-600 hover:bg-red-50 hover:text-red-700"
                      }`}
                      title="Remove current file"
                    >
                      <Icon icon="heroicons:trash" className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
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
                  <span>
                    {isEditing ? "Update Market Intel" : "Create Market Intel"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* PDF Preview Modal using ItemActionModal with React Portal */}
      {showPreviewModal &&
        createPortal(
          <ItemActionModal
            isOpen={showPreviewModal}
            onClose={() => setShowPreviewModal(false)}
            title="PDF Preview"
            mode={mode}
            width="max-w-6xl"
          >
            <div className="h-[80vh]">
              {formData.file_path ? (
                <iframe
                  src={formData.file_path}
                  className="w-full h-full border-0 rounded-lg"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Icon
                      icon="heroicons:document-text"
                      className={`mx-auto h-16 w-16 mb-4 ${
                        mode === "dark" ? "text-gray-400" : "text-gray-300"
                      }`}
                    />
                    <p
                      className={`text-sm ${
                        mode === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      No PDF file available to preview
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ItemActionModal>,
          document.body
        )}
    </>
  );
}
