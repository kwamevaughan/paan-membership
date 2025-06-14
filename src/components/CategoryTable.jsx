import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import ItemActionModal from "@/components/ItemActionModal";
import toast from "react-hot-toast";

export default function CategoryTable({
  categories,
  mode,
  onEdit,
  onAdd,
  onDelete,
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [filters, setFilters] = useState({
    jobType: "",
    mandatory: "",
  });

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      const success = await onDelete(categoryToDelete.id);
      if (success) {
        toast.success("Category deleted successfully!");
      } else {
        toast.error("Failed to delete category.");
      }
    }
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(category => {
      const matchesJobType = !filters.jobType || category.job_type === filters.jobType;
      const matchesMandatory = filters.mandatory === "" || 
        (filters.mandatory === "yes" && category.is_mandatory) ||
        (filters.mandatory === "no" && !category.is_mandatory);
      return matchesJobType && matchesMandatory;
    });
  }, [categories, filters]);

  const uniqueJobTypes = useMemo(() => {
    return [...new Set(categories.map(cat => cat.job_type).filter(Boolean))];
  }, [categories]);

  return (
    <div className="relative">
      <div
        className={`absolute -top-2 -right-2 w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gradient-to-br ${
          mode === "dark"
            ? "from-violet-500 to-purple-600"
            : "from-violet-400 to-purple-500"
        } opacity-50 z-8`}
      ></div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h3
            className={`text-lg font-semibold ${
              mode === "dark" ? "text-gray-100" : "text-[#231812]"
            }`}
          >
            Categories
          </h3>
          <button
            onClick={onAdd}
            className={`px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
              mode === "dark"
                ? "bg-gradient-to-r from-blue-700/80 to-blue-600/80 text-white hover:from-blue-600/80 hover:to-sky-600/80"
                : "bg-gradient-to-r from-blue-600 to-sky-500 text-white hover:from-blue-600 hover:to-sky-600"
            } flex items-center gap-2`}
            aria-label="Add new category"
          >
            <Icon icon="mdi:plus" width={20} />
            Add Category
          </button>
        </div>

        {/* Filter Controls */}
        <div className={`mb-4 p-4 rounded-xl ${
          mode === "dark" ? "bg-blue-500/20" : "bg-blue-50"
        }`}>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className={`block text-sm font-medium mb-2 ${
                mode === "dark" ? "text-gray-200" : "text-gray-700"
              }`}>
                Job Type
              </label>
              <select
                value={filters.jobType}
                onChange={(e) => handleFilterChange("jobType", e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border capitalize ${
                  mode === "dark"
                    ? "bg-blue-900/50 border-blue-400/30 text-gray-200"
                    : "bg-white border-blue-200 text-gray-700"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">All Job Types</option>
                {uniqueJobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className={`block text-sm font-medium mb-2 ${
                mode === "dark" ? "text-gray-200" : "text-gray-700"
              }`}>
                Mandatory Status
              </label>
              <select
                value={filters.mandatory}
                onChange={(e) => handleFilterChange("mandatory", e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  mode === "dark"
                    ? "bg-blue-900/50 border-blue-400/30 text-gray-200"
                    : "bg-white border-blue-200 text-gray-700"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">All</option>
                <option value="yes">Mandatory</option>
                <option value="no">Optional</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table
            className={`min-w-full rounded-xl backdrop-blur-sm border ${
              mode === "dark"
                ? "bg-blue-500/20 border-blue-400/30"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <thead>
              <tr
                className={`${
                  mode === "dark"
                    ? "bg-blue-600/30 text-blue-200"
                    : "bg-blue-100 text-[#231812]"
                }`}
              >
                <th className="py-3 px-4 text-left text-sm font-semibold">
                  Name
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold">
                  Job Type
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold">
                  Mandatory
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className={`py-4 px-4 text-center ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className={`border-t ${
                      mode === "dark"
                        ? "border-blue-400/20 text-gray-200"
                        : "border-blue-200 text-[#231812]"
                    } hover:bg-blue-500/10 transition-colors duration-200`}
                  >
                    <td className="py-3 px-4">{category.name}</td>
                    <td className="py-3 px-4 capitalize">{category.job_type || "None"}</td>
                    <td className="py-3 px-4">
                      {category.is_mandatory ? "Yes" : "No"}
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => onEdit(category)}
                        className={`p-2 rounded-lg hover:bg-blue-500/20 transition-all duration-200 ${
                          mode === "dark" ? "text-amber-400" : "text-amber-600"
                        }`}
                        aria-label={`Edit ${category.name}`}
                      >
                        <Icon icon="mdi:pencil" width={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(category)}
                        className={`p-2 rounded-lg hover:bg-red-500/20 transition-all duration-200 ${
                          mode === "dark" ? "text-red-400" : "text-red-600"
                        }`}
                        aria-label={`Delete ${category.name}`}
                      >
                        <Icon icon="mdi:delete" width={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <ItemActionModal
          isOpen={isDeleteModalOpen}
          onClose={handleCancelDelete}
          title="Confirm Deletion"
          mode={mode}
        >
          <div className="relative">
            <div
              className={`absolute top-2 right-2 w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gradient-to-br ${
                mode === "dark"
                  ? "from-violet-500 to-purple-600"
                  : "from-violet-400 to-purple-500"
              } opacity-20 z-0`}
            ></div>

            <div className="relative z-10 p-4">
              <p
                className={`text-base ${
                  mode === "dark" ? "text-gray-200" : "text-[#231812]"
                }`}
              >
                Are you sure you want to delete the category "
                {categoryToDelete?.name}"?
              </p>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={handleCancelDelete}
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
                  onClick={handleConfirmDelete}
                  className={`px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                    mode === "dark"
                      ? "bg-gradient-to-r from-blue-500/80 to-sky-600/80 text-white hover:from-blue-600/80 hover:to-sky-700/80"
                      : "bg-gradient-to-r from-blue-500 to-sky-600 text-white hover:from-blue-600 hover:to-sky-700"
                  }`}
                  aria-label="Delete category"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </ItemActionModal>
      </div>
    </div>
  );
}
