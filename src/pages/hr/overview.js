import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import SimpleFooter from "@/layouts/simpleFooter";
import WelcomeCard from "@/components/WelcomeCard";
import StatusChart from "@/components/StatusChart";
import CandidateList from "@/components/CandidateList";
import EmailModal from "@/components/EmailModal";
import CandidateModal from "@/components/CandidateModal";
import ChartFilterModal from "@/components/ChartFilterModal";
import useStatusChange from "@/hooks/useStatusChange";
import { fetchHRData } from "../../../utils/hrData";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { useSubscribers } from "@/hooks/useSubscribers";
import countriesGeoJson from "../../data/countries.js";
import OverviewBoxes from "@/components/OverviewBoxes";
import RecentActivities from "@/components/RecentActivities";
import SubscribersLog from "@/components/SubscribersLog";
import { getHROverviewProps } from "../../../utils/getPropsUtils";

const CountryChart = dynamic(() => import("@/components/CountryChart"), {
  ssr: false,
});

const countryCodeToName = countriesGeoJson.features.reduce((acc, feature) => {
  acc[feature.properties.iso_a2.toUpperCase()] = feature.properties.sovereignt;
  return acc;
}, {});

export default function HROverview({
  mode = "light",
  toggleMode,
  initialCandidates,
  initialJobOpenings,
  initialQuestions,
  breadcrumbs,
  userName,
}) {
  const { subscribers, loading: subscribersLoading } = useSubscribers();
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
  const router = useRouter();

  useAuthSession();

  const {
    isSidebarOpen,
    toggleSidebar,
    sidebarState,
    updateDragOffset,
    isMobile,
    isHovering,
    handleMouseEnter,
    handleMouseLeave,
    handleOutsideClick,
  } = useSidebar();
  const handleLogout = useLogout();

  const [emailData, setEmailData] = useState({
    subject: "",
    body: "",
    email: "",
  });

  const { handleStatusChange } = useStatusChange({
    candidates,
    setCandidates,
    setFilteredCandidates,
    setSelectedCandidate,
    setEmailData,
    setIsEmailModalOpen,
  });

  const handleSendEmail = async () => {
    const sendingToast = toast.loading("Sending email...");
    try {
      const response = await fetch("/api/send-status-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: emailData.fullName,
          primaryContactEmail: emailData.primaryContactEmail,
          opening: emailData.opening,
          status: emailData.status,
          subject: emailData.subject,
          body: emailData.body,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to send email");

      toast.success("Email sent successfully!", {
        icon: "✅",
        id: sendingToast,
      });
      setIsEmailModalOpen(false);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email.", { id: sendingToast });
    }
  };

  const handleChartFilter = (type, value) => {
    let filtered = [];
    let toastMessage = "";
    switch (type) {
      case "status":
        filtered = candidates.filter((c) => c.status === value);
        toastMessage = `Showing ${value} candidates`;
        break;
      case "country":
        filtered = candidates.filter((c) => {
          const countryCode = (c.country || "Unknown").toUpperCase();
          const fullName = countryCodeToName[countryCode] || countryCode;
          return (
            fullName.toLowerCase() === value.toLowerCase() ||
            countryCode === value.toUpperCase()
          );
        });
        toastMessage = `Showing ${value} applicants`;
        break;
      case "device":
        if (Array.isArray(value)) {
          filtered = candidates.filter((c) => {
            const device = c.device ? c.device.trim().toUpperCase() : "UNKNOWN";
            return value.includes(device);
          });
          toastMessage = `Showing ${
            value.length === 1 ? value[0] : "multiple device"
          } candidates`;
        } else {
          const normalizedValue = value.trim().toUpperCase();
          filtered = candidates.filter((c) => {
            const device = c.device ? c.device.trim().toUpperCase() : "UNKNOWN";
            return device === normalizedValue;
          });
          toastMessage = `Showing ${value} candidates`;
        }
        break;
      case "date":
        const date = new Date(value).toDateString();
        filtered = candidates.filter(
          (c) => new Date(c.submitted_at).toDateString() === date
        );
        toastMessage = `Showing applicants from ${date}`;
        break;
      case "tier":
        filtered = candidates.filter((c) => c.selected_tier === value);
        toastMessage = `Showing ${value} tier candidates`;
        break;
      default:
        filtered = candidates;
        toastMessage = "Showing all candidates";
    }
    setFilteredCandidates(filtered);
    setFilterType(type);
    setFilterValue(value);
    setIsFilterModalOpen(true);
    toast.success(toastMessage, { duration: 2000 });
    if (filtered.length === 0) {
      toast.info("No candidates match this filter", { duration: 3000 });
    }
  };

  const handleViewCandidate = async (candidate) => {
    // Show loading toast
    const loadingToastId = `loading-${candidate.id}`;
    toast.loading("Loading candidate details...", { 
      id: loadingToastId,
      duration: 3000 
    });

    try {
      // Fetch full candidate data including answers and questions using existing fetchHRData
      const response = await fetch(`/api/candidate-details?id=${candidate.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch candidate details');
      }
      
      const data = await response.json();
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId);
      
      setSelectedCandidate(data.candidate);
      setIsCandidateModalOpen(true);
    } catch (error) {
      console.error('Error fetching candidate details:', error);
      
      // Dismiss loading toast and show error
      toast.dismiss(loadingToastId);
      toast.error('Failed to load candidate details');
      
      // Fallback: use the basic candidate data
      setSelectedCandidate(candidate);
      setIsCandidateModalOpen(true);
    }
  };

  const handleCloseCandidateModal = () => {
    setIsCandidateModalOpen(false);
    // Small delay to ensure modal is closed before clearing candidate
    setTimeout(() => {
      setSelectedCandidate(null);
    }, 100);
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
        mode === "dark" ? "bg-gradient-to-b from-gray-900 to-gray-800" : ""
      }`}
    >
      <HRHeader
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        sidebarState={sidebarState}
        mode={mode}
        toggleMode={toggleMode}
        onLogout={handleLogout}
        pageName=""
        pageDescription="."
        breadcrumbs={breadcrumbs}
        isMobile={isMobile} // Pass isMobile to HRHeader
      />
      <div className="flex flex-1">
        <HRSidebar
          isSidebarOpen={isSidebarOpen}
          mode={mode}
          toggleMode={toggleMode}
          toggleSidebar={toggleSidebar}
          onLogout={handleLogout}
          setDragOffset={updateDragOffset}
          user={{ name: "PAAN Admin" }}
          isMobile={isMobile}
          isHovering={isHovering}
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
          handleOutsideClick={handleOutsideClick}
        />
        <div
          className={`content-container flex-1 p-4 md:p-10 pt-4 transition-all duration-300 overflow-hidden ${
            isSidebarOpen ? "sidebar-open" : ""
          } ${sidebarState.hidden ? "sidebar-hidden" : ""}`}
          style={{
            marginLeft: isMobile
              ? "0px"
              : sidebarState.hidden
              ? "0px"
              : `${84 + (isSidebarOpen ? 120 : 0) + sidebarState.offset}px`,
          }}
        >
          <div className="max-w-8xl mx-auto">
            <WelcomeCard
              totalApplicants={candidates.length}
              openPositions={jobOpenings.length}
              pendingReviews={
                candidates.filter((c) => c.status === "Pending").length
              }
              mode={mode}
              isMobile={isMobile}
              user={{ name: userName }}
            />

            <OverviewBoxes
              candidates={candidates}
              jobOpenings={jobOpenings}
              router={router}
              mode={mode}
            />

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2 max-w-full">
                <StatusChart
                  candidates={candidates}
                  mode={mode}
                  onFilter={handleChartFilter}
                />
              </div>
              <div className="md:col-span-1">
                <CandidateList
                  candidates={candidates}
                  setSelectedCandidate={handleViewCandidate}
                  setIsModalOpen={setIsCandidateModalOpen}
                  mode={mode}
                />
              </div>
            </div>

            <div className="md:col-span-1"></div>
            <div className="mb-6">
              <CountryChart
                candidates={candidates}
                mode={mode}
                onFilter={handleChartFilter}
              />
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-1">
                <SubscribersLog
                  key={subscribers.length}
                  initialSubscribers={subscribers}
                  mode={mode}
                  loading={subscribersLoading}
                />
              </div>
              <div className="md:col-span-2">
                <RecentActivities
                  candidates={candidates}
                  setSelectedCandidate={handleViewCandidate}
                  setIsModalOpen={setIsCandidateModalOpen}
                  mode={mode}
                />
              </div>
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
          key={`filter-modal-${filterType}-${JSON.stringify(filterValue)}`}
          candidates={filteredCandidates}
          type={filterType}
          value={filterValue}
          onClose={handleCloseFilterModal}
          setSelectedCandidate={handleViewCandidate}
          setIsCandidateModalOpen={setIsCandidateModalOpen}
          mode={mode}
          isCandidateModalOpen={isCandidateModalOpen}
        />
      )}

      <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
    </div>
  );
}

export { getHROverviewProps as getServerSideProps };
