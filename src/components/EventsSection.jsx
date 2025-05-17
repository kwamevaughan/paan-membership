import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function EventsSection({ mode, events, eventChartData }) {
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
              <Icon icon="mdi:calendar" className="h-5 w-5" />
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
              <Icon icon="mdi:dots-horizontal" className="h-5 w-5" />
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
  );
}
