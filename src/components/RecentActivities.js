import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useTimeline } from "@/hooks/useTimeline";
import Link from "next/link";
import { format, parseISO } from "date-fns";

const ACTIVITY_STYLES = {
  business_opportunities: {
    bg: "bg-blue-500",
    gradient: "from-blue-500 to-blue-200",
    icon: "lucide:briefcase",
    glow: "shadow-blue-500/25",
    color: "text-blue-600",
    ring: "ring-blue-500/20"
  },
  events: {
    bg: "bg-blue-500",
    gradient: "from-blue-500 to-blue-200",
    icon: "lucide:calendar",
    glow: "shadow-blue-500/25",
    color: "text-blue-600",
    ring: "ring-blue-500/20"
  },
  updates: {
    bg: "bg-purple-500",
    gradient: "from-purple-500 to-purple-200",
    icon: "lucide:trending-up",
    glow: "shadow-purple-500/25",
    color: "text-purple-600",
    ring: "ring-purple-500/20"
  },
  access: {
    bg: "bg-orange-500",
    gradient: "from-orange-500 to-orange-200",
    icon: "lucide:key",
    glow: "shadow-orange-500/25",
    color: "text-orange-600",
    ring: "ring-orange-500/20"
  },
  resources: {
    bg: "bg-indigo-500",
    gradient: "from-indigo-500 to-indigo-200",
    icon: "lucide:book-open",
    glow: "shadow-indigo-500/25",
    color: "text-indigo-600",
    ring: "ring-indigo-500/20"
  },
  offers: {
    bg: "bg-pink-500",
    gradient: "from-pink-500 to-pink-200",
    icon: "lucide:tag",
    glow: "shadow-pink-500/25",
    color: "text-pink-600",
    ring: "ring-pink-500/20"
  },
};

const FILTER_CATEGORIES = [
  { id: "all", label: "All", icon: "lucide:filter" },
  { id: "Business Opportunities", label: "Business", icon: "lucide:building-2" },
  { id: "Events", label: "Events", icon: "lucide:calendar" },
  { id: "Updates", label: "Updates", icon: "lucide:trending-up" },
  { id: "Resources", label: "Resources", icon: "lucide:book-open" },
  { id: "Offers", label: "Offers", icon: "lucide:tag" },
];

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 }
    }
  },
  activity: {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 }
    },
    exit: {
      opacity: 0,
      x: 30,
      transition: { duration: 0.3 }
    }
  }
};

export default function ModernTimeline({
  mode = "light",
  onFilter,
  onActivityClick,
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const { activities, loading } = useTimeline(activeFilter);

  const handleFilter = useCallback((filter) => {
    setActiveFilter(filter);
    onFilter?.(filter);
  }, [onFilter]);

  const handleActivityClick = useCallback((activity) => {
    onActivityClick?.(activity);
  }, [onActivityClick]);

  // Memoize grouped activities for better performance
  const groupedActivities = useMemo(() => {
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
      return `Updated ${format(latestDate, "MMM d, yyyy")}`;
    }
    return `${format(earliestDate, "MMM d, yyyy")} to ${format(latestDate, "MMM d, yyyy")}`;
  }, [activities]);

  const isDark = mode === "dark";

  return (
    <div className="relative overflow-hidden duration-500 transition-all rounded-3xl shadow-lg hover:shadow-xl">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 ${
            isDark ? "bg-gradient-to-r from-blue-400 to-purple-400" : "bg-gradient-to-r from-blue-400 to-indigo-400"
          }`}
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 ${
            isDark ? "bg-gradient-to-r from-purple-400 to-pink-400" : "bg-gradient-to-r from-indigo-400 to-purple-400"
          }`}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className={`rounded-3xl border backdrop-blur-xl transition-all duration-500 ${
          isDark
            ? "bg-gray-900/90 border-gray-700/50 shadow-xl hover:shadow-2xl shadow-black/25 text-white"
            : "bg-white/90 border-gray-200/50 shadow-xl hover:shadow-2xl shadow-gray-900/10 text-gray-900"
        }`}
      >
        {/* Enhanced Header Section */}
        <div
          className={`px-8 py-6 border-b backdrop-blur-sm sticky top-0 z-20 rounded-t-3xl ${
            isDark ? "border-gray-700/50 bg-gray-900/95" : "border-gray-200/50 bg-white/95"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative"
              >
                <div className={`p-3 rounded-2xl shadow-lg ${
                  isDark ? "bg-blue-500/20" : "bg-blue-50"
                }`}>
                  <Icon
                    icon="lucide:clock"
                    className={`w-6 h-6 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                  />
                </div>
               
              </motion.div>
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Activity Timeline
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Icon
                    icon="lucide:calendar-days"
                    className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  />
                  <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {dateRangeText}
                  </span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              className={`group p-3 rounded-2xl transition-all duration-300 ${
                isDark
                  ? "bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white"
                  : "bg-gray-100/80 hover:bg-gray-200/80 text-gray-600 hover:text-gray-900"
              } backdrop-blur-sm shadow-lg hover:shadow-xl`}
              aria-label="More options"
            >
              <Icon
                icon="lucide:more-horizontal"
                className="w-5 h-5 transition-transform"
              />
            </motion.button>
          </div>

          {/* Enhanced Filter Pills */}
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-4">
            {FILTER_CATEGORIES.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => handleFilter(category.id)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2.5 text-sm font-semibold rounded-2xl flex items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 whitespace-nowrap ${
                  activeFilter === category.id
                    ? `${isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-500/10 text-blue-600"} shadow-lg ring-2 ring-blue-500/20`
                    : isDark
                    ? "bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 border border-gray-700/50 hover:border-gray-600/50 shadow-md hover:text-white"
                    : "bg-gray-100/60 text-gray-700 hover:bg-gray-200/60 border border-gray-200/50 hover:border-gray-300/50 shadow-md hover:text-gray-900"
                } backdrop-blur-sm`}
                aria-label={`Filter by ${category.label}`}
              >
                <Icon icon={category.icon} className="w-4 h-4" />
                {category.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Enhanced Timeline Section */}
        <div className="flex-1 overflow-y-auto max-h-[500px]">
          {loading ? (
            <div className="py-12 px-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="mx-auto w-16 h-16 mb-6"
              >
                <Icon
                  icon="lucide:loader-2"
                  className={`w-16 h-16 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                />
              </motion.div>
              <p className={`text-lg font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                Loading timeline...
              </p>
              <p className={`text-sm mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Fetching your latest activities
              </p>
            </div>
          ) : Object.keys(groupedActivities).length > 0 ? (
            <motion.div
              variants={ANIMATION_VARIANTS.container}
              initial="hidden"
              animate="visible"
              className="relative px-6 pb-4"
            >
              <AnimatePresence mode="wait">
                {Object.entries(groupedActivities).map(([date, dateActivities], dateIndex) => (
                  <motion.div
                    key={date}
                    variants={ANIMATION_VARIANTS.item}
                    className="mb-10"
                  >
                    {/* Enhanced Date Marker */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: dateIndex * 0.1 }}
                      className="sticky top-[4rem] z-10 mb-2"
                    >
                      <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-bold shadow-xl backdrop-blur-sm border ${
                        isDark
                          ? "bg-gray-800/90 text-white shadow-black/30 border-gray-700/50"
                          : "bg-white/90 text-gray-900 shadow-gray-900/20 border-gray-200/50"
                      }`}>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`w-2 h-2 rounded-full ${isDark ? "bg-blue-400" : "bg-blue-600"}`}
                        />
                        {date}
                      </div>
                    </motion.div>

                    {/* Enhanced Activities */}
                    <div className="space-y-4">
                      {dateActivities.map((activity, index) => {
                        const style = ACTIVITY_STYLES[activity.type] || ACTIVITY_STYLES.updates;
                        
                        return (
                          <motion.div
                            key={`${date}-${index}`}
                            variants={ANIMATION_VARIANTS.activity}
                            transition={{ delay: index * 0.05 }}
                            className="relative pl-12"
                          >
                            {/* Enhanced Timeline Line */}
                            {index < dateActivities.length - 1 && (
                              <div className={`absolute left-5 top-12 w-0.5 h-full opacity-30 ${
                                isDark
                                  ? "bg-gradient-to-b from-gray-600 to-transparent"
                                  : "bg-gradient-to-b from-gray-400 to-transparent"
                              }`} />
                            )}

                            <div className="flex items-start gap-4">
                              {/* Enhanced Icon Marker */}
                              <div className="absolute left-0 top-0">
                                <motion.div
                                  whileHover={{ scale: 1.2, rotate: 10 }}
                                  className={`relative w-10 h-10 rounded-2xl flex items-center justify-center 
                                    bg-gradient-to-br ${style.gradient} 
                                    shadow-xl ${style.glow} ring-4 ring-white/20 backdrop-blur-sm`}
                                >
                                  <Icon
                                    icon={style.icon}
                                    className="w-5 h-5 text-white"
                                  />
                                  <div className="absolute inset-0 rounded-2xl bg-white/10" />
                                </motion.div>
                              </div>

                              {/* Enhanced Time Marker */}
                              <div className="min-w-[70px] text-xs font-bold mt-2">
                                <span className={`px-3 py-1 rounded-lg backdrop-blur-sm ${
                                  isDark
                                    ? "bg-gray-800/60 text-gray-300 border border-gray-700/50"
                                    : "bg-gray-100/60 text-gray-700 border border-gray-200/50"
                                }`}>
                                  {activity.time}
                                </span>
                              </div>

                              {/* Enhanced Content Card */}
                              <Link href={activity.url} className="flex-1">
                                <motion.div
                                  className={`group p-5 rounded-2xl transition-all cursor-pointer backdrop-blur-sm border hover:shadow-xl ${
                                    isDark
                                      ? "bg-gray-800/40 hover:bg-gray-800/60 border-gray-700/30 hover:border-gray-600/50 shadow-lg shadow-black/20"
                                      : "bg-white/60 hover:bg-white/80 border-gray-200/50 hover:border-gray-300/70 shadow-lg shadow-gray-900/10"
                                  }`}
                                  whileHover={{ scale: 1.02, y: -2 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleActivityClick(activity)}
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <p className={`text-sm font-semibold leading-relaxed ${
                                      isDark ? "text-gray-100" : "text-gray-900"
                                    }`}>
                                      {activity.description}
                                    </p>
                                    <Icon
                                      icon="lucide:arrow-up-right"
                                      className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1 ${
                                        isDark ? "text-gray-300" : "text-gray-600"
                                      }`}
                                    />
                                  </div>

                                  {/* Enhanced Category Chip */}
                                  <div className="flex">
                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl backdrop-blur-sm border shadow-sm ${
                                      isDark
                                        ? `bg-gray-700/60 text-gray-200 border-gray-600/50`
                                        : `bg-gray-50/80 ${style.color} border-gray-200/50`
                                    }`}>
                                      <Icon
                                        icon={
                                          activity.category === "Business Opportunities"
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
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="py-24 px-8 text-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
                className={`mx-auto w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-xl backdrop-blur-sm ${
                  isDark
                    ? "bg-gray-800/60 shadow-black/30"
                    : "bg-gray-100/60 shadow-gray-900/20"
                }`}
              >
                <Icon
                  icon="lucide:search-x"
                  className={`w-12 h-12 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                />
              </motion.div>
              <p className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                No activities found
              </p>
              <p className={`text-sm mb-8 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Try adjusting your filters or check back later for new updates
              </p>
              <motion.button
                onClick={() => handleFilter("all")}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-2xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all backdrop-blur-sm"
              >
                <Icon icon="lucide:refresh-cw" className="w-4 h-4 inline mr-2" />
                Reset all filters
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
}