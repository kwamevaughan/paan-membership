import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";

export default function ChartFilterModal({
  candidates = [],
  type,
  value,
  onClose,
  setSelectedCandidate,
  setIsCandidateModalOpen,
  mode = "light",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCandidates, setFilteredCandidates] = useState(candidates);
  const modalRef = useRef(null);
  const searchInputRef = useRef(null);
  const isInitialMount = useRef(true);

  // Track if a candidate modal is open to prevent closing this modal
  const [isViewingCandidate, setIsViewingCandidate] = useState(false);

  // Filter candidates based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCandidates(candidates);
      return;
    }

    const filtered = candidates.filter(
      (candidate) =>
        (candidate.primaryContactName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (candidate.opening || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (candidate.job_type || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

    setFilteredCandidates(filtered);
  }, [searchTerm, candidates]);

  // Focus search input on modal open
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Close modal when clicking outside, but only if not viewing a candidate
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Ignore clicks on ApexCharts elements
      if (event.target.closest(".apexcharts-canvas")) {
        return;
      }

      // Delay closing to avoid immediate closure on mount
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }

      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        !isViewingCandidate
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, isViewingCandidate]);

  // Handle escape key press, but only if not viewing a candidate
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && !isViewingCandidate) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [onClose, isViewingCandidate]);

  // Listen for candidate modal state changes
  useEffect(() => {
    // Create a MutationObserver to detect when candidate modals are added/removed
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          // Check if a candidate modal with z-[60] exists in the DOM
          const candidateModalExists =
            document.querySelector(".z-\\[60\\]") !== null;
          setIsViewingCandidate(candidateModalExists);
        }
      }
    });

    // Start observing the body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const handleViewClick = (candidate) => {
    setSelectedCandidate(candidate);
    setIsCandidateModalOpen(true);
    setIsViewingCandidate(true); // Mark that we're viewing a candidate
  };

  // Format the filter value display
  const getFilterDisplay = () => {
    if (type === "status") return `Status: ${value}`;
    if (type === "country") return `Country: ${value}`;
    if (type === "device")
      return `Device: ${Array.isArray(value) ? value.join(", ") : value}`;
    if (type === "date") {
      const date = new Date(value);
      return `Date: ${date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`;
    }
    return "Filter Results";
  };

  const isDark = mode === "dark";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[1000] p-4 backdrop-blur-sm transition-all duration-300"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] transform transition-transform duration-300 ease-out ${
          isDark ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <div className="bg-gradient-to-r from-[#f05d23] to-[#d94f1e] rounded-t-xl p-5 flex items-center justify-between">
          <h2
            id="modal-title"
            className="text-2xl font-bold text-white flex items-center"
          >
            <Icon
              icon={
                type === "status"
                  ? "mdi:flag"
                  : type === "country"
                  ? "mdi:earth"
                  : type === "device"
                  ? "mdi:devices"
                  : "mdi:calendar"
              }
              className="mr-2 w-6 h-6"
            />
            {getFilterDisplay()}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 bg-white bg-opacity-20 rounded-full p-2 transition duration-200"
            aria-label="Close modal"
          >
            <Icon icon="mdi:close" width={20} height={20} />
          </button>
        </div>

        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon
                icon="mdi:magnify"
                className={`w-5 h-5 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search candidates by name or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg ${
                isDark
                  ? "bg-gray-700 text-white placeholder-gray-400 border-gray-600"
                  : "bg-gray-100 text-gray-800 placeholder-gray-500 border-gray-300"
              } border focus:outline-none focus:ring-2 focus:ring-[#f05d23]`}
              aria-label="Search candidates"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label="Clear search"
              >
                <Icon
                  icon="mdi:close-circle"
                  className={`w-5 h-5 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  } hover:text-gray-700`}
                />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 p-5 overflow-y-auto">
          {filteredCandidates.length > 0 ? (
            <ul className="space-y-3">
              {filteredCandidates.map((candidate) => (
                <li
                  key={candidate.id || Math.random()} // Fallback key if id is missing
                  className={`p-3 rounded-lg flex justify-between items-center transform transition-all duration-200 animate-fade-in hover:translate-x-1 ${
                    isDark
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex flex-col">
                    <span
                      className={`font-medium ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {candidate.primaryContactName || "Unknown Name"}
                    </span>
                    <span
                      className={`text-sm ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {candidate.opening || "Unknown Position"} •{" "}
                      <span className="capitalize">
                        {candidate.job_type || "Unknown Type"}
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={() => handleViewClick(candidate)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#f05d23] text-white hover:bg-[#d94f1e] transition duration-200 shadow-md"
                    aria-label={`View details for ${
                      candidate.primaryContactName || "candidate"
                    }`}
                  >
                    <Icon icon="mdi:eye" className="w-4 h-4" />
                    View
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Icon
                icon="mdi:file-search-outline"
                className={`w-16 h-16 mb-4 ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <p
                className={`text-lg font-medium ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                No candidates match your filter
              </p>
              <p
                className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                {searchTerm
                  ? "Try adjusting your search query"
                  : "Try selecting a different filter"}
              </p>
            </div>
          )}
        </div>

        <div
          className={`p-5 border-t ${
            isDark
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-gray-50"
          } rounded-b-xl`}
        >
          <div className="flex justify-between items-center">
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {filteredCandidates.length}{" "}
              {filteredCandidates.length === 1 ? "candidate" : "candidates"}{" "}
              found
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className={`px-5 py-2 rounded-full flex items-center gap-2 transition duration-200 ${
                  isDark
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                aria-label="Close modal"
              >
                <Icon icon="mdi:close" width={18} height={18} />
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
