import { useState } from "react";
import dynamic from "next/dynamic";
import DashboardHeader from "./DashboardHeader";
import StatsCard from "./StatsCard";
import EventsSection from "./EventsSection";
import DownloadsSection from "./DownloadsSection";
import VideosSection from "./VideosSection";

// Dynamic import for charts
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// Sample data
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

const videoMetrics = [
  { name: "Tutorial Series", views: 8420, engagement: 76 },
  { name: "Product Demos", views: 5280, engagement: 62 },
  { name: "Webinar Recordings", views: 3150, engagement: 54 },
  { name: "Case Studies", views: 2740, engagement: 48 },
];

export default function ResourcesOverview({ mode = "light" }) {
  // Chart configurations
  const downloadChartData = {
    series: [{ name: "Downloads", data: [42, 56, 40, 64, 26, 48, 60] }],
    options: {
      chart: {
        height: 180,
        type: "area",
        toolbar: { show: false },
        fontFamily: "Inter, sans-serif",
      },
      dataLabels: { enabled: false },
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
        labels: { style: { colors: mode === "dark" ? "#9CA3AF" : "#6B7280" } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { labels: { show: false } },
      grid: {
        show: true,
        borderColor: mode === "dark" ? "#374151" : "#F3F4F6",
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
      },
      tooltip: { theme: mode === "dark" ? "dark" : "light" },
    },
  };

  const eventChartData = {
    series: [
      { name: "Upcoming", data: [3] },
      { name: "Past", data: [2] },
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
        bar: { horizontal: true, borderRadius: 8, barHeight: "40%" },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: ["Events"],
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { labels: { show: false } },
      grid: { show: false },
      legend: {
        position: "bottom",
        horizontalAlign: "left",
        labels: { colors: mode === "dark" ? "#E5E7EB" : "#4B5563" },
      },
      colors: [
        mode === "dark" ? "#10B981" : "#059669",
        mode === "dark" ? "#FBBF24" : "#D97706",
      ],
    },
  };

  return (
    <div
      className={`rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
        mode === "dark"
          ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-md hover:shadow-xl text-white"
          : "bg-gradient-to-br from-white to-gray-50 border-blue-100 shadow-lg hover:shadow-xl text-gray-800"
      }`}
    >
      <DashboardHeader mode={mode} />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Events"
          value={events.length}
          icon="mdi:calendar"
          iconColor={
            mode === "dark"
              ? "bg-green-900/30 text-green-400"
              : "bg-green-100 text-green-600"
          }
          mode={mode}
        />
        <StatsCard
          title="Total Downloads"
          value={29}
          icon="mdi:download"
          iconColor={
            mode === "dark"
              ? "bg-purple-900/30 text-purple-400"
              : "bg-purple-100 text-purple-600"
          }
          mode={mode}
        />
        <StatsCard
          title="Videos Published"
          value={20}
          icon="mdi:video"
          iconColor={
            mode === "dark"
              ? "bg-pink-900/30 text-pink-400"
              : "bg-pink-100 text-pink-600"
          }
          mode={mode}
        />
        <StatsCard
          title="Total Users"
          value="1,024"
          icon="mdi:account-group"
          iconColor={
            mode === "dark"
              ? "bg-blue-900/30 text-blue-400"
              : "bg-blue-100 text-blue-600"
          }
          mode={mode}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EventsSection
          mode={mode}
          events={events}
          eventChartData={eventChartData}
        />
        <div className="space-y-6">
          <DownloadsSection mode={mode} downloadChartData={downloadChartData} />
          <VideosSection mode={mode} videoMetrics={videoMetrics} />
        </div>
      </div>
    </div>
  );
}
