import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
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

export default function JobDetail({ mode, toggleMode, initialJob, countries }) {
  const [job, setJob] = useState(initialJob || null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const router = useRouter();
  const { slug } = router.query;

  const fetchJob = useCallback(async () => {
    const loadingToast = toast.loading("Loading job details...");
    try {
      const { data, error } = await supabase
        .from("job_openings")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;

      const countryName =
        countries.find((c) => c.code === data.location?.country)?.name ||
        data.location?.country;
      const formattedJob = {
        ...data,
        expires_on: formatDate(data.expires_on),
        is_expired: new Date(data.expires_on) < new Date(),
        location: data.location
          ? { ...data.location, country: countryName }
          : null,
      };
      setJob(formattedJob);
      toast.success("Job details loaded!", { id: loadingToast });
    } catch (error) {
      console.error("Error fetching job:", error);
      toast.error("Failed to load job details.", { id: loadingToast });
      setJob(null);
    }
  }, [slug, countries]);

  useEffect(() => {
    if (slug && !initialJob) {
      fetchJob();
    }
  }, [fetchJob, initialJob, slug]);

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
        const days = Math.floor(
          (diffTime % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24)
        );
        const hours = Math.floor(
          (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);

        setTimeLeft({ months, days, hours, minutes, seconds });
      };
      calculateTimeLeft();
      const interval = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(interval);
    }
  }, [job]);

  const handleApply = () => {
    if (job && !job.is_expired) {
      router.push(
        `/interview?opening=${encodeURIComponent(
          job.title
        )}&job_type=${encodeURIComponent(
          job.job_type
        )}&opening_id=${encodeURIComponent(job.id)}`
      );
    } else {
      toast.error(
        "This job has expired and is no longer accepting applications."
      );
    }
  };

  const previewUrl = job?.file_url
    ? `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(
        job.file_url
      )}`
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
          ? "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-b from-gray-50 via-white to-gray-50"
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
              __html: JSON.stringify(generateJobPostingSchema(job, countries)),
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
        <div className="absolute inset-0 z-10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <button
                onClick={() => router.push("/jobs")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  mode === "dark"
                    ? "bg-gray-800/50 text-white hover:bg-gray-700/50 shadow-lg"
                    : "bg-white/50 text-[#231812] hover:bg-gray-50/50 shadow-lg"
                }`}
              >
                <Icon icon="mdi:arrow-left" className="w-5 h-5" />
                Back to Jobs
              </button>
            </div>
            {job ? (
              <div
                className={`p-8 rounded-2xl shadow-2xl backdrop-blur-sm ${
                  mode === "dark"
                    ? "bg-gray-800/95 text-white"
                    : "bg-white/95 text-[#231812]"
                }`}
              >
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      mode === "dark" ? "bg-gray-700" : "bg-blue-50"
                    }`}
                  >
                    <Icon
                      icon="mdi:file-document"
                      className="w-8 h-8 text-blue-400"
                    />
                  </div>
                  Job Description
                </h2>
                {job.file_url ? (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent rounded-xl pointer-events-none" />
                    <iframe
                      src={previewUrl}
                      width="100%"
                      height="700px"
                      className={`border-2 rounded-xl shadow-inner transition-all duration-300 group-hover:shadow-lg ${
                        mode === "dark" ? "border-gray-700" : "border-gray-200"
                      }`}
                      title="Job Description Document"
                      allow="autoplay"
                    />
                  </div>
                ) : job.description ? (
                  <div
                    className="prose max-w-none prose-headings:text-2xl prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-a:text-blue-400 dark:prose-a:text-blue-400"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                ) : (
                  <div
                    className={`p-6 rounded-xl flex items-center gap-3 ${
                      mode === "dark"
                        ? "bg-gray-700/50 text-gray-300"
                        : "bg-blue-50/50 text-gray-600"
                    }`}
                  >
                    <Icon
                      icon="mdi:information"
                      className="w-6 h-6 text-blue-400"
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
              <div
                className={`p-8 rounded-2xl shadow-2xl backdrop-blur-sm flex items-center justify-center ${
                  mode === "dark" ? "bg-gray-800/95" : "bg-white/95"
                }`}
              >
                <p
                  className={`text-lg flex items-center gap-3 ${
                    mode === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <Icon
                    icon="mdi:loading"
                    className="w-6 h-6 animate-spin text-blue-400"
                  />
                  Loading job details...
                </p>
              </div>
            )}
          </div>

          {job && (
            <div className="lg:col-span-1">
              <div
                className={`p-8 rounded-2xl shadow-2xl backdrop-blur-sm sticky top-24 ${
                  mode === "dark"
                    ? "bg-gray-800/95 text-white"
                    : "bg-white/95 text-[#231812]"
                }`}
              >
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      mode === "dark" ? "bg-gray-700" : "bg-blue-50"
                    }`}
                  >
                    <Icon
                      icon="mdi:clipboard-check"
                      className="w-8 h-8 text-blue-400"
                    />
                  </div>
                  Application Details
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`p-4 rounded-xl ${
                        mode === "dark" ? "bg-gray-700/50" : "bg-gray-50/50"
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Employment Type
                      </p>
                      <p className="text-base font-semibold flex items-center gap-2">
                        <Icon
                          icon="mdi:briefcase"
                          className="w-5 h-5 text-blue-400"
                        />
                        {employmentTypeLabel[job.employment_type] || "N/A"}
                      </p>
                    </div>
                    <div
                      className={`p-4 rounded-xl ${
                        mode === "dark" ? "bg-gray-700/50" : "bg-gray-50/50"
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Location
                      </p>
                      <p className="text-base font-semibold flex items-center gap-2">
                        <Icon
                          icon="mdi:map-marker"
                          className="w-5 h-5 text-blue-400"
                        />
                        {job.location ? `${job.location.city}` : "N/A"}
                      </p>
                    </div>
                    {job.department && (
                      <div
                        className={`p-4 rounded-xl ${
                          mode === "dark" ? "bg-gray-700/50" : "bg-gray-50/50"
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Department
                        </p>
                        <p className="text-base font-semibold flex items-center gap-2">
                          <Icon
                            icon="mdi:domain"
                            className="w-5 h-5 text-blue-400"
                          />
                          {job.department}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`p-4 rounded-xl ${
                        mode === "dark" ? "bg-gray-700/50" : "bg-gray-50/50"
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Remote
                      </p>
                      <p className="text-base font-semibold flex items-center gap-2">
                        <Icon
                          icon="mdi:home"
                          className="w-5 h-5 text-blue-400"
                        />
                        {job.remote ? "Yes" : "No"}
                      </p>
                    </div>
                    <div
                      className={`p-4 rounded-xl ${
                        mode === "dark" ? "bg-gray-700/50" : "bg-gray-50/50"
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Expires On
                      </p>
                      <p className="text-base font-semibold flex items-center gap-2">
                        <Icon
                          icon="mdi:calendar"
                          className="w-5 h-5 text-blue-400"
                        />
                        {job.expires_on}
                      </p>
                    </div>
                  </div>

                  {!job.is_expired && timeLeft && (
                    <div
                      className={`p-6 rounded-xl shadow-lg ${
                        mode === "dark" ? "bg-gray-700/50" : "bg-blue-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Icon
                          icon="mdi:timer"
                          className="w-6 h-6 text-blue-400"
                        />
                        <h4 className="text-lg font-semibold">Time Left</h4>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {timeLeft.months > 0 && (
                          <div
                            className={`p-2 rounded-lg text-center ${
                              mode === "dark" ? "bg-gray-800/50" : "bg-white/50"
                            }`}
                          >
                            <p className="text-xl font-bold text-blue-400">
                              {timeLeft.months}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Months
                            </p>
                          </div>
                        )}
                        {timeLeft.days > 0 && (
                          <div
                            className={`p-2 rounded-lg text-center ${
                              mode === "dark" ? "bg-gray-800/50" : "bg-white/50"
                            }`}
                          >
                            <p className="text-xl font-bold text-blue-400">
                              {timeLeft.days}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Days
                            </p>
                          </div>
                        )}
                        {timeLeft.hours > 0 && (
                          <div
                            className={`p-2 rounded-lg text-center ${
                              mode === "dark" ? "bg-gray-800/50" : "bg-white/50"
                            }`}
                          >
                            <p className="text-xl font-bold text-blue-400">
                              {timeLeft.hours}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Hours
                            </p>
                          </div>
                        )}
                        {timeLeft.minutes > 0 && (
                          <div
                            className={`p-2 rounded-lg text-center ${
                              mode === "dark" ? "bg-gray-800/50" : "bg-white/50"
                            }`}
                          >
                            <p className="text-xl font-bold text-blue-400">
                              {timeLeft.minutes}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Minutes
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-xl ${
                      mode === "dark" ? "bg-gray-700/50" : "bg-gray-50/50"
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Status
                    </p>
                    <p
                      className={`text-base font-semibold flex items-center gap-2 ${
                        job.is_expired ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      <Icon
                        icon={job.is_expired ? "mdi:alert" : "mdi:check-circle"}
                        className="w-5 h-5"
                      />
                      {job.is_expired ? "Expired" : "Active"}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={handleApply}
                      disabled={job.is_expired}
                      className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 ${
                        job.is_expired
                          ? "bg-gray-400/50 text-gray-600 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:shadow-lg"
                      }`}
                    >
                      <Icon icon="mdi:send" className="w-6 h-6" />
                      Apply Now
                    </button>
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 ${
                        mode === "dark"
                          ? "bg-gray-700/50 text-white hover:bg-gray-600/50"
                          : "bg-gray-200/50 text-[#231812] hover:bg-gray-300/50"
                      }`}
                    >
                      <Icon icon="mdi:share" className="w-6 h-6" />
                      Share
                    </button>
                  </div>
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
  const filePath = path.join(
    process.cwd(),
    "public",
    "assets",
    "misc",
    "countries.json"
  );
  const countries = JSON.parse(fs.readFileSync(filePath, "utf8"));

  try {
    const { data, error } = await supabase
      .from("job_openings")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) throw error;

    const countryName =
      countries.find((c) => c.code === data.location?.country)?.name ||
      data.location?.country;
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
      location: data.location
        ? { ...data.location, country: countryName }
        : null,
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
