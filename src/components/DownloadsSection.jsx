import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function DownloadsSection({ mode, downloadChartData }) {
  return (
    <div
      className={`p-5 rounded-xl ${
        mode === "dark"
          ? "bg-gray-800 border border-gray-700"
          : "bg-white border border-gray-100 shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`text-lg font-semibold ${
            mode === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          Downloads
        </h3>
        <div className="flex items-center">
          <span
            className={`text-sm ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            This Week
          </span>
          <button
            className={`ml-2 p-1 rounded ${
              mode === "dark"
                ? "hover:bg-gray-700 text-gray-400"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <Icon icon="mdi:chevron-down" className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="mb-4">
        <ReactApexChart
          options={downloadChartData.options}
          series={downloadChartData.series}
          type="area"
          height={160}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {["PDF Reports", "Market Insights", "Trend Analysis"].map(
          (item, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                mode === "dark" ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              <p
                className={`text-xs font-medium ${
                  mode === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {item}
              </p>
              <p
                className={`text-lg font-semibold mt-1 ${
                  mode === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {[4, 10, 15][index]}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
