import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import MarketIntelChart from "@/components/market-intel/MarketIntelChart";

export default function MarketIntelForm({
  mode,
  formData,
  handleInputChange,
  handleSubmit,
  handleCancel,
  isEditing,
  showForm,
}) {
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const [chartDataError, setChartDataError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Validate ApexCharts JSON
  const validateChartData = (value) => {
    if (!value) {
      setChartDataError(null);
      return true;
    }
    try {
      const parsed = JSON.parse(value);
      if (
        !parsed.type ||
        !parsed.series ||
        !Array.isArray(parsed.series) ||
        !parsed.options
      ) {
        throw new Error(
          "Invalid ApexCharts configuration: missing type, series, or options"
        );
      }
      setChartDataError(null);
      return parsed;
    } catch (error) {
      setChartDataError(error.message);
      return false;
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      toast.success(`Selected: ${file.name}`);
    }
  };

  // Handle input changes with JSON validation for chart_data
  const onInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "chart_data") {
      validateChartData(value);
      handleInputChange({
        target: {
          name,
          value,
        },
      });
    } else {
      handleInputChange({
        target: {
          name,
          value: type === "checkbox" ? checked : value,
        },
      });
    }
  };

  // Handle form submission with validation
  const onSubmit = (e) => {
    e.preventDefault();
    setUploading(true);
    if (formData.type === "Data Visualization" && formData.chart_data) {
      const isValid = validateChartData(formData.chart_data);
      if (!isValid) {
        toast.error("Invalid chart data JSON. Please fix the errors.");
        setUploading(false);
        return;
      }
    }
    handleSubmit(e, selectedFile);
    setUploading(false);
  };

  // Generate sample chart JSON for ApexCharts
  const generateSampleChartData = (chartType) => {
    const colors = ["#4f46e5", "#7c3aed", "#ec4899", "#f59e0b", "#10b981"];
    const samples = {
      bar: {
        type: "bar",
        series: [
          {
            name: "Sales ($000)",
            data: [12, 19, 3, 5, 2],
          },
          {
            name: "Profit ($000)",
            data: [8, 11, 1, 3, 1],
          },
        ],
        options: {
          chart: {
            type: "bar",
            height: 350,
            toolbar: { show: false },
          },
          colors: [colors[0], colors[1]],
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: "55%",
            },
          },
          dataLabels: { enabled: false },
          xaxis: {
            categories: ["January", "February", "March", "April", "May"],
            labels: {
              style: { colors: mode === "dark" ? "#ffffff" : "#000000" },
            },
          },
          yaxis: {
            title: { text: "Amount ($000)" },
            labels: {
              style: { colors: mode === "dark" ? "#ffffff" : "#000000" },
            },
          },
          title: {
            text: "Monthly Sales & Profit",
            align: "center",
            style: { color: mode === "dark" ? "#ffffff" : "#000000" },
          },
          legend: { position: "top" },
        },
      },
      line: {
        type: "line",
        series: [
          {
            name: "Growth (%)",
            data: [65, 59, 80, 81, 56, 55],
          },
          {
            name: "Target (%)",
            data: [60, 65, 70, 75, 60, 65],
          },
        ],
        options: {
          chart: {
            type: "line",
            height: 350,
            toolbar: { show: false },
          },
          colors: [colors[0], colors[1]],
          dataLabels: { enabled: false },
          stroke: { curve: "smooth", width: 2 },
          xaxis: {
            categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            labels: {
              style: { colors: mode === "dark" ? "#ffffff" : "#000000" },
            },
          },
          yaxis: {
            title: { text: "Percentage (%)" },
            labels: {
              style: { colors: mode === "dark" ? "#ffffff" : "#000000" },
            },
          },
          title: {
            text: "Growth vs Target",
            align: "center",
            style: { color: mode === "dark" ? "#ffffff" : "#000000" },
          },
          legend: { position: "top" },
        },
      },
      pie: {
        type: "pie",
        series: [300, 250, 400, 120, 80],
        options: {
          chart: {
            type: "pie",
            height: 350,
            toolbar: { show: false },
          },
          colors,
          labels: [
            "North America",
            "Europe",
            "Asia",
            "Africa",
            "South America",
          ],
          dataLabels: { enabled: true },
          title: {
            text: "Revenue by Region",
            align: "center",
            style: { color: mode === "dark" ? "#ffffff" : "#000000" },
          },
          legend: {
            position: "top",
            labels: { colors: mode === "dark" ? "#ffffff" : "#000000" },
          },
        },
      },
      doughnut: {
        type: "donut",
        series: [55, 35, 8, 2],
        options: {
          chart: {
            type: "donut",
            height: 350,
            toolbar: { show: false },
          },
          colors: [colors[0], colors[1], colors[2], colors[3]],
          labels: ["Desktop", "Mobile", "Tablet", "Other"],
          dataLabels: { enabled: true },
          title: {
            text: "Device Usage Distribution",
            align: "center",
            style: { color: mode === "dark" ? "#ffffff" : "#000000" },
          },
          legend: {
            position: "top",
            labels: { colors: mode === "dark" ? "#ffffff" : "#000000" },
          },
        },
      },
      area: {
        type: "area",
        series: [
          {
            name: "Revenue",
            data: [40, 55, 70, 85],
          },
          {
            name: "Expenses",
            data: [25, 35, 45, 50],
          },
        ],
        options: {
          chart: {
            type: "area",
            height: 350,
            toolbar: { show: false },
          },
          colors: [colors[0], colors[1]],
          dataLabels: { enabled: false },
          stroke: { curve: "smooth", width: 2 },
          fill: {
            type: "gradient",
            gradient: { opacityFrom: 0.6, opacityTo: 0.8 },
          },
          xaxis: {
            categories: ["Q1", "Q2", "Q3", "Q4"],
            labels: {
              style: { colors: mode === "dark" ? "#ffffff" : "#000000" },
            },
          },
          yaxis: {
            title: { text: "Amount ($000)" },
            labels: {
              style: { colors: mode === "dark" ? "#ffffff" : "#000000" },
            },
          },
          title: {
            text: "Quarterly Performance",
            align: "center",
            style: { color: mode === "dark" ? "#ffffff" : "#000000" },
          },
          legend: { position: "top" },
        },
      },
    };
    return JSON.stringify(samples[chartType] || samples.bar, null, 2);
  };

  const insertSampleData = (chartType) => {
    const sampleData = generateSampleChartData(chartType);
    handleInputChange({
      target: {
        name: "chart_data",
        value: sampleData,
      },
    });
    validateChartData(sampleData);
  };

  // Parse chart_data for preview
  const parsedChartData =
    formData.type === "Data Visualization" &&
    formData.chart_data &&
    !chartDataError
      ? JSON.parse(formData.chart_data)
      : null;

  console.log("[MarketIntelForm] parsedChartData:", parsedChartData);

  return (
    <AnimatePresence>
      {showForm && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed right-0 top-0 h-full w-full md:w-[600px] ${
            mode === "dark" ? "bg-gray-900/70" : "bg-white/70"
          } backdrop-blur-xl shadow-2xl p-6 z-50 overflow-y-auto border-l ${
            mode === "dark" ? "border-gray-800/50" : "border-gray-200/50"
          }`}
          ref={formRef}
        >
          <div className="flex justify-between items-center mb-6">
            <h2
              className={`text-2xl font-semibold ${
                mode === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {isEditing ? "Edit Market Intel" : "Create Market Intel"}
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
          <form onSubmit={onSubmit} className="space-y-6">
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
                onChange={onInputChange}
                required
                className={`w-full px-4 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gray-800 text-white border-gray-700"
                    : "bg-white text-gray-900 border-gray-200"
                } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
                placeholder="Enter report title"
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
                onChange={onInputChange}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gray-800 text-white border-gray-700"
                    : "bg-white text-gray-900 border-gray-200"
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
                Tier Restriction *
              </label>
              <select
                name="tier_restriction"
                value={formData.tier_restriction}
                onChange={onInputChange}
                required
                className={`w-full px-4 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gray-800 text-white border-gray-700"
                    : "bg-white text-gray-900 border-gray-200"
                } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
              >
                <option value="All">All Members</option>
                <option value="Associate Members">Associate Members</option>
                <option value="Full Members">Full Members</option>
                <option value="Founding Members">Founding Members</option>
              </select>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Region *
              </label>
              <select
                name="region"
                value={formData.region}
                onChange={onInputChange}
                required
                className={`w-full px-4 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gray-800 text-white border-gray-700"
                    : "bg-white text-gray-900 border-gray-200"
                } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
              >
                <option value="Global">Global</option>
                <option value="East Africa">East Africa</option>
                <option value="West Africa">West Africa</option>
                <option value="Southern Africa">Southern Africa</option>
                <option value="North Africa">North Africa</option>
                <option value="Central Africa">Central Africa</option>
              </select>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={onInputChange}
                required
                className={`w-full px-4 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gray-800 text-white border-gray-700"
                    : "bg-white text-gray-900 border-gray-200"
                } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
              >
                <option value="Report">Report</option>
                <option value="Regional Insight">Regional Insight</option>
                <option value="Data Visualization">Data Visualization</option>
                <option value="Downloadable Resource">
                  Downloadable Resource
                </option>
              </select>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Upload PDF Document
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                />
                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-dashed ${
                    mode === "dark"
                      ? "border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500"
                      : "border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400"
                  } flex items-center justify-center gap-2 transition-colors`}
                >
                  <Icon
                    icon="heroicons:document-arrow-up"
                    className="w-5 h-5"
                  />
                  {selectedFile ? selectedFile.name : "Choose PDF file"}
                </motion.button>
                {selectedFile && (
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      mode === "dark" ? "bg-gray-800" : "bg-gray-100"
                    }`}
                  >
                    <Icon
                      icon="heroicons:document-text"
                      className="w-4 h-4 text-red-500"
                    />
                    <span className="text-sm flex-1">{selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {formData.file_path && !selectedFile && (
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      mode === "dark" ? "bg-gray-800" : "bg-gray-100"
                    }`}
                  >
                    <Icon
                      icon="heroicons:document-text"
                      className="w-4 h-4 text-green-500"
                    />
                    <span className="text-sm flex-1">
                      Existing file uploaded
                    </span>
                  </div>
                )}
              </div>
            </div>
            {formData.type === "Data Visualization" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className={`block text-sm font-medium ${
                      mode === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Chart Data (JSON) - Optional
                  </label>
                  <div className="flex gap-1">
                    {["bar", "line", "pie", "donut", "area"].map((type) => (
                      <motion.button
                        key={type}
                        type="button"
                        onClick={() => insertSampleData(type)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-2 py-1 text-xs rounded ${
                          mode === "dark"
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                        title={`Insert ${type} chart sample`}
                      >
                        {type}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <textarea
                  name="chart_data"
                  value={formData.chart_data || ""}
                  onChange={onInputChange}
                  rows={6}
                  className={`w-full px-4 py-3 rounded-xl ${
                    mode === "dark"
                      ? "bg-gray-800 text-white border-gray-700"
                      : "bg-white text-gray-900 border-gray-200"
                  } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm ${
                    chartDataError ? "border-red-500" : ""
                  }`}
                  placeholder='{
  "type": "bar",
  "series": [
    {
      "name": "Sales",
      "data": [12, 19, 3, 5, 2]
    }
  ],
  "options": {
    "chart": {
      "type": "bar",
      "height": 350
    },
    "xaxis": {
      "categories": ["Jan", "Feb", "Mar", "Apr", "May"]
    },
    "title": {
      "text": "Sample Chart"
    }
  }
}'
                />
                {chartDataError && (
                  <p className="mt-2 text-sm text-red-500">{chartDataError}</p>
                )}
                <p
                  className={`mt-2 text-xs ${
                    mode === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Click the buttons above to insert sample chart data, or paste
                  ApexCharts JSON. Leave empty for regular content.
                </p>
                {parsedChartData && (
                  <div className="mt-4">
                    <label
                      className={`block text-sm font-medium ${
                        mode === "dark" ? "text-gray-300" : "text-gray-700"
                      } mb-2`}
                    >
                      Chart Preview
                    </label>
                    <div
                      className={`p-4 rounded-xl border ${
                        mode === "dark"
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                      }`}
                      style={{ height: "440px" }}
                    >
                      <MarketIntelChart
                        mode={mode}
                        chartData={parsedChartData}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            <div>
              <label
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                URL
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={onInputChange}
                className={`w-full px-4 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gray-800 text-white border-gray-700"
                    : "bg-white text-gray-900 border-gray-200"
                } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
                placeholder="Enter resource URL"
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Icon URL
              </label>
              <input
                type="url"
                name="icon_url"
                value={formData.icon_url}
                onChange={onInputChange}
                className={`w-full px-4 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gray-800 text-white border-gray-700"
                    : "bg-white text-gray-900 border-gray-200"
                } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
                placeholder="Enter icon URL"
              />
              {formData.icon_url && (
                <img
                  src={formData.icon_url}
                  alt="Icon Preview"
                  className={`mt-4 w-16 h-16 rounded-lg object-cover border ${
                    mode === "dark" ? "border-gray-700" : "border-gray-200"
                  } shadow-sm`}
                  onError={() => toast.error("Invalid icon URL")}
                />
              )}
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Downloadable
              </label>
              <input
                type="checkbox"
                name="downloadable"
                checked={formData.downloadable}
                onChange={onInputChange}
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 rounded"
              />
            </div>
            <div className="flex gap-4">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={uploading}
                className={`flex-1 px-6 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gradient-to-r from-indigo-700 to-purple-700 text-white"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                } disabled:opacity-50 flex items-center justify-center shadow-lg hover:shadow-xl`}
              >
                {uploading ? (
                  <>
                    <Icon
                      icon="heroicons:arrow-path"
                      className="w-5 h-5 mr-2 animate-spin"
                    />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Icon icon="heroicons:check" className="w-5 h-5 mr-2" />
                    {isEditing ? "Update" : "Create"}
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
