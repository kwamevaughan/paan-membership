// TODO: Extract modal logic to useJobModals hook for better maintainability
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import JobForm from "@/components/JobForm";
import JobListings from "@/components/JobListings";
import EditJobModal from "@/components/EditJobModal";
import PreviewModal from "@/components/PreviewModal";
import ItemActionModal from "@/components/ItemActionModal";
import JobFilters from "@/components/JobFilters";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import SimpleFooter from "@/layouts/simpleFooter";
import NotifyEmailGroupModal from "@/components/NotifyEmailGroupModal";
import ConnectingDotsBackground from "@/components/ConnectingDotsBackground";
import useAuthSession from "@/hooks/useAuthSession";
import useLogout from "@/hooks/useLogout";
import { Icon } from "@iconify/react";

// Helper function to format ISO date as DD/MM/YYYY for display
const formatDate = (isoDateString) => {
  const date = new Date(isoDateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const JobDescriptionModal = dynamic(
  () => import("@/components/JobDescriptionModal"),
  { ssr: false }
);

export default function HRJobBoard({
  mode = "light",
  toggleMode,
  initialJobs,
  breadcrumbs = [],
}) {
  const [jobs, setJobs] = useState(initialJobs || []);
  const [filteredJobs, setFilteredJobs] = useState(initialJobs || []);
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);

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

  const router = useRouter();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedOpening, setSelectedOpening] = useState(null);
  const [editJob, setEditJob] = useState(null);
  const [lastJob, setLastJob] = useState(null);

  useEffect(() => {
    console.log("Initial jobs on mount:", initialJobs);
    const handleOpenModal = (e) => {
      setSelectedOpening(e.detail);
      setIsViewModalOpen(true);
    };

    const handleEditModal = (e) => {
      console.log("Opening EditJobModal with job:", e.detail);
      setEditJob(e.detail);
      setIsEditModalOpen(true);
    };

    window.addEventListener("openJobModal", handleOpenModal);
    window.addEventListener("editJobModal", handleEditModal);
    return () => {
      window.removeEventListener("openJobModal", handleOpenModal);
      window.removeEventListener("editJobModal", handleEditModal);
    };
  }, [router]);

  const fetchJobs = async () => {
    const loadingToast = toast.loading("Loading data...");
    try {
      const { data, error } = await supabase
        .from("job_openings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const updatedJobs = data.map((job) => ({
        ...job,
        is_expired: new Date(job.expires_on) < new Date(),
        expires_on_display: formatDate(job.expires_on), // For display only
      }));
      setJobs(updatedJobs);
      toast.success("Data loaded successfully!", { id: loadingToast });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load job openings.", { id: loadingToast });
      setJobs([]);
    }
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedOpening(null);
  };

  const handleProceed = () => {
    console.log("Proceed clicked for:", selectedOpening);
    handleCloseViewModal();
  };

  const handleCloseEditModal = () => {
    console.log("Closing edit modal explicitly");
    setIsEditModalOpen(false);
    setEditJob(null);
    setIsPreviewModalOpen(false);
  };

  const handleEditSave = async (updatedJob) => {
    console.log("Saved job:", updatedJob);
    setJobs((prevJobs) =>
      prevJobs.map((j) =>
        j.id === updatedJob.id
          ? {
              ...j,
              ...updatedJob,
              expires_on_display: formatDate(updatedJob.expires_on),
            }
          : j
      )
    );
    await fetchJobs(); // Refetch to ensure consistency
    handleCloseEditModal();
  };

  const handleJobAdded = (newJob) => {
    console.log("New job added:", newJob);
    setJobs((prevJobs) => [
      { ...newJob, expires_on_display: formatDate(newJob.expires_on) },
      ...prevJobs,
    ]);
    setLastJob({
      title: newJob.title,
      id: newJob.id,
      expiresOn: formatDate(newJob.expires_on), // For NotifyEmailGroupModal
      slug: newJob.slug,
    });
    setIsNotifyModalOpen(true);
  };

  const handlePreview = (url) => {
    if (!url) {
      console.error("No URL provided for preview");
      toast.error("Unable to preview file.");
      return;
    }
    setPreviewUrl(url);
    setIsPreviewModalOpen(true);
  };

  const handleClosePreviewModal = () => {
    console.log("Closing preview modal from parent");
    setIsPreviewModalOpen(false);
    setPreviewUrl(null);
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        mode === "dark" ? "bg-gradient-to-b from-gray-900 to-gray-800" : ""
      }`}
    >
      <Toaster />
      
      
      
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
      />
      <div className="flex flex-1">
        <HRSidebar
          isSidebarOpen={isSidebarOpen}
          mode={mode}
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
          className={`content-container flex-1 p-10 pt-4 transition-all duration-300 overflow-hidden ${
            isSidebarOpen ? "sidebar-open" : ""
          } ${sidebarState.hidden ? "sidebar-hidden" : ""}`}
          style={{
            marginLeft: sidebarState.hidden
              ? "0px"
              : `${84 + (isSidebarOpen ? 120 : 0) + sidebarState.offset}px`,
          }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setIsAddJobModalOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 backdrop-blur-sm shadow-lg hover:shadow-xl ${
                  mode === "dark"
                    ? "bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 text-gray-100 hover:from-blue-500/80 hover:to-blue-500/80"
                    : "bg-gradient-to-br from-white/60 to-gray-50/60 border-white/20 text-[#231812] hover:from-blue-200 hover:to-blue-400 hover:text-white"
                }`}
              >
                <Icon icon="mdi:plus" className="w-5 h-5" />
                Add New Job
              </button>
            </div>

            <h1 className={`text-2xl font-bold mb-6 ${
              mode === "dark" ? "text-white" : "text-gray-900"
            }`}>
              Job Openings
            </h1>

            <JobFilters 
              jobs={jobs} 
              onFilter={setFilteredJobs} 
              mode={mode} 
            />
            
            {filteredJobs.length ? (
              <JobListings mode={mode} jobs={filteredJobs} onJobDeleted={fetchJobs} />
            ) : (
              <div className={`text-center py-8 ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                {jobs.length ? "No jobs match your filters" : "Loading jobs..."}
              </div>
            )}
          </div>
        </div>
      </div>

      <ItemActionModal
        isOpen={isAddJobModalOpen}
        onClose={() => setIsAddJobModalOpen(false)}
        title="Add New Job"
        mode={mode}
      >
        <JobForm mode={mode} onJobAdded={(job) => {
          handleJobAdded(job);
          setIsAddJobModalOpen(false);
        }} />
      </ItemActionModal>

      <JobDescriptionModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        onProceed={handleProceed}
        selectedOpening={selectedOpening}
      />
      <EditJobModal
        isOpen={isEditModalOpen}
        job={editJob}
        onClose={handleCloseEditModal}
        onSave={handleEditSave}
        mode={mode}
        onPreview={handlePreview}
      />
      <NotifyEmailGroupModal
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        jobTitle={lastJob?.title}
        jobId={lastJob?.id}
        expiresOn={lastJob?.expiresOn}
        mode={mode}
      />
      <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
    </div>
  );
}

export async function getServerSideProps(context) {
  const { req } = context;

  try {
    console.time("fetchJobs");
    const { data, error } = await supabase
      .from("job_openings")
      .select("*")
      .order("created_at", { ascending: false });
    console.timeEnd("fetchJobs");

    if (error) throw error;

    const initialJobs = data.map((job) => ({
      ...job,
      is_expired: new Date(job.expires_on) < new Date(),
      expires_on_display: formatDate(job.expires_on), // For display only
    }));

    return {
      props: {
        initialJobs,
      },
    };
  } catch (error) {
    console.error("Error fetching jobs in getServerSideProps:", error);
    return {
      props: {
        initialJobs: [],
      },
    };
  }
}
