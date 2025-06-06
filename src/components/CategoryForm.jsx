import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ItemActionModal from "@/components/ItemActionModal";
import { Icon } from "@iconify/react";

export default function CategoryForm({
  mode,
  category,
  onSubmit,
  onCancel,
  isOpen,
}) {
  const [name, setName] = useState("");
  const [jobType, setJobType] = useState("agency"); // Default to "agency"
  const [isMandatory, setIsMandatory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name || "");
        setJobType(category.job_type || "agency");
        setIsMandatory(category.is_mandatory || false);
      } else {
        setName("");
        setJobType("agency");
        setIsMandatory(false);
      }
    }
  }, [isOpen, category]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    if (!jobType) {
      toast.error("Job type is required.");
      return;
    }

    const categoryData = {
      name: name.trim(),
      job_type: jobType,
      is_mandatory: isMandatory,
    };

    try {
      const success =
        category && category.id
          ? await onSubmit(category.id, categoryData)
          : await onSubmit(categoryData);
      if (success) {
        toast.success(
          category && category.id
            ? "Category updated successfully!"
            : "Category added successfully!"
        );
        onCancel();
      } else {
        toast.error("Failed to save category. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while saving the category.");
    }
  };

  return (
    <ItemActionModal
      isOpen={isOpen}
      onClose={onCancel}
      title={category ? "Edit Category" : "Add New Category"}
      mode={mode}
    >
      <div className="relative">
        {/* Floating Circle */}
        <div
          className={`absolute top-2 right-2 w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gradient-to-br ${
            mode === "dark"
              ? "from-violet-500 to-purple-600"
              : "from-violet-400 to-purple-500"
          } opacity-20 z-0`}
        ></div>

        <form onSubmit={handleFormSubmit} className="space-y-6 relative z-10">
          <div
            className={`relative p-4 rounded-xl backdrop-blur-sm border transition-all duration-200 hover:shadow-lg ${
              mode === "dark"
                ? "bg-blue-500/20 border-blue-400/30 text-blue-300"
                : "bg-blue-50 border-blue-200 text-gray-700"
            }`}
          >
            <label
              htmlFor="category-name"
              className={`block text-sm font-medium mb-2 ${
                mode === "dark" ? "text-gray-300" : "text-[#231812]"
              }`}
            >
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition-all duration-200 backdrop-blur-sm ${
                mode === "dark"
                  ? "bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 text-gray-100"
                  : "bg-gradient-to-br from-white/60 to-gray-50/60 border-white/20 text-[#231812]"
              } hover:bg-opacity-70`}
              placeholder="Enter category name"
              required
            />
          </div>

          <div
            className={`relative p-4 rounded-xl backdrop-blur-sm border transition-all duration-200 hover:shadow-lg ${
              mode === "dark"
                ? "bg-blue-500/20 border-blue-400/30 text-blue-300"
                : "bg-blue-50 border-blue-200 text-gray-700"
            }`}
          >
            <label
              htmlFor="job-type-select"
              className={`block text-sm font-medium mb-2 ${
                mode === "dark" ? "text-gray-300" : "text-[#231812]"
              }`}
            >
              Job Type <span className="text-red-500">*</span>
            </label>
            <select
              id="job-type-select"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition-all duration-200 backdrop-blur-sm ${
                mode === "dark"
                  ? "bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 text-gray-100"
                  : "bg-gradient-to-br from-white/60 to-gray-50/60 border-white/20 text-[#231812]"
              } hover:bg-opacity-70`}
              required
            >
              <option value="agency">Agency</option>
              <option value="freelancer">Freelancer</option>
              <option value="none">None</option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              className={`inline-flex items-center gap-2 cursor-pointer hover:text-[#f05d23] transition-all duration-200 ${
                mode === "dark" ? "text-gray-300" : "text-[#231812]"
              }`}
            >
              <input
                type="checkbox"
                checked={isMandatory}
                onChange={(e) => setIsMandatory(e.target.checked)}
                className="hidden"
                id="mandatory-checkbox"
              />
              <span>Mandatory Category</span>
              <Icon
                icon={
                  isMandatory
                    ? "mdi:checkbox-marked"
                    : "mdi:checkbox-blank-outline"
                }
                width={20}
                height={20}
                className={`${
                  mode === "dark" ? "text-amber-400" : "text-amber-600"
                } animate-bounce`}
                style={{
                  animationDuration: "2s",
                  animationIterationCount: "infinite",
                }}
              />
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                mode === "dark"
                  ? "bg-gradient-to-br from-gray-700/80 to-gray-600/80 text-gray-300 hover:bg-gray-600"
                  : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                mode === "dark"
                  ? "bg-gradient-to-r from-blue-500/80 to-sky-500/80 text-white hover:from-blue-600/80 hover:to-sky-600/80"
                  : "bg-gradient-to-r from-blue-500 to-sky-500 text-white hover:from-blue-600 hover:to-sky-600"
              }`}
              aria-label="Save category"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </ItemActionModal>
  );
}
