// src/components/DeviceChart.js
import { PolarArea } from "react-chartjs-2";
import { Chart as ChartJS, RadialLinearScale, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useState } from "react";

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend, ChartDataLabels);

export default function DeviceChart({ candidates, mode, onFilter }) {
    const [showDetails, setShowDetails] = useState(false);

    // Function to group devices into high-level categories
    const groupDevice = (device) => {
        if (!device || device === "Unknown") return "Other";
        if (device.toLowerCase().includes("mobile")) return "Mobile";
        return "Desktop"; // Windows, Ubuntu, Linux, Macintosh, etc.
    };

    // Detailed device count
    const deviceCount = candidates.reduce((acc, c) => {
        const device = c.device || "Unknown";
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
    const labels = showDetails ? Object.keys(deviceCount) : Object.keys(groupedCount);
    const baseColors = [
        "#f05d23", // Main orange
        "#231812", // Secondary brown
        "#ff9f1c", // Secondary yellow
        "#85ff9e", // Secondary green
        "#1c78ff", // Secondary blue
        "#ff1c78", // Secondary pink
    ];

    const data = {
        labels: labels,
        datasets: [
            {
                data: showDetails ? Object.values(deviceCount) : Object.values(groupedCount),
                backgroundColor: labels.map((_, index) =>
                    `rgba(${parseInt(baseColors[index % baseColors.length].slice(1, 3), 16)}, ${parseInt(
                        baseColors[index % baseColors.length].slice(3, 5),
                        16
                    )}, ${parseInt(baseColors[index % baseColors.length].slice(5, 7), 16)}, 0.7)`
                ),
                hoverBackgroundColor: labels.map((_, index) => baseColors[index % baseColors.length]),
                borderWidth: 1,
                borderColor: mode === "dark" ? "#fff" : "#231812",
            },
        ],
    };

    // Handle filter clicks with grouped logic
    const handleFilter = (label) => {
        if (showDetails) {
            // Detailed view: filter by exact device name
            onFilter("device", label);
        } else {
            // Grouped view: filter by all devices in the group
            const deviceList = candidates
                .map((c) => c.device)
                .filter((d) => groupDevice(d) === label);
            onFilter("device", deviceList);
        }
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: mode === "dark" ? "#fff" : "#231812",
                    padding: 20,
                    font: { size: 14 },
                },
                onClick: (e, legendItem) => {
                    const label = data.labels[legendItem.index];
                    handleFilter(label);
                },
            },
            tooltip: {
                backgroundColor: "rgba(240, 93, 35, 0.9)",
                titleColor: "#fff",
                bodyColor: "#fff",
                borderColor: "#231812",
                borderWidth: 1,
                cornerRadius: 8,
            },
            datalabels: {
                color: "#fff",
                font: {
                    size: 14,
                    weight: "bold",
                },
                formatter: (value) => value,
                anchor: "center",
                align: "center",
                textShadowBlur: 4,
                textShadowColor: "#000",
            },
        },
        animation: {
            animateScale: true,
            animateRotate: true,
            duration: 2000,
            easing: "easeOutBounce",
        },
        scales: {
            r: {
                ticks: {
                    display: false,
                },
                grid: {
                    color: mode === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(35, 24, 18, 0.2)",
                },
            },
        },
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const label = data.labels[index];
                handleFilter(label);
            }
        },
    };

    return (
      <div
        className={`border-t-4 border-[#84c1d9] p-6 rounded-xl shadow-lg hover:shadow-xl animate-fade-in transition-shadow duration-500 ${
          mode === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className={`text-lg font-semibold ${
              mode === "dark" ? "text-white" : "text-[#231812]"
            }`}
          >
            Device Usage
          </h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
              mode === "dark"
                ? "bg-[#84c1d9] text-white hover:bg-[#6ba8c1]" // Dark mode button with hover
                : "bg-[#84c1d9] text-white hover:bg-[#6ba8c1]" // Light mode button with hover
            }`}
          >
            {showDetails ? "Show Grouped View" : "Show Detailed View"}
          </button>
        </div>
        <div className="h-72">
          <PolarArea data={data} options={options} />
        </div>
      </div>
    );

}