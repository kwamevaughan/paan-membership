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
      bg: "bg-[#d97708]", // Orange for a warm, professional tone
      gradient: "from-[#d97708] to-[#fef1ce]", // Orange to light yellow for vibrancy
      icon: "lucide:briefcase",
      glow: "shadow-[#d97708]/25",
    },
    events: {
      bg: "bg-[#4086f7]", // Bright blue for event energy
      gradient: "from-[#4086f7] to-[#84c1d9]", // Blue to light cyan for a fresh look
      icon: "lucide:calendar",
      glow: "shadow-[#4086f7]/25",
    },
    updates: {
      bg: "bg-[#84c1d9]", // Light cyan for a clean, modern feel
      gradient: "from-[#84c1d9] to-[#eff6ff]", // Light cyan to soft white-blue
      icon: "lucide:trending-up",
      glow: "shadow-[#84c1d9]/25",
    },
    access: {
      bg: "bg-[#f97315]", // Vibrant orange-red for emphasis
      gradient: "from-[#f97315] to-[#d97708]", // Orange-red to orange for depth
      icon: "lucide:key",
      glow: "shadow-[#f97315]/25",
    },
    resources: {
      bg: "bg-[#fef1ce]", // Light yellow for a warm, approachable tone
      gradient: "from-[#fef1ce] to-[#eff6ff]", // Light yellow to soft white-blue
      icon: "lucide:book-open",
      glow: "shadow-[#fef1ce]/25",
    },
    offers: {
      bg: "bg-[#eff6ff]", // Soft white-blue for a neutral, clean look
      gradient: "from-[#eff6ff] to-[#84c1d9]", // Soft white-blue to light cyan
      icon: "lucide:tag",
      glow: "shadow-[#eff6ff]/25",
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
              ? "bg-gradient-to-r from-[#d97708] to-[#4086f7]" // Orange to blue
              : "bg-gradient-to-r from-[#84c1d9] to-[#fef1ce]" // Light cyan to light yellow
          }`}
        />
        <div
          className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 ${
            mode === "dark"
              ? "bg-gradient-to-r from-[#4086f7] to-[#d97708]" // Blue to orange
              : "bg-gradient-to-r from-[#fef1ce] to-[#84c1d9]" // Light yellow to light cyan
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
                <div className="p-3 rounded-2xl bg-blue-400/10 shadow-lg">
                  {" "}
                  {/* Light yellow background */}
                  <Icon
                    icon="lucide:clock"
                    className="w-6 h-6 text-[#4086f7]"
                  />{" "}
                  {/* Blue icon */}
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#f97315] rounded-full animate-pulse shadow-lg shadow-[#f97315]/50" />{" "}
                {/* Orange-red pulse */}
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
                    ? `bg-[#84c1d9]/20 shadow-lg ${
                        mode === "dark"
                          ? "shadow-[#d97708]/50"
                          : "shadow-[#4086f7]/30"
                      } ring-2 ring-[#4086f7]/20` // Blue ring for active state
                    : mode === "dark"
                    ? "bg-[#d97708]/20 text-[#fef1ce] hover:bg-[#d97708]/40 border border-[#d97708]/30 hover:border-[#4086f7]/50 shadow-md" // Orange and light yellow
                    : "bg-[#eff6ff]/60 text-[#4086f7] hover:bg-[#84c1d9]/20 border border-[#84c1d9]/50 hover:border-[#4086f7]/50 shadow-md" // Soft white-blue and blue
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
                      ? "border-t-[#fef1ce] border-r-[#4086f7]" // Light yellow and blue
                      : "border-t-[#f97315] border-r-[#4086f7]" // Orange-red and blue
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
                              ? "bg-[#d97708]/20 text-[#fef1ce] shadow-black/30 border border-[#f97315]/50" // Orange and light yellow
                              : "bg-[#eff6ff]/90 text-[#4086f7] shadow-[#84c1d9]/50 border border-[#84c1d9]/50" // Soft white-blue and blue
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              mode === "dark" ? "bg-[#f97315]" : "bg-[#4086f7]" // Orange-red or blue
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
                                    ? "bg-gradient-to-b from-[#fef1ce] to-transparent" // Light yellow
                                    : "bg-gradient-to-b from-[#4086f7] to-transparent" // Blue
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
                                      ? "bg-[#d97708]/20 hover:bg-[#f97315]/30 border-[#fef1ce]/30 hover:border-[#f97315]/50 shadow-lg hover:shadow-xl shadow-black/20"
                                      : "bg-[#eff6ff]/60 hover:bg-[#84c1d9]/30 border-[#84c1d9]/50 hover:border-[#4086f7]/70 shadow-lg hover:shadow-xl shadow-[#84c1d9]/10"
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
                    ? "bg-[#d97708]/20 shadow-black/30" // Orange
                    : "bg-[#84c1d9]/20 shadow-[#4086f7]/50" // Light cyan
                } backdrop-blur-sm`}
              >
                <Icon
                  icon="lucide:search-x"
                  className={`w-12 h-12 ${
                    mode === "dark" ? "text-[#fef1ce]" : "text-[#4086f7]" // Light yellow or blue
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
