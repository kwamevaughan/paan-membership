import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import JobsHeader from "@/layouts/JobsHeader";
import Footer from "@/layouts/footer";
import { Icon } from "@iconify/react";
import Head from "next/head";
import ShareModal from "@/components/ShareModal";
import { generateJobPostingSchema } from "@/lib/jobPostingSchema";
import fs from "fs";
import path from "path";
import ConnectingDotsBackground from "@/components/ConnectingDotsBackground";


export default function JobDetail({ mode, toggleMode, initialJob, countries }) {
    const [job, setJob] = useState(initialJob || null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const router = useRouter();
    const { slug } = router.query;

    useEffect(() => {
        if (slug && !initialJob) {
            fetchJob();
        }
    }, [slug]);

    useEffect(() => {
        if (job && !job.is_expired) {
            const calculateTimeLeft = () => {
                const now = new Date();
                const expiry = new Date(job.expires_on.split("/").reverse().join("-"));
                const diffTime = expiry - now;
                if (diffTime <= 0) {
                    setTimeLeft(null);
                    return;
                }

                const months = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
                const days = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);

                setTimeLeft({ months, days, hours, minutes, seconds });
            };
            calculateTimeLeft();
            const interval = setInterval(calculateTimeLeft, 1000);
            return () => clearInterval(interval);
        }
    }, [job]);

    const fetchJob = async () => {
        const loadingToast = toast.loading("Loading job details...");
        try {
            const { data, error } = await supabase
                .from("job_openings")
                .select("*")
                .eq("slug", slug)
                .single();
            if (error) throw error;

            const countryName = countries.find((c) => c.code === data.location?.country)?.name || data.location?.country;
            const formattedJob = {
                ...data,
                expires_on: formatDate(data.expires_on),
                is_expired: new Date(data.expires_on) < new Date(),
                location: data.location ? { ...data.location, country: countryName } : null,
            };
            setJob(formattedJob);
            toast.success("Job details loaded!", { id: loadingToast });
        } catch (error) {
            console.error("Error fetching job:", error);
            toast.error("Failed to load job details.", { id: loadingToast });
            setJob(null);
        }
    };

    const formatDate = (isoDateString) => {
        const date = new Date(isoDateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleApply = () => {
        if (job && !job.is_expired) {
            router.push(`/interview?opening=${encodeURIComponent(job.title)}`);
        } else {
            toast.error("This job has expired and is no longer accepting applications.");
        }
    };

    const previewUrl = job?.file_url
        ? `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(job.file_url)}`
        : null;

    const employmentTypeLabel = {
        FULL_TIME: "Full-Time",
        PART_TIME: "Part-Time",
        CONTRACTOR: "Contractor",
        TEMPORARY: "Temporary",
        INTERN: "Internship",
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
          <title>
            {job ? `${job.title} | PAAN Careers` : "Job Details | PAAN Careers"}
          </title>
          <meta
            name="description"
            content={
              job
                ? `Apply for ${job.title} at PAAN. ${
                    employmentTypeLabel[job.employment_type] || ""
                  } position in ${job.location?.city || ""}, ${
                    job.remote ? "Remote" : "On-site"
                  }. Expires on ${job.expires_on}.`
                : "Explore career opportunities at Pan-African Agency Network (PAAN)."
            }
          />
          <meta
            name="keywords"
            content="job opening, careers, PAAN, employment"
          />
          {job?.is_expired ? (
            <meta name="robots" content="noindex" />
          ) : (
            <meta name="robots" content="index, follow" />
          )}
          <meta property="og:title" content={job ? job.title : "Job Details"} />
          <meta
            property="og:description"
            content={
              job
                ? `Apply for ${job.title}. ${
                    employmentTypeLabel[job.employment_type] || ""
                  } position. Expires ${job.expires_on}.`
                : "Explore career opportunities at PAAN."
            }
          />
          <meta property="og:type" content="website" />
          <meta
            property="og:url"
            content={`https://membership.paan.africa/jobs/${slug}`}
          />
          {job && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(
                  generateJobPostingSchema(job, countries)
                ),
              }}
            />
          )}
        </Head>

        <JobsHeader
          mode={mode}
          toggleMode={toggleMode}
          pageName={job ? job.title : "Job Opening"}
          pageDescription="Explore this career opportunity and apply today!"
        />

        <main className="flex-1 p-6 pt-24">
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
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <button
                  onClick={() => router.push("/job-board")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    mode === "dark"
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-[#231812] hover:bg-gray-300"
                  }`}
                >
                  <Icon icon="mdi:arrow-left" className="w-5 h-5" />
                  Back to Jobs
                </button>
              </div>
              {job ? (
                <div
                  className={`p-6 rounded-lg shadow-lg ${
                    mode === "dark"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-[#231812]"
                  }`}
                >
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Icon
                      icon="mdi:file-document"
                      className="w-6 h-6 text-[#f05d23]"
                    />
                    Job Description
                  </h2>
                  {job.file_url ? (
                    <iframe
                      src={previewUrl}
                      width="100%"
                      height="600px"
                      className={`border-2 rounded-lg shadow-inner ${
                        mode === "dark" ? "border-gray-700" : "border-gray-200"
                      }`}
                      title="Job Description Document"
                      allow="autoplay"
                    />
                  ) : job.description ? (
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: job.description }}
                    />
                  ) : (
                    <div
                      className={`p-4 rounded-lg flex items-center gap-2 ${
                        mode === "dark"
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Icon
                        icon="mdi:information"
                        className="w-5 h-5 text-[#f05d23]"
                      />
                      <p className="italic">
                        No detailed description or file available for this
                        position. Please check back later or contact HR for more
                        information.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p
                  className={`text-center flex items-center justify-center gap-2 ${
                    mode === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                  Loading job details...
                </p>
              )}
            </div>

            {job && (
              <div className="lg:col-span-1">
                <div
                  className={`p-6 rounded-lg shadow-lg sticky top-24 ${
                    mode === "dark"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-[#231812]"
                  }`}
                >
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Icon
                      icon="mdi:clipboard-check"
                      className="w-6 h-6 text-[#f05d23]"
                    />
                    Application Details
                  </h3>
                  <div className="space-y-6">
                    <div className="flex gap-2">
                      <p
                        className={`text-base font-medium flex items-center gap-2 ${
                          mode === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <Icon
                          icon="mdi:briefcase"
                          className="w-5 h-5 text-[#f05d23]"
                        />
                        Employment Type
                      </p>
                      <p className="text-base">
                        {employmentTypeLabel[job.employment_type] || "N/A"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <p
                        className={`text-base font-medium flex items-center gap-2 ${
                          mode === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <Icon
                          icon="mdi:map-marker"
                          className="w-5 h-5 text-[#f05d23]"
                        />
                        Location
                      </p>
                      <p className="text-base">
                        {job.location
                          ? `${job.location.city}, ${job.location.region}, ${job.location.country}`
                          : "N/A"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <p
                        className={`text-base font-medium flex items-center gap-2 ${
                          mode === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <Icon
                          icon="mdi:home"
                          className="w-5 h-5 text-[#f05d23]"
                        />
                        Remote
                      </p>
                      <p className="text-base">{job.remote ? "Yes" : "No"}</p>
                    </div>
                    {job.department && (
                      <div className="flex gap-2">
                        <p
                          className={`text-base font-medium flex items-center gap-2 ${
                            mode === "dark" ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          <Icon
                            icon="mdi:domain"
                            className="w-5 h-5 text-[#f05d23]"
                          />
                          Department
                        </p>
                        <p className="text-base">{job.department}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <p
                        className={`text-base font-medium flex items-center gap-2 ${
                          mode === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <Icon
                          icon="mdi:calendar"
                          className="w-5 h-5 text-[#f05d23]"
                        />
                        Expires On
                      </p>
                      <p className="text-base">{job.expires_on}</p>
                    </div>
                    {!job.is_expired && timeLeft && (
                      <div
                        className={`justify-center mb-6 p-4 rounded-lg shadow-sm flex items-center gap-2 ${
                          mode === "dark" ? "bg-gray-700" : "bg-[#fff8f0]"
                        }`}
                      >
                        <Icon
                          icon="mdi:timer"
                          className="w-6 h-6 text-[#f05d23]"
                        />
                        <div
                          className={`flex items-center ${
                            mode === "dark" ? "text-white" : "text-[#231812]"
                          }`}
                        >
                          <strong className="mr-2">Time Left:</strong>
                          <div className="flex gap-2 text-lg">
                            {timeLeft.months > 0 && (
                              <span>
                                {timeLeft.months} month
                                {timeLeft.months > 1 ? "s" : ""}
                              </span>
                            )}
                            {timeLeft.days > 0 && (
                              <span>
                                {timeLeft.days} day
                                {timeLeft.days > 1 ? "s" : ""}
                              </span>
                            )}
                            {timeLeft.hours > 0 && (
                              <span>{timeLeft.hours}h</span>
                            )}
                            {timeLeft.minutes > 0 && (
                              <span>{timeLeft.minutes}m</span>
                            )}
                            {timeLeft.seconds > 0 && (
                              <span>{timeLeft.seconds}s</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <p
                        className={`text-base font-medium flex items-center gap-2 ${
                          job.is_expired
                            ? "text-red-500"
                            : mode === "dark"
                            ? "text-gray-300"
                            : "text-gray-600"
                        }`}
                      >
                        <Icon
                          icon={
                            job.is_expired ? "mdi:alert" : "mdi:check-circle"
                          }
                          className={`w-5 h-5 ${
                            job.is_expired ? "text-red-500" : "text-green-500"
                          }`}
                        />
                        Status
                      </p>
                      <p
                        className={`text-base ${
                          job.is_expired ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {job.is_expired ? "Expired" : "Active"}
                      </p>
                    </div>
                    <button
                      onClick={handleApply}
                      disabled={job.is_expired}
                      className={`w-full py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 ${
                        job.is_expired
                          ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                          : "bg-[#f05d23] text-white hover:bg-[#d94f1e] hover:shadow-lg"
                      }`}
                    >
                      <Icon icon="mdi:send" className="w-6 h-6" />
                      Apply Now
                    </button>
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className={`w-full py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 ${
                        mode === "dark"
                          ? "bg-gray-700 text-white hover:bg-gray-600"
                          : "bg-gray-200 text-[#231812] hover:bg-gray-300"
                      }`}
                    >
                      <Icon icon="mdi:share" className="w-6 h-6" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          job={job}
          mode={mode}
        />

        <Footer mode={mode} />
      </div>
    );
}

export async function getServerSideProps(context) {
    const { params } = context;
    const { slug } = params;

    // Read countries.json from public/assets/misc
    const filePath = path.join(process.cwd(), "public", "assets", "misc", "countries.json");
    const countries = JSON.parse(fs.readFileSync(filePath, "utf8"));

    try {
        const { data, error } = await supabase
            .from("job_openings")
            .select("*")
            .eq("slug", slug)
            .single();
        if (error) throw error;

        const countryName = countries.find((c) => c.code === data.location?.country)?.name || data.location?.country;
        const formatDate = (isoDateString) => {
            const date = new Date(isoDateString);
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

        const initialJob = {
            ...data,
            expires_on: formatDate(data.expires_on),
            is_expired: new Date(data.expires_on) < new Date(),
            location: data.location ? { ...data.location, country: countryName } : null,
        };

        return {
            props: {
                initialJob,
                countries,
            },
        };
    } catch (error) {
        console.error("Error fetching job in getServerSideProps:", error);
        return {
            props: {
                initialJob: null,
                countries,
            },
        };
    }
}