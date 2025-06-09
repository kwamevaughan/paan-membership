import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

export default function JobFilters({ jobs, onFilter, mode }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    jobType: "all",
    location: "all",
  });

  // Extract unique job types and locations from jobs
  const jobTypes = ["all", ...new Set(jobs.map(job => job.job_type).filter(Boolean))];
  
  // Handle location object properly
  const locations = ["all", ...new Set(jobs.map(job => {
    if (!job.location) return null;
    if (typeof job.location === 'string') return job.location;
    return `${job.location.city}, ${job.location.region}`;
  }).filter(Boolean))];

  useEffect(() => {
    const filteredJobs = jobs.filter(job => {
      const matchesSearch = searchTerm === "" || 
        (job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = filters.status === "all" || 
        (filters.status === "active" && !job.is_expired) ||
        (filters.status === "expired" && job.is_expired);
      
      const matchesJobType = filters.jobType === "all" || 
        job.job_type?.toLowerCase() === filters.jobType.toLowerCase();
      
      // Handle location matching properly
      const matchesLocation = filters.location === "all" || 
        (typeof job.location === 'string' && job.location === filters.location) ||
        (typeof job.location === 'object' && job.location && 
         `${job.location.city}, ${job.location.region}` === filters.location);

      return matchesSearch && matchesStatus && matchesJobType && matchesLocation;
    });

    onFilter(filteredJobs);
  }, [searchTerm, filters, jobs, onFilter]);

  // Format location for display
  const formatLocation = (location) => {
    if (!location) return "All Locations";
    if (typeof location === 'string') return location;
    return `${location.city}, ${location.region}`;
  };

  const formatJobType = (type) => {
    if (type === "all") return "All Types";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className={`mb-8 p-6 rounded-2xl backdrop-blur-sm ${
      mode === "dark" 
        ? "bg-gray-800/50 border border-white/10" 
        : "bg-white/50 border border-gray-200"
    }`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon icon="mdi:magnify" className={`h-5 w-5 ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search jobs..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl border ${
              mode === "dark"
                ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className={`px-4 py-2 rounded-xl border ${
            mode === "dark"
              ? "bg-gray-700/50 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </select>

        {/* Job Type Filter */}
        <select
          value={filters.jobType}
          onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
          className={`px-4 py-2 rounded-xl border ${
            mode === "dark"
              ? "bg-gray-700/50 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          {jobTypes.map(type => (
            <option key={type} value={type}>
              {formatJobType(type)}
            </option>
          ))}
        </select>

        {/* Location Filter */}
        <select
          value={filters.location}
          onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
          className={`px-4 py-2 rounded-xl border ${
            mode === "dark"
              ? "bg-gray-700/50 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          {locations.map(loc => (
            <option key={loc} value={loc}>
              {loc === "all" ? "All Locations" : loc}
            </option>
          ))}
        </select>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || filters.status !== "all" || filters.jobType !== "all" || filters.location !== "all") && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchTerm && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              mode === "dark" 
                ? "bg-blue-500/20 text-blue-300" 
                : "bg-blue-100 text-blue-800"
            }`}>
              Search: {searchTerm}
              <button
                onClick={() => setSearchTerm("")}
                className="ml-2 hover:text-red-500"
              >
                <Icon icon="mdi:close" className="h-4 w-4" />
              </button>
            </span>
          )}
          {filters.status !== "all" && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              mode === "dark" 
                ? "bg-green-500/20 text-green-300" 
                : "bg-green-100 text-green-800"
            }`}>
              Status: {filters.status}
              <button
                onClick={() => setFilters(prev => ({ ...prev, status: "all" }))}
                className="ml-2 hover:text-red-500"
              >
                <Icon icon="mdi:close" className="h-4 w-4" />
              </button>
            </span>
          )}
          {filters.jobType !== "all" && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              mode === "dark" 
                ? "bg-purple-500/20 text-purple-300" 
                : "bg-purple-100 text-purple-800"
            }`}>
              Type: {formatJobType(filters.jobType)}
              <button
                onClick={() => setFilters(prev => ({ ...prev, jobType: "all" }))}
                className="ml-2 hover:text-red-500"
              >
                <Icon icon="mdi:close" className="h-4 w-4" />
              </button>
            </span>
          )}
          {filters.location !== "all" && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              mode === "dark" 
                ? "bg-orange-500/20 text-orange-300" 
                : "bg-orange-100 text-orange-800"
            }`}>
              Location: {filters.location}
              <button
                onClick={() => setFilters(prev => ({ ...prev, location: "all" }))}
                className="ml-2 hover:text-red-500"
              >
                <Icon icon="mdi:close" className="h-4 w-4" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
} 