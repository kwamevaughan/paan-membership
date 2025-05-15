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
import ConnectingDotsBackground from "@/components/ConnectingDotsBackground";

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
            <ConnectingDotsBackground
              color="#f05d23"
              secondaryColor={mode === "dark" ? "#f05d23" : "#505050"}
              dotCount={50}
              dotSize={2.2}
              lineDistance={180}
              speed={0.6}
              mode={mode}
            />
          </div>
          <div className="max-w-7xl mx-auto">
            <h1
              className={`text-3xl md:text-4xl font-bold mb-8 text-center ${
                mode === "dark" ? "text-white" : "text-[#231812]"
              }`}
            >
              <Icon
                icon="mdi:briefcase"
                className="inline-block mr-2 w-8 h-8 text-[#f05d23]"
              />
              Current Job Openings
            </h1>

            <div
              className={`p-6 rounded-lg shadow-md mb-8 ${
                mode === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Icon
                    icon="mdi:magnify"
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Search by job title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-[#f05d23] ${
                      mode === "dark"
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-white text-gray-900 border-gray-300"
                    }`}
                  />
                </div>
                <div className="relative">
                  <Icon
                    icon="mdi:filter"
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-[#f05d23] ${
                      mode === "dark"
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-white text-gray-900 border-gray-300"
                    }`}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div className="relative">
                  <Icon
                    icon="mdi:map-marker"
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-[#f05d23] ${
                      mode === "dark"
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-white text-gray-900 border-gray-300"
                    }`}
                  >
                    <option value="">All Locations</option>
                    {uniqueLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleClearFilters}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    mode === "dark"
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  <Icon icon="mdi:refresh" className="w-5 h-5" />
                  Clear Filters
                </button>
              </div>
            </div>

            {filteredJobs.length === 0 ? (
              <div
                className={`p-6 rounded-lg shadow-md text-center ${
                  mode === "dark"
                    ? "bg-gray-800 text-gray-300"
                    : "bg-white text-gray-600"
                }`}
              >
                <Icon
                  icon="mdi:alert-circle"
                  className="inline-block w-6 h-6 text-[#f05d23] mb-2"
                />
                <p>
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
                    className={`block p-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                      mode === "dark"
                        ? "bg-gray-800 text-white border-gray-700"
                        : "bg-white text-[#231812] border-gray-200"
                    } ${
                      job.is_expired
                        ? "opacity-75"
                        : "border-t-4 border-[#f05d23]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold truncate">
                        {job.title}
                      </h2>
                      <Icon
                        icon={
                          job.is_expired
                            ? "mdi:clock-end"
                            : "mdi:briefcase-check"
                        }
                        className={`w-6 h-6 ${
                          job.is_expired ? "text-red-500" : "text-green-500"
                        }`}
                      />
                    </div>
                    <div className="space-y-3">
                      <p className="flex items-center gap-2 text-sm">
                        <Icon
                          icon="mdi:calendar"
                          className="w-5 h-5 text-[#f05d23]"
                        />
                        <span>
                          <strong>Expires:</strong> {job.expires_on}
                        </span>
                      </p>
                      {job.location && (
                        <p className="flex items-center gap-2 text-sm">
                          <Icon
                            icon="mdi:map-marker"
                            className="w-5 h-5 text-[#f05d23]"
                          />
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
                          <Icon
                            icon="mdi:text"
                            className="inline-block w-5 h-5 text-[#f05d23] mr-2"
                          />
                          {job.description.replace(/<[^>]+>/g, "")}
                        </p>
                      )}
                      <p
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          job.is_expired
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}
                      >
                        <Icon
                          icon={job.is_expired ? "mdi:close" : "mdi:check"}
                          className="w-4 h-4"
                        />
                        {job.is_expired ? "Expired" : "Active"}
                      </p>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <span className="inline-flex items-center gap-1 text-[#f05d23] font-medium hover:underline">
                        View Details
                        <Icon icon="mdi:arrow-right" className="w-5 h-5" />
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