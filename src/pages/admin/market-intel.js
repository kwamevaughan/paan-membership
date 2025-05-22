import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";
import { useMarketIntel } from "@/hooks/useMarketIntel";
import SimpleFooter from "@/layouts/simpleFooter";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { fetchHRData } from "../../../utils/hrData";
import MarketIntelHeader from "@/components/market-intel/MarketIntelHeader";
import MarketIntelControls from "@/components/market-intel/MarketIntelControls";
import MarketIntelForm from "@/components/market-intel/MarketIntelForm";
import MarketIntelGrid from "@/components/market-intel/MarketIntelGrid";

export default function AdminMarketIntel({
  mode = "light",
  toggleMode,
  initialMarketIntel,
  initialFeedback,
  initialCandidates,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useAuthSession();

  const { isSidebarOpen, toggleSidebar, sidebarState, updateDragOffset } =
    useSidebar();
  const handleLogout = useLogout();
  const {
    marketIntel,
    formData,
    loading,
    sortBy,
    filters,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    updateSort,
    updateFilters,
  } = useMarketIntel(initialMarketIntel, initialFeedback);

  const router = useRouter();

  const handleEditClick = (intel) => {
    handleEdit(intel);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
    setShowForm(false);
  };

  const handleViewFeedback = (intel) => {
    setSelectedFeedback(intel.feedback);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error("Select at least one entry to delete");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} selected market intel entries?`
    );
    if (!confirmed) {
      console.log("[AdminMarketIntel] Bulk delete cancelled");
      return;
    }
    try {
      for (const id of selectedIds) {
        await handleDelete(id);
      }
      setSelectedIds([]);
      toast.success("Selected entries deleted");
    } catch (err) {
      toast.error("Failed to delete entries");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const formElement = document.querySelector(".market-intel-form");
      if (formElement && !formElement.contains(event.target)) {
        handleCancel();
      }
    };
    if (showForm) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showForm]);

  return (
    <div
      className={`min-h-screen flex flex-col ${
        mode === "dark"
          ? "bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-gray-100 to-gray-200"
      } overflow-hidden`}
    >
      <Toaster
        position="top-center"
        toastOptions={{
          className: `!${
            mode === "dark"
              ? "bg-gray-800 text-gray-200"
              : "bg-white text-gray-800"
          }`,
          style: {
            borderRadius: "8px",
            padding: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          },
        }}
      />
      <HRHeader
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        sidebarState={sidebarState}
        mode={mode}
        toggleMode={toggleMode}
        onLogout={handleLogout}
        pageName="Admin Market Intel"
        pageDescription="Manage market intelligence reports, insights, and resources."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Market Intel" },
        ]}
      />
      <div className="flex flex-1 relative">
        <HRSidebar
          isOpen={isSidebarOpen}
          isSidebarOpen={isSidebarOpen}
          mode={mode}
          toggleMode={toggleMode}
          onLogout={handleLogout}
          toggleSidebar={toggleSidebar}
          setDragOffset={updateDragOffset}
        />
        <div
          className={`flex-1 transition-all duration-300 overflow-auto`}
          style={{
            marginLeft: sidebarState.hidden
              ? "0px"
              : `${84 + (isSidebarOpen ? 120 : 0) + sidebarState.offset}px`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <MarketIntelHeader
              mode={mode}
              pageName="Admin Market Intel"
              pageDescription="Curate cutting-edge market intelligence, regional insights, and interactive visualizations for members."
              breadcrumbs={[
                { label: "Dashboard", href: "/admin" },
                { label: "Market Intel" },
              ]}
            />
            <MarketIntelControls
              mode={mode}
              filters={filters}
              sortBy={sortBy}
              updateFilters={updateFilters}
              updateSort={updateSort}
              marketIntel={marketIntel}
              selectedIds={selectedIds}
              handleBulkDelete={handleBulkDelete}
              setShowForm={setShowForm}
              showForm={showForm}
            />
            <MarketIntelForm
              mode={mode}
              formData={formData}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              handleCancel={handleCancel}
              isEditing={isEditing}
              showForm={showForm}
              className="market-intel-form"
            />
            <MarketIntelGrid
              mode={mode}
              marketIntel={marketIntel}
              loading={loading}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              handleEditClick={handleEditClick}
              handleDelete={handleDelete}
              handleViewFeedback={handleViewFeedback}
              candidates={initialCandidates}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
            />
          </div>
          <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
        </div>
      </div>
      
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  try {
    const supabaseServer = createSupabaseServerClient(req, res);

    const {
      data: { session },
      error: sessionError,
    } = await supabaseServer.auth.getSession();

    if (sessionError || !session) {
      return {
        redirect: {
          destination: "/hr/login",
          permanent: false,
        },
      };
    }

    const { data: hrUser, error: hrUserError } = await supabaseServer
      .from("hr_users")
      .select("id")
      .eq("id", session.user.id)
      .single();

    if (hrUserError || !hrUser) {
      console.error(
        "[AdminMarketIntel] HR User Error:",
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
      fetchMarketIntel: true,
      fetchCandidates: true,
    });
    console.timeEnd("fetchHRData");

    const feedbackByIntel = data.marketIntelFeedback.reduce((acc, fb) => {
      acc[fb.market_intel_id] = acc[fb.market_intel_id] || [];
      acc[fb.market_intel_id].push(fb);
      return acc;
    }, {});

    const candidatesMap = data.initialCandidates.reduce((acc, candidate) => {
      if (candidate.auth_user_id) {
        acc[candidate.auth_user_id] = candidate.primaryContactName || "Unknown";
      }
      return acc;
    }, {});

    const enrichedMarketIntel = (data.marketIntel || []).map((intel) => {
      const feedback = feedbackByIntel[intel.id] || [];
      const averageRating =
        feedback.length > 0
          ? feedback.reduce((sum, fb) => sum + (fb.rating || 0), 0) /
            feedback.length
          : 0;
      return {
        ...intel,
        averageRating: Number(averageRating) || 0,
        feedbackCount: feedback.length,
        feedback,
      };
    });

    console.log(
      "[AdminMarketIntel] Enriched market intel:",
      enrichedMarketIntel
    );

    Object.keys(feedbackByIntel).forEach((intelId) => {
      feedbackByIntel[intelId] = feedbackByIntel[intelId].map((fb) => ({
        ...fb,
        primaryContactName: candidatesMap[fb.user_id] || "Unknown",
      }));
    });

    return {
      props: {
        initialMarketIntel: enrichedMarketIntel,
        initialFeedback: feedbackByIntel || {},
        initialCandidates: candidatesMap || {},
      },
    };
  } catch (error) {
    console.error("[AdminMarketIntel] Error:", error.message);
    return {
      redirect: {
        destination: "/hr/login",
        permanent: false,
      },
    };
  }
}
