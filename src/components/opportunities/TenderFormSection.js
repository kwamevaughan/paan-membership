import { Icon } from "@iconify/react";
import { useState, useCallback } from "react";
import FileUpload from "@/components/common/FileUpload";
import * as XLSX from 'xlsx';
import Select from "react-select";
import countriesGeoJson from "@/data/countries";

export default function TenderFormSection({
  formData,
  handleInputChange,
  mode,
  uploadedFile,
  setUploadedFile,
  handleFileUpload,
  tiers,
  handleBulkSubmit,
}) {
  const [uploadMode, setUploadMode] = useState("manual"); // "manual" or "bulk"
  const [bulkFile, setBulkFile] = useState(null);
  const [parsedTenders, setParsedTenders] = useState([]);
  const [parsingError, setParsingError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const tenderCategories = [
    "Advertising and Market Research",
    "Auditing",
    "Audio-Visual Training",
    "Photography and Videography",
    "Event Management and Logistics",
    "Event Coordinator",
    "E-Learning Content Development",
    "End Term Evaluation",
    "Project Management",
    "Business Development",
    "Business Management",
    "Communication",
    "Digital Marketing",
    "Business Planning",
    "Graphic Design",
    "Strategic Planning",
    "Strategic Development",
    "Reporting and Data Collection",
    "Website Management and Development",
    "Web Development",
    "Podcasts",
    "Auditing",
    "Policy Analysis",
    "Research and Study",
    "Design Work",
    "Videography",
    "Review and Development",
    "Technical Assistance",
    "Social Media",
    "E-learning Course Development",
    "Digital Marketing",
    "Media Monitoring Services",
    "Copywriting and Editing",
    "Consultancy Engagement",
    "Media content production ",

    "Other",
  ];

  const countryOptions = (countriesGeoJson?.features || [])
    .map((f) => f?.properties?.name)
    .filter(Boolean)
    .map((name) => ({ label: name, value: name }));

  const selectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: mode === "dark" ? "#1f2937" : "#ffffff",
      borderColor: mode === "dark" ? "#374151" : "#e5e7eb",
      color: mode === "dark" ? "#f3f4f6" : "#111827",
      paddingLeft: "2.5rem",
      borderRadius: "0.75rem",
      minHeight: "3rem",
      boxShadow: "none",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: mode === "dark" ? "#1f2937" : "#ffffff",
      color: mode === "dark" ? "#f3f4f6" : "#111827",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? mode === "dark" ? "#374151" : "#f3f4f6"
        : state.isSelected
        ? "#3b82f6"
        : mode === "dark" ? "#1f2937" : "#ffffff",
      color: state.isSelected ? "#ffffff" : mode === "dark" ? "#f3f4f6" : "#111827",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: mode === "dark" ? "#f3f4f6" : "#111827",
    }),
    input: (provided) => ({
      ...provided,
      color: mode === "dark" ? "#f3f4f6" : "#111827",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: mode === "dark" ? "#9ca3af" : "#6b7280",
    }),
  };

  // Parse CSV/Excel file
  const parseBulkFile = useCallback(async (file) => {
    setParsingError("");
    setParsedTenders([]);

    try {
      let lines = [];
      
      // Check file type and parse accordingly
      if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
        // Excel file - parse with xlsx library
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          throw new Error("Excel file must contain at least a header row and one data row");
        }
        
        // Convert JSON data to tab-separated format for consistent processing
        lines = jsonData.map(row => row.join('\t'));
      } else {
        // Text/CSV file
        const text = await file.text();
        lines = text.split('\n').filter(line => line.trim());
      }
      
      if (lines.length < 2) {
        throw new Error("File must contain at least a header row and one data row");
      }

      // Parse header row
      const headers = lines[0].split('\t').map(h => h.trim());
      const expectedHeaders = ['Organization', 'Category', 'Issued', 'Closing', 'Acces Link'];
      
      // Check if headers match (allowing for minor variations)
      const headerMatch = expectedHeaders.every((expected, index) => 
        headers[index] && headers[index].toLowerCase().includes(expected.toLowerCase())
      );

      if (!headerMatch) {
        throw new Error(`Invalid file format. Expected headers: ${expectedHeaders.join(', ')}`);
      }

      // Parse data rows
      const tenders = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t').map(v => v.trim());
        if (values.length >= 5 && values.some(v => v)) {
          const [organization, category, issued, closing, accessLink] = values;
          
          // Skip rows where organization and category are empty
          if (!organization && !category) continue;
          
          // Convert date formats
          const parseDate = (dateStr) => {
            if (!dateStr || dateStr.trim() === "") return "";
            
            // Handle Excel date objects (numbers) and string dates
            if (typeof dateStr === 'number') {
              // Excel stores dates as numbers - convert to date
              const excelDate = new Date((dateStr - 25569) * 86400 * 1000);
              return excelDate.toISOString().split('T')[0];
            }
            
            // Handle string date formats like "26th May 2025", "13th May 2025", etc.
            let cleanDate = dateStr.toString();
            
            // Fix common typos in ordinal indicators
            cleanDate = cleanDate
              .replace(/(\d+)ed\b/g, '$1rd') // Fix "3ed" -> "3rd"
              .replace(/(\d+)nd\b/g, '$1nd') // Keep "2nd"
              .replace(/(\d+)st\b/g, '$1st') // Keep "1st"
              .replace(/(\d+)th\b/g, '$1th'); // Keep "4th", "5th", etc.
            
            // Remove ordinal indicators for parsing
            cleanDate = cleanDate.replace(/(\d+)(st|nd|rd|th)/, '$1');
            
            // Try to parse the date
            const date = new Date(cleanDate);
            
            if (isNaN(date.getTime())) {
              return dateStr.toString(); // Return original if parsing fails
            }
            
            return date.toISOString().split('T')[0];
          };

          tenders.push({
            organization: organization || "",
            category: category || "",
            issued: parseDate(issued),
            closing: parseDate(closing),
            accessLink: accessLink || "",
            description: `Tender opportunity from ${organization} in the ${category} category.`
          });
        }
      }

      if (tenders.length === 0) {
        throw new Error("No valid tender data found in the file");
      }

      setParsedTenders(tenders);
    } catch (error) {
      setParsingError(error.message);
      setParsedTenders([]);
    }
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((file) => {
    if (file) {
      setBulkFile({ name: file.name, size: file.size });
      parseBulkFile(file);
    }
  }, [parseBulkFile]);

  // Handle drag and drop events
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files.find(f => 
      f.name.toLowerCase().endsWith('.csv') || 
      f.name.toLowerCase().endsWith('.txt') ||
      f.name.toLowerCase().endsWith('.xlsx') ||
      f.name.toLowerCase().endsWith('.xls')
    );
    
    if (file) {
      handleFileSelect(file);
    } else {
      setParsingError("Please select a .csv, .txt, .xlsx, or .xls file");
    }
  }, [handleFileSelect]);

  // Handle bulk upload submission
  const handleBulkSubmitLocal = useCallback(async () => {
    if (parsedTenders.length === 0) return;

    try {
      await handleBulkSubmit(parsedTenders, formData.tier_restriction);
      
      // Clear the form after successful submission
      setParsedTenders([]);
      setBulkFile(null);
      setParsingError("");
      
      // Reset file input
      const fileInput = document.getElementById('bulk-file-upload');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error("Bulk submission error:", error);
      // Error is already handled by the hook
    }
  }, [parsedTenders, formData.tier_restriction, handleBulkSubmit]);

  return (
    <div className="space-y-6">
      {/* Upload Mode Toggle */}
      <div className="flex items-center space-x-6">
        <label className="flex items-center">
          <input
            type="radio"
            name="upload_mode"
            value="manual"
            checked={uploadMode === "manual"}
            onChange={(e) => setUploadMode(e.target.value)}
            className={`h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 ${
              mode === "dark" ? "bg-gray-800 border-gray-600 focus:ring-indigo-400" : ""
            }`}
          />
          <span className={`ml-2 text-sm ${mode === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            Manual Entry
          </span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="upload_mode"
            value="bulk"
            checked={uploadMode === "bulk"}
            onChange={(e) => setUploadMode(e.target.value)}
            className={`h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 ${
              mode === "dark" ? "bg-gray-800 border-gray-600 focus:ring-indigo-400" : ""
            }`}
          />
          <span className={`ml-2 text-sm ${mode === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            Bulk Upload
          </span>
        </label>
      </div>

      {uploadMode === "manual" ? (
        /* Manual Entry Form */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Tender Title field - NEW FIELD */}
          <div className="col-span-2">
            <label className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
              Tender Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="tender_title"
              value={formData.tender_title || ""}
              onChange={handleInputChange}
              required={true}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${mode === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-900"}`}
              placeholder="Enter tender title"
            />
          </div>
          {/* Organization field (existing) */}
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
          
          {/* Location (Country) */}
          <div className="col-span-1">
            <label className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
              Location <span className="text-xs text-gray-400">(country)</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Icon icon="heroicons:map-pin" className={`h-5 w-5 ${mode === "dark" ? "text-gray-300" : "text-gray-400"}`} />
              </div>
              <Select
                inputId="tender_location"
                value={formData.location ? { label: formData.location, value: formData.location } : null}
                onChange={(opt) =>
                  handleInputChange({ target: { name: "location", value: opt ? opt.value : "" } })
                }
                options={countryOptions}
                isClearable
                isSearchable
                placeholder="Select country"
                styles={selectStyles}
                classNamePrefix="react-select"
              />
            </div>
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
              Membership Tier <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <select
                name="tier_restriction"
                value={formData.tier_restriction || ""}
                onChange={handleInputChange}
                required={true}
                className={`appearance-none w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  mode === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-900"
                }`}
              >
                <option value="">Select Tier</option>
                {tiers && tiers.length > 0 &&
                  tiers.map((tier) => (
                    <option key={tier} value={tier}>
                      {tier}
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
              Access Link <span className="text-xs text-gray-400">(optional)</span>
            </label>
            <input
              type="url"
              name="tender_access_link"
              value={formData.tender_access_link || ""}
              onChange={handleInputChange}
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
      ) : (
        /* Bulk Upload Section */
        <div className="space-y-6">
          {/* File Upload Instructions */}
          <div className={`p-4 rounded-lg border ${
            mode === "dark" ? "bg-blue-900/20 border-blue-800/30" : "bg-blue-50 border-blue-200"
          }`}>
            <div className="flex items-start space-x-3">
              <Icon icon="heroicons:information-circle" className={`h-5 w-5 mt-0.5 ${
                mode === "dark" ? "text-blue-400" : "text-blue-600"
              }`} />
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${
                  mode === "dark" ? "text-blue-300" : "text-blue-800"
                }`}>
                  Bulk Upload Instructions
                </h4>
                <p className={`text-sm mt-1 ${
                  mode === "dark" ? "text-blue-200" : "text-blue-700"
                }`}>
                  Upload a tab-separated file (.txt, .csv, .xlsx, or .xls) with the following columns: Organization, Category, Issued (optional), Closing, Access Link. 
                  All tenders will be created with the selected membership tier below.
                </p>
              </div>
            </div>
          </div>

          {/* Membership Tier Selection for Bulk Upload */}
          <div className="w-full max-w-md">
            <label className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
              Membership Tier for All Tenders <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <select
                name="tier_restriction"
                value={formData.tier_restriction || ""}
                onChange={handleInputChange}
                required={true}
                className={`appearance-none w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  mode === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-900"
                }`}
              >
                <option value="">Select Tier</option>
                {tiers && tiers.length > 0 &&
                  tiers.map((tier) => (
                    <option key={tier} value={tier}>
                      {tier}
                    </option>
                  ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Icon icon="heroicons:chevron-down" className={`h-5 w-5 ${mode === "dark" ? "text-gray-300" : "text-gray-400"}`} />
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-1.5`}>
              Upload Tender Sheet <span className="text-rose-500">*</span>
            </label>
            <div
              className={`mt-1 relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
                isDragOver
                  ? mode === "dark"
                    ? "border-blue-400 bg-blue-900/20"
                    : "border-blue-400 bg-blue-50"
                  : mode === "dark"
                  ? "border-gray-600 hover:border-gray-500"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <Icon
                  icon="heroicons:document-arrow-up"
                  className={`mx-auto h-12 w-12 ${
                    mode === "dark" ? "text-gray-400" : "text-gray-300"
                  }`}
                />
                <div className="mt-4">
                  <label
                    htmlFor="bulk-file-upload"
                    className={`cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                      mode === "dark"
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    <Icon icon="heroicons:folder-open" className="h-4 w-4 mr-2" />
                    Choose File
                  </label>
                  <input
                    id="bulk-file-upload"
                    type="file"
                    accept=".txt,.csv,.xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleFileSelect(file);
                      }
                    }}
                    className="hidden"
                  />
                </div>
                <p className={`mt-2 text-sm ${
                  mode === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                  or drag and drop
                </p>
                <p className={`text-xs ${
                  mode === "dark" ? "text-gray-500" : "text-gray-500"
                }`}>
                  CSV, TXT, XLSX, or XLS files
                </p>
              </div>
              {bulkFile && (
                <div className={`mt-4 p-3 rounded-md ${
                  mode === "dark" ? "bg-gray-800" : "bg-gray-50"
                }`}>
                  <div className="flex items-center">
                    <Icon icon="heroicons:document-text" className={`h-5 w-5 ${
                      mode === "dark" ? "text-green-400" : "text-green-600"
                    }`} />
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        mode === "dark" ? "text-gray-300" : "text-gray-900"
                      }`}>
                        {bulkFile.name}
                      </p>
                      <p className={`text-xs ${
                        mode === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}>
                        {(bulkFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {parsingError && (
            <div className={`p-4 rounded-lg border ${
              mode === "dark" ? "bg-red-900/20 border-red-800/30" : "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-start space-x-3">
                <Icon icon="heroicons:exclamation-triangle" className={`h-5 w-5 mt-0.5 ${
                  mode === "dark" ? "text-red-400" : "text-red-600"
                }`} />
                <div className="flex-1">
                  <h4 className={`text-sm font-medium ${
                    mode === "dark" ? "text-red-300" : "text-red-800"
                  }`}>
                    Upload Error
                  </h4>
                  <p className={`text-sm mt-1 ${
                    mode === "dark" ? "text-red-200" : "text-red-700"
                  }`}>
                    {parsingError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Preview Parsed Data */}
          {parsedTenders.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className={`text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Preview ({parsedTenders.length} tenders found)
                </h4>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleBulkSubmitLocal();
                  }}
                  disabled={!formData.tier_restriction}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    formData.tier_restriction
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Create All Tenders
                </button>
              </div>
              
              <div className={`border rounded-lg overflow-hidden ${
                mode === "dark" ? "border-gray-700" : "border-gray-200"
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${
                      mode === "dark" ? "bg-gray-800" : "bg-gray-50"
                    }`}>
                      <tr>
                        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          mode === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}>
                          Organization
                        </th>
                        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          mode === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}>
                          Category
                        </th>
                        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          mode === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}>
                          Issued
                        </th>
                        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          mode === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}>
                          Closing
                        </th>
                        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          mode === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}>
                          Access Link
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${
                      mode === "dark" ? "divide-gray-700" : "divide-gray-200"
                    }`}>
                      {parsedTenders.slice(0, 5).map((tender, index) => (
                        <tr key={index} className={`${
                          mode === "dark" ? "bg-gray-900" : "bg-white"
                        }`}>
                          <td className={`px-4 py-3 text-sm ${
                            mode === "dark" ? "text-gray-300" : "text-gray-900"
                          }`}>
                            {tender.organization}
                          </td>
                          <td className={`px-4 py-3 text-sm ${
                            mode === "dark" ? "text-gray-300" : "text-gray-900"
                          }`}>
                            {tender.category}
                          </td>
                          <td className={`px-4 py-3 text-sm ${
                            mode === "dark" ? "text-gray-300" : "text-gray-900"
                          }`}>
                            {tender.issued}
                          </td>
                          <td className={`px-4 py-3 text-sm ${
                            mode === "dark" ? "text-gray-300" : "text-gray-900"
                          }`}>
                            {tender.closing}
                          </td>
                          <td className={`px-4 py-3 text-sm ${
                            mode === "dark" ? "text-blue-400" : "text-blue-600"
                          }`}>
                            <a href={tender.accessLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              View Link
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedTenders.length > 5 && (
                  <div className={`px-4 py-3 text-sm text-center ${
                    mode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-500 bg-gray-50"
                  }`}>
                    ... and {parsedTenders.length - 5} more tenders
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 