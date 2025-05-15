import { useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";

export default function OverviewBoxes({
  candidates,
  jobOpenings,
  router,
  mode,
}) {
  const [hoveredUserIndex, setHoveredUserIndex] = useState(null);
  const [hoveredOpening, setHoveredOpening] = useState(null);

  const getCandidateNames = (opening) => {
    const relevantCandidates = candidates.filter((c) => c.opening === opening);
    return relevantCandidates.map(
      (c) => c.primaryContactName || "Unknown Candidate"
    );
  };

  const handleUserIconHover = (opening, index) => {
    setHoveredUserIndex(index);
    setHoveredOpening(opening);
  };

  const handleMouseLeave = () => {
    setHoveredUserIndex(null);
    setHoveredOpening(null);
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
      {/* Automations Box */}
      <div
        onClick={() => router.push("/hr/automations")}
        className={`relative rounded-2xl cursor-pointer transition-all duration-300 p-6 flex flex-col justify-between h-48 border group overflow-hidden ${
          mode === "dark"
            ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-md hover:shadow-xl text-white"
            : "bg-gradient-to-br from-white to-gray-50 border-blue-100 shadow-lg hover:shadow-xl text-gray-800"
        }`}
      >
        {/* Background Icon */}
        <Icon
          icon="logos:google-analytics"
          className="absolute right-2 bottom-2 text-gray-300 opacity-10 text-[8rem] pointer-events-none select-none"
        />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:bolt-outline"
                className="text-blue-500"
                width={20}
                height={20}
              />
              <h3 className="font-bold text-lg">Automations</h3>
            </div>
            <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
              No running automations yet
            </p>
          </div>
        </div>

        <div className="flex items-center mt-4 text-sm text-gray-500 dark:text-gray-400 relative z-10">
          <Icon icon="tabler:clock" width={16} height={16} className="mr-2" />
          <span>Last Run: N/A</span>
        </div>
      </div>

      {/* Job Opening Cards */}
      {jobOpenings.map((opening) => {
        const relevantCandidates = candidates.filter(
          (c) => c.opening === opening
        );
        const count = relevantCandidates.length;
        const visibleAvatars = 3;
        const extraCount = Math.max(0, count - visibleAvatars);
        const candidateNames = getCandidateNames(opening);

        return (
          <div
            key={opening}
            onClick={() => router.push(`/hr/applicants?opening=${opening}`)}
            className={`rounded-2xl cursor-pointer transition-all duration-300 p-6 flex flex-col justify-between h-48 border group ${
              mode === "dark"
                ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-md hover:shadow-xl text-white"
                : "bg-gradient-to-br from-white to-blue-50 border-blue-100 shadow-lg hover:shadow-xl text-gray-800"
            }`}
          >
            {/* Card Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg mb-1 truncate pr-6 max-w-full">
                  {opening}
                </h3>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Icon icon="tabler:users" width={16} height={16} />
                  <p className="text-sm">
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {count}
                    </span>{" "}
                    Applicants
                  </p>
                </div>
              </div>
            </div>

            {/* Avatar Stack */}
            <div className="flex items-center mt-4">
              <div className="flex -space-x-3">
                {Array(Math.min(count, visibleAvatars))
                  .fill()
                  .map((_, index) => (
                    <div
                      key={index}
                      className="relative group/avatar"
                      onMouseEnter={() => handleUserIconHover(opening, index)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm transition-transform duration-300 group-hover/avatar:-translate-y-2">
                        <Image
                          src="/assets/images/avatar.png"
                          alt="Avatar"
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Tooltip */}
                      <div
                        className={`absolute -top-12 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap pointer-events-none px-3 py-2 text-xs rounded-lg font-medium ring-1 transition-all duration-300 shadow-lg ${
                          hoveredOpening === opening &&
                          hoveredUserIndex === index
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-95"
                        } ${
                          mode === "dark"
                            ? "bg-white/10 backdrop-blur-md text-white ring-white/20"
                            : "bg-white/60 backdrop-blur-md text-gray-800 ring-white/40"
                        }`}
                      >
                        {candidateNames[index]}
                        <div
                          className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 transform rotate-45 w-2 h-2 ${
                            mode === "dark"
                              ? "bg-white/10 ring-white/20"
                              : "bg-white/60 ring-white/40"
                          } backdrop-blur-md`}
                        ></div>
                      </div>
                    </div>
                  ))}
                {extraCount > 0 && (
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 border-2 border-white flex items-center justify-center shadow-sm font-medium text-xs">
                    +{extraCount}
                  </div>
                )}
              </div>
              <span className="ml-4 text-xs text-gray-500 dark:text-gray-400">
                {count === 0
                  ? "No applicants yet"
                  : count === 1
                  ? "1 person applied"
                  : `${count} people applied`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
