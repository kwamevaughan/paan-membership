// src/components/StatusChart.js
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// Create and register a global plugin for count labels
const countPlugin = {
    id: 'countLabels',
    afterDraw(chart) {
        const { ctx, data, chartArea } = chart;

        // Loop through each slice to display the count number
        data.datasets[0].data.forEach((value, index) => {
            // Get position info from the chart meta
            const meta = chart.getDatasetMeta(0);
            const arc = meta.data[index];

            // Calculate the position for the text (midpoint of the arc)
            const angle = (arc.startAngle + arc.endAngle) / 2;
            const radius = (arc.innerRadius + arc.outerRadius) / 2;

            // Get the center point of the chart
            const centerX = chartArea.left + (chartArea.right - chartArea.left) / 2;
            const centerY = chartArea.top + (chartArea.bottom - chartArea.top) / 2;

            // Calculate text position
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            // Draw the text
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = '#fff'; // White text for visibility
            ctx.fillText(value, x, y);
            ctx.restore();
        });
    }
};

// Register the plugin globally
ChartJS.register(countPlugin);

export default function StatusChart({ candidates, mode, onFilter }) {
    // Aggregate status counts
    const statusCounts = candidates.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
    }, {});

    // Define the provided colors
    const chartColors = [
        "#4361ee", // Blue (e.g., Team A / Pending)
        "#805dca", // Purple (e.g., Team B / Reviewed)
        "#e2a03f", // Orange (e.g., Team C / Shortlisted)
        "#f05d23", // Your brand main color as a fallback (e.g., Rejected)
    ];

    const data = {
        labels: Object.keys(statusCounts),
        datasets: [
            {
                data: Object.values(statusCounts),
                backgroundColor: chartColors.slice(0, Object.keys(statusCounts).length), // Match colors to statuses
                hoverBackgroundColor: chartColors.map((color) =>
                    // Slightly darken for hover effect
                    color === "#4361ee"
                        ? "#3751cc" // Darker blue
                        : color === "#805dca"
                            ? "#6f50b5" // Darker purple
                            : color === "#e2a03f"
                                ? "#c98b34" // Darker orange
                                : "#d94f1e" // Darker brand orange
                ),
                borderWidth: 1,
                borderColor: mode === "dark" ? "#fff" : "#fff", // Secondary brand color for borders
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%", // Donut hole size
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: mode === "dark" ? "#fff" : "#231812",
                    padding: 20,
                    font: { size: 14 },
                },
                onClick: (e, legendItem) => {
                    const status = data.labels[legendItem.index];
                    onFilter("status", status);
                },
            },
            tooltip: {
                backgroundColor: "#4361ee", // Use blue from the palette for tooltip
                titleColor: "#fff",
                bodyColor: "#fff",
                borderColor: "#231812",
                borderWidth: 1,
            },
            // Removed the non-working beforeDraw function
        },
        animation: {
            animateScale: true, // Scale in from center
            animateRotate: true, // Rotate in
            duration: 1500, // 1.5-second animation
            easing: "easeOutQuart", // Smooth easing
        },
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const status = data.labels[index];
                onFilter("status", status);
            }
        },
    };

    return (
        <div
            className={`border-t-4 border-[#f05d23] p-6 rounded-xl shadow-md hover:shadow-none animate-fade-in transition-shadow duration-500 animate-scale-up ${
                mode === "dark" ? "bg-gray-800" : "bg-white"
            }`}
        >
            <h3
                className={`text-lg font-semibold mb-4 ${
                    mode === "dark" ? "text-white" : "text-[#231812]"
                }`}
            >
                Applicant Status
            </h3>
            <div className="h-64">
                <Doughnut data={data} options={options} />
            </div>
        </div>
    );
}