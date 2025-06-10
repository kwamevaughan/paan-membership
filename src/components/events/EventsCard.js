import { Icon } from "@iconify/react";
import { useState } from "react";
import ItemActionModal from "@/components/ItemActionModal";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

export default function EventsCard({
  event,
  mode,
  onEdit,
  onDelete,
  onViewRegistrations,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const stripHtml = (html) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const getEventStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return {
        status: "upcoming",
        label: "Upcoming",
        color: mode === "dark" ? "text-blue-400" : "text-blue-600",
        bgColor: mode === "dark" ? "bg-blue-900/30" : "bg-blue-100",
      };
    } else if (now >= start && now <= end) {
      return {
        status: "ongoing",
        label: "Ongoing",
        color: mode === "dark" ? "text-green-400" : "text-green-600",
        bgColor: mode === "dark" ? "bg-green-900/30" : "bg-green-100",
      };
    } else {
      return {
        status: "past",
        label: "Past",
        color: mode === "dark" ? "text-gray-400" : "text-gray-600",
        bgColor: mode === "dark" ? "bg-gray-800" : "bg-gray-100",
      };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  const eventStatus = getEventStatus(event.start_date, event.end_date);
  const timeRemaining = getTimeRemaining(event.end_date);
  const isMultiDay = event.start_date && event.end_date && 
    new Date(event.start_date).toDateString() !== new Date(event.end_date).toDateString();

  const handleViewRegistrations = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onViewRegistrations) {
      onViewRegistrations(event);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative flex flex-col rounded-xl border backdrop-blur-md transition-all duration-300 overflow-hidden transform hover:scale-[1.02] ${
        mode === "dark"
          ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-md hover:shadow-xl text-white"
          : "bg-gradient-to-br from-white to-blue-50 border-blue-100 shadow-lg hover:shadow-xl text-gray-800"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with Image */}
      <div className="relative h-48">
        {event.banner_image ? (
          <Image
            src={event.banner_image}
            alt={event.title}
            fill
            className="object-cover"
            unoptimized={true}
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${
              mode === "dark" ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <Icon
              icon="heroicons:calendar"
              className="w-12 h-12 opacity-50"
              />
          </div>
        )}
        <div
          className={`absolute inset-0 bg-gradient-to-t ${
            mode === "dark"
              ? "from-gray-900/80 to-transparent"
              : "from-gray-900/60 to-transparent"
          }`}
        />
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${eventStatus.color} ${eventStatus.bgColor}`}
          >
            {eventStatus.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pb-4">
        <div className="mb-4">
          <h3 className="font-bold text-lg mb-1 truncate pr-6 max-w-full">
            {event.title}
          </h3>
        </div>

        {/* Date and Time */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Icon icon="heroicons:calendar" className="w-4 h-4" />
            <span>
              {isMultiDay ? (
                <>
                  {formatDate(event.start_date)} - {formatDate(event.end_date)}
                </>
              ) : (
                formatDate(event.start_date)
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Icon icon="heroicons:clock" className="w-4 h-4" />
            <span>
              {formatTime(event.start_date)} - {formatTime(event.end_date)}
            </span>
          </div>
          {timeRemaining && (
            <div className="flex items-center gap-2 text-sm text-blue-500">
              <Icon icon="heroicons:clock" className="w-4 h-4" />
              <span>{timeRemaining}</span>
            </div>
          )}
        </div>

        {/* Type and Region */}
        <div className="flex flex-wrap items-center align-middle gap-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1">
            <Icon icon="heroicons:document-text" className="w-4 h-4" />
            <span>{event.type}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon icon="heroicons:globe-americas" className="w-4 h-4" />
            <span>{event.region}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 pb-6 flex-grow">
        <div
          className={`text-sm leading-relaxed mb-6 line-clamp-3 text-gray-600 dark:text-gray-300`}
        >
          {stripHtml(event.description)}
        </div>

        {/* Tier Restriction */}
        <div className="flex flex-wrap gap-2">
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${
              mode === "dark"
                ? "bg-purple-900/50 text-purple-300"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {event.tier_restriction}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div
        className={`px-6 py-4 border-t flex items-center justify-between ${
          mode === "dark"
            ? "bg-gray-800/40 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="flex items-center text-gray-500">
            <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-1" />
            {event.location || "Virtual Event"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleViewRegistrations}
            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
            title="View registrations"
          >
            <Icon icon="heroicons:user-group" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(event)}
            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
            title="Edit event"
          >
            <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(event)}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
            title="Delete event"
          >
            <Icon icon="heroicons:trash" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
