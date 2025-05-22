import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Dynamically import react-apexcharts with SSR disabled
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function MarketIntelChart({ mode, chartData }) {
  if (!chartData || !chartData.options || !chartData.series) {
    console.warn("[MarketIntelChart] Missing chartData or chartData.options");
    return null; // Or render a fallback component/spinner
  }

  const updatedChartData = {
    ...chartData,
    options: {
      ...chartData.options,
      theme: {
        ...chartData.options.theme,
        mode: mode === "dark" ? "dark" : "light",
      },
      colors: chartData.options.colors || [
        "#4F46E5",
        "#9333EA",
        "#EAB308",
        "#EF4444",
      ],
    },
  };

  console.log("[MarketIntelChart] Rendering chart:", updatedChartData);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`p-4 rounded-2xl backdrop-blur-lg shadow-xl border ${
        mode === "dark"
          ? "bg-gray-800/10 border-gray-700/50"
          : "bg-white/10 border-gray-200/50"
      }`}
    >
      <Chart
        options={updatedChartData.options}
        series={updatedChartData.series}
        type={chartData.type}
        height={350}
      />
    </motion.div>
  );
}

