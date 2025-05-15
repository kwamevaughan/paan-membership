import { useState } from "react";
import dynamic from "next/dynamic";

// Using dynamic import for charts to ensure they work in Next.js
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function ResourcesOverview({ mode = "light" }) {
  // Sample data for events
  const events = [
    {
      id: 1,
      title: "Q2 Marketing Summit",
      date: "June 5, 2025",
      status: "upcoming",
      attendees: 120,
    },
    {
      id: 2,
      title: "Product Launch",
      date: "June 15, 2025",
      status: "upcoming",
      attendees: 250,
    },
    {
      id: 3,
      title: "Team Workshop",
      date: "June 30, 2025",
      status: "upcoming",
      attendees: 35,
    },
    {
      id: 4,
      title: "Annual Conference",
      date: "April 10, 2025",
      status: "past",
      attendees: 425,
    },
    {
      id: 5,
      title: "Customer Webinar",
      date: "May 1, 2025",
      status: "past",
      attendees: 186,
    },
  ];

  // Video metrics data
  const videoMetrics = [
    { name: "Tutorial Series", views: 8420, engagement: 76 },
    { name: "Product Demos", views: 5280, engagement: 62 },
    { name: "Webinar Recordings", views: 3150, engagement: 54 },
    { name: "Case Studies", views: 2740, engagement: 48 },
  ];

  // Chart data for downloads
  const downloadChartData = {
    series: [
      {
        name: "Downloads",
        data: [42, 56, 40, 64, 26, 48, 60],
      },
    ],
    options: {
      chart: {
        height: 180,
        type: "area",
        toolbar: { show: false },
        fontFamily: "Inter, sans-serif",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 2,
        colors: [mode === "dark" ? "#8B5CF6" : "#6D28D9"],
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 90, 100],
          colorStops: [
            {
              offset: 0,
              color: mode === "dark" ? "#8B5CF6" : "#A78BFA",
              opacity: 0.4,
            },
            {
              offset: 100,
              color: mode === "dark" ? "#8B5CF6" : "#A78BFA",
              opacity: 0.1,
            },
          ],
        },
      },
      xaxis: {
        categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        labels: {
          style: {
            colors: mode === "dark" ? "#9CA3AF" : "#6B7280",
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          show: false,
        },
      },
      grid: {
        show: true,
        borderColor: mode === "dark" ? "#374151" : "#F3F4F6",
        strokeDashArray: 4,
        xaxis: {
          lines: { show: false },
        },
      },
      tooltip: {
        theme: mode === "dark" ? "dark" : "light",
      },
    },
  };

  // Chart data for events
  const eventChartData = {
    series: [
      {
        name: "Upcoming",
        data: [3],
      },
      {
        name: "Past",
        data: [2],
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 180,
        stacked: true,
        toolbar: { show: false },
        fontFamily: "Inter, sans-serif",
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 8,
          barHeight: "40%",
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: ["Events"],
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: { show: false },
      },
      grid: { show: false },
      legend: {
        position: "bottom",
        horizontalAlign: "left",
        labels: {
          colors: mode === "dark" ? "#E5E7EB" : "#4B5563",
        },
      },
      colors: [
        mode === "dark" ? "#10B981" : "#059669",
        mode === "dark" ? "#FBBF24" : "#D97706",
      ],
    },
  };

  // Chart data for download types
  const downloadTypesChartData = {
    series: [29, 45, 26],
    options: {
      chart: {
        type: "donut",
        height: 200,
      },
      labels: ["PDF Reports", "Market Insights", "Trend Analysis"],
      colors: [
        mode === "dark" ? "#EC4899" : "#DB2777",
        mode === "dark" ? "#8B5CF6" : "#7C3AED",
        mode === "dark" ? "#3B82F6" : "#2563EB",
      ],
      dataLabels: { enabled: false },
      plotOptions: {
        pie: {
          donut: {
            size: "70%",
            labels: {
              show: true,
              name: { show: false },
              value: {
                show: true,
                fontSize: "20px",
                fontWeight: 600,
                color: mode === "dark" ? "#F3F4F6" : "#1F2937",
                formatter: function (val) {
                  return val + "%";
                },
              },
              total: {
                show: true,
                color: mode === "dark" ? "#D1D5DB" : "#6B7280",
                formatter: function () {
                  return "100%";
                },
              },
            },
          },
        },
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        labels: {
          colors: mode === "dark" ? "#E5E7EB" : "#4B5563",
        },
      },
    },
  };

  return (
    <div
      className={`rounded-2xl p-6 cursor-pointer transition-all duration-300  ${
        mode === "dark"
          ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-md hover:shadow-xl text-white"
          : "bg-gradient-to-br from-white to-gray-50 border-blue-100 shadow-lg hover:shadow-xl text-gray-800"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2
          className={`text-2xl font-bold flex items-center ${
            mode === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2 text-purple-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
          </svg>
          Resource Dashboard
        </h2>

        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              mode === "dark"
                ? "bg-purple-900 text-purple-200"
                : "bg-purple-100 text-purple-800"
            }`}
          >
            Admin View
          </span>
          <button
            className={`p-2 rounded-full ${
              mode === "dark"
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Events */}
        <div
          className={`p-4 rounded-xl ${
            mode === "dark"
              ? "bg-gray-800 border border-gray-700"
              : "bg-gray-50 border border-gray-100"
          }`}
        >
          <div className="flex justify-between">
            <div>
              <p
                className={`text-sm font-medium ${
                  mode === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Total Events
              </p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  mode === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {events.length}
              </p>
            </div>
            <div
              className={`p-2 rounded-lg ${
                mode === "dark"
                  ? "bg-green-900/30 text-green-400"
                  : "bg-green-100 text-green-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Downloads */}
        <div
          className={`p-4 rounded-xl ${
            mode === "dark"
              ? "bg-gray-800 border border-gray-700"
              : "bg-gray-50 border border-gray-100"
          }`}
        >
          <div className="flex justify-between">
            <div>
              <p
                className={`text-sm font-medium ${
                  mode === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Total Downloads
              </p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  mode === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                29
              </p>
            </div>
            <div
              className={`p-2 rounded-lg ${
                mode === "dark"
                  ? "bg-purple-900/30 text-purple-400"
                  : "bg-purple-100 text-purple-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Videos */}
        <div
          className={`p-4 rounded-xl ${
            mode === "dark"
              ? "bg-gray-800 border border-gray-700"
              : "bg-gray-50 border border-gray-100"
          }`}
        >
          <div className="flex justify-between">
            <div>
              <p
                className={`text-sm font-medium ${
                  mode === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Videos Published
              </p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  mode === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                20
              </p>
            </div>
            <div
              className={`p-2 rounded-lg ${
                mode === "dark"
                  ? "bg-pink-900/30 text-pink-400"
                  : "bg-pink-100 text-pink-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Users */}
        <div
          className={`p-4 rounded-xl ${
            mode === "dark"
              ? "bg-gray-800 border border-gray-700"
              : "bg-gray-50 border border-gray-100"
          }`}
        >
          <div className="flex justify-between">
            <div>
              <p
                className={`text-sm font-medium ${
                  mode === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Active Users
              </p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  mode === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                1,024
              </p>
            </div>
            <div
              className={`p-2 rounded-lg ${
                mode === "dark"
                  ? "bg-blue-900/30 text-blue-400"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events Section */}
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
              Events Overview
            </h3>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                mode === "dark"
                  ? "bg-green-900/30 text-green-400"
                  : "bg-green-100 text-green-600"
              }`}
            >
              3 Upcoming
            </div>
          </div>

          <div className="flex mb-4">
            <div className="w-full h-40">
              <ReactApexChart
                options={eventChartData.options}
                series={eventChartData.series}
                type="bar"
                height={160}
              />
            </div>
          </div>

          <div className="space-y-3">
            {events.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className={`flex items-center p-3 rounded-lg ${
                  mode === "dark"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-50 hover:bg-gray-100"
                } transition-colors duration-150`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg ${
                    event.status === "upcoming"
                      ? mode === "dark"
                        ? "bg-green-900/30 text-green-400"
                        : "bg-green-100 text-green-600"
                      : mode === "dark"
                      ? "bg-yellow-900/30 text-yellow-400"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <h4
                    className={`text-sm font-medium ${
                      mode === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {event.title}
                  </h4>
                  <div className="flex items-center mt-1">
                    <span
                      className={`text-xs ${
                        mode === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {event.date}
                    </span>
                    <span
                      className={`mx-2 text-xs ${
                        mode === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      •
                    </span>
                    <span
                      className={`text-xs ${
                        mode === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {event.attendees} attendees
                    </span>
                  </div>
                </div>
                <button
                  className={`p-1 rounded-full ${
                    mode === "dark"
                      ? "hover:bg-gray-600 text-gray-400"
                      : "hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button
            className={`w-full mt-4 py-2 text-sm font-medium rounded-lg ${
              mode === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            View All Events
          </button>
        </div>

        {/* Resources Section */}
        <div className="space-y-6">
          {/* Downloads Chart */}
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
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
              <div
                className={`p-3 rounded-lg ${
                  mode === "dark" ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <p
                  className={`text-xs font-medium ${
                    mode === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  PDF Reports
                </p>
                <p
                  className={`text-lg font-semibold mt-1 ${
                    mode === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  4
                </p>
              </div>
              <div
                className={`p-3 rounded-lg ${
                  mode === "dark" ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <p
                  className={`text-xs font-medium ${
                    mode === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Market Insights
                </p>
                <p
                  className={`text-lg font-semibold mt-1 ${
                    mode === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  10
                </p>
              </div>
              <div
                className={`p-3 rounded-lg ${
                  mode === "dark" ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <p
                  className={`text-xs font-medium ${
                    mode === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Trend Analysis
                </p>
                <p
                  className={`text-lg font-semibold mt-1 ${
                    mode === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  15
                </p>
              </div>
            </div>
          </div>

          {/* Videos Section */}
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
                Video Resources
              </h3>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  mode === "dark"
                    ? "bg-pink-900/30 text-pink-400"
                    : "bg-pink-100 text-pink-600"
                }`}
              >
                20 Videos
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                {videoMetrics.slice(0, 2).map((video, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      mode === "dark" ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <p
                        className={`text-sm font-medium ${
                          mode === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {video.name}
                      </p>
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          mode === "dark"
                            ? "bg-blue-900/30 text-blue-400"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {video.engagement}% Engagement
                      </div>
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        mode === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {video.views.toLocaleString()} views
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {videoMetrics.slice(2, 4).map((video, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      mode === "dark" ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <p
                        className={`text-sm font-medium ${
                          mode === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {video.name}
                      </p>
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          mode === "dark"
                            ? "bg-blue-900/30 text-blue-400"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {video.engagement}% Engagement
                      </div>
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        mode === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {video.views.toLocaleString()} views
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button
              className={`w-full mt-4 py-2 text-sm font-medium rounded-lg ${
                mode === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              Manage Video Resources
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
