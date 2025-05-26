import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useTimeline } from "@/hooks/useTimeline";
import Link from "next/link";
import { format, parseISO } from "date-fns";

export default function ModernTimeline({
  mode = "light",
  onFilter,
  onActivityClick,
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const { activities, loading } = useTimeline(activeFilter);

  // Filter activities with loading simulation
  const handleFilter = (filter) => {
    setActiveFilter(filter);
    if (onFilter) onFilter(filter);
  };

  // Memoize grouped activities
  const filteredActivities = useMemo(() => {
    // Group by date
    return activities.reduce((groups, activity) => {
      const date = activity.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
      return groups;
    }, {});
  }, [activities]);

  // Calculate dynamic date range
  const dateRangeText = useMemo(() => {
    if (activities.length === 0) return "No activities yet";

    const dates = activities.map((activity) => parseISO(activity.rawDate));
    const earliestDate = new Date(Math.min(...dates));
    const latestDate = new Date(Math.max(...dates));

    if (earliestDate.toDateString() === latestDate.toDateString()) {
      return `Updated ${format(latestDate, "MMM d")}`;
    }
    return `${format(earliestDate, "MMM d")} to ${format(
      latestDate,
      "MMM d"
    )}`;
  }, [activities]);

  // Activity styles with blue-based palette
  const activityStyles = {
    business_opportunities: {
      bg: "bg-[#172840]", // Dark blue
      gradient: "from-[#172840] to-[#84c1d9]", // Dark blue to light blue
      icon: "lucide:briefcase",
      glow: "shadow-[#172840]/25",
    },
    events: {
      bg: "bg-[#3b82f6]", // Mid-tone blue
      gradient: "from-[#3b82f6] to-[#84c1d9]", // Mid-tone blue to light blue
      icon: "lucide:calendar",
      glow: "shadow-[#3b82f6]/25",
    },
    updates: {
      bg: "bg-[#84c1d9]", // Light blue
      gradient: "from-[#84c1d9] to-[#172840]", // Light blue to dark blue
      icon: "lucide:trending-up",
      glow: "shadow-[#84c1d9]/25",
    },
    access: {
      bg: "bg-[#f25849]", // Red
      gradient: "from-[#f25849] to-[#3b82f6]", // Red to mid-tone blue
      icon: "lucide:key",
      glow: "shadow-[#f25849]/25",
    },
    resources: {
      bg: "bg-[#84c1d9]", // Light blue
      gradient: "from-[#84c1d9] to-[#3b82f6]", // Light blue to mid-tone blue
      icon: "lucide:book-open",
      glow: "shadow-[#84c1d9]/25",
    },
    offers: {
      bg: "bg-[#172840]", 
      gradient: "from-[#172840] to-[#172840]", 
      icon: "lucide:tag",
      glow: "shadow-[#172840]/25",
    },
  };

  // Filter categories with Iconify icons
  const filterCategories = [
    { id: "all", label: "All", icon: "lucide:filter" },
    {
      id: "Business Opportunities",
      label: "Business",
      icon: "lucide:building-2",
    },
    { id: "Events", label: "Events", icon: "lucide:calendar" },
    { id: "Updates", label: "Updates", icon: "lucide:trending-up" },
    {
      id: "Resources",
      label: "Resources",
      icon: "lucide:book-open",
    },
    { id: "Offers", label: "Offers", icon: "lucide:tag" },
  ];

  return (
    <div className="relative overflow-hidden duration-500 shadow-md hover:shadow-xl rounded-2xl">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div
          className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 ${
            mode === "dark"
              ? "bg-gradient-to-r from-[#172840] to-[#3b82f6]" // Dark blue to mid-tone blue
              : "bg-gradient-to-r from-[#84c1d9] to-[#3b82f6]" // Light blue to mid-tone blue
          }`}
        />
        <div
          className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 ${
            mode === "dark"
              ? "bg-gradient-to-r from-[#3b82f6] to-[#172840]" // Mid-tone blue to dark blue
              : "bg-gradient-to-r from-[#3b82f6] to-[#84c1d9]" // Mid-tone blue to light blue
          }`}
        />
      </div>

      <div
        className={`rounded-2xl border backdrop-blur-xl transition-all duration-500 hover:shadow-2xl ${
          mode === "dark"
            ? "bg-[#172840]/90 border-[#172840]/50 shadow-xl shadow-black/25 text-white"
            : "bg-white/90 border-[#84c1d9]/50 shadow-xl shadow-[#84c1d9]/10 text-[#172840]"
        }`}
      >
        {/* Header Section */}
        <div
          className={`px-8 py-6 border-b backdrop-blur-sm sticky top-0 z-20 rounded-t-3xl ${
            mode === "dark"
              ? "border-[#172840]/50 bg-[#172840]/95"
              : "border-[#84c1d9]/50 bg-white/95"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 rounded-2xl bg-[#e6f1f8] shadow-lg">
                  <Icon icon="lucide:clock" className="w-6 h-6 " />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#f25849] rounded-full animate-pulse shadow-lg shadow-[#f25849]/50" />
              </div>
              <div>
                <h2 className={`text-xl font-bold text-[#172840] $`}>
                  Activity Timeline
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-sm font-medium ${
                      mode === "dark" ? "text-[#84c1d9]" : "text-[#172840]"
                    }`}
                  >
                    {dateRangeText}
                  </span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              className={`group p-3 rounded-2xl transition-all duration-300 ${
                mode === "dark"
                  ? "bg-[#172840]/80 hover:bg-[#3b82f6]/80 text-[#84c1d9] hover:text-white"
                  : "bg-[#84c1d9]/20 hover:bg-[#3b82f6]/20 text-[#172840] hover:text-[#172840]"
              } backdrop-blur-sm shadow-lg`}
              aria-label="More options"
            >
              <Icon
                icon="lucide:more-horizontal"
                className="w-5 h-5 transition-transform"
              />
            </motion.button>
          </div>

          {/* Modern Filter Pills */}
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-4">
            {filterCategories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => handleFilter(category.id)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2.5 text-sm font-semibold rounded-2xl flex items-center gap-2 transition-all focus:outline-none whitespace-nowrap ${
                  activeFilter === category.id
                    ? `bg-gradient-to-r from-[#3b82f6] to-[#84c1d9] text-white shadow-lg ${
                        mode === "dark"
                          ? "shadow-[#172840]/50"
                          : "shadow-[#3b82f6]/30"
                      } ring-2 ring-[#3b82f6]/20`
                    : mode === "dark"
                    ? "bg-[#172840]/60 text-[#84c1d9] hover:bg-[#172840]/80 border border-[#84c1d9]/30 hover:border-[#3b82f6]/50 shadow-md"
                    : "bg-white/60 text-[#172840] hover:bg-[#84c1d9]/20 border border-[#84c1d9]/50 hover:border-[#3b82f6]/50 shadow-md"
                } backdrop-blur-sm`}
                aria-label={`Filter by ${category.label}`}
              >
                <Icon icon={category.icon} className="w-4 h-4" />
                {category.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="flex-1 overflow-y-auto scrollbar-thin max-h-[450px]">
          {loading ? (
            <div className="py-10 px-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="mx-auto w-16 h-16 mb-6"
              >
                <div
                  className={`w-16 h-16 rounded-full border-4 border-transparent ${
                    mode === "dark"
                      ? "border-t-[#84c1d9] border-r-[#3b82f6]"
                      : "border-t-[#f25849] border-r-[#3b82f6]"
                  }`}
                />
              </motion.div>
              <p
                className={`text-lg font-medium ${
                  mode === "dark" ? "text-[#84c1d9]" : "text-[#172840]"
                }`}
              >
                Loading timeline...
              </p>
              <p
                className={`text-sm mt-2 ${
                  mode === "dark" ? "text-[#84c1d9]/70" : "text-[#172840]/70"
                }`}
              >
                Fetching your latest activities
              </p>
            </div>
          ) : Object.keys(filteredActivities).length > 0 ? (
            <div className="relative px-6">
              <AnimatePresence>
                {Object.entries(filteredActivities).map(
                  ([date, dateActivities], dateIndex) => (
                    <motion.div
                      key={date}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, delay: dateIndex * 0.1 }}
                      className="mb-10"
                    >
                      {/* Date marker */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="sticky top-[7rem] z-10 mb-6"
                      >
                        <div
                          className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-bold shadow-lg backdrop-blur-sm ${
                            mode === "dark"
                              ? "bg-[#172840]/90 text-white shadow-black/30 border border-[#84c1d9]/50"
                              : "bg-white/90 text-[#172840] shadow-[#84c1d9]/50 border border-[#84c1d9]/50"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              mode === "dark" ? "bg-[#3b82f6]" : "bg-[#f25849]"
                            } animate-pulse`}
                          />
                          {date}
                        </div>
                      </motion.div>

                      {/* Activities for this date */}
                      <div className="space-y-4">
                        {dateActivities.map((activity, index) => (
                          <motion.div
                            key={`${date}-${index}`}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="relative pl-12"
                          >
                            {/* Timeline line */}
                            {index < dateActivities.length - 1 && (
                              <div
                                className={`absolute left-5 top-12 w-0.5 h-full opacity-30 ${
                                  mode === "dark"
                                    ? "bg-gradient-to-b from-[#84c1d9] to-transparent"
                                    : "bg-gradient-to-b from-[#172840] to-transparent"
                                }`}
                              />
                            )}

                            <div className="flex items-start gap-4">
                              {/* Icon marker with enhanced design */}
                              <div className="absolute left-0 top-0">
                                <motion.div
                                  whileHover={{ scale: 1.2, rotate: 5 }}
                                  className={`relative w-10 h-10 rounded-2xl flex items-center justify-center 
                                    bg-gradient-to-br ${
                                      activityStyles[activity.type].gradient
                                    } 
                                    shadow-xl ${
                                      activityStyles[activity.type].glow
                                    } ring-2 ring-white/20`}
                                >
                                  <Icon
                                    icon={activityStyles[activity.type].icon}
                                    className="w-5 h-5 text-white"
                                  />
                                  <div className="absolute inset-0 rounded-2xl bg-white/10" />
                                </motion.div>
                              </div>

                              {/* Time marker */}
                              <div className="min-w-[70px] text-xs font-bold mt-2">
                                <span
                                  className={`px-2 py-1 rounded-lg ${
                                    mode === "dark"
                                      ? "bg-[#172840]/50 text-[#84c1d9]"
                                      : "bg-transparent text-[#172840]"
                                  } backdrop-blur-sm`}
                                >
                                  {activity.time}
                                </span>
                              </div>

                              {/* Content card with enhanced design */}
                              <Link href={activity.url} className="flex-1">
                                <motion.div
                                  className={`group p-5 rounded-2xl transition-all cursor-pointer backdrop-blur-sm border ${
                                    mode === "dark"
                                      ? "bg-[#172840]/60 hover:bg-[#172840]/80 border-[#84c1d9]/30 hover:border-[#3b82f6]/50 shadow-lg hover:shadow-xl shadow-black/20"
                                      : "bg-white/60 hover:bg-white/80 border-[#84c1d9]/50 hover:border-[#3b82f6]/70 shadow-lg hover:shadow-xl shadow-[#84c1d9]/10"
                                  }`}
                                  whileHover={{ scale: 1.02, y: -2 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => onActivityClick?.(activity)}
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <p
                                      className={`text-sm font-semibold leading-relaxed ${
                                        mode === "dark"
                                          ? "text-white"
                                          : "text-[#172840]"
                                      }`}
                                    >
                                      {activity.description}
                                    </p>
                                    <Icon
                                      icon="lucide:arrow-up-right"
                                      className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1 ${
                                        mode === "dark"
                                          ? "text-[#84c1d9]"
                                          : "text-[#172840]"
                                      }`}
                                    />
                                  </div>

                                  {/* Enhanced category chip */}
                                  <div className="flex">
                                    <span
                                      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl backdrop-blur-sm ${
                                        mode === "dark"
                                          ? `bg-${
                                              activityStyles[activity.type].bg
                                            }/40 text-white border border-${
                                              activityStyles[activity.type].bg
                                            }/40`
                                          : `bg-${
                                              activityStyles[activity.type].bg
                                            }/20 text-${
                                              activityStyles[activity.type].bg
                                            } border border-${
                                              activityStyles[activity.type].bg
                                            }/50`
                                      } shadow-sm`}
                                    >
                                      <Icon
                                        icon={
                                          activity.category ===
                                          "Business Opportunities"
                                            ? "lucide:building-2"
                                            : activity.category === "Events"
                                            ? "lucide:calendar"
                                            : activity.category === "Updates"
                                            ? "lucide:trending-up"
                                            : activity.category === "Resources"
                                            ? "lucide:book-open"
                                            : "lucide:tag"
                                        }
                                        className="w-3.5 h-3.5"
                                      />
                                      {activity.category}
                                    </span>
                                  </div>
                                </motion.div>
                              </Link>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="py-24 px-8 text-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
                className={`mx-auto w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-xl ${
                  mode === "dark"
                    ? "bg-[#172840]/80 shadow-black/30"
                    : "bg-[#84c1d9]/20 shadow-[#84c1d9]/50"
                } backdrop-blur-sm`}
              >
                <Icon
                  icon="lucide:search-x"
                  className={`w-12 h-12 ${
                    mode === "dark" ? "text-[#84c1d9]" : "text-[#172840]"
                  }`}
                />
              </motion.div>
              <p
                className={`text-xl font-bold mb-2 ${
                  mode === "dark" ? "text-white" : "text-[#172840]"
                }`}
              >
                No activities found
              </p>
              <p
                className={`text-sm mb-8 ${
                  mode === "dark" ? "text-[#84c1d9]/70" : "text-[#172840]/70"
                }`}
              >
                Try adjusting your filters or check back later for new updates
              </p>
              <motion.button
                onClick={() => handleFilter("all")}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-2xl text-sm font-semibold bg-gradient-to-r from-[#3b82f6] to-[#84c1d9] text-white shadow-lg hover:shadow-xl transition-all backdrop-blur-sm"
              >
                Reset all filters
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
