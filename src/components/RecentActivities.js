import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";

export default function ModernTimeline({
  mode = "light",
  onFilter,
  onActivityClick,
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // Sample data for recent activities
  const activities = [
    {
      time: "5:20 PM",
      date: "Today",
      type: "opportunity",
      description:
        "New business opportunity posted for Founding Members: Global Partnership in Tech Industry.",
      category: "Business",
    },
    {
      time: "1:02 PM",
      date: "Today",
      type: "event",
      description:
        "Event announcement: Regional Networking Event for Full Members in Nigeria.",
      category: "Event",
    },
    {
      time: "8:14 AM",
      date: "Today",
      type: "report",
      description:
        "Market Intel report released: Emerging Trends in African Retail for Full Members.",
      category: "Report",
    },
    {
      time: "3:45 PM",
      date: "Yesterday",
      type: "access",
      description:
        "Associate Member accessed subcontracting opportunity in Marketing Services.",
      category: "Business",
    },
    {
      time: "11:20 AM",
      date: "Yesterday",
      type: "resource",
      description:
        "New resource uploaded: Startup Business Guide for Associate Members.",
      category: "Resource",
    },
    {
      time: "2:30 PM",
      date: "May 13",
      type: "update",
      description:
        "Update posted: New governance initiative for Founding Members.",
      category: "Update",
    },
    {
      time: "10:15 AM",
      date: "May 12",
      type: "offer",
      description:
        "Offer added: 20% discount on software tools for Full Members.",
      category: "Offer",
    },
    {
      time: "4:00 PM",
      date: "May 8",
      type: "event",
      description:
        "Event held: Webinar on Business Development for Associate Members.",
      category: "Event",
    },
  ];

  // Filter activities with loading simulation
  const handleFilter = (filter) => {
    setIsLoading(true);
    setActiveFilter(filter);
    setTimeout(() => setIsLoading(false), 300);
    if (onFilter) onFilter(filter);
  };

  // Memoize filtered activities
  const filteredActivities = useMemo(() => {
    // First filter by category
    const filtered =
      activeFilter === "all"
        ? activities
        : activities.filter(
            (activity) =>
              activity.category.toLowerCase() === activeFilter.toLowerCase()
          );

    // Then group by date
    return filtered.reduce((groups, activity) => {
      const date = activity.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
      return groups;
    }, {});
  }, [activeFilter]);

  // Activity styles with modern colors and Iconify icons
  const activityStyles = {
    opportunity: {
      bg: "bg-indigo-500",
      gradient: "from-indigo-500 to-indigo-600",
      icon: "heroicons-outline:briefcase",
    },
    event: {
      bg: "bg-sky-500",
      gradient: "from-sky-500 to-sky-600",
      icon: "heroicons-outline:calendar",
    },
    report: {
      bg: "bg-amber-500",
      gradient: "from-amber-500 to-amber-600",
      icon: "heroicons-outline:chart-pie",
    },
    access: {
      bg: "bg-blue-500",
      gradient: "from-blue-400 to-blue-600",
      icon: "heroicons-outline:key",
    },
    resource: {
      bg: "bg-emerald-500",
      gradient: "from-emerald-400 to-emerald-600",
      icon: "heroicons-outline:book-open",
    },
    update: {
      bg: "bg-violet-500",
      gradient: "from-violet-400 to-violet-600",
      icon: "heroicons-outline:megaphone",
    },
    offer: {
      bg: "bg-rose-500",
      gradient: "from-rose-400 to-rose-600",
      icon: "heroicons-outline:tag",
    },
  };

  // Filter categories with Iconify icons
  const filterCategories = [
    { id: "all", label: "All", icon: "heroicons-outline:list-bullet" },
    {
      id: "business",
      label: "Business",
      icon: "heroicons-outline:building-office",
    },
    { id: "event", label: "Events", icon: "heroicons-outline:calendar" },
    { id: "report", label: "Reports", icon: "heroicons-outline:chart-bar" },
    { id: "resource", label: "Resources", icon: "heroicons-outline:book-open" },
    { id: "offer", label: "Offers", icon: "heroicons-outline:tag" },
  ];

  const themeClass =
    mode === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900";

  const borderClass = mode === "dark" ? "border-gray-800" : "border-gray-200";

  const cardClass =
    mode === "dark"
      ? "bg-gray-800 hover:bg-gray-750 shadow-lg shadow-gray-900/20"
      : "bg-white hover:bg-gray-50 shadow-md shadow-gray-200/50";

  return (
    <div
      className={`rounded-2xl cursor-pointer transition-all duration-300  ${
        mode === "dark"
          ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-md hover:shadow-xl text-white"
          : "bg-gradient-to-br from-white to-gray-50 border-blue-100 shadow-lg hover:shadow-xl text-gray-800"
      }`}
    >
      {/* Header Section */}
      <div
        className={`px-6 py-5 border-b ${borderClass} bg-opacity-95 backdrop-blur sticky top-0 z-10`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full bg-gradient-to-br from-blue-400 to-blue-600`}
            >
              <Icon
                icon="heroicons-outline:clock"
                className="w-5 h-5 text-white"
              />
            </div>
            <h2 className="text-xl font-bold">Recent Activities</h2>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                mode === "dark"
                  ? "bg-gray-800 text-gray-300 border border-gray-700"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}
            >
              Last 2 weeks
            </span>
          </div>

          <button
            className={`p-2 rounded-full hover:bg-opacity-80 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              mode === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-200"
            }`}
            aria-label="More options"
          >
            <Icon
              icon="heroicons-outline:dots-horizontal"
              className={`w-5 h-5 ${
                mode === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            />
          </button>
        </div>

        {/* Modern Filter Pills */}
        <div className="flex gap-2 mt-5 pb-2 overflow-x-auto scrollbar-none">
          {filterCategories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => handleFilter(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 text-sm font-medium rounded-full flex items-center gap-2 transition-all focus:outline-none ${
                activeFilter === category.id
                  ? `bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md ${
                      mode === "dark"
                        ? "shadow-blue-900/30"
                        : "shadow-blue-500/30"
                    }`
                  : mode === "dark"
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm"
              }`}
              aria-label={`Filter by ${category.label}`}
            >
              <Icon
                icon={category.icon}
                className="w-4 h-4"
                style={{
                  color:
                    activeFilter === category.id ? "white" : "currentColor",
                }}
              />
              {category.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="flex-1 overflow-y-auto scrollbar-thin max-h-[300px]">
        {isLoading ? (
          <div className="py-16 px-6 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mx-auto w-12 h-12"
            >
              <Icon
                icon="heroicons-outline:refresh"
                className={`w-12 h-12 ${
                  mode === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              />
            </motion.div>
            <p
              className={`mt-4 text-sm font-medium ${
                mode === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Loading timeline...
            </p>
          </div>
        ) : Object.keys(filteredActivities).length > 0 ? (
          <div className="relative px-4 pt-2 pb-4">
            <AnimatePresence>
              {Object.entries(filteredActivities).map(
                ([date, dateActivities], dateIndex) => (
                  <motion.div
                    key={date}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-8"
                  >
                    {/* Date marker */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="sticky top-[4.5rem] z-10 mb-4 "
                    >
                      <div
                        className={`inline-block px-4 py-2 rounded-lg font-bold ${
                          mode === "dark"
                            ? "bg-gray-800 text-white shadow-lg shadow-black/20"
                            : "bg-white text-gray-900 shadow-md shadow-gray-200/70"
                        }`}
                      >
                        {date}
                      </div>
                    </motion.div>

                    {/* Activities for this date */}
                    {dateActivities.map((activity, index) => (
                      <motion.div
                        key={`${date}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="mb-6 relative pl-8"
                      >
                        {/* Timeline line */}
                        {index < dateActivities.length - 1 && (
                          <div
                            className={`absolute left-4 top-10 w-0.5 h-full -z-10 ${
                              mode === "dark" ? "bg-gray-700" : "bg-gray-200"
                            }`}
                          />
                        )}

                        <div className="flex items-start">
                          {/* Icon marker with pulse effect */}
                          <div className="absolute left-0 top-0">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center 
                                bg-gradient-to-br ${
                                  activityStyles[activity.type].gradient
                                } shadow-lg ${
                                mode === "dark"
                                  ? "shadow-black/30"
                                  : "shadow-gray-300/70"
                              }`}
                            >
                              <Icon
                                icon={activityStyles[activity.type].icon}
                                className="w-4 h-4 text-white"
                              />
                            </div>
                          </div>

                          {/* Time marker */}
                          <div className="min-w-[60px] text-xs font-medium mt-1.5 mr-3">
                            <span
                              className={
                                mode === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }
                            >
                              {activity.time}
                            </span>
                          </div>

                          {/* Content card */}
                          <motion.div
                            className={`flex-1 p-4 rounded-xl ${cardClass} transition-all cursor-pointer group`}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => onActivityClick?.(activity)}
                          >
                            <div className="flex justify-between items-start">
                              <p
                                className={`text-sm font-medium ${
                                  mode === "dark"
                                    ? "text-gray-100"
                                    : "text-gray-800"
                                }`}
                              >
                                {activity.description}
                              </p>
                              <Icon
                                icon="heroicons-outline:chevron-right"
                                className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ${
                                  mode === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }`}
                              />
                            </div>

                            {/* Category chip */}
                            <div className="mt-3 flex">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
                                  mode === "dark"
                                    ? `bg-${
                                        activityStyles[activity.type].bg.split(
                                          "-"
                                        )[1]
                                      }-900/30 text-${
                                        activityStyles[activity.type].bg.split(
                                          "-"
                                        )[1]
                                      }-400 border border-${
                                        activityStyles[activity.type].bg.split(
                                          "-"
                                        )[1]
                                      }-700/30`
                                    : `bg-${
                                        activityStyles[activity.type].bg.split(
                                          "-"
                                        )[1]
                                      }-50 text-${
                                        activityStyles[activity.type].bg.split(
                                          "-"
                                        )[1]
                                      }-700 border border-${
                                        activityStyles[activity.type].bg.split(
                                          "-"
                                        )[1]
                                      }-100`
                                }`}
                              >
                                <Icon
                                  icon={
                                    activity.category === "Business"
                                      ? "heroicons-outline:building-office"
                                      : activity.category === "Event"
                                      ? "heroicons-outline:calendar"
                                      : activity.category === "Report"
                                      ? "heroicons-outline:chart-bar"
                                      : activity.category === "Resource"
                                      ? "heroicons-outline:book-open"
                                      : activity.category === "Update"
                                      ? "heroicons-outline:megaphone"
                                      : "heroicons-outline:tag"
                                  }
                                  className="w-3.5 h-3.5"
                                />
                                {activity.category}
                              </span>
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-20 px-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
                mode === "dark" ? "bg-gray-800" : "bg-gray-100"
              } mb-6`}
            >
              <Icon
                icon="heroicons-outline:magnifying-glass"
                className={`w-10 h-10 ${
                  mode === "dark" ? "text-gray-500" : "text-gray-400"
                }`}
              />
            </motion.div>
            <p
              className={`text-lg font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              No activities found
            </p>
            <p
              className={`text-sm mt-2 ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Try changing your filter or check back later
            </p>
            <motion.button
              onClick={() => handleFilter("all")}
              whileHover={{ scale: 1.05 }}
              className={`mt-6 px-4 py-2 rounded-lg text-sm font-medium ${
                mode === "dark"
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              } transition-colors`}
            >
              Reset filters
            </motion.button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`px-6 py-4 `}>
        
      </div>
    </div>
  );
}
