import { useState } from "react";
import { Icon } from "@iconify/react";
import { exportToCSV, exportToExcel } from "@/utils/exportUtils";

export function ExportButton({ 
  data, 
  fields, 
  filename, 
  mode = "light",
  label = "Export",
  showFormatSelector = true 
}) {
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = (format) => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}_${timestamp}`;

    if (format === "csv") {
      exportToCSV(data, fields, fullFilename);
    } else if (format === "excel") {
      exportToExcel(data, fields, fullFilename);
    }

    setShowMenu(false);
  };

  if (!showFormatSelector) {
    return (
      <button
        onClick={() => handleExport("csv")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          mode === "dark"
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-green-600 hover:bg-green-700 text-white"
        }`}
      >
        <Icon icon="mdi:download" className="w-5 h-5" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          mode === "dark"
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-green-600 hover:bg-green-700 text-white"
        }`}
      >
        <Icon icon="mdi:download" className="w-5 h-5" />
        <span>{label}</span>
        <Icon icon="mdi:chevron-down" className="w-4 h-4" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div
            className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-20 ${
              mode === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="py-1">
              <button
                onClick={() => handleExport("csv")}
                className={`w-full text-left px-4 py-2 flex items-center gap-2 transition-colors ${
                  mode === "dark"
                    ? "hover:bg-gray-700 text-white"
                    : "hover:bg-gray-100 text-gray-900"
                }`}
              >
                <Icon icon="mdi:file-delimited" className="w-5 h-5" />
                <span>Export as CSV</span>
              </button>
              <button
                onClick={() => handleExport("excel")}
                className={`w-full text-left px-4 py-2 flex items-center gap-2 transition-colors ${
                  mode === "dark"
                    ? "hover:bg-gray-700 text-white"
                    : "hover:bg-gray-100 text-gray-900"
                }`}
              >
                <Icon icon="mdi:file-excel" className="w-5 h-5" />
                <span>Export as Excel</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
