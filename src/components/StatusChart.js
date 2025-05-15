import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";

// Dynamically import ReactApexChart with SSR disabled
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function StatusChart({ candidates, mode, onFilter }) {
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedTab, setSelectedTab] = useState(null);

  const tiers = [
    ...new Set(
      candidates.map((candidate) => candidate.selected_tier).filter(Boolean)
    ),
  ].map((tier) => ({
    name: tier,
  }));

  useEffect(() => {
    if (tiers.length > 0 && !selectedTab) {
      setSelectedTab(tiers[0].name);
    }
  }, [tiers]);

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesTier = selectedTab
      ? candidate.selected_tier === selectedTab
      : true;
    const candidateYear = candidate.submitted_at
      ? new Date(candidate.submitted_at).getFullYear().toString()
      : selectedYear;
    const matchesYear = candidateYear === selectedYear;
    return matchesTier && matchesYear;
  });

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const statusCountsByMonth = months.map((_, index) => {
    return filteredCandidates.reduce((acc, candidate) => {
      const candidateMonth = candidate.submitted_at
        ? new Date(candidate.submitted_at).getMonth()
        : -1;
      if (candidateMonth === index) {
        acc[candidate.status] = (acc[candidate.status] || 0) + 1;
      }
      return acc;
    }, {});
  });

  const totalsByMonth = statusCountsByMonth.map((counts) => {
    return Object.values(counts).reduce((sum, count) => sum + count, 0);
  });

  // Determine zoom range
  let firstIndexWithData = -1;
  let lastIndexWithData = -1;
  for (let i = 0; i < statusCountsByMonth.length; i++) {
    const total = Object.values(statusCountsByMonth[i]).reduce(
      (sum, val) => sum + val,
      0
    );
    if (total > 0) {
      if (firstIndexWithData === -1) firstIndexWithData = i;
      lastIndexWithData = i;
    }
  }

  const tierColors = ["#f05d23", "#e2a03f", "#36a2eb", "#a1c181"];

  const series = [
    {
      name: "Pending",
      type: "column",
      data: statusCountsByMonth.map((counts) => counts["Pending"] || 0),
    },
    {
      name: "Reviewed",
      type: "column",
      data: statusCountsByMonth.map((counts) => counts["Reviewed"] || 0),
    },
    {
      name: "Accepted",
      type: "column",
      data: statusCountsByMonth.map((counts) => counts["Accepted"] || 0),
    },
    {
      name: "Rejected",
      type: "column",
      data: statusCountsByMonth.map((counts) => counts["Rejected"] || 0),
    },
    {
      name: "Total",
      type: "line",
      data: totalsByMonth,
      marker: {
        enabled: false,
      },
    },
  ];

  const options = {
    chart: {
      type: "line",
      stacked: false,
      toolbar: { show: false },
      width: "100%",
      animations: {
        enabled: true,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 350,
          },
          legend: {
            position: "bottom",
          },
        },
      },
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300,
          },
          xaxis: {
            labels: {
              rotate: -45,
            },
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        columnWidth: "100%",
        borderRadius: 6,
        endingShape: "rounded",
      },
    },
    colors: ["#4361ee", "#80d8a8", "#e2a03f", "#f35321", "#ffc107"],
    dataLabels: { enabled: false },
    stroke: {
      width: [1, 1, 1, 1, 4],
      curve: "smooth",
    },
    xaxis: {
      categories: months,
      min: firstIndexWithData !== -1 ? firstIndexWithData : undefined,
      max: lastIndexWithData !== -1 ? lastIndexWithData : undefined,
      labels: {
        style: {
          colors: mode === "dark" ? "#fff" : "#231812",
        },
        rotate: -45,
        rotateAlways: true,
      },
    },
    yaxis: [
      {
        axisTicks: { show: true },
        axisBorder: {
          show: true,
          color: mode === "dark" ? "#fff" : "#6780fb",
        },
        labels: {
          style: {
            colors: mode === "dark" ? "#fff" : "#6780fb",
          },
          formatter: (value) => Math.round(value),
        },
        title: {
          text: "Candidate Count",
          style: {
            color: mode === "dark" ? "#fff" : "#6780fb",
            fontSize: "14px",
            fontWeight: "bold",
          },
        },
      },
      {
        opposite: true,
        axisTicks: { show: true },
        axisBorder: {
          show: true,
          color: "#ffc107",
        },
        labels: {
          style: {
            colors: "#6780fb",
          },
          formatter: (value) => Math.round(value),
        },
        title: {
          text: "Total Candidates",
          style: {
            color: "#ffc107",
            fontSize: "14px",
            fontWeight: "bold",
          },
        },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const month = months[dataPointIndex] || "N/A";

        return `
      <div class="custom-tooltip" style="
        padding: 16px;
        border-radius: 12px;
        backdrop-filter: blur(12px);
        background: ${
          mode === "dark"
            ? "linear-gradient(135deg, rgba(30, 41, 59, 0.03) 0%, rgba(30, 41, 59, 0.01) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.005) 100%)"
        };
        box-shadow: 0 8px 32px rgba(31, 38, 135, 0.05), inset 0 0 6px rgba(255, 255, 255, 0.05);
        border: 1px solid ${
          mode === "dark"
            ? "rgba(255, 255, 255, 0.01)"
            : "rgba(255, 255, 255, 0.1)"
        };
        color: ${mode === "dark" ? "#ffffff" : "#231812"};
        min-width: 200px;
        position: relative;
        overflow: hidden;
        animation: pulseGlow 4s ease-in-out infinite;
      ">
        <div style="
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg, 
            transparent, 
            rgba(255, 255, 255, 0.05), 
            transparent
          );
          transform: rotate(45deg);
          animation: shimmer 5s linear infinite;
          pointer-events: none;
        "></div>
        <div style="
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid ${
            mode === "dark"
              ? "rgba(255, 255, 255, 0.01)"
              : "rgba(0, 0, 0, 0.01)"
          };
          font-weight: 600;
          font-size: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 2;
          text-shadow: none;
        ">
          <span>${
            selectedTab ? selectedTab + " - " : ""
          }${month} ${selectedYear}</span>
          <span style="
            background: ${
              mode === "dark"
                ? "rgba(255, 255, 255, 0.01)"
                : "rgba(255, 255, 255, 0.05)"
            };
            border-radius: 6px;
            padding: 3px 8px;
            font-size: 12px;
            border: 1px solid ${
              mode === "dark"
                ? "rgba(255, 255, 255, 0.01)"
                : "rgba(255, 255, 255, 0.1)"
            };
            box-shadow: inset 0 0 3px rgba(255, 255, 255, 0.05);
          ">Total: ${totalsByMonth[dataPointIndex]}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; position: relative; z-index: 2;">
          ${series
            .slice(0, 4)
            .map((s, index) => {
              const value = s.data[dataPointIndex];
              if (value === undefined || value === null || value === 0)
                return "";
              const seriesName = w.globals.seriesNames[index];
              const color = w.globals.colors[index];
              const percentage =
                totalsByMonth[dataPointIndex] > 0
                  ? Math.round((value / totalsByMonth[dataPointIndex]) * 100)
                  : 0;

              return `
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="
                    width: 12px; 
                    height: 12px; 
                    border-radius: 50%; 
                    background-color: ${color};
                    display: inline-block;
                    box-shadow: 0 0 3px rgba(0,0,0,0.1), inset 0 0 1px rgba(255, 255, 255, 0.1);
                  "></span>
                  <span style="font-size: 13px;">${seriesName}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-weight: 600; font-size: 13px;">${value}</span>
                  <span style="
                    font-size: 11px; 
                    opacity: 0.9;
                  ">(${percentage}%)</span>
                </div>
              </div>
              <div style="
                height: 4px;
                width: 100%;
                background: ${
                  mode === "dark"
                    ? "rgba(255, 255, 255, 0.005)"
                    : "rgba(0, 0, 0, 0.005)"
                };
                border-radius: 2px;
                overflow: hidden;
                margin-bottom: 4px;
                position: relative;
              ">
                <div style="
                  height: 100%;
                  width: ${percentage}%;
                  background: linear-gradient(90deg, ${color}60, ${color}90);
                  border-radius: 2px;
                  position: relative;
                  overflow: hidden;
                ">
                  <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 50%;
                    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent);
                  "></div>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `;
      },
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      labels: {
        colors: mode === "dark" ? "#fff" : "#231812",
      },
      markers: { radius: 12 },
    },
    grid: { show: true },
    zoom: {
      enabled: true,
      type: "x",
    },
  };

  const chartContainerId =
    "glassy-chart-" + Math.random().toString(36).substring(2, 11);

  // Function to create glassy overlay for the tooltip
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Add CSS for glassy tooltip
      const styleElement = document.createElement("style");
      styleElement.textContent = `
        .apexcharts-tooltip {
          background: ${
            mode === "dark"
              ? "rgba(30, 41, 59, 0.7)"
              : "rgba(255, 255, 255, 0.6)"
          } !important;
          backdrop-filter: blur(8px)?â€Šimportant;
          -webkit-backdrop-filter: blur(8px) !important;
          border: 1px solid ${
            mode === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(255, 255, 255, 0.8)"
          } !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
          border-radius: 10px !important;
          overflow: hidden !important;
        }
        
        .apexcharts-tooltip-title {
          background: ${
            mode === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(240, 248, 255, 0.6)"
          } !important;
          border-bottom: 1px solid ${
            mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"
          } !important;
          font-weight: 600 !important;
        }
        
        .apexcharts-tooltip-series-group {
          background: transparent !important;
        }
      `;
      document.head.appendChild(styleElement);

      return () => {
        document.head.removeChild(styleElement);
      };
    }
  }, [mode]);

  return (
    <div
      className={`rounded-2xl cursor-pointer transition-all duration-300 ${
        mode === "dark"
          ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-md hover:shadow-xl text-white"
          : "bg-gradient-to-br from-white to-gray-50 border-blue-100 shadow-lg hover:shadow-xl text-gray-800"
      }`}
    >
      <div className="flex justify-between items-center p-4 pb-0">
        <h3
          className={`text-lg font-bold flex items-center gap-2 ${
            mode === "dark" ? "text-white" : "text-[#231812]"
          }`}
        >
          <Icon
            icon="icon-park-outline:document-folder"
            width={28}
            height={28}
            className={`${mode === "dark" ? "text-white" : "text-indigo-900"}`}
          />
          Candidate Status by Tier
        </h3>
        <div
          className={`flex items-center space-x-2 p-1 rounded-full ${
            mode === "dark" ? "bg-gray-800" : "bg-sky-50"
          }`}
        >
          <button
            className={`p-2 rounded-full flex items-center justify-center ${
              mode === "dark"
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-sky-100 text-[#231812] hover:bg-sky-200"
            }`}
            onClick={() =>
              setSelectedYear((prev) => (parseInt(prev) - 1).toString())
            }
          >
            <Icon
              icon="lsicon:left-filled"
              width={20}
              height={20}
              className={`${mode === "dark" ? "text-white" : "text-[#231812]"}`}
            />
          </button>
          <span
            className={`text-md font-bold ${
              mode === "dark" ? "text-gray-300" : "text-[#231812]"
            }`}
          >
            {selectedYear}
          </span>
          <button
            className={`p-2 rounded-full flex items-center justify-center ${
              mode === "dark"
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-sky-100 text-[#231812] hover:bg-sky-200"
            }`}
            onClick={() =>
              setSelectedYear((prev) => (parseInt(prev) + 1).toString())
            }
          >
            <Icon
              icon="lsicon:right-filled"
              width={20}
              height={20}
              className={`${mode === "dark" ? "text-white" : "text-[#231812]"}`}
            />
          </button>
        </div>
      </div>

      <div className="flex">
        <div className="w-1/5 p-4">
          {tiers.map((tab, index) => {
            const isSelected = selectedTab === tab.name;
            const textColor = tierColors[index % tierColors.length];
            return (
              <button
                key={index}
                className={`flex items-center w-full p-2 mb-2 rounded-lg shadow-md font-extrabold text-left transition-colors duration-200 ${
                  isSelected
                    ? mode === "dark"
                      ? "bg-gray-600 text-white"
                      : "bg-sky-50 text-gray-800"
                    : mode === "dark"
                    ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                    : "bg-white text-gray-800 hover:bg-gray-100"
                }`}
                onClick={() => setSelectedTab(tab.name)}
              >
                <span style={{ color: isSelected ? undefined : textColor }}>
                  {tab.name}
                </span>
              </button>
            );
          })}
        </div>
        <div className="w-4/5 p-4 overflow-hidden">
          {ReactApexChart ? (
            <div id={chartContainerId}>
              <ReactApexChart
                options={options}
                series={series}
                type="line"
                height={400}
                width="100%"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
