  import React, { useState, useEffect, useMemo } from "react";
  import { Icon } from "@iconify/react";
  import dynamic from "next/dynamic";

  const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
  });

  export default function StatusChart({
    candidates,
    mode,
    onFilter,
    chartId = "default",
  }) {
    const [selectedYear, setSelectedYear] = useState(
      new Date().getFullYear().toString()
    );
    const [selectedTab, setSelectedTab] = useState(null);
    const [chartContainerId, setChartContainerId] = useState(null);
    const [isChartReady, setIsChartReady] = useState(false);

    const tiers = useMemo(() => {
      // Get unique tier names from candidates, stripping extra descriptions
      const uniqueTiers = [
        ...new Set(
          candidates
            .map((candidate) =>
              candidate.selected_tier
                ? candidate.selected_tier.split(" - ")[0].trim()
                : null
            )
            .filter(Boolean)
        ),
      ];
      // Sort tiers based on the tier number
      return uniqueTiers
        .map((tier) => ({
          name: tier,
          // Extract tier number (e.g., "Tier 1" -> 1) or default to Infinity if not found
          tierNumber: parseInt(tier.match(/Tier (\d+)/)?.[1] || "Infinity", 10),
        }))
        .sort((a, b) => a.tierNumber - b.tierNumber);
    }, [candidates]);

    useEffect(() => {
      if (tiers.length > 0 && !selectedTab) {
        setSelectedTab(tiers[0].name);
      }
    }, [tiers]);

    useEffect(() => {
      if (typeof window !== "undefined") {
        const randomSuffix = Math.random().toString(36).substring(2, 11);
        setChartContainerId(`glassy-chart-${chartId}-${randomSuffix}`);
      }
    }, [chartId]);

    const filteredCandidates = useMemo(
      () =>
        candidates.filter((candidate) => {
          const candidateTier = candidate.selected_tier
            ? candidate.selected_tier.split(" - ")[0].trim()
            : "";
          const matchesTier = selectedTab
            ? candidateTier === selectedTab
            : true;
          const candidateYear = candidate.submitted_at
            ? new Date(candidate.submitted_at).getFullYear().toString()
            : selectedYear;
          return matchesTier && candidateYear === selectedYear;
        }),
      [candidates, selectedTab, selectedYear]
    );

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

    const statusCountsByMonth = useMemo(
      () =>
        months.map((_, index) =>
          filteredCandidates.reduce((acc, candidate) => {
            const candidateMonth = candidate.submitted_at
              ? new Date(candidate.submitted_at).getMonth()
              : -1;
            if (candidateMonth === index) {
              acc[candidate.status] = (acc[candidate.status] || 0) + 1;
            }
            return acc;
          }, {})
        ),
      [filteredCandidates]
    );

    const totalsByMonth = useMemo(
      () =>
        statusCountsByMonth.map((counts) =>
          Object.values(counts).reduce((sum, count) => sum + count, 0)
        ),
      [statusCountsByMonth]
    );

    const zoomRange = useMemo(() => {
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
      return { firstIndexWithData, lastIndexWithData };
    }, [statusCountsByMonth]);

    const tierColors = ["#f05d23", "#e2a03f", "#36a2eb", "#a1c181"];

    const series = useMemo(
      () => [
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
          marker: { enabled: false },
        },
      ],
      [statusCountsByMonth, totalsByMonth]
    );

    const chartColors = ["#4361ee", "#80d8a8", "#e2a03f", "#f35321", "#ffc107"];

    const options = useMemo(
      () => ({
        chart: {
          type: "line",
          stacked: false,
          toolbar: { show: false },
          width: "100%",
          animations: { enabled: true },
          events: {
            mounted: () => setIsChartReady(true),
            updated: () => setIsChartReady(true),
            beforeMount: () => setIsChartReady(false),
          },
        },
        responsive: [
          {
            breakpoint: 1024,
            options: {
              chart: { height: 300 },
              legend: { position: "bottom" },
              xaxis: { labels: { rotate: -45 } },
            },
          },
          {
            breakpoint: 768,
            options: {
              chart: { height: 250 },
              xaxis: {
                labels: {
                  rotate: -45,
                  style: { fontSize: "10px" },
                },
              },
              yaxis: [
                {
                  labels: { style: { fontSize: "10px" } },
                  title: { style: { fontSize: "12px" } },
                },
                {
                  opposite: true,
                  labels: { style: { fontSize: "10px" } },
                  title: { style: { fontSize: "12px" } },
                },
              ],
              plotOptions: {
                bar: { columnWidth: "80%" },
              },
            },
          },
          {
            breakpoint: 480,
            options: {
              chart: { height: 200 },
              xaxis: {
                labels: {
                  rotate: -45,
                  style: { fontSize: "8px" },
                },
              },
              yaxis: [
                {
                  labels: { style: { fontSize: "8px" } },
                  title: { style: { fontSize: "10px" } },
                },
                {
                  opposite: true,
                  labels: { style: { fontSize: "8px" } },
                  title: { style: { fontSize: "10px" } },
                },
              ],
              plotOptions: {
                bar: { columnWidth: "70%" },
              },
              legend: {
                fontSize: "10px",
                offsetY: 10,
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
        colors: chartColors,
        dataLabels: { enabled: false },
        stroke: {
          width: [1, 1, 1, 1, 4],
          curve: "smooth",
        },
        xaxis: {
          categories: months,
          min:
            zoomRange.firstIndexWithData !== -1
              ? zoomRange.firstIndexWithData
              : undefined,
          max:
            zoomRange.lastIndexWithData !== -1
              ? zoomRange.lastIndexWithData
              : undefined,
          labels: {
            style: { colors: mode === "dark" ? "#fff" : "#231812" },
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
              style: { colors: mode === "dark" ? "#fff" : "#6780fb" },
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
            axisBorder: { show: true, color: "#ffc107" },
            labels: {
              style: { colors: "#6780fb" },
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
            if (
              !isChartReady ||
              !w?.globals ||
              !Array.isArray(w.globals.seriesNames) ||
              !Array.isArray(w.globals.colors) ||
              !Array.isArray(series) ||
              dataPointIndex === undefined
            ) {
              return '<div class="custom-tooltip" style="padding: 12px; border-radius: 8px; color: #000; background: rgba(255, 255, 255, 0.8);">Loading...</div>';
            }

            const month = months[dataPointIndex] || "N/A";
            const total = totalsByMonth[dataPointIndex] || 0;

            return `
              <div class="custom-tooltip" style="
                padding: 12px;
                border-radius: 8px;
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
                min-width: 150px;
                max-width: 90vw;
                font-size: 12px;
                position: relative;
                overflow: hidden;
                animation: pulseGlow 4s ease-in-out infinite;
              ">
                <div style="
                  margin-bottom: 8px;
                  padding-bottom: 6px;
                  border-bottom: 1px solid ${
                    mode === "dark"
                      ? "rgba(255, 255, 255, 0.01)"
                      : "rgba(0, 0, 0, 0.01)"
                  };
                  font-weight: 600;
                  font-size: 12px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  position: relative;
                  z-index: 2;
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
                    padding: 2px 6px;
                    font-size: 10px;
                    border: 1px solid ${
                      mode === "dark"
                        ? "rgba(255, 255, 255, 0.01)"
                        : "rgba(255, 255, 255, 0.1)"
                    };
                  ">Total: ${total}</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px; position: relative; z-index: 2;">
                  ${
                    Array.isArray(series) && series.length >= 4
                      ? series
                          .slice(0, 4)
                          .map((s, index) => {
                            if (
                              !s ||
                              !Array.isArray(s.data) ||
                              dataPointIndex >= s.data.length
                            ) {
                              return "";
                            }

                            const value = s.data[dataPointIndex];
                            if (
                              value === undefined ||
                              value === null ||
                              value === 0
                            )
                              return "";

                            const color =
                              chartColors[index % chartColors.length] || "#ccc";
                            const percentage =
                              total > 0 ? Math.round((value / total) * 100) : 0;
                            const seriesName =
                              w.globals.seriesNames[index] ||
                              `Series ${index + 1}`;

                            return `
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                              <div style="display: flex; align-items: center; gap: 6px;">
                                <span style="
                                  width: 10px; 
                                  height: 10px; 
                                  border-radius: 50%; 
                                  background-color: ${color};
                                  display: inline-block;
                                "></span>
                                <span style="font-size: 11px;">${seriesName}</span>
                              </div>
                              <div style="display: flex; align-items: center; gap: 4px;">
                                <span style="font-weight: 600; font-size: 11px;">${value}</span>
                                <span style="font-size: 10px; opacity: 0.9;">(${percentage}%)</span>
                              </div>
                            </div>
                            <div style="
                              height: 3px;
                              width: 100%;
                              background: ${
                                mode === "dark"
                                  ? "rgba(255, 255, 255, 0.005)"
                                  : "rgba(0, 0, 0, 0.005)"
                              };
                              border-radius: 2px;
                              overflow: hidden;
                            ">
                              <div style="
                                height: 100%;
                                width: ${percentage}%;
                                background: linear-gradient(90deg, ${color}60, ${color}90);
                                border-radius: 2px;
                              "></div>
                            </div>
                          `;
                          })
                          .join("")
                      : ""
                  }
                </div>
              </div>
            `;
          },
        },
        legend: {
          position: "bottom",
          horizontalAlign: "center",
          labels: { colors: mode === "dark" ? "#fff" : "#231812" },
          markers: { radius: 12 },
          fontSize: "12px",
        },
        grid: { show: true },
        zoom: { enabled: true, type: "x" },
      }),
      [
        mode,
        months,
        selectedTab,
        selectedYear,
        totalsByMonth,
        zoomRange,
        chartColors,
        isChartReady,
      ]
    );

    useEffect(() => {
      if (typeof window !== "undefined") {
        const styleElement = document.createElement("style");
        styleElement.textContent = `
          .apexcharts-tooltip {
            background: ${
              mode === "dark"
                ? "rgba(30, 41, 59, 0.7)"
                : "rgba(255, 255, 255, 0.6)"
            } !important;
            backdrop-filter: blur(8px) !important;
            -webkit-backdrop-filter: blur(8px) !important;
            border: 1px solid ${
              mode === "dark"
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(255, 255, 255, 0.8)"
            } !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
            border-radius: 8px !important;
            overflow: hidden !important;
            font-size: 12px !important;
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
            font-size: 12px !important;
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
        <div className="flex flex-col sm:flex-row justify-between items-start p-4 pb-0 sm:pb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 rounded-2xl bg-blue-400/10 shadow-lg">
                <Icon icon="mdi:chart-bar" className="w-6 h-6 text-[#4086f7]" />
              </div>
            </div>
            <h2
              className={`text-lg sm:text-xl font-medium text-[#172840] truncate ${
                mode === "dark" ? "text-white" : "text-gray-800"
              }`}
            >
              Candidate Status by Tier
            </h2>
          </div>
          <div
            className={`flex items-center space-x-2 p-1 rounded-full mt-2 sm:mt-0 self-center sm:self-auto ${
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
                className={`${
                  mode === "dark" ? "text-white" : "text-[#231812]"
                }`}
              />
            </button>
            <span
              className={`text-sm sm:text-md font-medium ${
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
                className={`${
                  mode === "dark" ? "text-white" : "text-[#231812]"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/5 p-2 sm:p-4 overflow-x-auto md:overflow-x-visible">
            <div className="flex md:flex-col gap-2">
              {tiers.map((tab, index) => {
                const isSelected = selectedTab === tab.name;
                const textColor = tierColors[index % tierColors.length];
                return (
                  <button
                    key={index}
                    className={`flex items-center justify-center w-full md:w-auto p-3 my-2 rounded-lg shadow-md font-medium text-left transition-colors duration-200 min-h-[48px] md:whitespace-normal whitespace-nowrap ${
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
                    <span
                      className="break-words text-sm leading-tight"
                      style={{ color: isSelected ? undefined : textColor }}
                    >
                      {tab.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="w-full md:w-4/5 p-2 sm:p-4 overflow-hidden">
            {ReactApexChart && chartContainerId ? (
              <div id={chartContainerId}>
                <ReactApexChart
                  options={options}
                  series={series}
                  type="line"
                  height={400}
                  width="100%"
                />
              </div>
            ) : (
              <div className="p-8 text-center">
                <Icon
                  icon="mdi:loading"
                  className="mx-auto text-4xl animate-spin"
                />
                <p>Loading chart...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
