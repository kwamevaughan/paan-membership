import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";
import SimpleFooter from "@/layouts/simpleFooter";
import ApplicantsTable from "@/components/ApplicantsTable";
import ApplicantsFilters from "@/components/ApplicantsFilters";
import CandidateModal from "@/components/CandidateModal";
import EmailModal from "@/components/EmailModal";
import ExportModal from "@/components/ExportModal";
import useStatusChange from "@/hooks/useStatusChange";
import { Icon } from "@iconify/react";
import { fetchHRData } from "../../../utils/hrData";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabase } from "@/lib/supabase";

export default function HRApplicants({
  mode = "light",
  toggleMode,
  initialCandidates,
  initialQuestions,
  breadcrumbs,
}) {
  const [candidates, setCandidates] = useState(initialCandidates || []);
  const [filteredCandidates, setFilteredCandidates] = useState(
    initialCandidates || []
  );
  const [sortField, setSortField] = useState("primaryContactName");
  const [sortDirection, setSortDirection] = useState("asc");
  const router = useRouter();
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [emailData, setEmailData] = useState({ subject: "", body: "" });

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

  const { handleStatusChange } = useStatusChange({
    candidates,
    setCandidates,
    setFilteredCandidates,
    setSelectedCandidate,
    setEmailData,
    setIsEmailModalOpen,
  });

  useEffect(() => {
    const { opening } = router.query;
    const savedOpening = localStorage.getItem("filterOpening") || "all";
    const savedStatus = localStorage.getItem("filterStatus") || "all";

    let initialFilter = [...candidates];
    if (opening && initialFilter.some((c) => c.opening === opening)) {
      initialFilter = initialFilter.filter((c) => c.opening === opening);
    } else if (savedOpening !== "all") {
      initialFilter = initialFilter.filter((c) => c.opening === savedOpening);
    }
    if (savedStatus !== "all") {
      initialFilter = initialFilter.filter((c) => c.status === savedStatus);
    }
    setFilteredCandidates(initialFilter);
  }, [router, candidates]);

  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };

  const handleFilterChange = ({ searchQuery, filterOpening, filterStatus }) => {
    console.log("handleFilterChange:", {
      searchQuery,
      filterOpening,
      filterStatus,
    });
    let result = [...candidates];

    if (searchQuery) {
      result = result.filter(
        (c) =>
          (c.primaryContactName || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (c.primaryContactEmail || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
      console.log("After search filter:", result);
    }
    if (filterOpening !== "all") {
      result = result.filter((c) => c.opening === filterOpening);
      console.log("After opening filter:", result);
    }
    if (filterStatus !== "all") {
      result = result.filter((c) => (c.status || "Pending") === filterStatus);
      console.log("After status filter:", result);
    }

    setFilteredCandidates(result);
    console.log("Final filtered candidates:", result);

    const currentOpening = localStorage.getItem("filterOpening") || "all";
    const currentStatus = localStorage.getItem("filterStatus") || "all";
    const currentQueryOpening = router.query.opening || "all";

    if (filterOpening !== currentOpening || filterStatus !== currentStatus) {
      localStorage.setItem("filterOpening", filterOpening);
      localStorage.setItem("filterStatus", filterStatus);

      if (filterOpening !== currentQueryOpening) {
        if (filterOpening !== "all") {
          router.push(
            { pathname: "/hr/applicants", query: { opening: filterOpening } },
            undefined,
            { shallow: true }
          );
        } else if (router.query.opening) {
          router.push("/hr/applicants", undefined, { shallow: true });
        }
      }
    }
  };

  const handleSort = (field) => {
    const newDirection =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);

    const sorted = [...filteredCandidates].sort((a, b) => {
      const aValue = a[field] || "";
      const bValue = b[field] || "";
      return newDirection === "asc"
        ? aValue.toString().localeCompare(bValue.toString())
        : bValue.toString().localeCompare(aValue.toString());
    });
    setFilteredCandidates(sorted);
  };

  const handleSendEmail = async (emailDataWithToast) => {
    const { toastId, subject, body, ...restEmailData } = emailDataWithToast;
    try {
      const response = await fetch("/api/send-status-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryContactName: emailData.primaryContactName,
          primaryContactEmail: emailData.primaryContactEmail,
          opening: emailData.opening,
          status: emailData.status,
          subject,
          body,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to send email");

      toast.dismiss(toastId);
      toast.success("Email sent successfully!", { icon: "✅" });
      setIsEmailModalOpen(false);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.dismiss(toastId);
      toast.error("Failed to send email.");
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    const confirmed = await new Promise((resolve) => {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <p className="text-xl font-medium text-gray-900">
                Delete Candidate?
              </p>
              <p className="mt-2 text-base text-gray-500">
                Are you sure you want to delete this candidate? This action
                cannot be undone.
              </p>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-[#f05d23] hover:text-[#d94f1e] hover:bg-[#ffe0b3] transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 hover:bg-[#f3f4f6] transition-colors"
              >
                No
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    });

    if (!confirmed) return;

    const loadingToast = toast.loading("Please wait...");
    try {
      // Fetch file IDs from the responses table
      const { data: responseData, error: fetchError } = await supabase
        .from("responses")
        .select(
          "company_registration_file_id, portfolio_work_file_id, agency_profile_file_id, tax_registration_file_id"
        )
        .eq("user_id", candidateId)
        .single();
      if (fetchError) throw fetchError;

      // Extract file IDs
      const fileIds = [
        responseData?.company_registration_file_id,
        responseData?.portfolio_work_file_id,
        responseData?.agency_profile_file_id,
        responseData?.tax_registration_file_id,
      ].filter((id) => id); // Filter out null/undefined IDs

      // Delete responses first to avoid foreign key constraint violation
      const { error: responseError } = await supabase
        .from("responses")
        .delete()
        .eq("user_id", candidateId);
      if (responseError) throw responseError;

      // Delete candidate from candidates table
      const { error: candidateError } = await supabase
        .from("candidates")
        .delete()
        .eq("id", candidateId);
      if (candidateError) throw candidateError;

      // Delete files from Google Drive if they exist
      if (fileIds.length > 0) {
        const deleteResponse = await fetch("/api/delete-files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileIds }),
        });
        const deleteResult = await deleteResponse.json();
        if (!deleteResponse.ok) {
          throw new Error(
            deleteResult.error || "Failed to delete files from Google Drive"
          );
        }
      } else {
        console.log("No file IDs found to delete for candidate", candidateId);
      }

      // Update state to remove deleted candidate
      const updatedCandidates = candidates.filter((c) => c.id !== candidateId);
      setCandidates(updatedCandidates);
      setFilteredCandidates(updatedCandidates);
      toast.success("Candidate and associated files deleted successfully!", {
        id: loadingToast,
        icon: "✅",
      });
    } catch (error) {
      console.error("Error deleting candidate:", error);
      toast.error("Failed to delete candidate or files.", { id: loadingToast });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error("No candidates selected for deletion.");
      return;
    }

    const confirmed = await new Promise((resolve) => {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <p className="text-xl font-medium text-gray-900">
                Delete Selected?
              </p>
              <p className="mt-2 text-base text-gray-500">
                Are you sure you want to delete {selectedIds.length}{" "}
                candidate(s)? This action cannot be undone.
              </p>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-[#f05d23] hover:text-[#d94f1e] hover:bg-[#ffe0b3] transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 hover:bg-[#f3f4f6] transition-colors"
              >
                No
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    });

    if (!confirmed) return;

    const loadingToast = toast.loading("Please wait...");
    try {
      // Fetch file IDs for all selected candidates
      const { data: responsesData, error: fetchError } = await supabase
        .from("responses")
        .select(
          "user_id, company_registration_file_id, portfolio_work_file_id, agency_profile_file_id, tax_registration_file_id"
        )
        .in("user_id", selectedIds);
      if (fetchError) throw fetchError;

      console.log("Responses data for bulk delete:", responsesData);

      // Collect all file IDs
      const fileIdsToDelete = responsesData.reduce((acc, response) => {
        if (response.company_registration_file_id)
          acc.push(response.company_registration_file_id);
        if (response.portfolio_work_file_id)
          acc.push(response.portfolio_work_file_id);
        if (response.agency_profile_file_id)
          acc.push(response.agency_profile_file_id);
        if (response.tax_registration_file_id)
          acc.push(response.tax_registration_file_id);
        return acc;
      }, []);

      console.log("File IDs to delete:", fileIdsToDelete);

      // Delete responses first to avoid foreign key constraint violation
      const { error: responseError } = await supabase
        .from("responses")
        .delete()
        .in("user_id", selectedIds);
      if (responseError) throw responseError;

      // Delete candidates
      const { error: candidateError } = await supabase
        .from("candidates")
        .delete()
        .in("id", selectedIds);
      if (candidateError) throw candidateError;

      // Delete files from Google Drive if they exist
      if (fileIdsToDelete.length > 0) {
        const deleteResponse = await fetch("/api/delete-files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileIds: fileIdsToDelete }),
        });
        const deleteResult = await deleteResponse.json();
        console.log("Bulk delete files response:", deleteResult);
        if (!deleteResponse.ok) {
          throw new Error(
            deleteResult.error || "Failed to delete files from Google Drive"
          );
        }
      } else {
        console.log("No file IDs found to delete for selected candidates");
      }

      // Update state to remove deleted candidates
      const updatedCandidates = candidates.filter(
        (c) => !selectedIds.includes(c.id)
      );
      setCandidates(updatedCandidates);
      setFilteredCandidates(updatedCandidates);
      setSelectedIds([]);
      toast.success(
        `${selectedIds.length} candidate(s) and associated files deleted successfully!`,
        { id: loadingToast, icon: "✅" }
      );
    } catch (error) {
      console.error("Error deleting candidates:", error);
      toast.error("Failed to delete selected candidates or files.", {
        id: loadingToast,
      });
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        mode === "dark" ? "bg-gray-900" : "bg-gray-50"
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
        pageName="Applicants"
        pageDescription="Manage and review candidate applications."
        breadcrumbs={breadcrumbs}
      />
      <div className="flex flex-1">
        <HRSidebar
          isSidebarOpen={isSidebarOpen}
          mode={mode}
          toggleMode={toggleMode}
          toggleSidebar={toggleSidebar}
          onLogout={handleLogout}
          setDragOffset={updateDragOffset}
          user={{ name: "PAAN HR Team" }}
          isMobile={isMobile}
          isHovering={isHovering}
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
          handleOutsideClick={handleOutsideClick}
        />
        <div
          className={`content-container flex-1 p-6 transition-all duration-300 overflow-hidden ${
            isSidebarOpen ? "sidebar-open" : ""
          } ${sidebarState.hidden ? "sidebar-hidden" : ""}`}
          style={{
            marginLeft: sidebarState.hidden
              ? "0px"
              : `${84 + (isSidebarOpen ? 120 : 0) + sidebarState.offset}px`,
          }}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            <ApplicantsFilters
              candidates={candidates}
              onFilterChange={handleFilterChange}
              mode={mode}
              initialOpening={router.query.opening || "all"}
            />
            <ApplicantsTable
              candidates={filteredCandidates}
              mode={mode}
              onViewCandidate={handleViewCandidate}
              onDeleteCandidate={handleDeleteCandidate}
              onSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              handleBulkDelete={handleBulkDelete}
              setIsExportModalOpen={setIsExportModalOpen}
            />
          </div>
        </div>
      </div>

      <CandidateModal
        candidate={selectedCandidate}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusChange={handleStatusChange}
        mode={mode}
      />
      <EmailModal
        candidate={selectedCandidate}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        emailData={emailData}
        setEmailData={setEmailData}
        onSend={handleSendEmail}
        mode={mode}
      />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        candidates={filteredCandidates}
        mode={mode}
      />
      <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  console.log(
    "[HRApplicants] Starting session check at",
    new Date().toISOString()
  );
  try {
    const supabaseServer = createSupabaseServerClient(req, res);

    const {
      data: { session },
      error: sessionError,
    } = await supabaseServer.auth.getSession();

    console.log("[HRApplicants] Session Response:", {
      session: session ? "present" : null,
      sessionError: sessionError ? sessionError.message : null,
    });

    if (sessionError || !session) {
      console.log(
        "[HRApplicants] No valid Supabase session, redirecting to login"
      );
      return {
        redirect: {
          destination: "/hr/login",
          permanent: false,
        },
      };
    }

    // Verify user is in hr_users
    const { data: hrUser, error: hrUserError } = await supabaseServer
      .from("hr_users")
      .select("id")
      .eq("id", session.user.id)
      .single();
    console.log("[HRApplicants] HR User Check:", {
      hrUser,
      hrUserError: hrUserError ? hrUserError.message : null,
    });

    if (hrUserError || !hrUser) {
      console.error(
        "[HRApplicants] HR User Error:",
        hrUserError?.message || "User not in hr_users"
      );
      await supabaseServer.auth.signOut();
      return {
        redirect: {
          destination: "/hr/login",
          permanent: false,
        },
      };
    }

    console.time("fetchHRData");
    const data = await fetchHRData({
      supabaseClient: supabaseServer,
      fetchCandidates: true,
      fetchQuestions: true,
    });
    console.timeEnd("fetchHRData");
    

    return {
      props: {
        initialCandidates: data.initialCandidates || [],
        initialQuestions: data.initialQuestions || [],
        breadcrumbs: [
          { label: "Dashboard", href: "/admin" },
          { label: "Applicants" },
        ],
      },
    };
  } catch (error) {
    console.error("[HRApplicants] Error:", error.message);
    return {
      redirect: {
        destination: "/hr/login",
        permanent: false,
      },
    };
  }
}
