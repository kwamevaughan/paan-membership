// src/pages/hr/overview.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";
import { Icon } from "@iconify/react";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import SimpleFooter from "@/layouts/simpleFooter";
import WelcomeCard from "@/components/WelcomeCard";
import StatusChart from "@/components/StatusChart";
import RecentActivity from "@/components/RecentActivity";
import JobOpenings from "@/components/JobOpenings";
import DeviceChart from "@/components/DeviceChart";
import EmailModal from "@/components/EmailModal";
import CandidateModal from "@/components/CandidateModal";
import useStatusChange from "@/hooks/useStatusChange";
import { fetchHRData } from "../../../utils/hrData";

const CountryChart = dynamic(() => import("@/components/CountryChart"), { ssr: false });

import countriesGeoJson from "../../data/countries.js";

const countryCodeToName = countriesGeoJson.features.reduce((acc, feature) => {
    acc[feature.properties.iso_a2.toUpperCase()] = feature.properties.sovereignt;
    return acc;
}, {});

export default function HROverview({ mode = "light", toggleMode, initialCandidates, initialJobOpenings, initialQuestions }) {
    const [candidates, setCandidates] = useState(initialCandidates || []);
    const [jobOpenings, setJobOpenings] = useState(initialJobOpenings || []);
    const [questions, setQuestions] = useState(initialQuestions || []);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [filteredCandidates, setFilteredCandidates] = useState([]);
    const [filterType, setFilterType] = useState("");
    const [filterValue, setFilterValue] = useState("");
    const [emailData, setEmailData] = useState({ subject: "", body: "", email: "" });
    const { isSidebarOpen, toggleSidebar } = useSidebar();
    const router = useRouter();

    const { handleStatusChange } = useStatusChange({
        candidates,
        setCandidates,
        setFilteredCandidates,
        setSelectedCandidate,
        setEmailData,
        setIsEmailModalOpen,
    });

    useEffect(() => {
        if (!localStorage.getItem("hr_session")) {
            router.push("/hr/login");
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("hr_session");
        document.cookie = "hr_session=; path=/; max-age=0";
        toast.success("Logged out successfully!");
        setTimeout(() => router.push("/hr/login"), 1000);
    };

    const handleSendEmail = async () => {
        const sendingToast = toast.loading("Sending email...");
        try {
            const response = await fetch("/api/send-status-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: emailData.fullName,
                    email: emailData.email,
                    opening: emailData.opening,
                    status: emailData.status,
                    subject: emailData.subject,
                    body: emailData.body,
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Failed to send email");

            toast.success("Email sent successfully!", { icon: "✅", id: sendingToast });
            setIsEmailModalOpen(false);
        } catch (error) {
            console.error("Error sending email:", error);
            toast.error("Failed to send email.", { id: sendingToast });
        }
    };

    const handleChartFilter = (type, value) => {
        console.log(`Filtering ${type}:`, value);
        let filtered;
        switch (type) {
            case "status":
                filtered = candidates.filter((c) => c.status === value);
                toast.success(`Showing ${value} candidates`, { duration: 2000 });
                break;
            case "score":
                const [min, max] = value.split("-").map(Number);
                filtered = candidates.filter((c) => c.score >= min && c.score < max);
                toast.success(`Showing scores ${value}`, { duration: 2000 });
                break;
            case "country":
                filtered = candidates.filter((c) => {
                    const countryCode = (c.country || "Unknown").toUpperCase();
                    const fullName = countryCodeToName[countryCode] || countryCode;
                    return fullName.toLowerCase() === value.toLowerCase() || countryCode === value.toUpperCase();
                });
                toast.success(`Showing ${value} applicants`, { duration: 2000 });
                break;
            case "device":
                if (Array.isArray(value)) {
                    // Grouped filter (e.g., all Mobile devices)
                    filtered = candidates.filter((c) => value.includes(c.device));
                    toast.success(`Showing ${value.length} device types`, { duration: 2000 });
                } else {
                    // Detailed filter (e.g., "Mobile (KH6)")
                    filtered = candidates.filter((c) => c.device === value);
                    toast.success(`Showing ${value} devices`, { duration: 2000 });
                }
                break;
            case "date":
                const date = new Date(value).toDateString();
                filtered = candidates.filter((c) => new Date(c.submitted_at).toDateString() === date);
                toast.success(`Showing applicants from ${date}`, { duration: 2000 });
                break;
            default:
                filtered = candidates;
                toast.success("Showing all candidates", { duration: 2000 });
        }
        setFilteredCandidates(filtered);
        setFilterType(type);
        setFilterValue(value);
        setIsFilterModalOpen(true);
    };

    const handleCloseCandidateModal = () => {
        setIsCandidateModalOpen(false);
        setSelectedCandidate(null);
    };

    const handleCloseFilterModal = () => {
        setIsFilterModalOpen(false);
        setFilteredCandidates([]);
        setFilterType("");
        setFilterValue("");
    };

    return (
      <div
        className={`min-h-screen flex flex-col ${
          mode === "dark"
            ? "bg-gradient-to-b from-gray-900 to-gray-800"
            : "bg-gradient-to-b from-gray-50 to-gray-100"
        }`}
      >
        <HRHeader
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          mode={mode}
          toggleMode={toggleMode}
          onLogout={handleLogout}
          pageName="HR Overview"
          pageDescription="View and manage candidate applications."
        />
        <div className="flex flex-1">
          <HRSidebar
            isOpen={isSidebarOpen}
            mode={mode}
            onLogout={handleLogout}
            toggleSidebar={toggleSidebar}
          />
          <div
            className={`content-container flex-1 p-6 transition-all duration-300 overflow-hidden md:ml-[80px] sidebar-open:md:ml-[300px] sidebar-closed:md:ml-[80px]`}
          >
            <div className="max-w-7xl mx-auto">
              <WelcomeCard
                totalApplicants={candidates.length}
                openPositions={jobOpenings.length}
                pendingReviews={
                  candidates.filter((c) => c.status === "Pending").length
                }
                mode={mode}
              />
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <StatusChart
                  candidates={candidates}
                  mode={mode}
                  onFilter={handleChartFilter}
                />
                <DeviceChart
                  candidates={candidates}
                  mode={mode}
                  onFilter={handleChartFilter}
                />
              </div>
              <div className="mb-6">
                <CountryChart
                  candidates={candidates}
                  mode={mode}
                  onFilter={handleChartFilter}
                />
              </div>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                <RecentActivity
                  candidates={candidates}
                  setSelectedCandidate={setSelectedCandidate}
                  setIsModalOpen={setIsCandidateModalOpen}
                  mode={mode}
                />
                <JobOpenings
                  candidates={candidates}
                  jobOpenings={jobOpenings}
                  router={router}
                  mode={mode}
                />
              </div>
              
            </div>
          </div>
        </div>

        <EmailModal
          candidate={emailData}
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          emailData={emailData}
          setEmailData={setEmailData}
          onSend={handleSendEmail}
          mode={mode}
        />
        <CandidateModal
          candidate={selectedCandidate}
          isOpen={isCandidateModalOpen}
          onClose={handleCloseCandidateModal}
          onStatusChange={handleStatusChange}
          mode={mode}
        />
        {isFilterModalOpen && (
          <ChartFilterModal
            candidates={filteredCandidates}
            type={filterType}
            value={filterValue}
            onClose={handleCloseFilterModal}
            setSelectedCandidate={setSelectedCandidate}
            setIsCandidateModalOpen={setIsCandidateModalOpen}
            mode={mode}
          />
        )}

        <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
      </div>
    );
}

export async function getServerSideProps(context) {
    const { req } = context;

    if (!req.cookies.hr_session) {
        return {
            redirect: {
                destination: "/hr/login",
                permanent: false,
            },
        };
    }

    try {
        console.time("fetchHRData");
        const data = await fetchHRData();
        console.timeEnd("fetchHRData");
        if (!data.initialCandidates || data.initialCandidates.length === 0) {
            console.error("No data returned from fetchHRData, redirecting to login");
            return {
                redirect: {
                    destination: "/hr/login",
                    permanent: false,
                },
            };
        }
        return { props: data };
    } catch (error) {
        console.error("Error in getServerSideProps:", error);
        return {
            redirect: {
                destination: "/hr/login",
                permanent: false,
            },
        };
    }
}

function ChartFilterModal({
    candidates,
    type,
    value,
    onClose,
    setSelectedCandidate,
    setIsCandidateModalOpen,
    mode,
}) {
    const handleViewClick = (candidate) => {
        setSelectedCandidate(candidate);
        setIsCandidateModalOpen(true);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
        <div
          className={`rounded-xl shadow-2xl w-full max-w-4xl mx-4 flex flex-col max-h-[90vh] ${
            mode === "dark"
              ? "bg-gray-800 text-white"
              : "bg-white text-[#231812]"
          }`}
        >
          <div className="bg-gradient-to-r from-[#f05d23] to-[#d94f1e] rounded-t-xl p-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {type === "status" && `Status: ${value}`}
              {type === "country" && `Country: ${value}`}
              {type === "score" && `Score Range: ${value}`}
              {type === "device" &&
                `Device: ${Array.isArray(value) ? "Multiple Devices" : value}`}
              {type === "date" &&
                `Date: ${new Date(value).toLocaleDateString()}`}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition duration-200"
            >
              <Icon icon="mdi:close" width={24} height={24} />
            </button>
          </div>
          <div className="flex-1 p-6 overflow-y-auto">
            {candidates.length > 0 ? (
              <ul className="space-y-4">
                {candidates.map((candidate) => (
                  <li
                    key={candidate.id}
                    className="flex justify-between items-center animate-fade-in"
                  >
                    <span
                      className={`${
                        mode === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {candidate.primaryContactName} - {candidate.agencyName} {" "}
                    </span>
                    <button
                      onClick={() => handleViewClick(candidate)}
                      className="text-[#f05d23] hover:text-[#d94f1e] flex items-center gap-1"
                    >
                      <Icon icon="mdi:eye" className="w-4 h-4" /> View
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">
                No candidates match this filter.
              </p>
            )}
          </div>
          <div
            className={`p-4 border-t border-gray-200 dark:border-gray-700 rounded-b-xl shadow-md ${
              mode === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex justify-end gap-4">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-[#231812] dark:text-white rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-200 flex items-center gap-2 shadow-md"
              >
                <Icon icon="mdi:close" width={20} height={20} />
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
}