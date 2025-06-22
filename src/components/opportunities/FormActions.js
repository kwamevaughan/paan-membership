import { Icon } from "@iconify/react";

export default function FormActions({
  cancelForm,
  mode,
  loading,
  isEditing,
  isFreelancer,
}) {
  return (
    <div className="col-span-2 mt-12 flex justify-end space-x-4">
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
        {isEditing
          ? `Update ${isFreelancer ? "Gig" : "Opportunity"}`
          : `Create ${isFreelancer ? "Gig" : "Opportunity"}`}
      </button>
    </div>
  );
} 