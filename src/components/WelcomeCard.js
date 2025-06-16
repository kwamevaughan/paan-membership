// src/components/WelcomeCard.jsx
import { Icon } from "@iconify/react";
import Link from "next/link";

export default function WelcomeCard({
  totalApplicants = 0,
  pendingReviews = 0,
  mode,
  isMobile,
  user,
}) {
  return (
    <div className="relative mt-6 mb-10 group w-full">
      {" "}
      {/* Glassmorphism backdrop */}
      <div className="absolute inset-0 rounded-3xl backdrop-filter backdrop-blur-xl bg-white/10 dark:bg-black/10"></div>
      {/* Main content container */}
      <div
        className={`relative overflow-hidden rounded-3xl border transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl w-full ${
          mode === "dark"
            ? "bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 shadow-xl"
            : "bg-gradient-to-br from-white/90 to-slate-50/90 border-slate-200/50 shadow-lg"
        }`}
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
        </div>

        {/* Content */}
        <div
          className={`relative p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0 ${
            isMobile ? "items-center" : ""
          }`}
        >
          {/* Left section with icon and text */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6 flex-1 gap-4 sm:gap-0">
            {/* Animated icon container */}
            <div className="relative">
              <div
                className={`absolute inset-0 rounded-2xl blur-md ${
                  mode === "dark" ? "bg-amber-400/30" : "bg-amber-500/30"
                } animate-pulse`}
              ></div>
              <div
                className={`relative p-2 rounded-2xl ${
                  mode === "dark"
                    ? "bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30"
                    : "bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200"
                }`}
              >
                <Icon
                  icon="mdi:bell-check"
                  width={isMobile ? 24 : 30}
                  height={isMobile ? 24 : 30}
                  className={`${
                    mode === "dark" ? "text-amber-400" : "text-amber-600"
                  } animate-bounce`}
                  style={{
                    animationDuration: "2s",
                    animationIterationCount: "infinite",
                  }}
                />
              </div>
            </div>

            {/* Text content */}
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <h2
                className={`text-xl sm:text-2xl font-bold tracking-tight ${
                  mode === "dark" ? "text-white" : "text-slate-900"
                }`}
              >
                Welcome back, {user.name}! 👋
              </h2>

              <p
                className={`text-sm sm:text-md leading-relaxed ${
                  mode === "dark" ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Here's your dashboard overview at a glance.
              </p>

              {/* Stats section */}
              <div className="flex flex-row items-center justify-center sm:justify-start space-x-3 sm:space-x-4 pt-2 flex-wrap gap-2">
                <div
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl ${
                    mode === "dark"
                      ? "bg-blue-500/20 border border-blue-400/30"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      mode === "dark" ? "text-blue-300" : "text-blue-700"
                    }`}
                  >
                    {totalApplicants} candidates in total
                  </span>
                </div>

                <div
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl ${
                    mode === "dark"
                      ? "bg-orange-500/20 border border-orange-400/30"
                      : "bg-orange-50 border border-orange-200"
                  }`}
                >
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      mode === "dark" ? "text-orange-300" : "text-orange-700"
                    }`}
                  >
                    {pendingReviews} pending approval
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="flex justify-center sm:justify-end sm:ml-6">
            <Link href="/hr/applicants">
              <button
                className={`group/btn relative px-4 py-2 sm:px-6 sm:py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                  mode === "dark"
                    ? "bg-[#84c1d9] text-white"
                    : "bg-[#84c1d9] text-white"
                }`}
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span className="text-sm sm:text-base">Take Action</span>
                  <Icon
                    icon="mdi:arrow-right"
                    width={isMobile ? 16 : 20}
                    height={isMobile ? 16 : 20}
                    className="transform group-hover/btn:translate-x-1 transition-transform duration-300"
                  />
                </span>

                {/* Button glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-[#84c1d9] opacity-0 group-hover/btn:opacity-50 blur-xl transition-opacity duration-300"></div>
              </button>
            </Link>
          </div>
        </div>

        {/* Bottom gradient accent */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-1 ${
            mode === "dark"
              ? "bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"
              : "bg-gradient-to-r from-[#3c82f6] to-[#dbe9fe]"
          }`}
        ></div>
      </div>
      {/* Floating elements for visual interest */}
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#85c2da] rounded-full opacity-60"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#f3584a] rounded-full opacity-40 animate-pulse delay-1000"></div>
    </div>
  );
}
