import { Icon } from "@iconify/react";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function FilterSection({
                                          filterStatus,
                                          setFilterStatus,
                                          filterTier,
                                          setFilterTier,
                                          filterJobType,
                                          setFilterJobType,
                                          dateRange,
                                          setDateRange,
                                          showDatePicker,
                                          setShowDatePicker,
                                          mode,
                                          statuses,
                                          tiers,
                                          jobTypes,
                                          fallbackStaticRanges,
                                      }) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label
                        className={`block text-sm font-medium mb-2 ${
                            mode === "dark"
                                ? "text-gray-200 bg-gray-800"
                                : "text-[#231812] bg-white"
                        }`}
                    >
                        Filter by Status
                    </label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] text-sm ${
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
                
                {tiers && (
                    <div>
                        <label
                            className={`block text-sm font-medium mb-2 ${
                                mode === "dark"
                                    ? "text-gray-200 bg-gray-800"
                                    : "text-[#231812] bg-white"
                            }`}
                        >
                            Filter by Tier
                        </label>
                        <select
                            value={filterTier}
                            onChange={(e) => setFilterTier(e.target.value)}
                            className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] text-sm ${
                                mode === "dark"
                                    ? "bg-gray-700 border-gray-600 text-white"
                                    : "bg-gray-50 border-gray-300 text-[#231812]"
                            }`}
                        >
                            {tiers.map((tier) => (
                                <option key={tier} value={tier}>
                                    {tier === "all" ? "All Tiers" : tier}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                
                {jobTypes && (
                    <div>
                        <label
                            className={`block text-sm font-medium mb-2 ${
                                mode === "dark"
                                    ? "text-gray-200 bg-gray-800"
                                    : "text-[#231812] bg-white"
                            }`}
                        >
                            Filter by Job Type
                        </label>
                        <select
                            value={filterJobType}
                            onChange={(e) => setFilterJobType(e.target.value)}
                            className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] text-sm ${
                                mode === "dark"
                                    ? "bg-gray-700 border-gray-600 text-white"
                                    : "bg-gray-50 border-gray-300 text-[#231812]"
                            }`}
                        >
                            {jobTypes.map((jobType) => (
                                <option key={jobType} value={jobType}>
                                    {jobType === "all" ? "All Job Types" : jobType.charAt(0).toUpperCase() + jobType.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
            
            <div className="mt-4">
                <label
                    className={`block text-sm font-medium mb-2 ${
                        mode === "dark"
                            ? "text-gray-200 bg-gray-800"
                            : "text-[#231812] bg-white"
                    }`}
                >
                    Filter by Date Range
                </label>
                <div className="relative">
                    <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className={`w-full p-2 rounded-lg flex items-center justify-between transition duration-200 shadow-md ${
                            mode === "dark"
                                ? "bg-gray-700 text-white hover:bg-gray-600"
                                : "bg-gray-200 text-[#231812] hover:bg-gray-300"
                        }`}
                    >
                        <span>
                            {!dateRange[0]?.startDate && !dateRange[0]?.endDate 
                                ? "All Time" 
                                : dateRange[0].startDate && dateRange[0].endDate
                                    ? `${dateRange[0].startDate.toLocaleDateString()} - ${dateRange[0].endDate.toLocaleDateString()}`
                                    : "Select Date Range"}
                        </span>
                        <Icon
                            icon={showDatePicker ? "mdi:chevron-up" : "mdi:chevron-down"}
                            className="w-5 h-5 text-[#f05d23]"
                        />
                    </button>
                    {showDatePicker && (
                        <div
                            className={`absolute left-0 top-[100%] mt-2 w-[calc(100%+2rem)] -ml-40 rounded-lg shadow-lg border z-50 ${
                                mode === "dark"
                                    ? "bg-gray-800 border-gray-700 text-white dark-mode-datepicker"
                                    : "bg-white border-gray-200 text-[#231812]"
                            }`}
                        >
                            <DateRangePicker
                                ranges={dateRange}
                                onChange={(item) => setDateRange([item.selection])}
                                className="w-full"
                                inputRanges={[]}
                                staticRanges={fallbackStaticRanges}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}