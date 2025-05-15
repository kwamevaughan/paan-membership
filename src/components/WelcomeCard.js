import { Icon } from "@iconify/react";

export default function WelcomeCard({
  totalApplicants = 0,
  pendingReviews = 0,
  mode,
}) {
  return (
    // Alert Section with Enhanced Multi-Layered Bottom Effect
    <div className="relative mb-8 hover:translate-y-[-10px] transition-transform duration-300 ease-in-out">
      {/* Main Alert Content */}
      <div
        className={`relative p-2 rounded-2xl flex items-center justify-between z-10 ${
          mode === "dark"
            ? "bg-[#1f2937] text-white"
            : "bg-[#e6e6fa] text-indigo-900"
        }`}
      >
        <div className="flex items-center">
          <Icon
            icon="mdi:bell-check"
            width={36}
            height={36}
            className={`mr-2 ${
              mode === "dark" ? "text-yellow-500" : "text-yellow-600"
            } animate-swing-infinite`}
          />

          <div className="text-xl font-medium flex flex-col">
            <span>Welcome Admin! Here is an overview of your dashboard.</span>
            <span
              className={`text-sm ${
                mode === "dark" ? "text-gray-400" : "text-[#4b5563]"
              }`}
            >
              There are {totalApplicants} candidates. {pendingReviews} are
              pending reviews.
            </span>
          </div>
        </div>
      </div>

      {/* Multi-layered bottom effect - with two layers and rounded borders */}
      <div
        className={`absolute w-[98%] h-6 ${
          mode === "dark" ? "bg-[#1f2937]" : "bg-[#dad9f3]"
        } -bottom-3 left-0 right-0 mx-auto opacity-50 rounded-md`}
      ></div>
      <div
        className={`absolute w-[96%] h-8 ${
          mode === "dark" ? "bg-[#1f2937]" : "bg-[#dfdcf7]"
        } -bottom-6 left-0 right-0 mx-auto opacity-30 rounded-md`}
      ></div>
    </div>
  );
}
