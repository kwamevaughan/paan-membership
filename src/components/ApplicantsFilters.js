import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";

export default function ApplicantsFilters({ candidates, onFilterChange, mode, initialOpening }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterOpening, setFilterOpening] = useState(initialOpening || "all");
    const [filterStatus, setFilterStatus] = useState("all");
    const hasAppliedInitialFilter = useRef(false);

    const uniqueOpenings = ["all", ...new Set(candidates.map((c) => c.opening))];
    const statuses = ["all", "Pending", "Reviewed", "Shortlisted", "Rejected"];

    useEffect(() => {
        console.log(
            "Initial useEffect triggered - initialOpening:",
            initialOpening,
            "filterOpening:",
            filterOpening,
            "hasAppliedInitialFilter:",
            hasAppliedInitialFilter.current
        );

        if (!hasAppliedInitialFilter.current && candidates.length > 0) {
            const savedOpening =
                initialOpening !== "all" ? initialOpening : localStorage.getItem("filterOpening") || "all";
            const savedStatus = localStorage.getItem("filterStatus") || "all";

            setFilterOpening(savedOpening);
            setFilterStatus(savedStatus);
            handleFilter(savedStatus, savedOpening);
            hasAppliedInitialFilter.current = true;
        }
    }, [candidates]);

    useEffect(() => {
        handleFilter();
    }, [searchQuery, filterOpening, filterStatus]);

    const handleFilter = (statusOverride = filterStatus, openingOverride = filterOpening) => {
        console.log("Applying Filter - SearchQuery:", searchQuery, "Opening:", openingOverride, "Status:", statusOverride);
        onFilterChange({ searchQuery, filterOpening: openingOverride, filterStatus: statusOverride });
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setFilterStatus(newStatus);
    };

    const handleOpeningChange = (e) => {
        const newOpening = e.target.value;
        setFilterOpening(newOpening);
    };

    return (
        <div
            className={`border-t-4 border-[#f05d23] mt-6 mb-4 p-3 sm:p-4 rounded-lg shadow-md ${
                mode === "dark" ? "bg-gray-800" : "bg-white"
            }`}
        >
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <label
                        className={`block text-xs sm:text-sm font-medium mb-1 ${
                            mode === "dark" ? "text-gray-300" : "text-[#231812]"
                        }`}
                    >
                        Search
                    </label>
                    <div className="relative">
                        <Icon
                            icon="mdi:magnify"
                            className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-[#f05d23]"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or email..."
                            className={`w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-1 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] text-xs sm:text-sm ${
                                mode === "dark"
                                    ? "bg-gray-700 border-gray-600 text-white"
                                    : "bg-gray-50 border-gray-300 text-[#231812]"
                            }`}
                        />
                    </div>
                </div>
                <div className="flex-1 relative">
                    <label
                        className={`block text-xs sm:text-sm font-medium mb-1 ${
                            mode === "dark" ? "text-gray-300" : "text-[#231812]"
                        }`}
                    >
                        Filter by Opening
                    </label>
                    <select
                        value={filterOpening}
                        onChange={handleOpeningChange}
                        className={`w-full p-1 sm:p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] text-xs sm:text-sm z-20 relative ${
                            mode === "dark"
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-gray-50 border-gray-300 text-[#231812]"
                        }`}
                    >
                        {uniqueOpenings.map((opening) => (
                            <option key={opening} value={opening}>
                                {opening}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex-1 relative">
                    <label
                        className={`block text-xs sm:text-sm font-medium mb-1 ${
                            mode === "dark" ? "text-gray-300" : "text-[#231812]"
                        }`}
                    >
                        Filter by Status
                    </label>
                    <select
                        value={filterStatus}
                        onChange={handleStatusChange}
                        className={`w-full p-1 sm:p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] text-xs sm:text-sm z-20 relative ${
                            mode === "dark"
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-gray-50 border-gray-300 text-[#231812]"
                        }`}
                    >
                        {statuses.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}