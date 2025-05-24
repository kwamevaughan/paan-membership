import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";
import { useOffers } from "@/hooks/useOffers";
import ModernOffersForm from "@/components/ModernOffersForm";
import ModernOffersFilters from "@/components/ModernOffersFilters";
import OfferCard from "@/components/OfferCard";
import SimpleFooter from "@/layouts/simpleFooter";
import FeedbackModal from "@/components/FeedbackModal";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default function AdminOffers({
  mode = "light",
  toggleMode,
  initialCandidates,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [showFilters, setShowFilters] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState(null);

  useAuthSession();

  const { isSidebarOpen, toggleSidebar, sidebarState, updateDragOffset } =
    useSidebar();
  const handleLogout = useLogout();
  const {
    offers,
    formData,
    loading,
    filterTerm,
    setFilterTerm,
    filterType,
    setFilterType,
    sortOrder,
    sortDirection,
    setSortOrder,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
  } = useOffers(initialCandidates);

  const router = useRouter();

  useEffect(() => {
    if (isEditing) {
      setActiveTab("form");
    }
  }, [isEditing]);

  const submitForm = (e) => {
    e.preventDefault();
    handleSubmit(e);
    setIsEditing(false);
    setActiveTab("list");
  };

  const startEditing = (offer) => {
    handleEdit(offer);
    setIsEditing(true);
    setActiveTab("form");
  };

  const cancelForm = () => {
    setIsEditing(false);
    setActiveTab("list");
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-gradient-to-br ${
        mode === "dark"
          ? "from-gray-900 via-indigo-950 to-purple-950"
          : "from-indigo-100 via-purple-100 to-pink-100"
      } overflow-hidden`}
    >
      <HRHeader
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        sidebarState={sidebarState}
        mode={mode}
        toggleMode={toggleMode}
        onLogout={handleLogout}
        pageName="Offers"
        pageDescription="Unlock exclusive opportunities for your members."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Offers" },
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
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h1
                className={`text-5xl font-extrabold ${
                  mode === "dark" ? "text-white" : "text-gray-900"
                } bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}
              >
                Exclusive Offers
              </h1>
              <p
                className={`mt-4 text-lg ${
                  mode === "dark" ? "text-gray-300" : "text-gray-600"
                } max-w-2xl mx-auto`}
              >
                Curate premium opportunities, discounts, and partnerships for
                your members.
              </p>
            </motion.div>

            {activeTab === "list" ? (
              <div className="relative">
                <ModernOffersFilters
                  filterTerm={filterTerm}
                  setFilterTerm={setFilterTerm}
                  filterType={filterType}
                  setFilterType={setFilterType}
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                  sortOrder={sortOrder}
                  sortDirection={sortDirection}
                  setSortOrder={setSortOrder}
                  mode={mode}
                  loading={loading}
                />
                {offers.length > 0 ? (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.2 }}
                  >
                    {offers.map((offer) => (
                      <OfferCard
                        key={offer.id}
                        offer={offer}
                        onEdit={startEditing}
                        onDelete={handleDelete}
                        onViewFeedback={(id) => {
                          setSelectedOfferId(id);
                          setIsFeedbackModalOpen(true);
                        }}
                        mode={mode}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <Icon
                      icon="heroicons:tag"
                      className={`mx-auto h-24 w-24 ${
                        mode === "dark" ? "text-indigo-400" : "text-indigo-500"
                      }`}
                    />
                    <h3
                      className={`mt-4 text-2xl font-semibold ${
                        mode === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      No Offers Found
                    </h3>
                    <p
                      className={`mt-2 text-sm ${
                        mode === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {filterTerm || filterType !== "all"
                        ? "Try adjusting your filters."
                        : "Create a new offer to get started!"}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => {
                        setIsEditing(false);
                        setActiveTab("form");
                      }}
                      className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl"
                    >
                      Add New Offer
                    </motion.button>
                  </motion.div>
                )}
                <motion.button
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  className={`fixed bottom-8 right-8 p-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl z-20`}
                  onClick={() => {
                    setIsEditing(false);
                    setActiveTab("form");
                  }}
                >
                  <Icon icon="heroicons:plus" className="w-6 h-6" />
                </motion.button>
              </div>
            ) : (
              <ModernOffersForm
                formData={formData}
                handleInputChange={handleInputChange}
                submitForm={submitForm}
                cancelForm={cancelForm}
                isEditing={isEditing}
                mode={mode}
              />
            )}
            <FeedbackModal
              isOpen={isFeedbackModalOpen}
              onClose={() => setIsFeedbackModalOpen(false)}
              feedback={
                offers.find((o) => o.id === selectedOfferId)?.feedback || []
              }
              mode={mode}
            />
          </div>
          <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
        </div>
      </div>
      <Toaster />
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
        "[AdminOffers] HR User Error:",
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

    // Fetch candidates
    const { data: candidatesData, error: candidatesError } =
      await supabaseServer
        .from("candidates")
        .select("id, auth_user_id, primaryContactName");

    if (candidatesError) {
      console.error("[AdminOffers] Candidates Error:", candidatesError.message);
      throw new Error(`Failed to fetch candidates: ${candidatesError.message}`);
    }

    const candidatesMap = candidatesData.reduce((acc, candidate) => {
      if (candidate.auth_user_id) {
        acc[candidate.auth_user_id] = candidate.primaryContactName || "Unknown";
      }
      return acc;
    }, {});

    return {
      props: {
        initialCandidates: candidatesMap,
      },
    };
  } catch (error) {
    console.error("[AdminOffers] Error:", error.message);
    return {
      redirect: {
        destination: "/hr/login",
        permanent: false,
      },
    };
  }
}
