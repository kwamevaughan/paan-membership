import { useState } from "react";
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";

// Import ApexCharts dynamically to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ModernDeviceChart({ candidates, mode, onFilter }) {
  const [showDetails, setShowDetails] = useState(false);

  // Normalize device names to handle edge cases and ensure consistency
  const normalizeDevice = (device) => {
    if (!device || typeof device !== "string" || device.trim() === "") {
      return "UNKNOWN";
    }
    return device.trim().toUpperCase();
  };

  // Function to group devices into high-level categories
  const groupDevice = (device) => {
    const normalized = normalizeDevice(device);
    if (normalized === "UNKNOWN") return "Other";
    if (
      normalized.includes("MOBILE") ||
      normalized.includes("PHONE") ||
      normalized.includes("ANDROID") ||
      normalized.includes("IOS")
    ) {
      return "Mobile";
    }
    return "Desktop"; // Windows, Ubuntu, Linux, Macintosh, etc.
  };

  // Detailed device count
  const deviceCount = candidates.reduce((acc, c) => {
    const device = normalizeDevice(c.device);
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});

  // Grouped device count
  const groupedCount = candidates.reduce((acc, c) => {
    const group = groupDevice(c.device);
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});

  // Determine which data to display based on toggle
  const displayData = showDetails ? deviceCount : groupedCount;
  const labels = Object.keys(displayData);
  const series = Object.values(displayData);

  // Custom modern colors
  const colors = [
    "#3B82F6", // Blue
    "#F97316", // Orange
    "#10B981", // Green
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#F59E0B", // Amber
    "#6366F1", // Indigo
    "#14B8A6", // Teal
  ];

  // Handle filter clicks
  const handleFilter = (label) => {
    if (showDetails) {
      // Detailed view: filter by exact device name (normalized)
      onFilter("device", label);
    } else {
      // Grouped view: filter by unique devices in the group
      const deviceList = [
        ...new Set(
          candidates
            .map((c) => normalizeDevice(c.device))
            .filter((d) => groupDevice(d) === label)
        ),
      ];
      onFilter("device", deviceList);
    }
  };

  // ApexCharts configuration
  const chartOptions = {
    chart: {
      type: "polarArea",
      toolbar: {
        show: false,
      },
      fontFamily: "'Inter', sans-serif",
      foreColor: mode === "dark" ? "#fff" : "#1F2937",
      events: {
        dataPointSelection: (event, chartContext, config) => {
          if (
            config.dataPointIndex >= 0 &&
            config.dataPointIndex < labels.length
          ) {
            const label = labels[config.dataPointIndex];
            handleFilter(label);
          }
        },
        legendClick: (chartContext, seriesIndex, config) => {
          if (seriesIndex >= 0 && seriesIndex < labels.length) {
            const label = labels[seriesIndex];
            handleFilter(label);
          }
        },
      },
    },
    labels: labels,
    stroke: {
      width: 2,
      colors: [mode === "dark" ? "#1F2937" : "#fff"],
    },
    fill: {
      opacity: 0.8,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    colors: colors,
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      fontWeight: 500,
      labels: {
        colors: mode === "dark" ? "#fff" : "#1F2937",
      },
      markers: {
        width: 12,
        height: 12,
        radius: 6,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
      onItemClick: {
        toggleDataSeries: false,
      },
      formatter: function (seriesName, opts) {
        return [seriesName, " - ", opts.w.globals.series[opts.seriesIndex]];
      },
    },
    tooltip: {
      theme: mode === "dark" ? "dark" : "light",
      y: {
        formatter: function (value) {
          return value + " users";
        },
      },
    },
    plotOptions: {
      polarArea: {
        rings: {
          strokeWidth: 1,
          strokeColor: mode === "dark" ? "#374151" : "#E5E7EB",
        },
        spokes: {
          strokeWidth: 1,
          connectorColors: mode === "dark" ? "#374151" : "#E5E7EB",
        },
      },
    },
    yaxis: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    theme: {
      mode: mode === "dark" ? "dark" : "light",
    },
    animations: {
      enabled: true,
      easing: "easeinout",
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 150,
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350,
      },
    },
  };

  return (
    <div
      className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-500 ${
        mode === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div className="flex items-center gap-3"></div>
      </div>

      <div className="h-80">
        {typeof window !== "undefined" && (
          <Chart
            options={chartOptions}
            series={series}
            type="polarArea"
            height="100%"
          />
        )}
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        <div
          onClick={() => setShowDetails(!showDetails)}
          className={`cursor-pointer p-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
            mode === "dark"
              ? "bg-[#84c1d9] text-white hover:bg-[#65a8c7]"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          <Icon
            icon={"mdi:information-outline"}
            className="w-5 h-5 transition-all duration-300"
          />
        </div>
        <span className="text-sm text-gray-500">
          Click chart segments to filter candidates
        </span>
      </div>
    </div>
  );
}
