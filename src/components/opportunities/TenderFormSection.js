import { Icon } from "@iconify/react";
import FileUpload from "@/components/common/FileUpload";

export default function TenderFormSection({
  formData,
  handleInputChange,
  mode,
  uploadedFile,
  setUploadedFile,
  handleFileUpload,
}) {
  const tenderCategories = [
    "Advertising and Market Research",
    "Photography and Videography",
    "Research and Study",
    "Review and Development",
    "Event Management and Logistics",
    "Event Coordinator",
    "Project Management",
    "Business Management",
    "Communication",
    "Digital Marketing",
    "Business Planning",
    "Graphic Design"
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      {/* Tender-specific fields */}
      <div className="col-span-1">
        <label className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
          Organization <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="tender_organization"
          value={formData.tender_organization || ""}
          onChange={handleInputChange}
          required={true}
          className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${mode === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-900"}`}
          placeholder="Enter organization name"
        />
      </div>
      
      <div className="col-span-1">
        <label className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
          Category <span className="text-rose-500">*</span>
        </label>
        <div className="relative group">
          <select
            name="tender_category"
            value={formData.tender_category || ""}
            onChange={handleInputChange}
            required={true}
            className={`appearance-none w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
              mode === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-900"
            }`}
          >
            <option value="">Select Category</option>
            {tenderCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Icon icon="heroicons:chevron-down" className={`h-5 w-5 ${mode === "dark" ? "text-gray-300" : "text-gray-400"}`} />
          </div>
          <div className="absolute inset-0 rounded-xl border border-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
      </div>
      
      <div className="col-span-1">
        <label className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
          Issued Date <span className="text-rose-500">*</span>
        </label>
        <input
          type="date"
          name="tender_issued"
          value={formData.tender_issued || ""}
          onChange={handleInputChange}
          onClick={(e) => e.target.showPicker()}
          required={true}
          className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${mode === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-900"}`}
        />
      </div>
      
      <div className="col-span-1">
        <label className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
          Closing Date <span className="text-rose-500">*</span>
        </label>
        <input
          type="date"
          name="tender_closing"
          value={formData.tender_closing || ""}
          onChange={handleInputChange}
          onClick={(e) => e.target.showPicker()}
          required={true}
          className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${mode === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-900"}`}
        />
      </div>
      
      <div className="col-span-2">
        <label className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
          Access Link <span className="text-rose-500">*</span>
        </label>
        <input
          type="url"
          name="tender_access_link"
          value={formData.tender_access_link || ""}
          onChange={handleInputChange}
          required={true}
          className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${mode === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-900"}`}
          placeholder="https://example.com/tender"
        />
      </div>
      
      <div className="col-span-2">
        <label className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
          Tender Description <span className="text-xs text-gray-400">(optional)</span>
        </label>
        <textarea
          name="description"
          rows={4}
          value={formData.description || ""}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 ${
            mode === "dark" ? "border-gray-700 bg-gray-800 text-white placeholder:text-gray-500" : "border-gray-200 bg-white text-gray-900"
          }`}
          placeholder="Provide additional details about the tender opportunity, requirements, scope of work, or any other relevant information..."
        />
      </div>
      
      {/* Tender file upload */}
      <div className="col-span-2">
        <label className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
          Tender Attachment <span className="text-xs text-gray-400">(optional)</span>
        </label>
        <FileUpload
          mode={mode}
          onFileUpload={handleFileUpload}
          uploadedFile={uploadedFile}
          setUploadedFile={setUploadedFile}
          label="Upload Tender Document"
          placeholder="Choose file or drag and drop"
        />
      </div>
    </div>
  );
} 