// src/components/RecentActivity.js
import { Icon } from "@iconify/react";

export default function RecentActivity({ candidates, setSelectedCandidate, setIsModalOpen, mode }) {
    const recent = candidates
        .slice()
        .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
        .slice(0, 5); // Sort by date descending

    const handleViewClick = (candidate) => {
        setSelectedCandidate(candidate);
        setIsModalOpen(true);
    };

    return (
      <div
        className={`border-t-4 border-[#84c1d9] p-6 rounded-xl shadow-lg hover:shadow-xl animate-fade-in transition-shadow duration-500 mb-6 ${
          mode === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h3
          className={`text-lg font-semibold mb-6 ${
            mode === "dark" ? "text-white" : "text-[#231812]"
          }`}
        >
          Recent Activity
        </h3>
        <ul className="space-y-4 max-h-[300px] overflow-y-auto">
          {recent.map((candidate) => (
            <li
              key={candidate.id}
              className={`relative p-4 rounded-lg shadow-md hover:shadow-lg transform transition-all duration-300 ${
                mode === "dark"
                  ? "bg-gradient-to-r from-gray-700 to-gray-600 text-white"
                  : "bg-gradient-to-r from-gray-50 to-gray-100 text-[#231812]"
              }`}
              style={{
                borderLeft: "4px solid #84c1d9", // Consistent highlight
              }}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium text-base">
                    {candidate.primaryContactName} - {candidate.agencyName}
                  </p>
                  <p
                    className={`text-sm ${
                      mode === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {new Date(candidate.submitted_at).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleViewClick(candidate)}
                  className="group flex items-center gap-1 px-3 py-1 bg-[#84c1d9] text-white rounded-full hover:bg-[#84c1d9] transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <Icon
                    icon="mdi:eye"
                    className="w-4 h-4 group-hover:scale-110 transition-transform"
                  />
                  View
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
}