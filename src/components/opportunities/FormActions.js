import { Icon } from "@iconify/react";

export default function FormActions({
  cancelForm,
  mode,
  loading,
  isEditing,
  isFreelancer,
  buttonText,
  stayOnPage,
  setStayOnPage,
}) {
  return (
    <div className="col-span-2 mt-12">
      {/* Stay on page checkbox - only show when creating (not editing) */}
      {!isEditing && (
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="stay-on-page"
            checked={stayOnPage}
            onChange={(e) => setStayOnPage(e.target.checked)}
            className={`h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 ${
              mode === "dark" ? "bg-gray-800 border-gray-600 focus:ring-indigo-400" : ""
            }`}
          />
          <label
            htmlFor="stay-on-page"
            className={`ml-2 text-sm ${mode === "dark" ? "text-gray-300" : "text-gray-700"}`}
          >
            Stay on page after adding (form will reset)
          </label>
        </div>
      )}
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={cancelForm}
          className={`px-6 py-3 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center shadow-sm ${
            mode === "dark"
              ? "border-gray-600 text-gray-200 bg-gray-800 hover:bg-gray-700"
              : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
          }`}
        >
          <Icon icon="heroicons:x-mark" className="h-4 w-4 mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          className={`px-6 py-3 text-sm font-medium rounded-xl text-white shadow-md transition-all duration-200 flex items-center ${
            mode === "dark"
              ? "bg-paan-blue hover:bg-paan-dark-blue"
              : "bg-paan-blue hover:bg-paan-dark-blue"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={loading}
        >
          <Icon
            icon={isEditing ? "heroicons:pencil" : "heroicons:plus"}
            className="h-4 w-4 mr-2"
          />
          {buttonText || (isEditing
            ? `Update ${isFreelancer ? "Gig" : "Opportunity"}`
            : `Create ${isFreelancer ? "Gig" : "Opportunity"}`)}
        </button>
      </div>
    </div>
  );
} 