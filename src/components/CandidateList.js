import { Icon } from "@iconify/react";
import Image from "next/image";
import { useState } from "react";
import { useCountry } from "@/hooks/useCountry";

export default function CandidateList({
  candidates,
  setSelectedCandidate,
  setIsModalOpen,
  mode,
}) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedJobType, setSelectedJobType] = useState("all"); // "all", "agency", or "freelancer"
  const { countries } = useCountry(); // Use the hook to get countries data

  // Function to determine job type from opening
  const getJobType = (opening) => {
    const openingLower = opening?.toLowerCase() || "";
    if (openingLower.includes("agency") || openingLower.includes("agencies")) {
      return "agency";
    } else if (
      openingLower.includes("freelancer") ||
      openingLower.includes("freelancers")
    ) {
      return "freelancer";
    }
    return "other";
  };

  // Filter candidates based on selected job type and Pending status
  const filteredCandidates = candidates.filter((candidate) => {
    // Only include candidates with Pending status
    if (candidate.status !== "Pending") return false;
    if (selectedJobType === "all") return true;
    return getJobType(candidate.opening) === selectedJobType;
  });

  const recent = filteredCandidates
    .slice()
    .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
    .slice(0, 5); // Sort by date descending and take latest 5

  const pendingCount = filteredCandidates.length; // Since all filtered candidates are Pending

  const handleViewClick = (candidate, e) => {
    e.stopPropagation();
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  // Debug log for development (remove in production)
  if (process.env.NODE_ENV === "development" && countries.length === 0) {
    console.warn(
      "Countries data is empty. Check useCountry hook or countries.json path."
    );
  }

  return (
    <div
      className={`rounded-2xl cursor-pointer transition-all duration-300 p-6 ${
        mode === "dark"
          ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-md hover:shadow-xl text-white"
          : "bg-gradient-to-br from-white to-gray-50 border-blue-100 shadow-lg hover:shadow-xl text-gray-800"
      }`}
    >
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3
            className={`text-lg font-semibold flex items-center ${
              mode === "dark" ? "text-white" : "text-gray-800"
            }`}
          >
            <Icon icon="mdi:clock-outline" className="mr-2 text-2xl" />
            Pending Approval
            <span
              className={`ml-2 px-2.5 py-0.5 text-sm rounded-full ${
                mode === "dark"
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {pendingCount}
            </span>
          </h3>
        </div>

        {/* Job Type Switch */}
        <div
          className={`inline-flex p-1 rounded-lg ${
            mode === "dark" ? "bg-gray-700" : "bg-gray-100"
          }`}
        >
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
              selectedJobType === "all"
                ? mode === "dark"
                  ? "bg-gray-600 text-white shadow-sm"
                  : "bg-white text-gray-800 shadow-sm"
                : mode === "dark"
                ? "text-gray-300 hover:text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setSelectedJobType("all")}
          >
            All
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition flex items-center ${
              selectedJobType === "agency"
                ? mode === "dark"
                  ? "bg-gray-600 text-white shadow-sm"
                  : "bg-white text-gray-800 shadow-sm"
                : mode === "dark"
                ? "text-gray-300 hover:text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setSelectedJobType("agency")}
          >
            <Icon icon="mdi:office-building" className="mr-1.5" />
            Agency
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition flex items-center ${
              selectedJobType === "freelancer"
                ? mode === "dark"
                  ? "bg-gray-600 text-white shadow-sm"
                  : "bg-white text-gray-800 shadow-sm"
                : mode === "dark"
                ? "text-gray-300 hover:text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setSelectedJobType("freelancer")}
          >
            <Icon icon="mdi:account" className="mr-1.5" />
            Freelancer
          </button>
        </div>
      </div>

      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
        {recent.map((candidate) => {
          const isHovered = hoveredItem === candidate.id;
          // Find the country flag from countries data (case-insensitive)
          const countryData = countries.find(
            (c) => c.name.toLowerCase() === candidate.country?.toLowerCase()
          );
          const countryFlag = countryData ? countryData.flag : "🌐"; // Fallback to globe emoji

          // Debug log for development (remove in production)
          if (
            process.env.NODE_ENV === "development" &&
            !countryData &&
            candidate.country
          ) {
            console.warn(`No country flag found for: ${candidate.country}`);
          }

          return (
            <div
              key={candidate.id}
              className={`relative rounded-xl transition-all duration-300 overflow-hidden ${
                mode === "dark"
                  ? "bg-gray-800 hover:bg-gray-750 border border-gray-700"
                  : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
              }`}
              onMouseEnter={() => setHoveredItem(candidate.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => setSelectedCandidate(candidate)}
            >
              <div className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200">
                    <Image
                      src="/assets/images/avatar.png"
                      alt={`${candidate.primaryContactName}'s avatar`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1">
                      <h4
                        className={`font-medium truncate ${
                          mode === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {candidate.primaryContactName}
                        {candidate.agencyName && (
                          <span className="opacity-70">
                            {" "}
                            - {candidate.agencyName}
                          </span>
                        )}
                      </h4>

                      <div className="flex flex-wrap items-center gap-2">
                        {candidate.country &&
                          candidate.country !== "Unknown" && (
                            <span
                              className={`text-lg font-medium ${
                                mode === "dark"
                                  ? "text-gray-300"
                                  : "text-gray-700"
                              }`}
                            >
                              {countryFlag}
                            </span>
                          )}

                        <span
                          className={`text-xs ${
                            mode === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {candidate.submitted_at
                            ? new Date(
                                candidate.submitted_at
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "No submission date"}
                        </span>

                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            candidate.status === "Pending"
                              ? mode === "dark"
                                ? "bg-amber-800 text-amber-200"
                                : "bg-amber-100 text-amber-800"
                              : candidate.status === "Accepted"
                              ? mode === "dark"
                                ? "bg-green-800 text-green-200"
                                : "bg-green-100 text-green-800"
                              : mode === "dark"
                              ? "bg-blue-800 text-blue-200"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {candidate.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleViewClick(candidate, e)}
                    className={`ml-2 flex items-center justify-center px-3 py-1.5 rounded-lg transition ${
                      mode === "dark"
                        ? "bg-blue-900/50 hover:bg-blue-800 text-blue-200"
                        : "bg-blue-50 hover:bg-blue-100 text-blue-700"
                    }`}
                  >
                    <Icon icon="mdi:eye-outline" className="mr-1" />
                    View
                  </button>
                </div>
              </div>

              {/* Animated hover effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r opacity-0 ${
                  isHovered ? "opacity-10" : ""
                } transition-opacity duration-300 pointer-events-none ${
                  mode === "dark"
                    ? "from-blue-500/20 to-purple-500/20"
                    : "from-blue-500/10 to-purple-500/10"
                }`}
              />
            </div>
          );
        })}

        {recent.length === 0 && (
          <div
            className={`p-8 text-center rounded-lg ${
              mode === "dark"
                ? "bg-gray-800 text-gray-400"
                : "bg-gray-50 text-gray-500"
            }`}
          >
            <Icon icon="mdi:inbox-outline" className="mx-auto text-4xl mb-2" />
            <p>
              No {selectedJobType !== "all" ? selectedJobType : ""} pending
              submissions found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
