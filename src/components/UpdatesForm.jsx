import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";

export default function UpdatesForm({
  showForm,
  mode,
  formData,
  handleInputChange,
  handleSubmit,
  handleCancel,
  loading,
  categories,
}) {
  const validTiers = ["Associate Member", "Full Member", "Gold Member", "Free Member", "All"];
  const tagOptions = [
    "Governance",
    "Member Spotlights",
    "Global Partnerships",
    "Regional Growth",
  ];

  // Handle multi-select change for tags
  const handleTagsChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    handleInputChange({
      target: { name: "tags", value: selectedOptions.join(", ") },
    });
  };

  return (
    <AnimatePresence>
      {showForm && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed bottom-0 left-0 right-0 mx-auto w-full max-w-4xl h-3/4 max-h-[75vh] ${
            mode === "dark"
              ? "bg-gray-900/70 border-gray-800/30"
              : "bg-white/70 border-gray-200/30"
          } backdrop-blur-2xl shadow-2xl p-6 z-50 overflow-y-auto border-t rounded-t-xl`}
        >
          <div className="flex justify-between items-center mb-6">
            <h2
              className={`text-2xl font-semibold ${
                mode === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {formData.id ? "Edit Update" : "Create Update"}
            </h2>
            <motion.button
              whileHover={{ scale: 1.2, rotate: 90 }}
              onClick={handleCancel}
              className={`p-2 rounded-full ${
                mode === "dark" ? "bg-gray-800" : "bg-gray-200"
              }`}
            >
              <Icon icon="heroicons:x-mark" className="w-5 h-5" />
            </motion.button>
          </div>
          <form
            onSubmit={(e) => handleSubmit(e, handleCancel)}
            className="space-y-6"
          >
            <div>
              <label
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gray-800/80 text-white border-gray-700/50"
                    : "bg-white/80 text-gray-900 border-gray-200/50"
                } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
                placeholder="Enter update title"
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gray-800/80 text-white border-gray-700/50"
                    : "bg-white/80 text-gray-900 border-gray-200/50"
                } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
                placeholder="Enter description"
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gray-800/80 text-white border-gray-700/50"
                    : "bg-white/80 text-gray-900 border-gray-200/50"
                } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Tier Restriction *
              </label>
              <select
                name="tier_restriction"
                value={formData.tier_restriction}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gray-800/80 text-white border-gray-700/50"
                    : "bg-white/80 text-gray-900 border-gray-200/50"
                } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
              >
                {validTiers.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Tags
              </label>
              <select
                name="tags"
                multiple
                value={
                  formData.tags ? formData.tags.split(", ").filter(Boolean) : []
                }
                onChange={handleTagsChange}
                className={`w-full px-4 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gray-800/80 text-white border-gray-700/50"
                    : "bg-white/80 text-gray-900 border-gray-200/50"
                } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm h-24`}
              >
                {tagOptions.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                CTA Text
              </label>
              <input
                type="text"
                name="cta_text"
                value={formData.cta_text}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gray-800/80 text-white border-gray-700/50"
                    : "bg-white/80 text-gray-900 border-gray-200/50"
                } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
                placeholder="e.g., Register for Webinar"
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                CTA URL
              </label>
              <input
                type="url"
                name="cta_url"
                value={formData.cta_url}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gray-800/80 text-white border-gray-700/50"
                    : "bg-white/80 text-gray-900 border-gray-200/50"
                } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
                placeholder="e.g., https://paan.org/webinar"
              />
            </div>
            <div className="flex gap-4">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
                className={`flex-1 px-6 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gradient-to-r from-indigo-700 to-purple-700 text-white"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                } disabled:opacity-50 flex items-center justify-center shadow-lg hover:shadow-xl`}
              >
                {loading ? (
                  <>
                    <Icon
                      icon="heroicons:arrow-path"
                      className="w-5 h-5 mr-2 animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon icon="heroicons:check" className="w-5 h-5 mr-2" />
                    {formData.id ? "Update" : "Create"}
                  </>
                )}
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className={`flex-1 px-6 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200 text-gray-900"
                } flex items-center justify-center shadow-lg hover:shadow-xl`}
              >
                <Icon icon="heroicons:x-mark" className="w-5 h-5 mr-2" />
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
