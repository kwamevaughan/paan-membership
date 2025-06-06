import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Head from "next/head";
import Link from "next/link";
import toast from "react-hot-toast";
import JobsHeader from "@/layouts/JobsHeader";
import Footer from "@/layouts/footer";
import { Icon } from "@iconify/react";
import { generateJobPostingSchema } from "@/lib/jobPostingSchema";
import fs from "fs/promises"; // For filesystem access in Node.js
import path from "path"; // For resolving file paths

export default function PublicJobListings({ mode, toggleMode, initialJobs, countries }) {
    const [jobs, setJobs] = useState(initialJobs);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [locationFilter, setLocationFilter] = useState("");

    const schema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: jobs.map((job, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: generateJobPostingSchema(job, countries),
        })),
    };

    const formatDate = (isoDateString) => {
        const date = new Date(isoDateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const filteredJobs = jobs.filter((job) => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && !job.is_expired) ||
            (statusFilter === "expired" && job.is_expired);
        const matchesLocation =
            !locationFilter ||
            (job.location &&
                (typeof job.location === "object"
                    ? `${job.location.city}, ${job.location.country}`.toLowerCase().includes(locationFilter.toLowerCase())
                    : job.location.toLowerCase().includes(locationFilter.toLowerCase())));
        return matchesSearch && matchesStatus && matchesLocation;
    });

    const uniqueLocations = Array.from(
        new Set(
            jobs
                .filter((job) => job.location)
                .map((job) =>
                    typeof job.location === "object"
                        ? `${job.location.city}, ${job.location.country}`
                        : job.location
                )
        )
    );

    const handleClearFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setLocationFilter("");
    };

    return (
      <div
        className={`min-h-screen flex flex-col ${
          mode === "dark"
            ? "bg-gradient-to-b from-gray-900 to-gray-800"
            : "bg-gradient-to-b from-gray-50 to-gray-100"
        }`}
      >
        <Head>
          <title>Job Openings | PAAN Careers</title>
          <meta
            name="description"
            content="Explore current job openings at Pan-African Agency Network (PAAN) and apply today!"
          />
          <meta
            name="keywords"
            content="job openings, careers, PAAN, employment"
          />
          <meta name="robots" content="index, follow" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        </Head>

        <JobsHeader
          mode={mode}
          toggleMode={toggleMode}
          pageName="Current Job Openings"
          pageDescription="Explore exciting career opportunities at Pan-African Agency Network (PAAN) and apply today!"
        />

        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 z-10 pointer-events-none">
            
          </div>
          <div className="max-w-7xl mx-auto">
            <h1
              className={`text-3xl md:text-4xl font-bold mb-8 text-center ${
                mode === "dark" ? "text-white" : "text-[#231812]"
              }`}
            >
              <Icon
                icon="mdi:briefcase"
                className="inline-block mr-2 w-8 h-8 text-blue-400"
              />
              Current Job Openings
            </h1>

            <div
              className={`p-8 rounded-2xl shadow-2xl backdrop-blur-sm mb-8 ${
                mode === "dark" ? "bg-gray-800/95" : "bg-white/95"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative group">
                  <Icon
                    icon="mdi:magnify"
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      mode === "dark" ? "text-gray-400 group-hover:text-blue-400" : "text-gray-500 group-hover:text-blue-400"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Search by job title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ${
                      mode === "dark"
                        ? "bg-gray-700/50 text-white border-gray-600 hover:border-blue-400/50"
                        : "bg-white/50 text-gray-900 border-gray-200 hover:border-blue-400/50"
                    }`}
                  />
                </div>
                <div className="relative group">
                  <Icon
                    icon="mdi:filter"
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      mode === "dark" ? "text-gray-400 group-hover:text-blue-400" : "text-gray-500 group-hover:text-blue-400"
                    }`}
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 appearance-none ${
                      mode === "dark"
                        ? "bg-gray-700/50 text-white border-gray-600 hover:border-blue-400/50"
                        : "bg-white/50 text-gray-900 border-gray-200 hover:border-blue-400/50"
                    }`}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                  </select>
                  <Icon
                    icon="mdi:chevron-down"
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                </div>
                <div className="relative group">
                  <Icon
                    icon="mdi:map-marker"
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      mode === "dark" ? "text-gray-400 group-hover:text-blue-400" : "text-gray-500 group-hover:text-blue-400"
                    }`}
                  />
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 appearance-none ${
                      mode === "dark"
                        ? "bg-gray-700/50 text-white border-gray-600 hover:border-blue-400/50"
                        : "bg-white/50 text-gray-900 border-gray-200 hover:border-blue-400/50"
                    }`}
                  >
                    <option value="">All Locations</option>
                    {uniqueLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  <Icon
                    icon="mdi:chevron-down"
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleClearFilters}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    mode === "dark"
                      ? "bg-gray-700/50 text-white hover:bg-gray-600/50"
                      : "bg-gray-200/50 text-gray-800 hover:bg-gray-300/50"
                  }`}
                >
                  <Icon icon="mdi:refresh" className="w-5 h-5" />
                  Clear Filters
                </button>
              </div>
            </div>

            {filteredJobs.length === 0 ? (
              <div
                className={`p-8 rounded-2xl shadow-2xl backdrop-blur-sm text-center ${
                  mode === "dark"
                    ? "bg-gray-800/95 text-gray-300"
                    : "bg-white/95 text-gray-600"
                }`}
              >
                <Icon
                  icon="mdi:alert-circle"
                  className="inline-block w-8 h-8 text-blue-400 mb-3"
                />
                <p className="text-lg">
                  No job openings match your criteria. Try adjusting your
                  filters!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.slug}`}
                    className={`block p-8 rounded-2xl shadow-2xl backdrop-blur-sm transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl ${
                      mode === "dark"
                        ? "bg-gray-800/95 text-white"
                        : "bg-white/95 text-[#231812]"
                    } ${
                      job.is_expired
                        ? "opacity-75"
                        : "ring-2 ring-blue-400/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold truncate">
                        {job.title}
                      </h2>
                      <div className={`p-2 rounded-xl ${
                        mode === "dark" ? "bg-gray-700" : "bg-blue-50"
                      }`}>
                        <Icon
                          icon={
                            job.is_expired
                              ? "mdi:clock-end"
                              : "mdi:briefcase-check"
                          }
                          className={`w-6 h-6 ${
                            job.is_expired ? "text-red-500" : "text-blue-400"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="flex items-center gap-3 text-sm">
                        <div className={`p-2 rounded-xl ${
                          mode === "dark" ? "bg-gray-700" : "bg-blue-50"
                        }`}>
                          <Icon
                            icon="mdi:calendar"
                            className="w-5 h-5 text-blue-400"
                          />
                        </div>
                        <span>
                          <strong>Expires:</strong> {job.expires_on}
                        </span>
                      </p>
                      {job.location && (
                        <p className="flex items-center gap-3 text-sm">
                          <div className={`p-2 rounded-xl ${
                            mode === "dark" ? "bg-gray-700" : "bg-blue-50"
                          }`}>
                            <Icon
                              icon="mdi:map-marker"
                              className="w-5 h-5 text-blue-400"
                            />
                          </div>
                          <span>
                            <strong>Location:</strong>{" "}
                            {typeof job.location === "object"
                              ? `${job.location.city}, ${job.location.country}`
                              : job.location}
                          </span>
                        </p>
                      )}
                      {job.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          <div className={`p-2 rounded-xl inline-block mr-2 ${
                            mode === "dark" ? "bg-gray-700" : "bg-blue-50"
                          }`}>
                            <Icon
                              icon="mdi:text"
                              className="w-5 h-5 text-blue-400"
                            />
                          </div>
                          {job.description.replace(/<[^>]+>/g, "")}
                        </p>
                      )}
                      <p
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                          job.is_expired
                            ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                        }`}
                      >
                        <Icon
                          icon={job.is_expired ? "mdi:close" : "mdi:check"}
                          className="w-4 h-4"
                        />
                        {job.is_expired ? "Expired" : "Active"}
                      </p>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <span className="inline-flex items-center gap-2 text-blue-400 font-medium group">
                        View Details
                        <Icon icon="mdi:arrow-right" className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer mode={mode} />
      </div>
    );
}

export async function getServerSideProps() {
    const formatDate = (isoDateString) => {
        const date = new Date(isoDateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    try {
        // Fetch jobs from Supabase
        const { data: jobsData, error: jobsError } = await supabase
            .from("job_openings")
            .select("*")
            .order("created_at", { ascending: false });
        if (jobsError) throw jobsError;

        // Read countries.json from the public folder
        const filePath = path.join(process.cwd(), "public", "assets", "misc", "countries.json");
        const countriesData = await fs.readFile(filePath, "utf8");
        const countries = JSON.parse(countriesData);

        const jobs = jobsData.map((job) => {
            let parsedLocation = job.location;
            if (parsedLocation && typeof parsedLocation === "string") {
                try {
                    parsedLocation = JSON.parse(parsedLocation);
                } catch (e) {
                    console.error("Error parsing location:", e);
                }
            }

            return {
                ...job,
                expires_on: formatDate(job.expires_on),
                is_expired: new Date(job.expires_on) < new Date(),
                location: parsedLocation,
            };
        });

        return { props: { initialJobs: jobs, countries } };
    } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load job openings");
        return { props: { initialJobs: [], countries: [] } };
    }
}