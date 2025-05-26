import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

export default function ModernOffersForm({
  formData,
  handleInputChange,
  submitForm,
  cancelForm,
  isEditing,
  mode,
}) {
  const isDark = mode === "dark";
  const inputBg = isDark ? "bg-gray-800/50" : "bg-white/80";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const placeholderColor = isDark
    ? "placeholder-gray-400"
    : "placeholder-gray-500";

  const inputVariants = {
    focus: { scale: 1.02, boxShadow: "0 0 8px rgba(99, 102, 241, 0.5)" },
    blur: { scale: 1, boxShadow: "none" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`p-8 rounded-2xl backdrop-blur-lg ${
        isDark ? "bg-gray-900/30" : "bg-white/30"
      } shadow-2xl max-w-2xl mx-auto`}
    >
      <h2
        className={`text-3xl font-bold ${textColor} mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent`}
      >
        {isEditing ? "Edit Offer" : "Create New Offer"}
      </h2>
      <form onSubmit={submitForm} className="space-y-6">
        <div>
          <label className={`block text-sm font-medium ${textColor} mb-2`}>
            Offer Title
          </label>
          <motion.input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            variants={inputVariants}
            whileFocus="focus"
            className={`w-full px-4 py-3 rounded-xl ${inputBg} ${textColor} ${placeholderColor} border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-sm`}
            placeholder="Enter offer title"
            required
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${textColor} mb-2`}>
            Description
          </label>
          <motion.textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            variants={inputVariants}
            whileFocus="focus"
            className={`w-full px-4 py-3 rounded-xl ${inputBg} ${textColor} ${placeholderColor} border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-sm`}
            placeholder="Describe the offer"
            rows="4"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${textColor} mb-2`}>
            Tier Restriction
          </label>
          <motion.select
            name="tier_restriction"
            value={formData.tier_restriction}
            onChange={handleInputChange}
            variants={inputVariants}
            whileFocus="focus"
            className={`w-full px-4 py-3 rounded-xl ${inputBg} ${textColor} border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-sm`}
            required
          >
            <option value="All">All Members</option>
            <option value="Associate Member">Associate Member</option>
            <option value="Full Member">Full Member</option>
            <option value="Gold Member">Gold Member</option>
            <option value="Free Member">Free Member</option>
          </motion.select>
        </div>
        <div>
          <label className={`block text-sm font-medium ${textColor} mb-2`}>
            Offer URL
          </label>
          <motion.input
            type="url"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            variants={inputVariants}
            whileFocus="focus"
            className={`w-full px-4 py-3 rounded-xl ${inputBg} ${textColor} ${placeholderColor} border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-sm`}
            placeholder="https://example.com/offer"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${textColor} mb-2`}>
            Icon URL
          </label>
          <motion.input
            type="url"
            name="icon_url"
            value={formData.icon_url}
            onChange={handleInputChange}
            variants={inputVariants}
            whileFocus="focus"
            className={`w-full px-4 py-3 rounded-xl ${inputBg} ${textColor} ${placeholderColor} border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-sm`}
            placeholder="https://example.com/icon.png"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <motion.button
            type="button"
            onClick={cancelForm}
            whileHover={{ scale: 1.05 }}
            className={`px-6 py-3 rounded-xl ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            } ${textColor} hover:bg-${
              isDark ? "gray-600" : "gray-300"
            } transition-colors`}
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            {isEditing ? "Update Offer" : "Create Offer"}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
