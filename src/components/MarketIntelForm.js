// src/components/MarketIntelForm.js
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";
import { IKContext, IKUpload } from "imagekitio-react";
import { Line, Bar, Pie } from "react-chartjs-2";
import toast from "react-hot-toast";
import ItemActionModal from "./ItemActionModal";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Dynamically import EditorComponent for client-side only
const EditorComponent = dynamic(() => import("./EditorComponent"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

const defaultChartData = {
  labels: ["January", "February", "March", "April", "May", "June"],
  datasets: [
    {
      label: "Sample Data",
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: "rgba(75, 192, 192, 0.2)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
    },
  ],
};

export default function MarketIntelForm({
  showForm,
  mode,
  formData,
  handleInputChange,
  handleSubmit,
  handleCancel,
  loading,
  isEditing,
  categories,
  memberCount,
  getPDFUrl,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(formData.file_path || null);
  const [chartType, setChartType] = useState("line");
  const [chartData, setChartData] = useState(defaultChartData);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  const types = [
    "Report",
    "Analysis",
    "Regional Insight",
    "Data Visualization",
  ];

  const regions = [
    "Global",
    "North America",
    "South America",
    "Europe",
    "Asia Pacific",
    "Middle East",
    "Africa",
  ];

  const tiers = [
    "Associate Member",
    "Full Member",
    "Gold Member",
    "Free Member",
  ];

  const chartTypes = [
    { value: "line", label: "Line Chart" },
    { value: "bar", label: "Bar Chart" },
    { value: "pie", label: "Pie Chart" },
  ];

  // Authenticator function
  const authenticator = async () => {
    try {
      const endpoint =
        process.env.NODE_ENV === "production"
          ? "https://membership.paan.africa/api/imagekit/auth"
          : "http://localhost:3000/api/imagekit/auth";
      const response = await fetch(endpoint, {
        method: "GET",
        credentials: "include", // Include cookies for Supabase session
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch auth parameters: ${response.status} ${errorText}`
        );
      }
      const data = await response.json();
      if (!data.signature || !data.token || !data.expire) {
        throw new Error("Invalid auth parameters received");
      }
      console.log("Authenticator success:", data);
      return {
        signature: data.signature,
        token: data.token,
        expire: data.expire,
      };
    } catch (error) {
      console.error("Authenticator error:", error);
      toast.error(`Authentication failed: ${error.message}`);
      throw error;
    }
  };

  // Parse chart data when form data changes
  useEffect(() => {
    if (formData.type === "Data Visualization") {
      try {
        if (formData.chart_data) {
          const parsedData = typeof formData.chart_data === 'string' 
            ? JSON.parse(formData.chart_data)
            : formData.chart_data;
          
          // Ensure the parsed data has the required structure
          if (!parsedData.labels || !parsedData.datasets) {
            setChartData(defaultChartData);
            return;
          }
          
          // Ensure datasets is an array and has at least one item
          if (!Array.isArray(parsedData.datasets) || parsedData.datasets.length === 0) {
            setChartData(defaultChartData);
            return;
          }
          
          setChartData(parsedData);
        } else {
          setChartData(defaultChartData);
        }
      } catch (error) {
        console.error("Error parsing chart data:", error);
        setChartData(defaultChartData);
      }
    } else {
      setChartData(null);
    }
  }, [formData.type, formData.chart_data]);

  useEffect(() => {
    if (formData.file_path) {
      setPreviewUrl(formData.file_path);
    }
  }, [formData.file_path]);

  const onUploadStart = () => {
    setUploading(true);
    setUploadProgress(0);
  };

  const onUploadSuccess = (res) => {
    try {
      const fileUrl = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}${res.filePath}`;
      handleInputChange({
        target: {
          name: "file_path",
          value: fileUrl,
        },
      });
      setPreviewUrl(fileUrl);
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload success handling error:", error);
      toast.error("Failed to process uploaded file");
    } finally {
      setUploading(false);
    }
  };

  const onUploadError = (error) => {
    console.error("Upload error:", error);
    toast.error(`Failed to upload file: ${error.message || "Unknown error"}`);
    setUploading(false);
  };

  const onUploadProgress = (progressEvent) => {
    const progress = Math.round(
      (progressEvent.loaded / progressEvent.total) * 100
    );
    setUploadProgress(progress);
  };

  const handleChartTypeChange = (e) => {
    setChartType(e.target.value);
  };

  const handleChartDataChange = (e) => {
    try {
      const parsedData = JSON.parse(e.target.value);
      
      // Validate the parsed data structure
      if (!parsedData.labels || !Array.isArray(parsedData.datasets) || parsedData.datasets.length === 0) {
        throw new Error("Invalid chart data structure");
      }
      
      setChartData(parsedData);
      handleInputChange({
        target: {
          name: "chart_data",
          value: JSON.stringify(parsedData),
        },
      });
    } catch (error) {
      console.error("Invalid JSON or chart data structure:", error);
      // Keep the existing chart data if the new data is invalid
    }
  };

  const handleViewPdf = async () => {
    if (!formData.file_path) {
      toast.error("No file available to view");
      return;
    }

    try {
      setIsLoadingPdf(true);
      // Use the file_path directly since it's already a complete URL
      setPdfUrl(formData.file_path);
      setShowPdfModal(true);
    } catch (error) {
      console.error("Error getting PDF URL:", error);
      toast.error("Failed to load PDF. The file may have been deleted or is not accessible.");
    } finally {
      setIsLoadingPdf(false);
    }
  };

  if (!showForm) {
    return null;
  }

  const renderChart = () => {
    if (!chartData || !chartData.datasets || !Array.isArray(chartData.datasets)) {
      return null;
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: formData.title || "Chart Title",
        },
      },
    };

    switch (chartType) {
      case "line":
        return <Line data={chartData} options={options} />;
      case "bar":
        return <Bar data={chartData} options={options} />;
      case "pie":
        return <Pie data={chartData} options={options} />;
      default:
        return null;
    }
  };

  return (
    <>
      <ItemActionModal
        isOpen={showForm}
        onClose={handleCancel}
        title={isEditing ? "Edit Market Intel" : "Create Market Intel"}
        mode={mode}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label
                htmlFor="title"
                className={`block text-sm font-medium mb-2 ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title || ""}
                onChange={handleInputChange}
                required
                className={`w-full rounded-lg border ${
                  mode === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-white border-gray-300 text-gray-700"
                } px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter report title"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className={`block text-sm font-medium mb-2 ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category || ""}
                onChange={handleInputChange}
                required
                className={`w-full rounded-lg border ${
                  mode === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-white border-gray-300 text-gray-700"
                } px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label
                htmlFor="type"
                className={`block text-sm font-medium mb-2 ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type || ""}
                onChange={handleInputChange}
                required
                className={`w-full rounded-lg border ${
                  mode === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-white border-gray-300 text-gray-700"
                } px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Select type</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Region */}
            <div>
              <label
                htmlFor="region"
                className={`block text-sm font-medium mb-2 ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Region
              </label>
              <select
                id="region"
                name="region"
                value={formData.region || ""}
                onChange={handleInputChange}
                required
                className={`w-full rounded-lg border ${
                  mode === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-white border-gray-300 text-gray-700"
                } px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Select region</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            {/* Tier Restriction */}
            <div>
              <label
                htmlFor="tier_restriction"
                className={`block text-sm font-medium mb-2 ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Tier Restriction
              </label>
              <select
                id="tier_restriction"
                name="tier_restriction"
                value={formData.tier_restriction || ""}
                onChange={handleInputChange}
                required
                className={`w-full rounded-lg border ${
                  mode === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-white border-gray-300 text-gray-700"
                } px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Select tier</option>
                {tiers.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div className="md:col-span-2">
              <label
                className={`block text-sm font-medium mb-2 ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Upload Report (PDF)
              </label>
              <IKContext
                publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
                urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
                authenticationEndpoint={
                  process.env.NODE_ENV === "production"
                    ? "https://membership.paan.africa/api/imagekit/auth"
                    : "http://localhost:3000/api/imagekit/auth"
                }
                authenticator={authenticator}
                onError={(err) => {
                  console.error("ImageKit context error:", err);
                  toast.error(
                    `Failed to initialize file upload: ${
                      err.message || "Unknown error"
                    }`
                  );
                }}
              >
                <div className="space-y-4">
                  <IKUpload
                    fileName="report.pdf"
                    useUniqueFileName={true}
                    folder="/Reports"
                    onUploadStart={onUploadStart}
                    onUploadProgress={onUploadProgress}
                    onSuccess={onUploadSuccess}
                    onError={onUploadError}
                    accept="application/pdf"
                    className={`w-full rounded-lg border ${
                      mode === "dark"
                        ? "bg-gray-700 border-gray-600 text-gray-200"
                        : "bg-white border-gray-300 text-gray-700"
                    } px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {uploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                  {previewUrl && /\.pdf$/i.test(formData.file_path) && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={handleViewPdf}
                        disabled={isLoadingPdf}
                        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                          mode === "dark"
                            ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        } transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isLoadingPdf ? (
                          <>
                            <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Icon icon="heroicons:document-text" className="w-4 h-4 mr-2" />
                            View uploaded file
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </IKContext>
            </div>

            {/* Chart Type (only for Data Visualization) */}
            {formData.type === "Data Visualization" && (
              <div className="md:col-span-2">
                <label
                  htmlFor="chartType"
                  className={`block text-sm font-medium mb-2 ${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Chart Type
                </label>
                <select
                  id="chartType"
                  value={chartType}
                  onChange={handleChartTypeChange}
                  className={`w-full rounded-lg border ${
                    mode === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-200"
                      : "bg-white border-gray-300 text-gray-700"
                  } px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                >
                  {chartTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Chart Data (only for Data Visualization) */}
            {formData.type === "Data Visualization" && (
              <div className="md:col-span-2">
                <label
                  htmlFor="chartData"
                  className={`block text-sm font-medium mb-2 ${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Chart Data (JSON)
                </label>
                <textarea
                  id="chartData"
                  name="chart_data"
                  value={JSON.stringify(chartData, null, 2)}
                  onChange={handleChartDataChange}
                  rows={10}
                  className={`w-full rounded-lg border ${
                    mode === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-200"
                      : "bg-white border-gray-300 text-gray-700"
                  } px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter chart data in JSON format"
                />
                {chartData && (
                  <div className="mt-4 p-4 bg-white rounded-lg shadow">
                    {renderChart()}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className={`block text-sm font-medium mb-2 ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Description
              </label>
              <div
                className={`border-2 rounded-xl overflow-hidden transition-all duration-200 ${
                  mode === "dark" ? "border-gray-600" : "border-gray-200"
                }`}
              >
                <EditorComponent
                  initialValue={formData.description || ""}
                  onBlur={(newContent) =>
                    handleInputChange({
                      target: { name: "description", value: newContent },
                    })
                  }
                  mode={mode}
                  holderId="jodit-editor-market-intel-form"
                  className="w-full"
                  height="300"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="submit"
              disabled={loading || uploading}
              className={`px-6 py-3 text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 flex items-center shadow-sm ${
                mode === "dark" ? "shadow-white/10" : "shadow-gray-200"
              } ${loading || uploading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading || uploading ? (
                <>
                  <Icon
                    icon="heroicons:arrow-path"
                    className="h-4 w-4 mr-2 animate-spin"
                  />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Icon
                    icon={isEditing ? "heroicons:check" : "heroicons:plus"}
                    className="h-4 w-4 mr-2"
                  />
                  {isEditing ? "Update Report" : "Create Report"}
                </>
              )}
            </button>
          </div>
        </form>
      </ItemActionModal>

      {/* PDF Viewer Modal */}
      <ItemActionModal
        isOpen={showPdfModal}
        onClose={() => {
          setShowPdfModal(false);
          setPdfUrl("");
        }}
        title="Document Preview"
        mode={mode}
        size="xl"
      >
        <div className="space-y-4">
          {pdfUrl ? (
            <div className="relative w-full" style={{ height: "80vh" }}>
              <iframe
                src={pdfUrl}
                className="absolute inset-0 w-full h-full border-0"
                title="PDF Preview"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-80">
              <p className={`text-sm ${mode === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Failed to load PDF preview
              </p>
            </div>
          )}
          <div className="flex justify-end">
            <button
              onClick={() => {
                setShowPdfModal(false);
                setPdfUrl("");
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                mode === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              } transition-colors duration-200`}
            >
              Close
            </button>
          </div>
        </div>
      </ItemActionModal>
    </>
  );
}
